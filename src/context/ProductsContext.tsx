import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  createProduct as svcCreateProduct,
  deleteProduct as svcDeleteProduct,
  getProductById,
  getProducts,
  updateProduct as svcUpdateProduct,
  type ProductInput,
} from "../services/products.service";
import {
  initialProductsState,
  productsReducer,
  type ProductsState,
} from "../reducers/productsReducer";

export type ProductsStateContextType = {
  state: ProductsState;
  fetchAll: () => Promise<void>;
};

export type ProductsActionsContextType = {
  createOne: (input: ProductInput) => Promise<string>;
  updateOne: (id: string, input: Partial<ProductInput>) => Promise<void>;
  removeOne: (id: string) => Promise<void>;
  bulkCreate: (inputs: ProductInput[]) => Promise<number>;
  syncStockAfterPurchase: (
    items: Array<{ id: string; quantity: number }>,
  ) => void;
};

export const ProductsStateContext =
  createContext<ProductsStateContextType | null>(null);

export const ProductsActionsContext =
  createContext<ProductsActionsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(productsReducer, initialProductsState);

  // Ref para que syncStockAfterPurchase sea siempre estable (sin deps de state)
  const itemsRef = useRef(state.items);
  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  const fetchAll = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const items = await getProducts();
      dispatch({ type: "FETCH_SUCCESS", payload: items });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload:
          err instanceof Error ? err.message : "Error al cargar productos",
      });
    }
  }, []);

  const createOne = useCallback(async (input: ProductInput): Promise<string> => {
    const id = await svcCreateProduct(input);
    const fresh = await getProductById(id);
    if (fresh) dispatch({ type: "ADD", payload: fresh });
    return id;
  }, []);

  const updateOne = useCallback(
    async (id: string, input: Partial<ProductInput>): Promise<void> => {
      await svcUpdateProduct(id, input);
      const fresh = await getProductById(id);
      if (fresh) dispatch({ type: "UPDATE", payload: fresh });
    },
    [],
  );

  const removeOne = useCallback(async (id: string): Promise<void> => {
    await svcDeleteProduct(id);
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const bulkCreate = useCallback(
    async (inputs: ProductInput[]): Promise<number> => {
      const ids = await Promise.all(inputs.map((p) => svcCreateProduct(p)));
      const fresh = (
        await Promise.all(ids.map((id) => getProductById(id)))
      ).filter((p): p is NonNullable<typeof p> => p !== null);
      dispatch({ type: "ADD_MANY", payload: fresh });
      return fresh.length;
    },
    [],
  );

  const syncStockAfterPurchase = useCallback(
    (items: Array<{ id: string; quantity: number }>) => {
      items.forEach(({ id, quantity }) => {
        const product = itemsRef.current.find((p) => p.id === id);
        if (product) {
          dispatch({
            type: "UPDATE",
            payload: { ...product, stock: product.stock - quantity },
          });
        }
      });
    },
    [],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <ProductsStateContext.Provider value={{ state, fetchAll }}>
      <ProductsActionsContext.Provider
        value={{
          createOne,
          updateOne,
          removeOne,
          bulkCreate,
          syncStockAfterPurchase,
        }}
      >
        {children}
      </ProductsActionsContext.Provider>
    </ProductsStateContext.Provider>
  );
}
