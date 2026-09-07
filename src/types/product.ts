import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  imageUrls?: string[];
  stock: number;
  createdAt: Timestamp;
  /** name en minúsculas, para ordenar y buscar por prefijo en Firestore. */
  nameLower?: string;
};
