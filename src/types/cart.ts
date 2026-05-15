import type { Products } from "./product";

export type CartItem = Products & {
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { 
    type: "ADD_TO_CART";
    payload: Products;
    }
  | {
     type: "REMOVE_FROM_CART"; 
     payload: number;
    }
  | { 
    type: "UPDATE_QUANTITY"; 
    payload: { id: string; quantity: number } 
    }
  | { 
    type: "CLEAR_CART" 
    };
