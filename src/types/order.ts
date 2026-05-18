import type { Product } from "./product";

export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

export type Order = Product & {
  quantity: number;
  totalPrice: number;
  orderDate: Date;
  userId: string;
  status: OrderStatus;
  shippingInfo: {
    address: string;
    city: string;
  };
};
