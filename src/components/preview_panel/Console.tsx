import { appOutputAtom } from "@/atoms/appAtoms";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

// Console component
export const Console = () => {
  const appOutput = useAtomValue(appOutputAtom);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [appOutput]);

  // Track memory usage
  useEffect(() => {
    const perf = window.performance as ExtendedPerformance;
    if (perf?.memory) {
      const memory = perf.memory;
      console.log(
        `[MEMORY] Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
      );
    }
  }, [appOutput]);

  return (
    <div
      ref={consoleRef}
      className="font-mono text-xs px-4 h-full overflow-auto"
    >
      {appOutput.map((output, index) => (
        <div
          key={index}
          className={
            output.type === "stderr" || output.type === "client-error"
              ? "text-red-500"
              : ""
          }
        >
          {output.message}
        </div>
      ))}
    </div>
  );
};
