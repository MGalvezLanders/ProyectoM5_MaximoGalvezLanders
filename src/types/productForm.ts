export type ProductFormFields = {
  name: string;
  description: string;
  price: number | "";
  category: string;
  stock: number | "";
  imageUrl: string;
};

export type ProductFormErrors = {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  stock?: string;
  image?: string;
};

export type ProductFormStatus = "editing" | "submitting" | "success" | "error";

export type ProductFormState = {
  fields: ProductFormFields;
  errors: ProductFormErrors;
  status: ProductFormStatus;
  globalError: string | null;
};
