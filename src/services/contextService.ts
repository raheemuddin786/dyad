import { natural } from "@/utils/naturalConfig";
import { ChatMessage } from "@/types/chat";
import { getCodeContext } from "./codeService";
import { analyzeWithLLM } from "./llmService";

const CACHE_SIZE = 100;
const messageCache = new Map<string, MessageAnalysis>();

interface MessageAnalysis {
  isTechnical: boolean;
  containsRequirements: boolean;
  qualityScore: number;
  timestamp: number;
}

function hasTechnicalIndicators(content: string): boolean {
  const techPatterns = [
    /error:\s*.+/i,
    /exception:\s*.+/i,
    /at\s+.+:\d+:\d+/,
    /```[\s\S]+```/,
  ];
  return techPatterns.some((p) => p.test(content));
}

function hasSpecificRequirements(content: string): boolean {
  return (
    content.length > 20 &&
    !content.startsWith("Can you") &&
    !content.endsWith("?") &&
    (content.includes("should") ||
      content.includes("must") ||
      content.includes("need"))
  );
}

export async function analyzeMessage(
  content: string,
): Promise<MessageAnalysis> {
  const cacheKey = content.toLowerCase().trim();

  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey)!;
  }

  let analysis: MessageAnalysis = {
    isTechnical: false,
    containsRequirements: false,
    qualityScore: 0.5,
    timestamp: Date.now(),
  };

  try {
    const nlpResult = natural.analyze(content);
    analysis = {
      isTechnical: nlpResult.technicalScore > 0.6,
      containsRequirements: nlpResult.specificityScore > 0.7,
      qualityScore:
        nlpResult.technicalScore * 0.6 + nlpResult.specificityScore * 0.4,
      timestamp: Date.now(),
    };

    if (analysis.qualityScore < 0.5) {
      analysis = await analyzeWithLLM(content);
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    analysis = {
      isTechnical: hasTechnicalIndicators(content),
      containsRequirements: hasSpecificRequirements(content),
      qualityScore: 0.5,
      timestamp: Date.now(),
    };
  }

  if (messageCache.size >= CACHE_SIZE) {
    messageCache.delete([...messageCache.keys()][0]);
  }
  messageCache.set(cacheKey, analysis);

  return analysis;
}

export async function buildChatContext(
  messages: ChatMessage[],
  currentError: string,
) {
  const filtered = [];

  for (const msg of messages.slice(-10)) {
    const analysis = await analyzeMessage(msg.content);
    if (analysis.isTechnical || analysis.qualityScore > 0.4) {
      filtered.push({
        ...msg,
        analysisScore: analysis.qualityScore,
      });
    }
  }

  return {
    error: currentError,
    messages: filtered
      .sort((a, b) => b.analysisScore - a.analysisScore)
      .slice(0, 5),
    codeContext: await getCodeContext(currentError),
  };
}

export type { MessageAnalysis };
