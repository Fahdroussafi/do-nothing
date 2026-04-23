import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./client.js";

export function ReactQueryProvider({ children }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
