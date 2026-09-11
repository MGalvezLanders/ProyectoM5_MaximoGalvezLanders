import { Link } from "react-router-dom";

const deadLink =
  "cursor-pointer text-cream-300 hover:text-sun-400 transition-colors";

function DeadLink({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="link"
      tabIndex={0}
      className={deadLink}
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
    >
      {children}
    </span>
  );
}

/* ── Iconos medios de pago ─────────────────────────────────────────────────── */
function VisaIcon() {
  return (
    <div className="flex items-center justify-center w-14 h-9 bg-[#1A1F71] rounded-md px-2">
      <span className="text-white font-extrabold italic text-base tracking-tight leading-none">
        VISA
      </span>
    </div>
  );
}

function MastercardIcon() {
  return (
    <div className="flex items-center justify-center w-14 h-9 bg-leather-800 rounded-md">
      <svg viewBox="0 0 38 24" className="w-10 h-6" aria-label="Mastercard">
        <circle cx="13" cy="12" r="8" fill="#EB001B" />
        <circle cx="25" cy="12" r="8" fill="#F79E1B" />
        <path d="M19 6.8a8 8 0 0 1 0 10.4A8 8 0 0 1 19 6.8z" fill="#FF5F00" />
      </svg>
    </div>
  );
}

function MercadoPagoIcon() {
  return (
    <div className="flex items-center justify-center gap-1 w-14 h-9 bg-[#009EE3] rounded-md px-1.5">
      <span className="text-white font-black text-xs leading-none tracking-tight">
        MP
      </span>
    </div>
  );
}

function AmexIcon() {
  return (
    <div className="flex items-center justify-center w-14 h-9 bg-[#2E77BC] rounded-md px-1">
      <span className="text-white font-bold text-[10px] tracking-widest leading-none">
        AMEX
      </span>
    </div>
  );
}

function CabalIcon() {
  return (
    <div className="flex items-center justify-center w-14 h-9 bg-[#006EB6] rounded-md px-1">
      <span className="text-white font-bold text-[10px] tracking-wide leading-none">
        CABAL
      </span>
    </div>
  );
}

function TransferIcon() {
  return (
    <div className="flex items-center justify-center gap-1 w-14 h-9 bg-leather-700 rounded-md px-1">
      <svg viewBox="0 0 20 20" className="w-4 h-4 text-sun-400" fill="currentColor" aria-hidden="true">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
      </svg>
      <span className="text-cream-300 font-semibold text-[9px] leading-tight">
        Trans.
      </span>
    </div>
  );
}

/* ── Iconos medios de envío ────────────────────────────────────────────────── */
function ShippingBadge({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="flex items-center justify-center h-9 px-3 rounded-md text-white text-xs font-bold tracking-wide"
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-leather-900 text-cream-100 border-t border-leather-700">
      {/* Franja patria decorativa */}
      <div className="h-4 band-argentina opacity-80" />

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* ── Marca ──────────────────────────────────────────────────────── */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <p className="font-display text-2xl font-bold text-sun-400 mb-2">
              La Gauchada
            </p>
            <p className="text-sm text-cream-300 leading-relaxed mb-4">
              Mates, materas y artesanías con alma argentina. Hechos a mano,
              pensados para compartir.
            </p>
            {/* Redes sociales */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/lagauchada.mates"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-leather-700 hover:bg-sun-500 hover:text-leather-900 text-cream-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="mailto:contacto@lagauchada.com.ar"
                aria-label="Email"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-leather-700 hover:bg-sun-500 hover:text-leather-900 text-cream-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-leather-700 hover:bg-sun-500 hover:text-leather-900 text-cream-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Tienda ─────────────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sepia-400 mb-4">
              Tienda
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/catalog" className={deadLink}>Catálogo</Link></li>
              <li><DeadLink>Novedades</DeadLink></li>
              <li><DeadLink>Ofertas</DeadLink></li>
              <li><Link to="/cart" className={deadLink}>Mi carrito</Link></li>
              <li><Link to="/orders" className={deadLink}>Mis pedidos</Link></li>
            </ul>
          </div>

          {/* ── Ayuda ──────────────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sepia-400 mb-4">
              Ayuda
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><DeadLink>Preguntas frecuentes</DeadLink></li>
              <li><DeadLink>Cómo comprar</DeadLink></li>
              <li><DeadLink>Cambios y devoluciones</DeadLink></li>
              <li><DeadLink>Seguimiento de envío</DeadLink></li>
              <li>
                <a href="mailto:contacto@lagauchada.com.ar" className={deadLink}>
                  Contactarnos
                </a>
              </li>
            </ul>
          </div>

          {/* ── Legal ──────────────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sepia-400 mb-4">
              Legal
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><DeadLink>Política de privacidad</DeadLink></li>
              <li><DeadLink>Términos y condiciones</DeadLink></li>
              <li><DeadLink>Política de cookies</DeadLink></li>
              <li><DeadLink>Política de devoluciones</DeadLink></li>
              <li><DeadLink>Defensa del consumidor</DeadLink></li>
            </ul>
          </div>

          {/* ── Contacto ───────────────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sepia-400 mb-4">
              Contacto
            </p>
            <ul className="space-y-3 text-sm text-cream-300">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-sun-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Yerba Buena, Tucumán, Argentina</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-sun-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Lun–Vie 9:00–18:00 hs</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-sun-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contacto@lagauchada.com.ar" className="hover:text-sun-400 transition-colors">
                  contacto@lagauchada.com.ar
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-sun-500 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <a
                  href="https://www.instagram.com/lagauchada.mates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sun-400 transition-colors"
                >
                  @lagauchada.mates
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Medios de envío ────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-leather-700">
          <p className="text-xs font-semibold uppercase tracking-widest text-sepia-400 mb-4 text-center">
            Medios de envío
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ShippingBadge label="OCA" color="#E8400C" />
            <ShippingBadge label="Correo Argentino" color="#003087" />
            <ShippingBadge label="Andreani" color="#F5A623" />
            <ShippingBadge label="Mercado Envíos" color="#009EE3" />
            <div className="flex items-center justify-center h-9 px-3 rounded-md bg-leather-700 text-cream-300 text-xs font-bold gap-1.5">
              <svg className="w-4 h-4 text-sun-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Retiro en tienda
            </div>
          </div>
        </div>

        {/* ── Medios de pago ─────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-leather-700/50">
          <p className="text-xs font-semibold uppercase tracking-widest text-sepia-400 mb-4 text-center">
            Medios de pago
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <VisaIcon />
            <MastercardIcon />
            <MercadoPagoIcon />
            <AmexIcon />
            <CabalIcon />
            <TransferIcon />
          </div>
          <p className="text-center text-xs text-sepia-500 mt-3">
            Hasta 6 cuotas sin interés con tarjetas seleccionadas · 10% de descuento pagando con transferencia
          </p>
        </div>

        {/* ── Copyright ──────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-leather-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sepia-400">
          <span>© {new Date().getFullYear()} La Gauchada. Todos los derechos reservados.</span>
          <span>Hecho con mate y tradición 🧉</span>
        </div>
      </div>
    </footer>
  );
}
