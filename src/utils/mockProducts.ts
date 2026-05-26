import type { ProductInput } from "@/services/product/products.service";

const placeholderImg = (text: string) =>
  `https://placehold.co/600x600/8B4513/F5DEB3?text=${encodeURIComponent(text)}`;

export const MOCK_PRODUCTS: ProductInput[] = [
  {
    name: "Yerba Mate Cruz de Malta 500g",
    description:
      "Yerba mate clásica con palo. Sabor tradicional y aroma intenso, cosechada en Misiones.",
    price: 1200,
    category: "yerba",
    imageUrl: placeholderImg("Cruz de Malta"),
    stock: 50,
  },
  {
    name: "Yerba Mate Taragüi Sin Palo 1kg",
    description:
      "Yerba sin palo, sabor fuerte y prolongado. Ideal para mateadas largas.",
    price: 2800,
    category: "yerba",
    imageUrl: placeholderImg("Taragüi 1kg"),
    stock: 30,
  },
  {
    name: "Yerba Mate Playadito 500g",
    description:
      "Estacionada naturalmente. Suave en boca, aroma a monte misionero.",
    price: 1400,
    category: "yerba",
    imageUrl: placeholderImg("Playadito"),
    stock: 40,
  },
  {
    name: "Mate Imperial de Calabaza",
    description:
      "Mate de calabaza forrado en cuero repujado con virola de alpaca. Hecho a mano.",
    price: 3500,
    category: "mates",
    imageUrl: placeholderImg("Mate Imperial"),
    stock: 15,
  },
  {
    name: "Mate Camionero",
    description:
      "Mate de calabaza grande con base de cuero. Capacidad extra para mateadas largas.",
    price: 4200,
    category: "mates",
    imageUrl: placeholderImg("Mate Camionero"),
    stock: 10,
  },
  {
    name: "Mate de Madera Algarrobo",
    description:
      "Tallado en madera maciza de algarrobo argentino. Resistente y elegante.",
    price: 2800,
    category: "mates",
    imageUrl: placeholderImg("Mate Algarrobo"),
    stock: 0,
  },
  {
    name: "Bombilla de Alpaca",
    description:
      "Bombilla de alpaca con filtro pico de loro. No transmite sabor y dura años.",
    price: 2200,
    category: "bombillas",
    imageUrl: placeholderImg("Bombilla Alpaca"),
    stock: 25,
  },
  {
    name: "Termo Stanley 1L Verde",
    description:
      "Termo Stanley clásico de acero inoxidable. Mantiene el agua caliente hasta 24hs.",
    price: 35000,
    category: "termos",
    imageUrl: placeholderImg("Stanley 1L"),
    stock: 8,
  },
];
