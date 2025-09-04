/* eslint-disable react/react-in-jsx-scope */
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { HydratedRouter, RouterProvider } from "react-router/dom";
import { createBrowserRouter } from "react-router";
import React, { startTransition, StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import store from "./store";
import { queryClient } from "./query-client-config";

async function prepareApp() {
  if (
    process.env.NODE_ENV === "development" &&
    import.meta.env.VITE_MOCK_API === "true"
  ) {
    const { worker } = await import("./mocks/browser");

    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

prepareApp().then(async () =>
  startTransition(async () => {
    // If SSR context is available (Remix SPA/SSR), HydratedRouter will work.
    const hasSSRContext =
      typeof window !== "undefined" &&
      (window as any).__reactRouterContext &&
      (window as any).__reactRouterManifest &&
      (window as any).__reactRouterRouteModules;

    let routerUI: React.ReactNode;
    if (hasSSRContext) {
      routerUI = <HydratedRouter />;
    } else {
      // Client-only fallback: dynamically create a router from generated routes.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const routesModule = await import("/src/routes.client.ts");
      const routes = routesModule?.default ?? [];
      const router = createBrowserRouter(routes as any);
      routerUI = <RouterProvider router={router} />;
    }

    const app = (
      <StrictMode>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>{routerUI}</QueryClientProvider>
        </Provider>
        <div id="modal-portal-exit" />
      </StrictMode>
    );

    if (hasSSRContext) {
      hydrateRoot(document, app);
    } else {
      const container = document.getElementById("root");
      if (!container) {
        const el = document.createElement("div");
        el.id = "root";
        document.body.appendChild(el);
        createRoot(el).render(app);
      } else {
        createRoot(container).render(app);
      }
    }
  }),
);
