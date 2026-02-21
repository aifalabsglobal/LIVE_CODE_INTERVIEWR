"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Editor } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { CODE_SNIPPETS } from "@/constants";
import * as Y from "yjs";
import LiveblocksYjsProvider from "@liveblocks/yjs";
import { useRoom } from "@/lib/liveblocks";
import { MonacoBinding } from "y-monaco";
import type { Awareness } from "y-protocols/awareness";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

let savedCodeCount = 0;

interface CodeEditorProps {
  roomId: string;
  userId: string;
  /** When "workspace", only the editor area is rendered (for stitch layout). */
  layout?: "default" | "workspace";
  /** Optional ref to get editor instance from parent (e.g. for Run in header). */
  editorRefOut?: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
  language?: string;
  onLanguageChange?: (language: string) => void;
  onSaveClick?: () => void;
}

export default function CodeEditor({
  roomId,
  userId,
  layout = "default",
  editorRefOut,
  language: controlledLanguage,
  onLanguageChange,
  onSaveClick,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("//Code goes here");
  const [language, setLanguage] = useState(controlledLanguage ?? "javascript");
  const lang = controlledLanguage ?? language;
  const setLang = onLanguageChange ?? setLanguage;
  const room = useRoom();

  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const [yProvider, setYProvider] = useState<InstanceType<typeof LiveblocksYjsProvider> | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    const provider = new LiveblocksYjsProvider(room, ydocRef.current);
    setYProvider(provider);
    return () => {
      provider.destroy();
      setYProvider(null);
    };
  }, [room]);

  const yText = ydocRef.current.getText("monaco");

  const onMount = useCallback(
    (e: editor.IStandaloneCodeEditor) => {
      editorRef.current = e;
      if (editorRefOut) editorRefOut.current = e;
      e.focus();
      setEditorReady(true);
    },
    [editorRefOut]
  );

  useEffect(() => {
    if (!yProvider || !editorReady || !editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const binding = new MonacoBinding(
      yText,
      model,
      new Set([editorRef.current]),
      yProvider.awareness as unknown as Awareness
    );

    return () => {
      binding.destroy();
    };
  }, [yProvider, editorReady, yText]);

  async function saveCode() {
    if (!firestore) {
      toast.error("Firebase not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY to .env to save code.");
      return;
    }
    const docReference = doc(
      firestore,
      `codes/${roomId}/versions/${savedCodeCount++}`
    );
    const docData = { code: value };

    try {
      await setDoc(docReference, docData);
      toast.success("Code saved successfully.");
    } catch (error) {
      toast.error("Error saving code. Please try again.");
      console.error("Error saving code:", error);
    }
  }

  const handleSave = onSaveClick ?? saveCode;

  if (layout === "workspace") {
    return (
      <section className="w-full h-full flex flex-col bg-editor-bg">
        <div className="flex-1 overflow-hidden custom-scrollbar code-editor relative min-h-0 flex flex-col">
          <Editor
            options={{ minimap: { enabled: false } }}
            theme="vs-dark"
            language={lang}
            defaultValue={CODE_SNIPPETS[lang] ?? CODE_SNIPPETS.javascript}
            onMount={onMount}
            value={value}
            onChange={(newValue) => setValue(newValue ?? "")}
            height="100%"
            className="min-h-[300px]"
          />
        </div>
      </section>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="w-1/2">
        <div className="flex justify-between items-center mb-4">
          <LanguageSelector language={lang} onSelect={setLang} />
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"
          >
            Save Code
          </button>
        </div>
        <Editor
          options={{ minimap: { enabled: false } }}
          height="70vh"
          theme="vs-dark"
          language={lang}
          defaultValue={CODE_SNIPPETS[lang] ?? CODE_SNIPPETS.javascript}
          onMount={onMount}
          value={value}
          onChange={(newValue) => setValue(newValue ?? "")}
        />
      </div>
      <Output editorRef={editorRef} language={lang} layout="side" />
    </div>
  );
}
