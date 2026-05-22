import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  type Dispatch,
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
  type ProductsAction,
  type ProductsState,
} from "../reducers/productsReducer";

type ProductsContextType = {
  state: ProductsState;
  dispatch: Dispatch<ProductsAction>;
  fetchAll: () => Promise<void>;
  createOne: (input: ProductInput) => Promise<string>;
  updateOne: (id: string, input: Partial<ProductInput>) => Promise<void>;
  removeOne: (id: string) => Promise<void>;
  bulkCreate: (inputs: ProductInput[]) => Promise<number>;
};

export const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(productsReducer, initialProductsState);

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

  const createOne = useCallback(
    async (input: ProductInput): Promise<string> => {
      const id = await svcCreateProduct(input);
      // Releemos el producto recién creado para tener el `createdAt` del server
      const fresh = await getProductById(id);
      if (fresh) dispatch({ type: "ADD", payload: fresh });
      return id;
    },
    [],
  );

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

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <ProductsContext.Provider
      value={{
        state,
        dispatch,
        fetchAll,
        createOne,
        updateOne,
        removeOne,
        bulkCreate,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
