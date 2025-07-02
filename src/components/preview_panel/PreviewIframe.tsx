import React, { useState, useRef, useEffect } from "react";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import {
  selectedAppIdAtom,
  appUrlAtom,
  appOutputAtom,
  previewErrorMessageAtom,
} from "@/atoms/appAtoms";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";
import { selectedComponentPreviewAtom } from "@/atoms/previewAtoms";
import { useStreamChat } from "@/hooks/useStreamChat";
import { ComponentSelection } from "@/ipc/ipc_types";
import { IpcClient } from "@/ipc/ipc_client";
import { useLoadAppFile } from "@/hooks/useLoadAppFile";
import {
  Sparkles,
  X,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Lightbulb,
  ChevronRight,
  MousePointerClick,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface _AppOutput {
  message: string;
  type: "client-error" | "stdout" | "stderr" | "info";
  appId: number;
  timestamp: number;
}
interface ErrorBannerProps {
  error: string | undefined;
  onDismiss: () => void;
  onAIFix: () => void;
}

const ErrorBanner = ({ error, onDismiss, onAIFix }: ErrorBannerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { isStreaming } = useStreamChat();

  if (!error) return null;

  const getTruncatedError = () => {
    const firstLine = error.split("\n")[0];
    const snippetLength = 200;
    const snippet = error.substring(0, snippetLength);
    return firstLine.length < snippet.length
      ? firstLine
      : snippet + (snippet.length === snippetLength ? "..." : "");
  };

  return (
    <div className="absolute top-2 left-2 right-2 z-10 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md shadow-sm p-2">
      <div className="flex justify-between items-start">
        <div
          className="text-red-700 dark:text-red-300 text-wrap font-mono whitespace-pre-wrap break-words text-xs cursor-pointer flex gap-1 items-start"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronRight
            size={14}
            className={`mt-0.5 transform transition-transform ${
              isCollapsed ? "" : "rotate-90"
            }`}
          />
          {isCollapsed ? getTruncatedError() : error}
        </div>
        <button onClick={onDismiss} className="p-1">
          <X size={16} className="text-red-500 dark:text-red-400" />
        </button>
      </div>

      <div className="mt-2 px-2">
        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-sm flex gap-1 items-center">
          <Lightbulb size={16} className="text-red-800 dark:text-red-300" />
          <span className="text-sm text-red-700 dark:text-red-200">
            <span className="font-medium">Tip: </span>Check if restarting the
            app fixes the error.
          </span>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          disabled={isStreaming}
          onClick={onAIFix}
          className="flex items-center gap-2 px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded text-sm hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50"
          data-testid="ai-fix-button"
        >
          <Sparkles size={14} />
          <span>Fix with AI</span>
        </button>
      </div>
    </div>
  );
};

export const PreviewIframe = ({ loading }: { loading: boolean }) => {
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const { appUrl, originalUrl } = useAtomValue(appUrlAtom);
  const setAppOutput = useSetAtom(appOutputAtom);
  const [errorMessage, setErrorMessage] = useAtom(previewErrorMessageAtom);
  const selectedChatId = useAtomValue(selectedChatIdAtom);
  const { streamMessage } = useStreamChat();
  const [availableRoutes, setAvailableRoutes] = useState<
    Array<{ path: string; label: string }>
  >([]);

  // Get storage key for current app
  const storageKey = `previewContext_${selectedAppId}`;

  // Initialize state from localStorage if available
  const [reloadKey, setReloadKey] = useState<number>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? JSON.parse(savedState).reloadKey || 0 : 0;
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { content: routerContent } = useLoadAppFile(
    selectedAppId,
    "src/App.tsx",
  );

  // Parse routes from router content
  useEffect(() => {
    if (routerContent) {
      const routes: Array<{ path: string; label: string }> = [];
      const routePathsRegex = /<Route\s+(?:[^>]*\s+)?path=["']([^"']+)["']/g;
      let match;

      while ((match = routePathsRegex.exec(routerContent)) !== null) {
        const path = match[1];
        const label =
          path === "/"
            ? "Home"
            : path
                .split("/")
                .filter((segment) => segment && !segment.startsWith(":"))
                .pop()
                ?.replace(/[-_]/g, " ")
                .replace(/^\w/, (c) => c.toUpperCase()) || path;

        if (!routes.some((r) => r.path === path)) {
          routes.push({ path, label });
        }
      }

      setAvailableRoutes(routes);
    }
  }, [routerContent]);

  // Navigation state
  const [isComponentSelectorInitialized, setIsComponentSelectorInitialized] =
    useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? JSON.parse(savedState).navigationHistory || [] : [];
  });
  const [currentHistoryPosition, setCurrentHistoryPosition] = useState<number>(
    () => {
      const savedState = localStorage.getItem(storageKey);
      return savedState
        ? JSON.parse(savedState).currentHistoryPosition || 0
        : 0;
    },
  );
  const [selectedComponentPreview, setSelectedComponentPreview] = useAtom(
    selectedComponentPreviewAtom,
  );
  const [isPicking, setIsPicking] = useState<boolean>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? JSON.parse(savedState).isPicking || false : false;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      reloadKey,
      navigationHistory,
      currentHistoryPosition,
      isPicking,
      selectedComponentPreview,
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [
    reloadKey,
    navigationHistory,
    currentHistoryPosition,
    isPicking,
    selectedComponentPreview,
    storageKey,
  ]);

  // Clear storage when app changes
  useEffect(() => {
    return () => {
      localStorage.removeItem(storageKey);
    };
  }, [storageKey]);

  // Message handling
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const { type, payload } = event.data as {
        type: string;
        payload?: any;
      };

      if (type === "dyad-component-selector-initialized") {
        setIsComponentSelectorInitialized(true);
      } else if (type === "dyad-component-selected") {
        setSelectedComponentPreview(parseComponentSelection(event.data));
        setIsPicking(false);
      } else if (
        type === "window-error" ||
        type === "unhandled-rejection" ||
        type === "iframe-sourcemapped-error"
      ) {
        const errorMessage = `Error ${payload?.message || payload?.reason}\n${payload?.stack}`;
        setErrorMessage(errorMessage);
        setAppOutput((prev) => [
          ...prev,
          {
            message: `Iframe error: ${errorMessage}`,
            type: "client-error",
            appId: selectedAppId!,
            timestamp: Date.now(),
          },
        ]);
      } else if (type === "pushState" || type === "replaceState") {
        if (payload?.newUrl) {
          const newHistory =
            type === "pushState"
              ? [
                  ...navigationHistory.slice(0, currentHistoryPosition + 1),
                  payload.newUrl,
                ]
              : navigationHistory.map((url, i) =>
                  i === currentHistoryPosition ? payload.newUrl : url,
                );

          setNavigationHistory(newHistory);
          setCurrentHistoryPosition(
            type === "pushState"
              ? newHistory.length - 1
              : currentHistoryPosition,
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigationHistory, currentHistoryPosition, selectedAppId]);

  // Initialize navigation
  useEffect(() => {
    if (appUrl) {
      setNavigationHistory([appUrl]);
      setCurrentHistoryPosition(0);
    }
  }, [appUrl]);

  // Update nav buttons
  useEffect(() => {
    setCanGoBack(currentHistoryPosition > 0);
    setCanGoForward(currentHistoryPosition < navigationHistory.length - 1);
  }, [navigationHistory, currentHistoryPosition]);

  // Component selection handlers
  const handleActivateComponentSelector = () => {
    if (iframeRef.current?.contentWindow) {
      const newIsPicking = !isPicking;
      setIsPicking(newIsPicking);
      iframeRef.current.contentWindow.postMessage(
        {
          type: newIsPicking
            ? "activate-dyad-component-selector"
            : "deactivate-dyad-component-selector",
        },
        "*",
      );
    }
  };

  // Navigation handlers
  const handleNavigate = (direction: "back" | "forward") => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "navigate", payload: { direction } },
        "*",
      );
      setCurrentHistoryPosition((prev) =>
        direction === "back" ? prev - 1 : prev + 1,
      );
    }
  };

  const navigateToRoute = (path: string) => {
    if (iframeRef.current?.contentWindow && appUrl) {
      const newUrl = `${new URL(appUrl).origin}${path}`;
      iframeRef.current.contentWindow.location.href = newUrl;
      const newHistory = [
        ...navigationHistory.slice(0, currentHistoryPosition + 1),
        newUrl,
      ];
      setNavigationHistory(newHistory);
      setCurrentHistoryPosition(newHistory.length - 1);
    }
  };

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
    setErrorMessage(undefined);
  };

  const handleAIFix = () => {
    if (selectedChatId && errorMessage) {
      streamMessage({
        prompt: `Fix this error while preserving current UI state:\n\nError: ${errorMessage}\n\nCurrent URL: ${appUrl}\nSelected Component: ${
          selectedComponentPreview?.name || "none"
        }`,
        chatId: selectedChatId,
        selectedComponent: selectedComponentPreview,
      });
    }
  };

  if (loading) {
    return <div className="p-4 dark:text-gray-300">Loading app preview...</div>;
  }

  if (!selectedAppId) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        Select an app to see the preview.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 border-b space-x-2">
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleActivateComponentSelector}
                  className={`p-1 rounded ${
                    isPicking
                      ? "bg-purple-500 text-white"
                      : "text-purple-700 dark:text-purple-300"
                  }`}
                  disabled={!isComponentSelectorInitialized}
                >
                  <MousePointerClick size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isPicking ? "Cancel selection" : "Select component"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            onClick={() => handleNavigate("back")}
            disabled={!canGoBack}
            className="p-1 rounded disabled:opacity-50"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            onClick={() => handleNavigate("forward")}
            disabled={!canGoForward}
            className="p-1 rounded disabled:opacity-50"
          >
            <ArrowRight size={16} />
          </button>

          <button onClick={handleReload} className="p-1 rounded">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="relative flex-grow">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-between px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm cursor-pointer">
                <span>
                  {navigationHistory[currentHistoryPosition]
                    ? new URL(navigationHistory[currentHistoryPosition])
                        .pathname
                    : "/"}
                </span>
                <ChevronDown size={14} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {availableRoutes.map((route) => (
                <DropdownMenuItem
                  key={route.path}
                  onClick={() => navigateToRoute(route.path)}
                  className="flex justify-between"
                >
                  <span>{route.label}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {route.path}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {originalUrl && (
          <button
            onClick={() => IpcClient.getInstance().openExternalUrl(originalUrl)}
            className="p-1 rounded"
          >
            <ExternalLink size={16} />
          </button>
        )}
      </div>

      <div className="relative flex-grow">
        {errorMessage && (
          <ErrorBanner
            error={errorMessage}
            onDismiss={() => setErrorMessage(undefined)}
            onAIFix={handleAIFix}
          />
        )}

        {!appUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-gray-950">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-300">
              Starting up your app...
            </p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={reloadKey}
            title={`Preview for App ${selectedAppId}`}
            className="w-full h-full border-none bg-white dark:bg-gray-950"
            src={appUrl}
            onLoad={() => setErrorMessage(undefined)}
          />
        )}
      </div>
    </div>
  );
};

function parseComponentSelection(data: any): ComponentSelection | null {
  if (!data || data.type !== "dyad-component-selected") return null;

  const parts = data.id.split(":");
  if (parts.length < 3) return null;

  const columnStr = parts.pop();
  const lineStr = parts.pop();
  const relativePath = parts.join(":");

  const lineNumber = parseInt(lineStr, 10);
  const columnNumber = parseInt(columnStr, 10);

  if (isNaN(lineNumber) || isNaN(columnNumber)) return null;

  return {
    id: data.id,
    name: data.name,
    relativePath,
    lineNumber,
    columnNumber,
  };
}

export { ErrorBanner };
