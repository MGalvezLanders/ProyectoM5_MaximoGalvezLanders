import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Server compartido para toda la suite. El lifecycle (listen/resetHandlers/close)
// vive en src/test/setup.ts para que aplique a todos los tests.
export const server = setupServer(...handlers);
