import { Timestamp } from "firebase/firestore";

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";


export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type ShippingInfo = {
  name: string;
  address: string;
  city: string;
  phone?: string;
  province?: string;
  postalCode?: string;
};

export type PaymentMethod = "mercadopago" | "transfer";

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  orderDate: Timestamp;
  shippingInfo: ShippingInfo;
  paymentMethod?: PaymentMethod;
};

export type OrderInput = {
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  shippingInfo: ShippingInfo;
  paymentMethod?: PaymentMethod;
};
