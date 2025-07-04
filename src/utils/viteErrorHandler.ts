import { previewErrorMessageAtom } from "@/atoms/appAtoms";
import { useSetAtom } from "jotai";

interface ViteErrorPayload {
  err: {
    message: string;
    stack?: string;
  };
}

declare global {
  interface ImportMeta {
    hot?: {
      on(event: string, cb: (payload: ViteErrorPayload) => void): void;
    };
  }
}

export const setupViteErrorHandling = () => {
  const setError = useSetAtom(previewErrorMessageAtom);

  if (import.meta.hot) {
    import.meta.hot.on("vite:error", (payload: ViteErrorPayload) => {
      if (payload.err.message.includes("Failed to resolve import")) {
        setError(`Module resolution error: ${payload.err.message}`);
      } else {
        setError(payload.err.message);
      }
    });

    import.meta.hot.on("vite:invalidate", () => {
      setError(undefined);
    });
  }

  window.addEventListener("error", (event) => {
    if (event.message.includes("vite") || event.filename?.includes("vite")) {
      setError(event.message);
    }
  });
};
