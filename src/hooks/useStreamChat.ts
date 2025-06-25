import { useCallback } from "react";
import type { ComponentSelection, Message } from "@/ipc/ipc_types";
import { useAtom, useSetAtom } from "jotai";
import {
  chatErrorAtom,
  chatMessagesAtom,
  chatStreamCountAtom,
  isStreamingAtom,
} from "@/atoms/chatAtoms";
import { IpcClient } from "@/ipc/ipc_client";
import { isPreviewOpenAtom } from "@/atoms/viewAtoms";
import type { ChatResponseEnd } from "@/ipc/ipc_types";
import { useChats } from "./useChats";
import { useLoadApp } from "./useLoadApp";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { useVersions } from "./useVersions";
import { showExtraFilesToast } from "@/lib/toast";
import { useProposal } from "./useProposal";
import { useSearch } from "@tanstack/react-router";
import { useRunApp } from "./useRunApp";
import { useCountTokens } from "./useCountTokens";
import { useUserBudgetInfo } from "./useUserBudgetInfo";
import { usePostHog } from "posthog-js/react";

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

export function getRandomNumberId() {
  return Math.floor(Math.random() * 1_000_000_000_000_000);
}

export function useStreamChat({
  hasChatId = true,
}: { hasChatId?: boolean } = {}) {
  const [, setMessages] = useAtom(chatMessagesAtom);
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  const [error, setError] = useAtom(chatErrorAtom);
  const setIsPreviewOpen = useSetAtom(isPreviewOpenAtom);
  const [selectedAppId] = useAtom(selectedAppIdAtom);
  const { refreshChats } = useChats(selectedAppId);
  const { refreshApp } = useLoadApp(selectedAppId);
  const setStreamCount = useSetAtom(chatStreamCountAtom);
  const { refreshVersions } = useVersions(selectedAppId);
  const { refreshAppIframe } = useRunApp();
  const { countTokens } = useCountTokens();
  const { refetchUserBudget } = useUserBudgetInfo();
  const posthog = usePostHog();
  let chatId: number | undefined;

  if (hasChatId) {
    const { id } = useSearch({ from: "/chat" });
    chatId = id;
  }
  let { refreshProposal } = hasChatId ? useProposal(chatId) : useProposal();

  const streamMessage = useCallback(
    async ({
      prompt,
      chatId,
      redo,
      attachments,
      selectedComponent,
    }: {
      prompt: string;
      chatId: number;
      redo?: boolean;
      attachments?: File[];
      selectedComponent?: ComponentSelection | null;
    }) => {
      if (
        (!prompt.trim() && (!attachments || attachments.length === 0)) ||
        !chatId
      ) {
        return;
      }

      setError(null);
      setIsStreaming(true);
      let hasIncrementedStreamCount = false;

      // Create cleanup function for stream completion/error
      const cleanup = () => {
        setIsStreaming(false);
        refreshChats();
        refreshApp();
        refreshVersions();
        countTokens(chatId, "");
      };

      try {
        // Track initial memory
        const perf = window.performance as ExtendedPerformance;
        if (perf?.memory) {
          console.log(
            `[MEMORY] Initial: ${(perf.memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
          );
        }

        IpcClient.getInstance().streamMessage(prompt, {
          selectedComponent: selectedComponent ?? null,
          chatId,
          redo,
          attachments,
          onUpdate: (updatedMessages: Message[]) => {
            if (!hasIncrementedStreamCount) {
              setStreamCount((streamCount) => streamCount + 1);
              hasIncrementedStreamCount = true;
            }

            // Use functional update to avoid closure issues
            setMessages((prev) => {
              // Only keep last 50 messages to prevent memory buildup
              const newMessages = [...prev, ...updatedMessages];
              return newMessages.slice(-50);
            });

            // Log memory during updates
            if (perf?.memory && updatedMessages.length % 5 === 0) {
              console.log(
                `[MEMORY] Update: ${(perf.memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
              );
            }
          },
          onEnd: (response: ChatResponseEnd) => {
            if (response.updatedFiles) {
              setIsPreviewOpen(true);
              refreshAppIframe();
            }
            if (response.extraFiles) {
              showExtraFilesToast({
                files: response.extraFiles,
                error: response.extraFilesError,
                posthog,
              });
            }
            refreshProposal(chatId);
            refetchUserBudget();
            cleanup();

            // Log final memory
            if (perf?.memory) {
              console.log(
                `[MEMORY] Final: ${(perf.memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
              );
            }
          },
          onError: (errorMessage: string) => {
            console.error(`[CHAT] Stream error for ${chatId}:`, errorMessage);
            setError(errorMessage);
            cleanup();
          },
        });
      } catch (error) {
        console.error("[CHAT] Exception during streaming setup:", error);
        setError(error instanceof Error ? error.message : String(error));
        cleanup();
      }
    },
    [setMessages, setIsStreaming, setIsPreviewOpen, refetchUserBudget],
  );

  return {
    streamMessage,
    isStreaming,
    error,
    setError,
    setIsStreaming,
  };
}
