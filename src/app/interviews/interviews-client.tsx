"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ArrowLeft, ArrowRight, AudioLines, CheckCircle2, CircleHelp, Code2, History, Mic, MicOff, Play, RotateCcw, Sparkles, Target, Trophy, Volume2, VolumeX } from "lucide-react";

type Round = { id: string; title: string; detail: string; count: number };

type Answer = { question: string; answer: string; score: number; feedback: string; strengths: string[]; improvements: string[]; correctedCode?: string; round: string };

type McqQuestion = { category: string; question: string; options: string[]; correctIndex: number; explanation: string };
type CodingQuestion = { id: string; category: string; difficulty: string; question: string };

type Session = { mode: "round" | "mock"; roundIds: string[]; roundIndex: number; questionIndex: number; currentQuestion: string; codingQuestions?: CodingQuestion[]; currentCodingQuestion?: CodingQuestion; currentMcq?: McqQuestion; mcqQuestions?: McqQuestion[]; feedbackMode: "each" | "end"; answers: Answer[]; startedAt: string; completedAt?: string; status: "in_progress" | "completed" };

type HistoryItem = { id: number; userId: number; mode: string; roundIds: string[]; status: string; score: number; startedAt: string; completedAt: string | null; session: Session };

type Recognition = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((event: any) => void) | null; onerror: ((event: any) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };

type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };


