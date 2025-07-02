import { analyzeMessage } from "../contextService";
import { natural } from "../../utils/naturalConfig";
import { analyzeWithLLM } from "../llmService";

jest.mock("../../utils/naturalConfig");
jest.mock("../llmService");

describe("contextService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeMessage", () => {
    it("should identify technical messages", async () => {
      (natural.analyze as jest.Mock).mockReturnValue({
        technicalScore: 0.9,
        specificityScore: 0.8,
        confidence: 0.8,
      });

      const result = await analyzeMessage("Error: Invalid syntax at line 42");
      expect(result.isTechnical).toBe(true);
      expect(result.qualityScore).toBeGreaterThan(0.7);
    });

    it("should fallback to LLM for uncertain messages", async () => {
      (natural.analyze as jest.Mock).mockReturnValue({
        technicalScore: 0.4,
        specificityScore: 0.3,
        confidence: 0.5,
      });
      (analyzeWithLLM as jest.Mock).mockResolvedValue({
        isTechnical: true,
        containsRequirements: false,
        qualityScore: 0.6,
        timestamp: Date.now(),
      });

      const _result = await analyzeMessage("This might be important");
      expect(analyzeWithLLM).toHaveBeenCalled();
    });
  });

  describe("buildChatContext", () => {
    it("should filter and sort messages", async () => {
      // Test implementation
    });
  });
});
