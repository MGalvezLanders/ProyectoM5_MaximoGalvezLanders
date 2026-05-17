import type { Product } from "./product";

export type Order = Product & {
  quantity: number;
  totalPrice: number;
  orderDate: Date;
  userId: string;
  shippingInfo: {
    address: string;
    city: string;
  };
};

export type OrderStatus = {
  status: "pending" | "shipped" | "delivered" | "cancelled";
};
