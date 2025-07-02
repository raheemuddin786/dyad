import { useEffect, useRef } from "react";
import { useLocation, useMatches } from "@tanstack/react-router";
import { store } from "@/store";

interface Breadcrumb {
  title: string;
  path: string;
}

export function useNavigationPreservation() {
  const location = useLocation();
  const matches = useMatches();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    const breadcrumbs = matches.reduce<Breadcrumb[]>((acc, match) => {
      if (match.routeId) {
        acc.push({
          title: match.routeId.split("/").pop() || match.pathname,
          path: match.pathname,
        });
      }
      return acc;
    }, []);

    const menuElements = document.querySelectorAll("[data-menu-item]");
    const menuState: Record<string, boolean> = {};
    menuElements.forEach((el) => {
      const id = el.getAttribute("data-menu-item");
      if (id) {
        menuState[id] = el.getAttribute("aria-expanded") === "true";
      }
    });

    store.registerNavigationState({
      path: location.pathname,
      breadcrumbs: breadcrumbs.map((b) => b.title),
      menuState,
    });
  }, [location.pathname, matches]);
}
