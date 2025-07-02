import { useEffect, useRef } from "react";
import { store, type ComponentRegistry } from "../store";

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
};

const generateComponentTree = (componentName: string): string => {
  if (typeof document === "undefined") return "";

  const root = document.querySelector(`[data-component="${componentName}"]`);
  if (!root) return "";

  const walkDOM = (node: Element): string => {
    let result = node.tagName.toLowerCase();
    if (node.id) result += `#${node.id}`;

    node.getAttributeNames().forEach((attr) => {
      if (!["id", "data-component"].includes(attr)) {
        result += `[${attr}]`;
      }
    });

    Array.from(node.children).forEach((child) => {
      result += ` > ${walkDOM(child)}`;
    });

    return result;
  };

  return walkDOM(root);
};

export function useComponentRegistry(
  componentName: string,
  props: Record<string, unknown>,
) {
  const registryRef = useRef<ComponentRegistry>({
    originalProps: {},
    styleHashes: [],
    componentTree: "",
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const styles = Array.from(
      document.querySelectorAll(`style, [data-component="${componentName}"]`),
    ).map((el) => el.textContent || el.getAttribute("style") || "");

    registryRef.current = {
      originalProps: { ...props },
      styleHashes: styles.map((s) => simpleHash(s)),
      componentTree: generateComponentTree(componentName),
    };

    store.registerComponent(componentName, registryRef.current);
    return () => store.unregisterComponent(componentName);
  }, [componentName, props]);

  return registryRef.current;
}
