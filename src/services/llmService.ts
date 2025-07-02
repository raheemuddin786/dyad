export async function analyzeWithLLM(content: string): Promise<{
  isTechnical: boolean;
  containsRequirements: boolean;
  qualityScore: number;
  timestamp: number;
}> {
  // Actual LLM implementation would go here
  return {
    isTechnical: content.length > 20,
    containsRequirements:
      content.includes("should") || content.includes("must"),
    qualityScore: 0.7,
    timestamp: Date.now(),
  };
}
