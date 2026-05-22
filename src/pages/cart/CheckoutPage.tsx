import { Navigate } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/login-register/FormField";
import { useCheckout } from "@/hooks/useCheckout";
import { formatPrice } from "@/utils/formatting";

export default function CheckoutPage() {
  const {
    cartItems,
    total,
    totalUnits,
    form,
    errors,
    isSubmitting,
    isFormInvalid,
    createError,
    handleChange,
    handleSubmit,
  } = useCheckout();

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <Container size="lg" className="py-12">
      <h1 className="font-display text-3xl font-bold text-leather-900 mb-2">
        Finalizar compra
      </h1>
      <p className="text-sm text-leather-600 mb-6">
        Completá los datos de envío para confirmar tu pedido
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <Card>
          <h2 className="font-display text-xl font-bold text-leather-900 mb-4">
            Datos de envío
          </h2>
          <form onSubmit={handleSubmit} noValidate>
            <FormField
              id="name"
              name="name"
              label="Nombre completo"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Tu nombre y apellido"
              autoComplete="name"
              error={errors.name}
            />
            <FormField
              id="address"
              name="address"
              label="Dirección"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="Calle y número"
              autoComplete="street-address"
              error={errors.address}
            />
            <FormField
              id="city"
              name="city"
              label="Ciudad"
              type="text"
              value={form.city}
              onChange={handleChange}
              placeholder="Ciudad"
              autoComplete="address-level2"
              error={errors.city}
            />

            {createError && (
              <p
                className="mb-4 text-sm text-terracota-500 bg-terracota-50 border border-terracota-200 rounded-lg px-3 py-2"
                role="alert"
              >
                No pudimos crear la orden: {createError}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting || isFormInvalid}
            >
              {isSubmitting ? "Procesando..." : "Confirmar compra"}
            </Button>
            <p className="mt-3 text-xs text-leather-500 text-center">
              Pago simulado · No se cobrará nada
            </p>
          </form>
        </Card>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <h2 className="font-display text-xl font-bold text-leather-900 mb-4">
              Resumen del pedido
            </h2>
            <ul className="divide-y divide-sepia-300/60 mb-4 -mx-2">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-2 px-2"
                >
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-sepia-300 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-leather-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-leather-600">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-leather-700">Productos</dt>
                <dd className="font-medium text-leather-900">{totalUnits}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-sepia-300">
                <dt className="text-leather-900 font-display text-base font-bold">
                  Total
                </dt>
                <dd className="font-display text-xl font-bold text-leather-900">
                  {formatPrice(total)}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
