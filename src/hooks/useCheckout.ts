import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/cart/useCart";
import { useProductsActions } from "@/hooks/products/useProductsActions";
import { useFirestoreError } from "@/hooks/errors/useFirestoreError";
import { createOrder } from "@/services/order/orders.service";
import type { OrderItem, ShippingInfo, PaymentMethod } from "@/types/order";

type ShippingErrors = Partial<Record<keyof ShippingInfo, string>>;

function validateShipping(form: ShippingInfo): ShippingErrors {
  const e: ShippingErrors = {};
  if (!form.name.trim()) e.name = "El nombre es requerido";
  else if (form.name.trim().length < 2) e.name = "Mínimo 2 caracteres";
  if (!form.phone?.trim()) e.phone = "El teléfono es requerido";
  if (!form.address.trim()) e.address = "La dirección es requerida";
  else if (form.address.trim().length < 4) e.address = "Mínimo 4 caracteres";
  if (!form.city.trim()) e.city = "La ciudad es requerida";
  if (!form.province?.trim()) e.province = "Seleccioná una provincia";
  return e;
}

const EMPTY_FORM: ShippingInfo = {
  name: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
};

export function useCheckout() {
  const { user, profile } = useAuth();
  const { state: cartState, clear } = useCart();
  const { syncStockAfterPurchase } = useProductsActions();
  const navigate = useNavigate();
  const { error: createError, captureError, clearError } = useFirestoreError();

  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  const [form, setForm] = useState<ShippingInfo>({
    ...EMPTY_FORM,
    name: profile?.name ?? "",
  });
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cartState.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalUnits = cartState.items.reduce((acc, i) => acc + i.quantity, 0);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (errors[e.target.name as keyof ShippingInfo]) {
      setErrors(validateShipping(updated));
    }
    clearError();
  };

  const handleNextStep = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validateShipping(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = cartState.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));

      const orderId = await createOrder({
        userId: user.uid,
        items: orderItems,
        totalPrice: total,
        shippingInfo: {
          name: form.name.trim(),
          phone: form.phone?.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          province: form.province?.trim(),
          postalCode: form.postalCode?.trim(),
        },
        paymentMethod,
      });

      syncStockAfterPurchase(
        orderItems.map(({ id, quantity }) => ({ id, quantity })),
      );

      clear();

      // ─── INTEGRACIÓN MERCADO PAGO ──────────────────────────────────────────
      // Cuando actives MP, reemplazá el navigate de abajo por este flujo:
      //
      // 1. Llamá a tu Vercel Function para crear la preferencia:
      //    const res = await fetch('/api/create-mp-preference', {
      //      method: 'POST',
      //      headers: { 'Content-Type': 'application/json' },
      //      body: JSON.stringify({ orderId, items: orderItems, total }),
      //    });
      //    const { init_point } = await res.json();
      //
      // 2. Redirigí al usuario a Mercado Pago:
      //    window.location.href = init_point;
      //
      // 3. Configurá las URLs de retorno en el Dashboard de MP:
      //    - Éxito:   https://tudominio.com/orders/{orderId}?mp=approved
      //    - Fallo:   https://tudominio.com/checkout?mp=failure
      //    - Pendiente: https://tudominio.com/orders/{orderId}?mp=pending
      //
      // Alternativa con MP Bricks (componente embebido):
      //    npm install @mercadopago/sdk-react
      //    import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
      //    initMercadoPago('TU_PUBLIC_KEY')
      //    <Wallet initialization={{ preferenceId }} />
      // ──────────────────────────────────────────────────────────────────────

      navigate(`/orders/${orderId}`, { replace: true });
    } catch (err) {
      captureError(err);
      setIsSubmitting(false);
    }
  };

  return {
    cartItems: cartState.items,
    userEmail: user?.email ?? "",
    total,
    totalUnits,
    form,
    errors,
    step,
    paymentMethod,
    setPaymentMethod,
    isSubmitting,
    createError,
    handleChange,
    handleNextStep,
    handleBack,
    handleSubmit,
  };
}
