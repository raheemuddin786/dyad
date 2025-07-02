export const configureNatural = () => {
  return {
    analyze: (text: string) => ({
      technicalScore: text.includes("error") ? 0.8 : 0.3,
      specificityScore: text.includes("should") ? 0.9 : 0.4,
      confidence: 0.7,
    }),
  };
};

export const natural = configureNatural();
