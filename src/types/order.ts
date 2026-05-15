import type { Products } from "./product";

export type Order = Products & {
    quantity: number;
    totalPrice: number;
    orderDate: Date;
    userId: string;
    shippingInfo: {
        address: string;
        city: string;
    };
};

export type OrderStatus ={
    status: "pending" | "shipped" | "delivered" | "cancelled";
};
