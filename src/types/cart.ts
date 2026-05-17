import type { Product } from "./product";

export type CartItem = Product & {
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | {
      type: "ADD_TO_CART";
      payload: Product;
    }
  | {
      type: "REMOVE_FROM_CART";
      payload: string;
    }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: string; quantity: number };
    }
  | {
      type: "CLEAR_CART";
    };