/** Render generated interview text with readable fenced and inline code blocks. */
function RichQuestionText({ text, className = "" }: { text: string; className?: string }) {
  const cleanedText = text
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$\n]+?)\$/g, "$1")
    .replace(/\\\((.*?)\\\)/g, "$1")
    .replace(/\\\[([\s\S]*?)\\\]/g, "$1");
  const segments = cleanedText.split(/(```[\s\S]*?```)/g).filter(Boolean);

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        const fenced = segment.match(/^```([\w+#.-]*)\n?([\s\S]*?)```$/);
        if (fenced) {
          const language = fenced[1] || "code";
          const code = fenced[2].replace(/^\n|\n$/g, "");
          return (
            <div key={index} className="neo-surface my-4 overflow-hidden rounded-2xl text-zinc-800 dark:text-zinc-100">
              <div className="flex items-center justify-between border-b border-black/[0.06] bg-black/[0.025] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.025]">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{language}</span>
                <span className="rounded-lg bg-black/[0.04] px-2 py-1 text-[10px] font-semibold text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">Code</span>
              </div>
              <pre className="overflow-x-auto bg-[#e0e5ec]/55 p-4 text-[13px] leading-6 text-zinc-800 shadow-[inset_3px_3px_7px_rgba(163,177,198,0.35),inset_-3px_-3px_7px_rgba(255,255,255,0.7)] dark:bg-[#1a1d23]/70 dark:text-zinc-100 dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.24),inset_-2px_-2px_6px_rgba(255,255,255,0.025)]"><code>{code}</code></pre>
            </div>
          );
        }

        return (
          <div key={index} className="whitespace-pre-wrap">
            {segment.split("\n").map((line, lineIndex) => {
              const heading = line.match(/^(#{1,3})\s+(.+)$/);
              const bullet = line.match(/^\s*[-*]\s+(.+)$/);
              // Support common Markdown emitted by the explanation model without showing raw markers.
              const content = (value: string) => {
                const tokens = value.split(/(`[^`\n]+`|\*\*.+?\*\*|(?<!\*)\*[^*\n]+\*(?!\*))/g).filter((part) => part.length > 0);
                return tokens.map((part, partIndex) => {
                  const inline = part.match(/^`([^`]+)`$/);
                  const bold = part.match(/^\*\*(.+?)\*\*$/);
                  const italic = !bold && part.match(/^\*([^*]+)\*$/);
                  if (inline) return <code key={partIndex} className="rounded-md bg-[#ff4500]/10 px-1.5 py-0.5 font-mono text-[0.88em] font-semibold text-[#c83a00] dark:text-[#ff8a5c]">{inline[1]}</code>;
                  if (bold) return <strong key={partIndex} className="font-extrabold text-slate-900 dark:text-white">{bold[1]}</strong>;
                  if (italic) return <em key={partIndex} className="italic text-slate-600 dark:text-slate-300">{italic[1]}</em>;
                  return <span key={partIndex}>{part.replace(/\\\(/g, "").replace(/\\\)/g, "").replace(/\$/g, "")}</span>;
                });
              };
              const numbered = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
              const markdownLabel = line.match(/^\s*\*\*(.+?):\*\*\s*(.*)$/);
              if (!line.trim()) return <div key={lineIndex} className="h-2" />;
              if (heading) return <h3 key={lineIndex} className={`${heading[1].length === 1 ? "mt-4 text-base" : "mt-3 text-sm"} mb-2 font-extrabold leading-snug first:mt-0 text-zinc-900 dark:text-white`}>{content(heading[2])}</h3>;
              if (markdownLabel) return <div key={lineIndex} className="mt-3 first:mt-0"><h4 className="mb-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#c83a00] dark:text-[#ff8a5c]">{markdownLabel[1]}</h4>{markdownLabel[2] && <p className="leading-6 text-slate-700 dark:text-slate-200">{content(markdownLabel[2])}</p>}</div>;
              if (bullet) return <div key={lineIndex} className="ml-1 flex gap-2 rounded-lg py-0.5 leading-6"><span className="mt-px font-bold text-[#ff4500] dark:text-[#ff8a5c]">•</span><span>{content(bullet[1])}</span></div>;
              if (numbered) return <div key={lineIndex} className="flex items-start gap-3 rounded-lg py-1"><span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff4500]/10 text-[11px] font-extrabold text-[#c83a00] ring-1 ring-[#ff4500]/20 dark:text-[#ff8a5c]">{numbered[1]}</span><span className="flex-1 leading-6">{content(numbered[2])}</span></div>;
              return <p key={lineIndex} className="leading-6 text-slate-700 dark:text-slate-200">{content(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function getNormalizedAnswerScore(item: Answer): number {

  return item.round === "aptitude" ? (item.score > 0 ? 100 : 0) : item.score;

}

function getSessionAverage(answers: Answer[]): number {

  if (!answers.length) return 0;

  return Math.round(

    answers.reduce((sum, item) => sum + getNormalizedAnswerScore(item), 0) /

    answers.length

  );

}

const ROUNDS: Round[] = [

  { id: "aptitude", title: "Online Assessment", detail: "Quantitative aptitude, logical reasoning, verbal ability and technical MCQs", count: 20 },

  { id: "coding", title: "Technical Coding", detail: "Algorithms, data structures, debugging and problem solving", count: 4 },

  { id: "technical", title: "Technical Interview", detail: "OOP, DBMS, SQL, OS, networking and core CS", count: 5 },

  { id: "project", title: "Project / Advanced Technical", detail: "Project decisions, architecture, trade-offs and system design", count: 4 },

  { id: "hr", title: "HR / Managerial", detail: "Introduction, strengths, teamwork and workplace scenarios", count: 5 },

];

async function requestApi(body: Record<string, unknown>) {

  const action = typeof body.action === "string" ? body.action : "unknown";

  try {
    const response = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = typeof data?.error === "string" ? data.error : `HTTP ${response.status}`;
      // Keep technical details in DevTools / the browser console, not in the UI.
      console.error("[Interview UI] API request failed", {
        action,
        status: response.status,
        statusText: response.statusText,
        message: detail,
      });
      throw new Error("Something went wrong. Please try again. Technical details are available in the browser console.");
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Something went wrong.")) throw error;

    console.error("[Interview UI] Could not reach the interview API", {
      action,
      message: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Could not connect to the interview service. Please try again. Technical details are available in the browser console.");
  }

}

const IDB_NAME = "courseguide-interviews";

const IDB_STORE = "sessions";

type StoredSession = { id: number; userId: number; session: Session };

function openInterviewDb(): Promise<IDBDatabase> {

  return new Promise((resolve, reject) => {

    const request = indexedDB.open(IDB_NAME, 1);

    request.onupgradeneeded = () => {

      const db = request.result;

      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE, { keyPath: "id" });

    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => reject(request.error || new Error("Could not open local interview storage."));

  });

}

async function saveLocalSession(userId: number, id: number, session: Session): Promise<void> {

  const db = await openInterviewDb();

  await new Promise<void>((resolve, reject) => {

    const transaction = db.transaction(IDB_STORE, "readwrite");

    transaction.objectStore(IDB_STORE).put({ id, userId, session } satisfies StoredSession);

    transaction.oncomplete = () => resolve();

    transaction.onerror = () => reject(transaction.error || new Error("Could not save interview locally."));

    transaction.onabort = () => reject(transaction.error || new Error("Local interview save was cancelled."));

  });

  db.close();

}

async function readLocalSessions(userId: number): Promise<StoredSession[]> {

  const db = await openInterviewDb();

  const rows = await new Promise<StoredSession[]>((resolve, reject) => {

    const transaction = db.transaction(IDB_STORE, "readonly");

    const request = transaction.objectStore(IDB_STORE).getAll();

    request.onsuccess = () => resolve((request.result as StoredSession[]).filter((row) => row.userId === userId));

    request.onerror = () => reject(request.error || new Error("Could not read local interview history."));

  });

  db.close();

  return rows;

}

export default function InterviewsClient({ userName, userId }: { userName: string; userId: number }) {

  const [selectedRound, setSelectedRound] = useState("technical");

  const [feedbackMode, setFeedbackMode] = useState<"each" | "end">("each");

  const [sessionId, setSessionId] = useState<number | null>(null);

  const [session, setSession] = useState<Session | null>(null);

  const [round, setRound] = useState<Round | null>(null);

  const [answer, setAnswer] = useState("");

  const [selectedLanguage, setSelectedLanguage] = useState("C");

  const [questionExplanation, setQuestionExplanation] = useState<string | null>(null);

  const [explanationLoading, setExplanationLoading] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [listening, setListening] = useState(false);

  const [speaking, setSpeaking] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [latestEvaluation, setLatestEvaluation] = useState<Answer | null>(null);

  const [roundSummary, setRoundSummary] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [showHistory, setShowHistory] = useState(false);

  const [voiceAvailable, setVoiceAvailable] = useState(false);

  const recognitionRef = useRef<Recognition | null>(null);

  const sessionRef = useRef<Session | null>(null);

  useEffect(() => { sessionRef.current = session; }, [session]);

  const loadHistory = useCallback(async () => {

    try {

      const rows = await readLocalSessions(userId);

      setHistory(rows.map((row) => ({ id: row.id, userId: row.userId, mode: row.session.mode, roundIds: row.session.roundIds, status: row.session.status, score: getSessionAverage(row.session.answers), startedAt: row.session.startedAt, completedAt: row.session.completedAt || null, session: row.session })).sort((a, b) => b.id - a.id).slice(0, 20));

    } catch (storageError) { console.error("Could not load local interview history:", storageError); }

  }, [userId]);

  useEffect(() => {

    const speechWindow = window as SpeechWindow;

    setVoiceAvailable(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));

    void loadHistory();

    return () => { window.speechSynthesis?.cancel(); recognitionRef.current?.stop(); };

  }, [loadHistory]);

  const speak = useCallback((text: string) => {

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.96; utterance.pitch = 1.02;

    utterance.onstart = () => setSpeaking(true);

    utterance.onend = () => setSpeaking(false);

    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);

  }, []);

  const startInterview = async (mode: "round" | "mock") => {

    setLoading(true); setError(""); setLatestEvaluation(null); setRoundSummary(null); setAnswer(""); setSelectedOption(null); setQuestionExplanation(null); setExplanationLoading(false);

    try {

      // Send previously answered aptitude questions so the generator can avoid
      // repeating exact questions or reusing the same templates in later sessions.
      let excludedQuestions: string[] = [];
      if (selectedRound === "aptitude" || mode === "mock") {
        try {
          const savedSessions = await readLocalSessions(userId);
          excludedQuestions = savedSessions
            .flatMap((row) => row.session.answers || [])
            .filter((item) => item.round === "aptitude" && item.question.trim())
            .map((item) => item.question.trim())
            .filter((question, index, all) =>
              all.findIndex((candidate) =>
                candidate.toLocaleLowerCase() === question.toLocaleLowerCase()
              ) === index
            )
            .slice(-100);
        } catch (storageError) {
          console.warn("Could not load previous aptitude questions for novelty checks:", storageError);
        }
      }

      const data = await requestApi({
        action: "start",
        mode,
        roundId: selectedRound,
        feedbackMode,
        excludedQuestions,
      });

      setSessionId(data.sessionId); setSession(data.session); setRound(data.round); setShowHistory(false);

      await saveLocalSession(userId, data.sessionId, data.session);

      if (data.round?.id !== "aptitude" && data.round?.id !== "coding") speak(data.session.currentQuestion);

    } catch (e) { setError(e instanceof Error ? e.message : "Could not start interview."); }

    finally { setLoading(false); }

  };

  const startRecording = () => {

    const speechWindow = window as SpeechWindow;

    const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Constructor) { setError("Speech recognition is not supported by this browser. Try the latest Chrome or Edge."); return; }

    setError("");

    const recognition = new Constructor();

    recognition.lang = "en-IN"; recognition.interimResults = true; recognition.continuous = true;

    recognition.onresult = (event) => {

      let finalText = ""; let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {

        const transcript = event.results[i][0]?.transcript || "";

        if (event.results[i].isFinal) finalText += transcript; else interimText += transcript;

      }

      setAnswer((previous) => {

        const base = previous.split("\n[Listening…]")[0].trim();

        const finalCombined = [base, finalText.trim()].filter(Boolean).join(" ");

        return [finalCombined, interimText ? `\n[Listening…] ${interimText}` : ""].filter(Boolean).join("");

      });

    };

    recognition.onerror = (event) => { setListening(false); setError(event.error === "not-allowed" ? "Microphone permission was blocked. Allow microphone access in your browser settings." : `Speech recognition error: ${event.error}`); };

    recognition.onend = () => { setListening(false); setAnswer((previous) => previous.replace(/\n?\[Listening…\].*$/s, "").trim()); };

    recognitionRef.current = recognition;

    try { recognition.start(); setListening(true); } catch { setError("The microphone could not start. Please try again."); }

  };

  const stopRecording = () => { recognitionRef.current?.stop(); setListening(false); };

  const explainQuestion = async () => {
    if (!sessionId || !session || round?.id !== "coding" || explanationLoading || loading) return;
    setExplanationLoading(true);
    setError("");
    try {
      const data = await requestApi({ action: "explain", sessionId, session });
      setQuestionExplanation(typeof data.explanation === "string" ? data.explanation : "I could not explain this question right now. Please try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not explain this question.");
    } finally {
      setExplanationLoading(false);
    }
  };

  const submitAnswer = async () => {

    const isMcq = round?.id === "aptitude";

    if (!sessionId || !session || loading || (isMcq ? selectedOption === null : !answer.trim())) return;

    stopRecording(); window.speechSynthesis?.cancel(); setSpeaking(false); setLoading(true); setError(""); setRoundSummary(null);

    try {

      const submittedAnswer = isMcq && selectedOption !== null ? `${String.fromCharCode(65 + selectedOption)}. ${session.currentMcq?.options[selectedOption] || ""}` : answer.trim();

      const data = await requestApi({ action: "answer", sessionId, session, answer: submittedAnswer, language: round?.id === "coding" ? selectedLanguage : undefined });

      setLatestEvaluation(data.evaluation || null); setRoundSummary(data.roundSummary || null); setAnswer(""); setSelectedOption(null); setQuestionExplanation(null); sessionRef.current = data.session; setSession(data.session); setRound(data.round); await saveLocalSession(userId, sessionId, data.session);

      if (data.finished) { await loadHistory(); }

      else if (data.session?.currentQuestion && data.round?.id !== "aptitude" && data.round?.id !== "coding") speak(data.session.currentQuestion);

    } catch (e) { setError(e instanceof Error ? e.message : "Could not submit your answer."); }

    finally { setLoading(false); }

  };

  const finishEarly = async () => {

    if (!sessionId) return;

    stopRecording(); window.speechSynthesis?.cancel(); setLoading(true);

    try { const data = await requestApi({ action: "finish", sessionId, session }); sessionRef.current = data.session; setSession(data.session); setRound(null); setLatestEvaluation(null); if (sessionId) await saveLocalSession(userId, sessionId, data.session); await loadHistory(); }

    catch (e) { setError(e instanceof Error ? e.message : "Could not finish interview."); }

    finally { setLoading(false); }

  };

  const reset = () => { window.speechSynthesis?.cancel(); recognitionRef.current?.stop(); sessionRef.current = null; setSession(null); setSessionId(null); setRound(null); setAnswer(""); setSelectedOption(null); setQuestionExplanation(null); setExplanationLoading(false); setLatestEvaluation(null); setRoundSummary(null); setError(""); setListening(false); setSpeaking(false); void loadHistory(); };

  const completed = session?.status === "completed";

  const average = session ? getSessionAverage(session.answers) : 0;

  const roundProgress = session && round ? Math.min(100, Math.round((session.questionIndex / round.count) * 100)) : 0;

  return <main className="min-h-screen bg-[#e0e5ec] px-4 pb-16 pt-8 text-[#242833] transition-colors dark:bg-[#1a1d23] dark:text-[#f5f7fa] sm:px-6">

    <div className="mx-auto max-w-6xl">

      {!session ? <>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-2 text-sm font-semibold text-[#ff4500]"><Sparkles size={16} /> AI Interview Preparation</div><h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Practice for your next <span className="text-[#ff4500]">big opportunity.</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">Hi {userName.split(" ")[0]}, practice placement interviews with MCQ-based online assessments, voice interviews, and actionable feedback.</p></div>

          <button onClick={() => { setShowHistory(!showHistory); void loadHistory(); }} className="neo-surface-sm inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold"><History size={17} /> Interview history</button>

        </div>

        {showHistory && <section className="neo-surface mb-8 rounded-3xl p-5"><h2 className="mb-4 text-lg font-bold">Your recent sessions</h2>{history.length ? <div className="space-y-3">{history.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/[0.03] p-4 dark:bg-white/[0.04]"><div><p className="font-semibold">{item.mode === "mock" ? "Complete mock interview" : (ROUNDS.find((r) => r.id === item.roundIds?.[0])?.title || "Round practice")}</p><p className="mt-1 text-xs text-zinc-500">{new Date(item.startedAt).toLocaleString()} · {item.status.replace("_", " ")}</p></div><span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-lg font-bold text-[#ff4500]">{item.status === "completed" ? `${item.score}%` : "Not Completed"}</span></div>)}</div> : <p className="text-sm text-zinc-500">No saved interview sessions yet.</p>}</section>}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          <section className="neo-surface rounded-[28px] p-5 sm:p-7"><div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-[#ff4500]/10 p-3 text-[#ff4500]"><Target size={22} /></div><div><h2 className="text-xl font-bold">Practice a single round</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Focus on the skills you want to improve.</p></div></div>

            <div className="space-y-3">{ROUNDS.map((item, index) => <button key={item.id} onClick={() => setSelectedRound(item.id)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${selectedRound === item.id ? "border-[#ff4500]/50 bg-[#ff4500]/[0.07]" : "border-transparent bg-black/[0.025] hover:bg-black/[0.05] dark:bg-white/[0.035] dark:hover:bg-white/[0.06]"}`}><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-extrabold ${selectedRound === item.id ? "bg-[#ff4500] text-white" : "neo-surface-sm text-zinc-500"}`}>{index + 1}</div><div className="min-w-0 flex-1"><p className="font-bold">{item.title}</p><p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{item.detail}</p></div><span className="text-xs font-semibold text-zinc-500">{item.count} Qs</span></button>)}</div>

            <button disabled={loading} onClick={() => void startInterview("round")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4500] px-5 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#e83f00] disabled:opacity-60"><Play size={18} fill="currentColor" />{loading ? "Preparing your interview…" : "Start selected round"}<ArrowRight size={17} /></button>

          </section>

          <div className="space-y-6">

            <section className="neo-surface overflow-hidden rounded-[28px] p-6 sm:p-7"><div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-[#ff4500]/10 p-3 text-[#ff4500]"><Trophy size={22} /></div><div><h2 className="text-xl font-bold">Full mock interview</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Work through all five placement rounds.</p></div></div><div className="mb-5 grid grid-cols-5 gap-2">{ROUNDS.map((item, index) => <div key={item.id} className="text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04] text-sm font-bold dark:bg-white/[0.06]">{index + 1}</div><p className="mt-2 text-[10px] font-semibold leading-4 text-zinc-500">{["Aptitude", "Coding", "Technical", "Project", "HR"][index]}</p></div>)}</div><button disabled={loading} onClick={() => void startInterview("mock")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4500] px-5 py-4 font-bold text-white transition hover:bg-[#e83f00] disabled:opacity-60"><Sparkles size={18} />{loading ? "Preparing your interview…" : "Start full mock interview"}</button></section>

            <section className="neo-surface rounded-[28px] p-6"><h3 className="mb-4 font-bold">Feedback preference</h3><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setFeedbackMode("each")} className={`rounded-2xl border p-4 text-left ${feedbackMode === "each" ? "border-[#ff4500]/50 bg-[#ff4500]/[0.07]" : "border-transparent bg-black/[0.03] dark:bg-white/[0.04]"}`}><p className="font-bold">After every answer</p><p className="mt-1 text-xs leading-5 text-zinc-500">Get a score and tips before the next question.</p></button><button onClick={() => setFeedbackMode("end")} className={`rounded-2xl border p-4 text-left ${feedbackMode === "end" ? "border-[#ff4500]/50 bg-[#ff4500]/[0.07]" : "border-transparent bg-black/[0.03] dark:bg-white/[0.04]"}`}><p className="font-bold">At the end of each round</p><p className="mt-1 text-xs leading-5 text-zinc-500">Keep the interview flowing, then review the round.</p></button></div><p className="mt-4 text-xs leading-5 text-zinc-500"><AudioLines size={14} className="mr-1 inline" /> Online Assessment uses on-screen MCQs. Other rounds use spoken questions and microphone answers. Coding answers use a code editor.</p></section>

          </div>

        </div>

      </> : <>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><button onClick={reset} className="neo-surface-sm inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"><ArrowLeft size={16} /> Interview dashboard</button>{!completed && <button onClick={() => void finishEarly()} disabled={loading} className="rounded-xl px-4 py-3 text-sm font-semibold text-zinc-500 hover:text-[#ff4500]">Finish early</button>}</div>

        {completed ? <section className="neo-surface mx-auto max-w-3xl rounded-[30px] p-5 sm:p-9">
          <div className="text-center">
            <div className="neo-surface-sm mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] text-[#ff4500]"><Trophy size={34} /></div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#ff4500]">Interview completed</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Great work showing up.</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">Here is your overall practice result. Use the feedback below to prepare for your next attempt.</p>
            <div className="neo-surface-sm mx-auto my-7 flex h-36 w-36 flex-col items-center justify-center rounded-full border-[6px] border-[#ff4500]/25">
              <span className="text-4xl font-black tracking-tight">{average}%</span><span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">overall score</span>
            </div>
          </div>
          <div className="mb-7 grid gap-4 text-left sm:grid-cols-2">
            <div className="neo-surface-sm rounded-2xl p-4"><p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Answers reviewed</p><p className="mt-1 text-2xl font-extrabold">{session.answers.length}</p></div>
            <div className="neo-surface-sm rounded-2xl p-4"><p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Practice type</p><p className="mt-1 text-lg font-bold">{session.mode === "mock" ? "Full mock" : "Single round"}</p></div>
          </div>
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-extrabold">Answer review</h2><span className="text-xs font-medium text-zinc-500">{session.answers.length} questions</span></div>
          <div className="space-y-3 text-left">{session.answers.map((item, index) => {
            const isAptitude = item.round === "aptitude";
            const isCorrect = item.score > 0;
            return <details key={`${index}-${item.question}`} className="neo-surface-sm group overflow-hidden rounded-2xl transition-shadow open:shadow-inner">
              <summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:items-center sm:p-5 [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-xs font-extrabold text-zinc-500 dark:bg-white/[0.06]">{index + 1}</span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-6"><RichQuestionText text={item.question} /></span>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-extrabold sm:text-xs ${isAptitude ? (isCorrect ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300") : "bg-[#ff4500]/10 text-[#ff4500]"}`}>
                  {isAptitude ? <>{isCorrect ? <CheckCircle2 size={14} /> : <CircleHelp size={14} />}<span>{isCorrect ? "Correct" : "Incorrect"}</span></> : <span>{item.score}/100</span>}
                </span>
                <span aria-hidden="true" className="ml-0.5 mt-1 text-xs text-zinc-400 transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="mx-4 mb-4 rounded-xl bg-black/[0.025] p-4 dark:bg-white/[0.035] sm:mx-5 sm:mb-5">
                <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300"><RichQuestionText text={item.feedback} /></div>
                <p className="mt-3 border-t border-black/[0.06] pt-3 text-xs leading-5 text-zinc-500 dark:border-white/[0.08]">Your answer: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{item.answer || "No answer recorded"}</span></p>
              </div>
            </details>;
          })}</div>
          <div className="mt-8 text-center">
            <button
              onClick={reset}
              className="
      inline-flex items-center justify-center gap-2
      rounded-2xl
      bg-[#ff4500] px-6 py-4
      font-bold text-white
      shadow-[5px_5px_12px_rgba(181,59,10,0.22),-4px_-4px_10px_rgba(255,255,255,0.55)]
      transition-all duration-200
      hover:-translate-y-0.5 hover:bg-[#ed4100]
      active:translate-y-0
      dark:bg-[#ff4500]
      dark:shadow-[4px_4px_10px_rgba(0,0,0,0.35),-3px_-3px_8px_rgba(255,255,255,0.035)]
      dark:hover:bg-[#ff571a]
      dark:active:shadow-inner
      focus-visible:outline-none
      focus-visible:ring-2 focus-visible:ring-[#ff4500]
      focus-visible:ring-offset-2
      dark:focus-visible:ring-offset-[#1e2228]
    "
            >
              <RotateCcw size={17} />
              Practice again
            </button>
          </div>
        </section> : <div className={`grid items-start gap-5 ${round?.id === "coding" ? "xl:grid-cols-[minmax(0,1fr)_260px]" : "lg:grid-cols-[1fr_320px]"}`}>

          <section className={`neo-surface rounded-[26px] p-4 sm:p-6 ${round?.id === "coding" ? "min-w-0" : ""}`}><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#ff4500]">{round?.title || "Interview round"}</p><p className="mt-1 text-xs text-zinc-500">{session.mode === "mock" ? `Round ${session.roundIndex + 1} of ${session.roundIds.length}` : "Individual round practice"} · Question {session.questionIndex + 1} of {round?.count || "—"}</p></div><div className="rounded-xl bg-black/[0.04] px-3 py-2 text-xs font-semibold dark:bg-white/[0.06]">{session.feedbackMode === "each" ? "Live feedback" : "Round-end feedback"}</div></div><div className="mb-6 h-2 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]"><div className="h-full rounded-full bg-[#ff4500] transition-all" style={{ width: `${roundProgress}%` }} /></div><div className={`mb-5 rounded-[20px] bg-black/[0.025] p-4 dark:bg-white/[0.025] sm:p-5 ${round?.id === "coding" ? "max-h-[min(58vh,620px)] overflow-y-auto" : ""}`}><div className="mb-4 flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500"><CircleHelp size={16} /> {round?.id === "aptitude" ? (session.currentMcq?.category || "Multiple-choice question") : "Your question"}</span>{round?.id !== "aptitude" && round?.id !== "coding" && <button title={speaking ? "Stop speaking" : "Read question aloud"} onClick={() => { if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); } else speak(session.currentQuestion); }} className="neo-surface-sm rounded-xl p-3 text-[#ff4500]">{speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>}</div><RichQuestionText text={session.currentQuestion} className={round?.id === "coding" ? "text-[15px] font-medium leading-6 sm:text-base sm:leading-7" : "text-xl font-bold leading-8 sm:text-2xl"} /></div>{round?.id === "coding" && <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#ff4500]/10 px-3 py-1.5 font-bold text-[#ff4500]">{session.currentCodingQuestion?.id || "Coding question"}</span><span className="rounded-full bg-black/[0.05] px-3 py-1.5 font-semibold text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-300">{session.currentCodingQuestion?.category || "Coding"}</span><span className="rounded-full bg-black/[0.05] px-3 py-1.5 font-semibold text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-300">{session.currentCodingQuestion?.difficulty || "Practice"}</span></div><button type="button" disabled={explanationLoading || loading} onClick={() => void explainQuestion()} className="neo-surface-sm inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[#ff4500] transition hover:-translate-y-0.5 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] disabled:cursor-not-allowed disabled:opacity-60"><CircleHelp size={16} />{explanationLoading ? "Explaining…" : "Explain Question"}</button></div>}{round?.id === "coding" && questionExplanation && <section className="neo-surface relative mb-5 overflow-hidden rounded-[24px] p-4 sm:p-6"><div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/80 dark:bg-white/[0.08]" /><div className="mb-5 flex flex-wrap items-start gap-3"><div className="neo-surface-sm flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[#ff4500]"><Sparkles size={19} /></div><div className="min-w-0 flex-1"><h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-lg">Understand the question</h3><p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">A simple explanation to help you think it through</p></div><span className="rounded-full bg-[#ff4500]/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#ff4500]">Hint only</span></div><div className="rounded-[18px] bg-black/[0.025] px-4 py-4 text-sm leading-7 text-zinc-700 shadow-[inset_3px_3px_7px_rgba(163,177,198,0.22),inset_-3px_-3px_7px_rgba(255,255,255,0.7)] dark:bg-white/[0.025] dark:text-zinc-200 dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.18),inset_-2px_-2px_7px_rgba(255,255,255,0.025)] sm:px-5 sm:py-5"><RichQuestionText text={questionExplanation} className="space-y-2" /></div><div className="neo-surface-sm mt-4 flex items-start gap-2 rounded-xl px-3 py-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400"><CircleHelp size={15} className="mt-0.5 shrink-0 text-[#ff4500]" /><p>Use these hints to understand the task. Your solution is still yours to discover.</p></div></section>}

            {round?.id === "aptitude" ? <div className="mb-5 space-y-3">{(session.currentMcq?.options || []).map((option, index) => <button key={`${index}-${option}`} type="button" disabled={loading} onClick={() => setSelectedOption(index)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${selectedOption === index ? "border-[#ff4500] bg-[#ff4500]/10" : "border-black/10 bg-black/[0.025] hover:border-[#ff4500]/40 dark:border-white/10 dark:bg-white/[0.03]"}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${selectedOption === index ? "bg-[#ff4500] text-white" : "bg-black/[0.06] dark:bg-white/[0.08]"}`}>{String.fromCharCode(65 + index)}</span><span className="min-w-0 flex-1 pt-1 text-sm font-medium leading-6"><RichQuestionText text={option} /></span></button>)}</div> : round?.id === "coding" ? <div className="mb-5 space-y-3"><div className="overflow-hidden rounded-2xl border border-slate-700/20 bg-[#18212f] shadow-[inset_3px_3px_8px_rgba(0,0,0,0.22),inset_-2px_-2px_6px_rgba(255,255,255,0.03)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3"><label htmlFor="interview-answer" className="flex items-center gap-2 text-sm font-bold text-slate-100"><Code2 size={16} /> Your solution</label><div className="flex flex-wrap items-center gap-2"><label htmlFor="coding-language" className="text-xs font-semibold text-slate-300">Language</label><select id="coding-language" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} disabled={loading} className="rounded-xl border border-white/10 bg-[#202b3a] px-3 py-2 text-sm font-semibold text-slate-100 outline-none transition focus:border-[#ff4500]/70 focus:ring-2 focus:ring-[#ff4500]/20 disabled:opacity-60"><option value="C">C</option><option value="C++">C++</option><option value="C#">C#</option><option value="Java">Java</option><option value="Python">Python</option><option value="JavaScript">JavaScript</option><option value="TypeScript">TypeScript</option><option value="Go">Go</option><option value="Rust">Rust</option><option value="PHP">PHP</option><option value="Ruby">Ruby</option><option value="Kotlin">Kotlin</option><option value="Swift">Swift</option></select><span className="rounded-lg bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">Code editor</span></div></div><div className="flex bg-[#111923]">
                  <div aria-hidden="true" className="select-none border-r border-white/[0.07] px-3 py-4 text-right font-mono text-sm leading-6 text-slate-600">{Array.from({ length: Math.max(14, answer.split("\n").length) }, (_, i) => <div key={i}>{i + 1}</div>)}</div>
                  <textarea id="interview-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => { const el = e.currentTarget; if (e.key === "Tab") { e.preventDefault(); const start = el.selectionStart; const end = el.selectionEnd; const next = answer.slice(0, start) + "  " + answer.slice(end); setAnswer(next); requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; }); } else if (e.key === "Enter") { const start = el.selectionStart; const before = answer.slice(0, start); const currentLine = before.split("\n").pop() || ""; const indent = currentLine.match(/^\s*/)?.[0] || ""; if (indent) { e.preventDefault(); const next = answer.slice(0, start) + "\n" + indent + answer.slice(el.selectionEnd); setAnswer(next); requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 1 + indent.length; }); } } }} rows={18} spellCheck={false} autoCapitalize="off" autoCorrect="off" placeholder={selectedLanguage === 'Python' ? '# Write your solution here…\n# You may include code and explain your approach.' : selectedLanguage === 'SQL' ? '-- Write your solution here…' : '// Write your solution here…\n// You may include code and explain your approach.'} className="min-h-[336px] min-w-0 flex-1 resize-y bg-transparent p-4 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-[#ff4500]/60" />
                </div></div><p className="text-xs leading-5 text-zinc-500">Choose your programming language, then write your solution. Feedback and corrected code will use the selected language. Voice input is disabled for Technical Coding.</p></div> : <div className="mb-5"><div className="rounded-2xl bg-black/[0.025] p-5 dark:bg-white/[0.03]"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Mic size={17} className="text-[#ff4500]" /> Your spoken answer</div><p className="min-h-16 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">{answer || (listening ? "Listening… speak clearly into your microphone." : "Tap Start speaking and answer naturally. You do not need to type.")}</p><div className="mt-4 flex flex-wrap gap-3"><button disabled={!voiceAvailable || listening || loading} onClick={startRecording} className="inline-flex items-center gap-2 rounded-xl bg-[#ff4500] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Mic size={16} /> Start speaking</button><button disabled={!listening} onClick={stopRecording} className="neo-surface-sm inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"><MicOff size={16} /> Stop recording</button></div>{!voiceAvailable && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">This browser does not support built-in speech recognition. Use Chrome or Edge for microphone answers.</p>}</div></div>}

            {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</p>}

            <button disabled={(round?.id === "aptitude" ? selectedOption === null : !answer.trim()) || loading || listening} onClick={() => void submitAnswer()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4500] px-5 py-4 font-bold text-white transition hover:bg-[#e83f00] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Reviewing your answer…" : "Submit answer & continue"}<ArrowRight size={17} /></button><p className="mt-3 text-center text-xs text-zinc-500">{round?.id === "aptitude" ? "Choose one option, then submit." : round?.id === "coding" ? "Submit your code and approach for AI review." : listening ? "Stop recording before submitting your answer." : "Your answers and feedback are saved to your interview history."}</p>

            {latestEvaluation && session.feedbackMode === "each" && <div className="neo-surface mt-6 rounded-[24px] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">Feedback on your answer</h3><span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-sm font-extrabold text-[#ff4500]">{round?.id === "aptitude" ? (latestEvaluation.score === 1 ? "Correct" : "Incorrect") : `${latestEvaluation.score}/100`}</span></div><div className="neo-surface-sm mt-4 rounded-2xl p-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300"><RichQuestionText text={latestEvaluation.feedback} /></div>{latestEvaluation.strengths.length > 0 && <div className="mt-4 rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.025]"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">What went well</p>{latestEvaluation.strengths.map((item, i) => <p key={i} className="mb-1 flex gap-2 text-sm"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />{item}</p>)}</div>}{latestEvaluation.improvements.length > 0 && <div className="mt-4 rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.025]"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#ff4500]">How to correct it</p>{latestEvaluation.improvements.map((item, i) => <p key={i} className="mb-1 text-sm leading-6">• {item}</p>)}</div>}{round?.id === "coding" && latestEvaluation.correctedCode?.trim() && <section className="neo-surface-sm mt-5 rounded-2xl p-4 sm:p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-extrabold text-zinc-900 dark:text-white">Corrected answer</h4><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">A complete example in {selectedLanguage}</p></div><button type="button" onClick={() => { void navigator.clipboard?.writeText(latestEvaluation.correctedCode || ""); }} className="neo-surface-sm rounded-xl px-3 py-2 text-xs font-bold text-[#ff4500]">Copy code</button></div><RichQuestionText text={`\`\`\`${selectedLanguage}\n${latestEvaluation.correctedCode.trim()}\n\`\`\``} /></section>}</div>}

            {roundSummary && <div className="mt-5 rounded-2xl bg-[#ff4500]/[0.06] p-5"><h3 className="font-bold">Round summary</h3><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{roundSummary}</p></div>}

          </section>

          <aside className="space-y-4 xl:sticky xl:top-5"><section className="neo-surface rounded-[26px] p-5"><h3 className="mb-4 font-bold">Interview progress</h3><div className="space-y-3">{ROUNDS.filter((item) => session.roundIds.includes(item.id)).map((item) => { const active = round?.id === item.id; const done = session.answers.filter((a) => a.round === item.id).length >= item.count; return <div key={item.id} className={`flex items-center gap-3 rounded-xl p-3 ${active ? "bg-[#ff4500]/10" : ""}`}><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${done ? "bg-emerald-500/10 text-emerald-600" : active ? "bg-[#ff4500] text-white" : "bg-black/[0.04] text-zinc-500 dark:bg-white/[0.05]"}`}>{done ? <CheckCircle2 size={17} /> : ROUNDS.findIndex((r) => r.id === item.id) + 1}</div><div className="min-w-0 flex-1"><p className={`text-sm font-semibold ${active ? "text-[#ff4500]" : ""}`}>{item.title}</p><p className="mt-1 text-xs text-zinc-500">{session.answers.filter((a) => a.round === item.id).length}/{item.count} answered</p></div></div>; })}</div></section><section className="neo-surface rounded-[26px] p-5"><h3 className="mb-3 font-bold">Quick reminders</h3><ul className="space-y-3 text-sm leading-5 text-zinc-600 dark:text-zinc-300">{round?.id === "coding" ? <><li>• Break the problem into clear steps before coding.</li><li>• Consider empty inputs, duplicates, boundaries, and other edge cases.</li><li>• Prefer readable variable names and a complete solution.</li><li>• Include time and space complexity when relevant.</li></> : round?.id === "aptitude" ? <><li>• 5 questions each from four categories.</li><li>• Quantitative aptitude: percentages, ratios, time and work, profit and loss.</li><li>• Logical reasoning, verbal ability and technical fundamentals.</li><li>• Select one option; the score and explanation appear after submission.</li></> : <><li>• Think aloud and structure your response.</li><li>• For technical questions, explain the reason behind your answer.</li><li>• If you do not know something, explain what you do know.</li><li>• Speak clearly; you can replay the question any time.</li></>}</ul></section></aside>

        </div>}

      </>}

      {error && !session && <p role="alert" className="mt-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">{error}</p>}

    </div>

  </main>;

}
