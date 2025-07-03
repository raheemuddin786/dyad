import { createRootRoute, createRoute } from "@tanstack/react-router";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

export const rootRoute = createRootRoute();

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFound,
});

export const routeTree = rootRoute.addChildren([indexRoute, notFoundRoute]);
