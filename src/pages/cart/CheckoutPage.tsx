import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { useCheckout } from "@/hooks/useCheckout";
import { formatPrice } from "@/utils/formatting";
import type { PaymentMethod, ShippingInfo } from "@/types/order";

const PROVINCES = [
  "Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Catamarca", "Chaco",
  "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy",
  "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro",
  "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg bg-white text-leather-900 placeholder-leather-400/60 border border-sepia-300 focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500 transition-colors disabled:opacity-60 text-sm";
const errorClass = "mt-1 text-xs text-terracota-500";

/* ── Componentes pequeños ─────────────────────────────────────────────────── */

function FieldWrapper({
  label, htmlFor, error, children,
}: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wide text-leather-600 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

function StepIndicator({ current }: { current: 1 | 2 }) {
  const steps = [
    { n: 1 as const, label: "Datos de envío" },
    { n: 2 as const, label: "Método de pago" },
  ];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="contents">
          <div className={`flex items-center gap-2 ${current >= s.n ? "text-leather-900" : "text-leather-400"}`}>
            <div className={[
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              current > s.n ? "bg-field-500 text-white" : current === s.n ? "bg-sun-400 text-leather-900" : "bg-sepia-200 text-leather-500",
            ].join(" ")}>
              {current > s.n ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : s.n}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${current >= s.n ? "text-leather-900" : "text-leather-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px transition-colors ${current > 1 ? "bg-field-400" : "bg-sepia-300"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Paso 1: Datos de envío ───────────────────────────────────────────────── */

type ShippingStepProps = {
  form: ShippingInfo;
  errors: Partial<Record<keyof ShippingInfo, string>>;
  userEmail: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

function ShippingStep({ form, errors, userEmail, onChange, onSubmit }: ShippingStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldWrapper label="Nombre completo" htmlFor="name" error={errors.name}>
          <input id="name" name="name" type="text" autoComplete="name"
            value={form.name} onChange={onChange} placeholder="Juan Pérez"
            className={inputClass} />
        </FieldWrapper>
        <FieldWrapper label="Teléfono / WhatsApp" htmlFor="phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel"
            value={form.phone ?? ""} onChange={onChange} placeholder="+54 9 11 1234-5678"
            className={inputClass} />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Email" htmlFor="email" error={undefined}>
        <input id="email" name="email" type="email" value={userEmail}
          readOnly disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-xs text-leather-500">El email se toma de tu cuenta</p>
          <Link
            to="/profile"
            className="text-xs text-leather-700 hover:text-leather-900 underline underline-offset-2 shrink-0"
          >
            Cambiar cuenta
          </Link>
        </div>
      </FieldWrapper>

      <FieldWrapper label="Dirección (calle y número)" htmlFor="address" error={errors.address}>
        <input id="address" name="address" type="text" autoComplete="street-address"
          value={form.address} onChange={onChange} placeholder="Av. Corrientes 1234, Piso 3 Dto B"
          className={inputClass} />
      </FieldWrapper>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <FieldWrapper label="Ciudad" htmlFor="city" error={errors.city}>
            <input id="city" name="city" type="text" autoComplete="address-level2"
              value={form.city} onChange={onChange} placeholder="Tucumán"
              className={inputClass} />
          </FieldWrapper>
        </div>
        <FieldWrapper label="Código Postal" htmlFor="postalCode" error={errors.postalCode}>
          <input id="postalCode" name="postalCode" type="text" autoComplete="postal-code"
            value={form.postalCode ?? ""} onChange={onChange} placeholder="4000"
            className={inputClass} />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Provincia" htmlFor="province" error={errors.province}>
        <select id="province" name="province" value={form.province ?? ""} onChange={onChange}
          className={inputClass}>
          <option value="">Seleccioná una provincia…</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </FieldWrapper>

      <div className="pt-2">
        <Button type="submit" fullWidth size="lg">
          Continuar al pago →
        </Button>
      </div>
    </form>
  );
}

/* ── Paso 2: Método de pago ───────────────────────────────────────────────── */

function MpLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <img
      src="/images/mercadopago-logo.png"
      alt="Mercado Pago"
      className={className}
    />
  );
}

function PaymentMethodCard({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left p-4 rounded-xl border-2 transition-all",
        selected
          ? "border-sun-500 bg-sun-50/60 shadow-sm"
          : "border-sepia-300 bg-white hover:border-sepia-400",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className={[
          "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
          selected ? "border-sun-500" : "border-sepia-400",
        ].join(" ")}>
          {selected && <div className="w-2 h-2 rounded-full bg-sun-500" />}
        </div>
        {children}
      </div>
    </button>
  );
}

type PaymentStepProps = {
  paymentMethod: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  isSubmitting: boolean;
  createError: string | null;
  onBack: () => void;
  onSubmit: () => void;
};

function PaymentStep({
  paymentMethod, onSelect, isSubmitting, createError, onBack, onSubmit,
}: PaymentStepProps) {
  return (
    <div className="space-y-4">
      {/* Mercado Pago */}
      <PaymentMethodCard selected={paymentMethod === "mercadopago"} onClick={() => onSelect("mercadopago")}>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <MpLogo />
            <span className="font-semibold text-leather-900 text-sm">Mercado Pago</span>
          </div>
          <p className="text-xs text-leather-600 mb-3">
            Pagá con tarjeta de crédito, débito, efectivo (Rapipago / PagoFácil) o saldo MP.
            Hasta 12 cuotas sin interés con bancos seleccionados.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Visa", "Mastercard", "Amex", "Cabal", "Naranja", "Efectivo"].map((m) => (
              <span key={m} className="text-[10px] font-medium bg-sepia-100 text-leather-700 px-2 py-0.5 rounded">
                {m}
              </span>
            ))}
          </div>
          {paymentMethod === "mercadopago" && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-field-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Pago 100% seguro · Tecnología SSL
            </div>
          )}
        </div>
      </PaymentMethodCard>

      {/* Transferencia bancaria */}
      <PaymentMethodCard selected={paymentMethod === "transfer"} onClick={() => onSelect("transfer")}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-leather-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            <span className="font-semibold text-leather-900 text-sm">Transferencia bancaria</span>
          </div>
          <p className="text-xs text-leather-600 mb-2">
            10% de descuento pagando por transferencia. Te enviamos los datos al confirmar.
          </p>
          {paymentMethod === "transfer" && (
            <div className="mt-3 bg-cream-100 border border-sepia-300 rounded-lg p-3 text-xs space-y-1.5 text-leather-800">
              <div className="flex justify-between">
                <span className="font-semibold text-leather-600">Titular</span>
                <span>La Gauchada S.R.L.</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-leather-600">CBU</span>
                <span className="font-mono tracking-wide">0110012030012345678901</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-leather-600">Alias</span>
                <span className="font-mono">LAGAUCHADA.MP</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-leather-600">Banco</span>
                <span>Banco Nación Argentina</span>
              </div>
              <p className="text-leather-500 pt-1 border-t border-sepia-200">
                Enviá el comprobante a <strong>pagos@lagauchada.com.ar</strong>
              </p>
            </div>
          )}
        </div>
      </PaymentMethodCard>

      {createError && (
        <p className="text-sm text-terracota-500 bg-terracota-50 border border-terracota-200 rounded-lg px-3 py-2" role="alert">
          {createError}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          ← Volver
        </Button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all",
            paymentMethod === "mercadopago"
              ? "bg-[#009EE3] hover:bg-[#007EB5] text-white disabled:opacity-60"
              : "bg-leather-900 hover:bg-leather-800 text-cream-50 disabled:opacity-60",
          ].join(" ")}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando…
            </>
          ) : paymentMethod === "mercadopago" ? (
            <>
              <MpLogo className="h-5 w-auto brightness-0 invert" />
              <span>Ir a pagar</span>
            </>
          ) : (
            "Confirmar pedido →"
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Resumen del pedido (sidebar) ─────────────────────────────────────────── */

function OrderSummary({
  cartItems, total, totalUnits, paymentMethod, step,
}: {
  cartItems: ReturnType<typeof useCheckout>["cartItems"];
  total: number;
  totalUnits: number;
  paymentMethod: PaymentMethod;
  step: 1 | 2;
}) {
  const transferDiscount = paymentMethod === "transfer" ? Math.round(total * 0.1) : 0;
  const finalTotal = total - transferDiscount;

  return (
    <div className="bg-white border border-sepia-300 rounded-xl shadow-warm-sm overflow-hidden">
      <div className="p-5 border-b border-sepia-200">
        <h2 className="font-display text-lg font-bold text-leather-900">
          Resumen del pedido
        </h2>
        <p className="text-xs text-leather-500 mt-0.5">{totalUnits} {totalUnits === 1 ? "producto" : "productos"}</p>
      </div>

      {/* Items */}
      <ul className="divide-y divide-sepia-100 px-5 max-h-64 overflow-y-auto">
        {cartItems.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="relative shrink-0">
              <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-sepia-200" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-leather-700 text-cream-50 text-[10px] font-bold rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-leather-900 truncate">{item.name}</p>
              <p className="text-xs text-leather-500">{formatPrice(item.price)} c/u</p>
            </div>
            <p className="text-sm font-semibold text-leather-900 tabular-nums shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      {/* Totales */}
      <div className="p-5 border-t border-sepia-200 space-y-2 text-sm">
        <div className="flex justify-between text-leather-700">
          <span>Subtotal</span>
          <span className="font-medium">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-leather-700">
          <span>Envío</span>
          <span className="font-medium text-field-600">Gratis</span>
        </div>
        {transferDiscount > 0 && (
          <div className="flex justify-between text-field-600">
            <span>Descuento transferencia (10%)</span>
            <span className="font-medium">- {formatPrice(transferDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-sepia-300">
          <span className="font-display text-base font-bold text-leather-900">Total</span>
          <span className="font-display text-xl font-bold text-leather-900">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {/* Badges de confianza */}
      {step === 2 && (
        <div className="px-5 pb-5 space-y-2">
          {[
            {
              text: "Pago seguro con cifrado SSL",
              svg: (
                <svg className="w-4 h-4 text-field-600" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              text: "Devolución gratis en 30 días",
              svg: (
                <svg className="w-4 h-4 text-field-600" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M3 10a7 7 0 1114 0 7 7 0 01-14 0z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 6v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              text: "Envío a todo el país",
              svg: (
                <svg className="w-4 h-4 text-field-600" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M2 14V7h9v7M11 9h4l2 3v2h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="5.5" cy="15.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="14.5" cy="15.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              ),
            },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-xs text-leather-600">
              {b.svg}
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Modal de confirmación para transferencia ─────────────────────────────── */

function ConfirmTransferModal({
  total, isSubmitting, onCancel, onConfirm,
}: {
  total: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-leather-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-transfer-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-cream-50 rounded-2xl shadow-warm-lg border border-sepia-300 p-6"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sun-400/20 text-sun-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 3v7M10 14v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h3 id="confirm-transfer-title" className="font-display text-lg font-bold text-leather-900">
              Confirmar pedido por transferencia
            </h3>
            <p className="text-sm text-leather-700 mt-1">
              Vamos a reservar tu pedido por 48hs esperando el comprobante.
            </p>
          </div>
        </div>

        <div className="bg-cream-100 border border-sepia-300 rounded-lg p-3 mb-5 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-leather-600">Total a transferir</span>
            <span className="font-display text-lg font-bold text-leather-900">
              {formatPrice(total)}
            </span>
          </div>
          <p className="text-xs text-leather-500">
            Incluye 10% de descuento por transferencia. Después de confirmar te mostramos los datos bancarios y el email para enviar el comprobante.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
            Volver
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Procesando…" : "Confirmar pedido"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Página principal ─────────────────────────────────────────────────────── */

export default function CheckoutPage() {
  const {
    cartItems, userEmail, total, totalUnits,
    form, errors, step, paymentMethod, setPaymentMethod,
    isSubmitting, createError,
    handleChange, handleNextStep, handleBack, handleSubmit,
  } = useCheckout();

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (cartItems.length === 0) return <Navigate to="/cart" replace />;

  const finalTotal = paymentMethod === "transfer" ? Math.round(total * 0.9) : total;

  const handlePayClick = () => {
    if (paymentMethod === "transfer") setConfirmOpen(true);
    else handleSubmit();
  };

  const handleConfirmedSubmit = () => {
    setConfirmOpen(false);
    handleSubmit();
  };

  return (
    <main className="bg-cream-50/80 min-h-[calc(100vh-65px)] py-10">
      <Container size="lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-leather-900 mb-1">
            Finalizar compra
          </h1>
          <p className="text-sm text-leather-600">
            {step === 1 ? "Completá tus datos de envío" : "Elegí cómo querés pagar"}
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Formulario */}
          <div className="bg-white border border-sepia-300 rounded-xl shadow-warm-sm p-6">
            <h2 className="font-display text-xl font-bold text-leather-900 mb-6">
              {step === 1 ? "Datos de envío" : "Método de pago"}
            </h2>
            {step === 1 ? (
              <ShippingStep
                form={form}
                errors={errors}
                userEmail={userEmail}
                onChange={handleChange}
                onSubmit={handleNextStep}
              />
            ) : (
              <PaymentStep
                paymentMethod={paymentMethod}
                onSelect={setPaymentMethod}
                isSubmitting={isSubmitting}
                createError={createError}
                onBack={handleBack}
                onSubmit={handlePayClick}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24">
            <OrderSummary
              cartItems={cartItems}
              total={total}
              totalUnits={totalUnits}
              paymentMethod={paymentMethod}
              step={step}
            />
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {confirmOpen && (
          <ConfirmTransferModal
            total={finalTotal}
            isSubmitting={isSubmitting}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmedSubmit}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
