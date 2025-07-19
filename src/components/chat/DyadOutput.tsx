import React, { useState, useEffect } from "react";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";
import { useStreamChat } from "@/hooks/useStreamChat";
import { selectedComponentPreviewAtom } from "@/atoms/previewAtoms";

interface DyadOutputProps {
  type: "error" | "warning";
  message?: string;
  children?: React.ReactNode;
}

export const DyadOutput: React.FC<DyadOutputProps> = ({
  type,
  message,
  children,
}) => {
  const storageKey = `dyadOutput_${useAtomValue(selectedChatIdAtom)}`;

  // Initialize state from localStorage
  const [isContentVisible, setIsContentVisible] = useState<boolean>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? JSON.parse(savedState).isContentVisible : false;
  });

  const selectedChatId = useAtomValue(selectedChatIdAtom);
  const { streamMessage } = useStreamChat();
  const selectedComponentPreview = useAtomValue(selectedComponentPreviewAtom);

  // Enhanced error classification
  const getErrorDetails = () => {
    if (!message) return { type: "ERROR", formattedMessage: "" };

    const moduleError = message.match(/Cannot find module ['"](.+?)['"]/);
    const syntaxError = message.match(/SyntaxError:.+/);
    const typeError = message.match(/TypeError:.+/);

    if (moduleError) {
      return {
        type: "MODULE_NOT_FOUND",
        formattedMessage: `Missing module: ${moduleError[1]}\n${message}`,
      };
    }
    if (syntaxError) {
      return {
        type: "SYNTAX_ERROR",
        formattedMessage: message,
      };
    }
    if (typeError) {
      return {
        type: "TYPE_ERROR",
        formattedMessage: message,
      };
    }
    return {
      type: "RUNTIME_ERROR",
      formattedMessage: message,
    };
  };

  const { type: errorType, formattedMessage } = getErrorDetails();

  // Save state to localStorage
  useEffect(() => {
    const state = {
      isContentVisible,
      message,
      errorType,
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
    if (message && selectedChatId)
      streamMessage({
        prompt: `Understand this error and provide best fix while not disrupting other components:\n\nError: ${formattedMessage}\n\nSelected Component: ${
          selectedComponentPreview?.name || "none"
        }`,
        chatId: selectedChatId,
        selectedComponent: selectedComponentPreview,
      });
  }, [isContentVisible, message, errorType, storageKey]);

  const handleAIFix = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message && selectedChatId) {
      streamMessage({
        prompt: `Understand this error and provide best fix while not disrupting other components:\n\nError: ${formattedMessage}\n\nSelected Component: ${
          selectedComponentPreview?.name || "none"
        }`,
        chatId: selectedChatId,
        selectedComponent: selectedComponentPreview,
      });
    }
  };

  // Rest of the component implementation remains the same...
  const isError = type !== "warning";
  const borderColor = isError ? "border-red-500" : "border-amber-500";
  const iconColor = isError ? "text-red-500" : "text-amber-500";
  const icon = isError ? (
    <XCircle size={16} className={iconColor} />
  ) : (
    <AlertTriangle size={16} className={iconColor} />
  );
  const label = isError ? "Error" : "Warning";

  return (
    <div
      className={`relative bg-(--background-lightest) hover:bg-(--background-lighter) rounded-lg px-4 py-2 border my-2 cursor-pointer min-h-18 ${borderColor}`}
      onClick={() => setIsContentVisible(!isContentVisible)}
    >
      {/* Top-left label badge with error type */}
      <div
        className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${iconColor} bg-white dark:bg-gray-900`}
        style={{ zIndex: 1 }}
      >
        {icon}
        <span>{isError ? `${label} (${errorType})` : label}</span>
      </div>

      {/* Fix with AI button - always visible for errors */}
      {isError && message && (
        <div className="absolute top-9 left-2">
          <button
            onClick={handleAIFix}
            className="cursor-pointer flex items-center justify-center bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded text-xs p-1 w-24 h-6"
            data-testid="ai-fix-button"
          >
            <Sparkles size={16} className="mr-1" />
            <span>Fix with AI</span>
          </button>
        </div>
      )}

      {/* Main content remains the same */}
      <div className="flex items-center justify-between pl-24 pr-6">
        <div className="flex items-center gap-2">
          {message && (
            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              {formattedMessage.slice(0, isContentVisible ? undefined : 100) +
                (!isContentVisible ? "..." : "")}
            </span>
          )}
        </div>
        <div className="flex items-center">
          {isContentVisible ? (
            <ChevronsDownUp
              size={20}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            />
          ) : (
            <ChevronsUpDown
              size={20}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            />
          )}
        </div>
      </div>

      {isContentVisible && children && (
        <div className="mt-4 pl-20 text-sm text-gray-800 dark:text-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};
