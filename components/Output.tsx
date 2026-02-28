"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import toast from "react-hot-toast";
import { executeCode } from "@/lib/api";

interface OutputProps {
  editorRef: React.RefObject<{ getValue: () => string } | null>;
  language: string;
  /** "side" = classic 50% panel with Run button; "footer" = console-only, run triggered from header via ref */
  layout?: "side" | "footer";
}

export interface OutputHandle {
  runCode: () => Promise<string | undefined>;
}

const Output = forwardRef<OutputHandle, OutputProps>(function Output(
  { editorRef, language, layout = "side" },
  ref
) {
  const [output, setOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current?.getValue?.();
    if (!sourceCode) return undefined;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      const outLines = result.output;
      setOutput(outLines.split("\n"));
      setIsError(!!result.stderr);
      return outLines;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const description = err.response?.data?.error || err.message || "Unable to run code";
      toast.error(`Run code failed: ${description}`, { duration: 8000 });
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ runCode }), [language]);

  const outputLines = (
    <>
      {output.length > 0 ? (
        <>
          {output.map((line, i) => (
            <div key={i} className={isError ? "text-red-400" : "text-slate-300"}>
              {line}
            </div>
          ))}
          <div className="text-slate-500 italic mt-4">
            --- Execution finished with exit code {isError ? 1 : 0} ---
          </div>
        </>
      ) : layout === "footer" ? (
        <div className="text-slate-500">$ Run code from the header to see output here.</div>
      ) : (
        <div className="text-slate-400">Click &quot;Run Code&quot; to see the output here.</div>
      )}
    </>
  );

  if (layout === "footer") {
    return (
      <footer className="h-48 border-t border-slate-800 bg-background-dark flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-2 bg-background-dark border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">terminal</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Console Output
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isLoading ? "bg-yellow-500/10 text-yellow-500" : "bg-success/10 text-success"
                  }`}
              >
                {isLoading ? "RUNNING" : "READY"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setOutput([])}
              className="p-1 rounded hover:bg-slate-800 text-slate-400"
              aria-label="Clear"
            >
              <span className="material-symbols-outlined text-lg">block</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 font-mono text-sm custom-scrollbar bg-black/20">
          {outputLines}
        </div>
      </footer>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#0b0b1a] overflow-auto font-mono text-sm custom-scrollbar">
      {outputLines}
    </div>
  );
});

export default Output;
