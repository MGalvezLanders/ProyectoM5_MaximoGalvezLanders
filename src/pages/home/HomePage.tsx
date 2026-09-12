import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { LogoGauchada } from "@/components/ui/LogoGauchada";
import { BestSellersSlider } from "@/components/home/BestSellersSlider";
import { useBestSellers } from "@/hooks/products/useBestSellers";
import { useProductsList } from "@/hooks/products/useProductsList";
import { assignGroup } from "@/utils/filters";
import { stagger, cardReveal } from "@/utils/animations";
import type { Product } from "@/types/product";

const features = [
  {
    title: "Mates curados a mano",
    body: "Cada mate llega listo para el primer cebado, sin pasos extra.",
  },
  {
    title: "Cuero genuino argentino",
    body: "Materas, fundas y accesorios trabajados con cuero del litoral.",
  },
  {
    title: "Envíos a todo el país",
    body: "Despachamos en 24-48hs desde nuestro taller. Tracking incluido.",
  },
];

const categoryTiles = [
  { label: "Mates",     group: "mates",     tone: "bg-terracota-500/10" },
  { label: "Materas",   group: "materas",   tone: "bg-leather-700/10" },
  { label: "Termos",    group: "termos",    tone: "bg-field-500/10" },
  { label: "Bombillas", group: "bombillas", tone: "bg-sun-400/15" },
  { label: "Sombreros", group: "sombreros", tone: "bg-sepia-400/25" },
  { label: "Ponchos",   group: "ponchos",   tone: "bg-sky-arg-300/25" },
];

const testimonials = [
  {
    name: "Rocío M.",
    location: "Salta",
    quote: "El mate llegó en 2 días y ya curado. Se nota el laburo artesanal — no lo compraría en otro lado.",
  },
  {
    name: "Federico L.",
    location: "Rosario, Santa Fe",
    quote: "La matera es una belleza. Cuero de verdad, costuras prolijas. Vale cada peso.",
  },
  {
    name: "Camila R.",
    location: "Neuquén",
    quote: "Compré un poncho para mi viejo y me escribieron para confirmar el color. Atención 10 puntos.",
  },
];

function PromoVideo() {
  const [hidden, setHidden] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (hidden) return null;

  const togglePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <section className="border-b border-sepia-300 bg-leather-900 relative">
      <video
        ref={videoRef}
        src="/videos/promo.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setHidden(true)}
        className="w-full max-h-[85vh] object-cover block"
      />
      <button
        type="button"
        onClick={togglePause}
        aria-label={paused ? "Reanudar video" : "Pausar video"}
        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-leather-900/60 backdrop-blur text-cream-50 hover:bg-leather-900/80 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50"
      >
        {paused ? (
          <svg className="w-4 h-4 ml-0.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M4 2v12l10-6z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="4" y="2" width="3" height="12" />
            <rect x="9" y="2" width="3" height="12" />
          </svg>
        )}
      </button>
    </section>
  );
}

