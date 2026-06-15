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
    `function helloWorld(){\n console.log("Hello, World!");\n}`,
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
      const cleanCode = reply
        .replace(/^```[\w-]*\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();

      setOutputCode(cleanCode);
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
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-slate-900/80 text-white px-4 py-2 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md cursor-pointer"
        >
          {["Python", "Java", "C++", "Go", "Rust", "TypeScript"].map((lang) => (
            <option value={lang} key={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button
          onClick={handleConvert}
          disabled={!aiReady || loading}
          className="px-6 py-3 bg-linear-to-r from-violet-500 to-cyan-500 hover:opacity-80 active:scale-95 text-white font-semibold rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5 " />
          )}
          {loading ? "Converting..." : "Converte"}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-6 py-3 bg-linear-to-r from-rose-500 to-orange-500 hover:opacity-80 active:scale-95 text-white font-semibold rounded-2xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" /> Reset
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl relative z-10">
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold">Input Code</span>
          </div>
          <CodeMirror
            value={inputCode}
            height="420px"
            extensions={[javascript({ jsx: true })]}
            theme={dracula}
            onChange={(val) => setInputCode(val)}
          />
        </div>
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-semibold">
                Converted Code ({targetLang})
              </span>
            </div>
            <button
              onClick={handleCopy}
              disabled={!outputCode}
              className="flex items-center gap-1 text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
            >
              <Clipboard className="w-4 h-4" />
            </button>
          </div>
          <CodeMirror
            value={outputCode}
            height="420px"
            extensions={[javascript({ jsx: true })]}
            theme={dracula}
            editable={false}
          />
        </div>
      </div>

      {feedback && (
        <p
          className={`text-center font-semibold drop-shadow-md relative z-10 ${
            feedback.includes("✔") || feedback.includes("📋")
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {feedback}
        </p>
      )}
      {!aiReady && (
        <p className="text-sm text-slate-400 relative z-10 ">
          Initializing AI... please waite
        </p>
      )}
    </div>
  );
};

export default App;
