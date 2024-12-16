import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
// import { persistQueryClient } from "@tanstack/react-query-persist-client";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // networkMode: "offlineFirst",
      gcTime: 1000 * 60 * 60 * 168, // 24 hours
      staleTime: Infinity,
      retry: 0,
    },
  },
});

// const localStoragePersister = createSyncStoragePersister({
//   storage: typeof window !== "undefined" ? window.localStorage : undefined,
// });
// // const sessionStoragePersister = createSyncStoragePersister({ storage: window.sessionStorage })

// persistQueryClient({
//   queryClient,
//   persister: localStoragePersister,
// });

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}
