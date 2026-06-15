import { useState, useEffect } from "react";
import {
  Code,
  Play,
  RotateCcw,
  CheckCircle,
  Clipboard,
  Loader2,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
const App = () => {
  const [aiReady, setAiReady] = useState(false);
  const [inputCode, setInputCode] = useState(
    `function helloWorld(){\n console.log("Hello, World!");}\n`,
  );
  const [outputCode, setOutputCode] = useState("");
  const [targetLang, setTargetLang] = useState("Python");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 300);

    return () => clearInterval(checkReady);
  }, []);
  const handleConvert = async () => {
    if (!inputCode.trim()) {
      setFeedback("❌ Please enter some code to convert.");
      return;
    }
    if (!aiReady) {
      setFeedback("❌ Ai not ready yet,Please wait a few second.");
      return;
    }
    setLoading(true);
    setFeedback("");
    setOutputCode("");
    try {
      const res = await window.puter.ai.chat(
        `Convert the following code into ${targetLang}.no explanations.
        Code:
        ${inputCode}`,
      );
      const reply =
        typeof res === "string"
          ? res
          : res?.message?.content ||
            res?.message?.map((m) => m.content).join("\n") ||
            "";
      if (!reply.trim()) throw new Error("Empty Response from Ai");
      setOutputCode(reply.trim());
      setFeedback("✔ Conversion successful!");
    } catch (error) {
      console.error("Coversion error:", error);
      setFeedback(`❌ Error:${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputCode(`function helloWorld(){\n console.log("Hello, World!");}\n`);
    setOutputCode("");
    setFeedback("");
  };
  const handleCopy = async () => {
    if (outputCode) {
      try {
        await navigator.clipboard.writeText(outputCode);
        setFeedback("📋 Code copied to clipboard!");
      } catch (error) {
        setFeedback("❌ Failed to copy code.");
        console.error(error);
      }
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-950 to-purple-950 flex flex-col items-center justify-center p-6 gap-10 relative overflow-hidden">
      <h1 className="text-5xl sm:text-7xl font-extrabold bg-linear-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent text-center drop-shadow-lg relative">
        AI Code Converter
      </h1>
    </div>
  );
};

export default App;
