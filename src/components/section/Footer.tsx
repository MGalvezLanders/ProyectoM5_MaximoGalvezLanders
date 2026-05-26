import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-leather-900  text-cream-100 border-t border-leather-700">
      {/* Franja patria decorativa */}
      <div className="h-4 band-argentina opacity-80" />

      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Marca */}
          <div>
            <p className="font-display text-xl font-bold text-sun-400 mb-2">
              La Gauchada
            </p>
            <p className="text-sm text-cream-300 leading-relaxed">
              Mates, materas y artesanías con alma argentina. Hechos a mano,
              pensados para compartir.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sepia-400 mb-3">
              Navegación
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/catalog"
                  className="text-cream-300 hover:text-sun-400 transition-colors"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-cream-300 hover:text-sun-400 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-cream-300 hover:text-sun-400 transition-colors"
                >
                  Crear cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sepia-400 mb-3">
              Contacto
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://www.instagram.com/lagauchada.mates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cream-300 hover:text-sun-400 transition-colors"
                >
                  {/* Instagram icon */}
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  @lagauchada.mates
                </a>
              </li>
              <li>
                <a
                  href="mailto:contacto@lagauchada.com.ar"
                  className="flex items-center gap-2 text-cream-300 hover:text-sun-400 transition-colors"
                >
                  {/* Mail icon */}
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  contacto@lagauchada.com.ar
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-leather-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sepia-400">
          <span>© {new Date().getFullYear()} La Gauchada. Todos los derechos reservados.</span>
          <span>Hecho con mate y tradición 🧉</span>
        </div>
      </div>
    </footer>
  );
}