function HeroImage({ products }: { products: Product[] }) {
  const hero = products[0];
  const accent = products[1];

  if (!hero) {
    return (
      <div className="hidden md:block relative aspect-[4/5] w-full ml-auto radius-modal bg-gradient-to-br from-cream-200 to-sepia-300 border border-sepia-400/40 shadow-warm-lg" />
    );
  }

  return (
    <div className="hidden md:block relative w-full aspect-[4/5]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 radius-modal overflow-hidden border border-sepia-300 shadow-warm-lg"
      >
        <img
          src={hero.imageUrl}
          alt={hero.name}
          className="w-full h-full object-cover"
        />
        {/* Etiqueta artesanal sobre la imagen */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3">
          <div className="bg-cream-50/90 backdrop-blur px-3 py-2 radius-ui border border-sepia-300">
            <p className="text-[10px] uppercase tracking-widest text-leather-500 font-semibold">
              Destacado
            </p>
            <p className="font-display text-sm font-semibold text-leather-900 leading-tight line-clamp-1 max-w-[200px]">
              {hero.name}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Card accent apilada (opcional, si hay 2do producto) */}
      {accent && (
        <motion.div
          initial={{ opacity: 0, x: 30, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -bottom-8 -right-8 w-40 aspect-square radius-card overflow-hidden border-4 border-cream-50 shadow-warm-lg z-10"
        >
          <img
            src={accent.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </div>
  );
}

function FeaturesStrip() {
  return (
    <section className="bg-leather-900 text-cream-50 py-8 sm:py-10 border-y border-leather-800">
      <Container size="lg">
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
          {features.map((f) => (
            <div key={f.title} className="sm:flex sm:items-start sm:gap-4">
              <span className="inline-flex sm:block items-center justify-center w-10 h-10 shrink-0 text-sun-400 mb-2 sm:mb-0">
                <LogoGauchada className="w-8 h-8" />
              </span>
              <div>
                <h3
                  className="font-display text-xl sm:text-2xl font-bold text-sun-200 mb-1.5 leading-tight"
                  style={{ fontVariationSettings: '"SOFT" 30' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-cream-50/70 leading-relaxed">
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CategoriesSection() {
  // Usamos el catálogo completo (no bestsellers) para asegurar
  // que TODAS las categorías tengan al menos una imagen disponible.
  const { products } = useProductsList();

  const imageByGroup = useMemo(() => {
    const map = new Map<string, string>();

    // Pase 1: match exacto por grupo canónico (assignGroup)
    for (const p of products) {
      const g = assignGroup(p.category);
      if (g && !map.has(g)) map.set(g, p.imageUrl);
    }

    // Pase 2: fallback por keyword en el nombre del grupo. Cubre casos donde
    // el producto tiene una category custom que assignGroup no reconoce pero
    // el nombre contiene la palabra ("Bombilla criolla" cae en "bombillas").
    const missing = categoryTiles.filter((c) => !map.has(c.group));
    for (const cat of missing) {
      const stem = cat.group.replace(/s$/, ""); // "bombillas" → "bombilla"
      const match = products.find((p) =>
        `${p.name} ${p.category}`.toLowerCase().includes(stem),
      );
      if (match) map.set(cat.group, match.imageUrl);
    }

    return map;
  }, [products]);

  return (
    <section className="border-b border-sepia-300 bg-cream-50">
      <Container size="xl" className="py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex items-end justify-between gap-6 flex-wrap"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-leather-600 mb-3">
              <span className="w-6 h-px bg-leather-400" />
              Categorías
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-leather-900 max-w-md">
              Explorá por producto
            </h2>
          </div>
          <Link
            to="/catalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-leather-700 hover:text-leather-900 link-fancy"
            data-underline="true"
          >
            Ver catálogo completo →
          </Link>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {categoryTiles.map((cat) => {
            const img = imageByGroup.get(cat.group);
            return (
              <motion.div key={cat.group} variants={cardReveal}>
                <Link
                  to={`/catalog?group=${encodeURIComponent(cat.group)}`}
                  className="group block relative aspect-square rounded-2xl overflow-hidden border border-sepia-300 bg-cream-100 hover:shadow-warm-lg hover:-translate-y-0.5 transition-all"
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    // Placeholder decorativo con logo — nunca queda "vacío".
                    <div className={`absolute inset-0 ${cat.tone} flex items-center justify-center`}>
                      <LogoGauchada className="w-1/2 h-1/2 text-leather-900/15" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-leather-900/70 via-leather-900/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 right-3 font-display font-semibold text-cream-50 text-sm sm:text-base">
                    {cat.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="border-b border-sepia-300 bg-cream-100/70">
      <Container size="lg" className="py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-14"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-leather-600 mb-3">
            <span className="w-6 h-px bg-leather-400" />
            La comunidad
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold text-leather-900 leading-[1.05]">
            Lo que dicen quienes<br />ya compraron.
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-5 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.name}
              variants={cardReveal}
              className="bg-cream-50 seam-border radius-card p-6 shadow-warm-sm flex flex-col gap-4"
            >
              <div className="flex items-center gap-1 text-sun-500" aria-label="5 estrellas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 1.5l2.6 5.4 6 .8-4.3 4.2 1 5.9L10 15l-5.3 2.8 1-5.9L1.4 7.7l6-.8L10 1.5z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-leather-800 leading-relaxed italic text-sm">
                "{t.quote}"
              </blockquote>
              <figcaption className="pt-2 border-t border-sepia-300/60">
                <p className="font-display font-semibold text-leather-900 text-sm">{t.name}</p>
                <p className="text-xs text-leather-500">{t.location}</p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

const HomePage = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const { products } = useBestSellers();

  //* Sol de Mayo: watermark contenido — pequeño pero presente.
  const solOpacity = useTransform(scrollY, [0, 320], [0.14, 0]);

  return (
    <main className="paper-texture min-h-[calc(100vh-65px)]">
      {/* ── Hero — mucho aire (py-24 mobile / py-32 desktop) ───────────────── */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Sol de Mayo como watermark discreto en una esquina */}
        <motion.div
          style={{ opacity: solOpacity }}
          className="absolute top-8 right-8 pointer-events-none select-none hidden lg:block"
        >
          <SolDeMayo className="w-32 h-32" spin={80} />
        </motion.div>

        <Container size="lg" className="relative py-20 md:py-28 lg:py-32">
          <div className="grid md:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-leather-600 mb-6"
              >
                <span className="w-6 h-px bg-leather-400" />
                Tradición argentina · desde 2024
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[2.75rem] sm:text-6xl lg:text-7xl font-semibold text-leather-900 leading-[1.02] mb-6"
                style={{ fontVariationSettings: '"SOFT" 50' }}
              >
                Pequeños mates,
                <br />
                <em className="not-italic text-leather-700">grandes momentos.</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg text-stone-600 mb-10 max-w-lg leading-relaxed"
              >
                Mates, termos, materas, ponchos y sombreros artesanales. Hechos
                con tradición, pensados para compartir.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-3 mb-10"
              >
                <Link to="/catalog">
                  <Button size="lg">Ver catálogo</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg">
                    Crear cuenta
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.32 }}
                className="flex items-center gap-3 text-xs text-stone-500"
              >
                <span className="text-sun-500 text-sm tracking-tight">★★★★★</span>
                <span className="font-semibold text-leather-900">4.9/5</span>
                <span className="w-px h-3 bg-stone-300" />
                <span>500+ pedidos entregados</span>
              </motion.div>
            </div>

            <HeroImage products={products} />
          </div>
        </Container>
      </section>

      {/* ── Franja de features apretada (contrast section, dark) ───────────── */}
      <FeaturesStrip />

      {/* ── Video promocional ─────────────────────────────────────────────── */}
      <PromoVideo />

      {/* ── Categorías visuales (py-28) ───────────────────────────────────── */}
      <CategoriesSection />

      {/* ── Más Vendidos ──────────────────────────────────────────────────── */}
      <BestSellersSlider />

      {/* ── Banda argentina como separador (no más en el sticky) ──────────── */}
      <motion.div
        className="band-argentina h-1.5"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
      />

      {/* ── Testimonios (py-32, mucho aire) ────────────────────────────────── */}
      <TestimonialsSection />
    </main>
  );
};

export default HomePage;
