import type { Product } from "@/types/product";

export type ProductsState = {
  items: Product[];
  loading: boolean;
  error: string | null;
};

export const initialProductsState: ProductsState = {
  items: [],
  loading: false,
  error: null,
};

export type ProductsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Product[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ADD"; payload: Product }
  | { type: "ADD_MANY"; payload: Product[] }
  | { type: "UPDATE"; payload: Product }
  | { type: "REMOVE"; payload: string }
  | { type: "RESET" };

export function productsReducer(
  state: ProductsState,
  action: ProductsAction,
): ProductsState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };

    case "FETCH_SUCCESS":
      return { items: action.payload, loading: false, error: null };

    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "ADD":
      return { ...state, items: [action.payload, ...state.items] };

    case "ADD_MANY":
      return { ...state, items: [...action.payload, ...state.items] };

    case "UPDATE":
      return {
        ...state,
        items: state.items.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
      };

    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((p) => p.id !== action.payload),
      };

    case "RESET":
      return initialProductsState;

    default:
      return state;
  }
}
