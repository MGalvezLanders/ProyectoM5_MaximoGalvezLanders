import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useProductsActions } from "@/hooks/useProductsActions";
import { useFirestoreError } from "@/hooks/errors/useFirestoreError";
import { createOrder } from "@/services/orders.service";
import type { OrderItem, ShippingInfo } from "@/types/order";

function validate(form: ShippingInfo): Partial<ShippingInfo> {
  const errors: Partial<ShippingInfo> = {};
  if (!form.name.trim()) errors.name = "El nombre es requerido";
  else if (form.name.trim().length < 2) errors.name = "Mínimo 2 caracteres";
  if (!form.address.trim()) errors.address = "La dirección es requerida";
  else if (form.address.trim().length < 4)
    errors.address = "Mínimo 4 caracteres";
  if (!form.city.trim()) errors.city = "La ciudad es requerida";
  else if (form.city.trim().length < 2) errors.city = "Mínimo 2 caracteres";
  return errors;
}

export function useCheckout() {
  const { user, profile } = useAuth();
  const { state: cartState, clear } = useCart();
  const { syncStockAfterPurchase } = useProductsActions();
  const navigate = useNavigate();
  const { error: createError, captureError, clearError } = useFirestoreError();

  const [form, setForm] = useState<ShippingInfo>({
    name: profile?.name ?? "",
    address: "",
    city: "",
  });
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cartState.items.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0,
  );
  const totalUnits = cartState.items.reduce((acc, i) => acc + i.quantity, 0);
  const isFormInvalid = Object.keys(errors).length > 0;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    setErrors(validate(updated));
    clearError();
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
          address: form.address.trim(),
          city: form.city.trim(),
        },
      });

      syncStockAfterPurchase(
        orderItems.map(({ id, quantity }) => ({ id, quantity })),
      );

      clear();
      navigate(`/orders/${orderId}`, { replace: true });
    } catch (err) {
      captureError(err);
      setIsSubmitting(false);
    }
  };

  return {
    cartItems: cartState.items,
    total,
    totalUnits,
    form,
    errors,
    isSubmitting,
    isFormInvalid,
    createError,
    handleChange,
    handleSubmit,
  };
}
