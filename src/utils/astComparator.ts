import { parse } from "@babel/parser";
import type { Node } from "@babel/types";

interface ASTDifference {
  path: string[];
  before: string;
  after: string;
}

export function compareComponentAST(
  originalCode: string,
  modifiedCode: string,
): { hasChanges: boolean; differences: ASTDifference[] } {
  const originalAST = parse(originalCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const modifiedAST = parse(modifiedCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const differences: ASTDifference[] = [];
  const ignoreKeys = new Set(["loc", "start", "end", "extra"]);

  function compareNodes(
    path: string[],
    a: Node | null | undefined,
    b: Node | null | undefined,
  ) {
    if (!a || !b) {
      if (a !== b) {
        differences.push({
          path,
          before: a ? "Present" : "Absent",
          after: b ? "Present" : "Absent",
        });
      }
      return;
    }

    for (const key in a) {
      if (ignoreKeys.has(key)) continue;

      const newPath = [...path, key];
      const aVal = a[key as keyof Node];
      const bVal = b[key as keyof Node];

      if (typeof aVal !== typeof bVal) {
        differences.push({
          path: newPath,
          before: typeof aVal,
          after: typeof bVal,
        });
      }
    }
  }

  compareNodes([], originalAST, modifiedAST);

  return {
    hasChanges: differences.length > 0,
    differences,
  };
}
