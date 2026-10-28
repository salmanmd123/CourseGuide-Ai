"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Bot, Check, Clipboard, LoaderCircle, MessageCircle, Send, Trash2, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type TutorRole = "user" | "assistant";
type TutorLanguage = "English" | "Hindi" | "Hinglish";
type TutorMessage = { id: number | string; role: TutorRole; message: string; createdAt?: string };
type AiTutorProps = { lessonId: number; courseTitle: string; lessonTitle: string };

const suggestions = [
  "Explain the main concept simply",
  "Give me a practical example",
  "What should I remember from this lesson?",
];

const neoPanel = "border border-[#d6dce5] bg-[#e0e5ec] shadow-[7px_7px_16px_rgba(163,177,198,0.55),-7px_-7px_16px_rgba(255,255,255,0.78)] dark:border-[#252a33] dark:bg-[#1e2229] dark:shadow-[7px_7px_16px_rgba(5,7,10,0.48),-7px_-7px_16px_rgba(43,48,58,0.32)]";
const neoInset = "border border-[#d0d7e1] bg-[#e0e5ec] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.48),inset_-4px_-4px_8px_rgba(255,255,255,0.72)] dark:border-[#292e37] dark:bg-[#1e2229] dark:shadow-[inset_4px_4px_8px_rgba(5,7,10,0.48),inset_-4px_-4px_8px_rgba(43,48,58,0.22)]";
const neoButton = "border border-[#d5dce6] bg-[#e0e5ec] text-[#424854] shadow-[3px_3px_7px_rgba(163,177,198,0.48),-3px_-3px_7px_rgba(255,255,255,0.75)] transition-all duration-200 hover:-translate-y-px hover:border-[#ff4500]/30 hover:bg-[#e5eaf1] hover:text-[#e64100] hover:shadow-[4px_4px_9px_rgba(163,177,198,0.55),-4px_-4px_9px_rgba(255,255,255,0.8)] active:translate-y-0 active:bg-[#d9e0e9] active:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.42),inset_-2px_-2px_5px_rgba(255,255,255,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#292e37] dark:bg-[#1e2229] dark:text-[#c1c7d0] dark:shadow-[3px_3px_7px_rgba(5,7,10,0.48),-3px_-3px_7px_rgba(43,48,58,0.3)] dark:hover:border-[#ff885f]/35 dark:hover:bg-[#252a33] dark:hover:text-[#ff885f] dark:hover:shadow-[4px_4px_9px_rgba(0,0,0,0.55),-4px_-4px_9px_rgba(48,54,65,0.34)] dark:active:bg-[#191d23] dark:active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.45),inset_-2px_-2px_5px_rgba(48,54,65,0.22)] dark:focus-visible:ring-offset-[#1e2229]";
const neoAccent = "bg-[#ff4500] text-white shadow-[4px_4px_9px_rgba(163,177,198,0.5),-3px_-3px_8px_rgba(255,255,255,0.55)] transition-all duration-200 hover:-translate-y-px hover:bg-[#e64100] hover:shadow-[5px_5px_11px_rgba(163,177,198,0.58),-4px_-4px_9px_rgba(255,255,255,0.62)] active:translate-y-0 active:shadow-[inset_2px_2px_5px_rgba(120,35,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[orangered] dark:shadow-[4px_4px_9px_rgba(0,0,0,0.38),-3px_-3px_8px_rgba(48,54,65,0.28)] dark:hover:bg-[#ff5a2b] dark:hover:shadow-[5px_5px_11px_rgba(0,0,0,0.48),-4px_-4px_9px_rgba(55,62,74,0.32)] dark:active:bg-[#e64100] dark:focus-visible:ring-offset-[#1e2229]";

function TutorMarkdown({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode((current) => current === code ? null : current), 1800);
    } catch (error) {
      console.error("Copy code error:", error);
    }
  }

  return (
    <div className="tutor-markdown min-w-0 break-words text-[13px] leading-5 sm:text-sm sm:leading-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mt-2 text-[13px] leading-5 text-[#3f3e3e] first:mt-0 last:mb-0 dark:text-[#c1c7d0] sm:mt-3 sm:text-sm sm:leading-6">{children}</p>,
          h1: ({ children }) => <h1 className="mt-2 text-[15px] font-bold text-[#20242b] first:mt-0 dark:text-[#f5f7fa] sm:text-lg">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-5 border-b border-[#cdd3dc] pb-2 text-sm font-bold text-[#20242b] first:mt-0 dark:border-[#343a45] dark:text-[#f5f7fa] sm:mt-7 sm:pb-2.5 sm:text-base">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-3 text-[13px] font-bold text-[#20242b] first:mt-0 dark:text-[#f5f7fa] sm:mt-5 sm:text-sm">{children}</h3>,
          h4: ({ children }) => <h4 className="mt-3 text-[13px] font-bold text-[#20242b] first:mt-0 dark:text-[#f5f7fa] sm:mt-5 sm:text-sm">{children}</h4>,
          strong: ({ children }) => <strong className="font-semibold text-[#20242b] dark:text-[#f5f7fa]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="my-2 space-y-1 pl-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1 pl-1">{children}</ol>,
          li: ({ children }) => <li className="mt-1 flex items-start gap-2 text-[13px] leading-5 text-[#3f3e3e] dark:text-[#c1c7d0]"><span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff4500]" /><span className="min-w-0 flex-1">{children}</span></li>,
          blockquote: ({ children }) => <blockquote className={`mt-3 rounded-r-xl border-l-[3px] border-[#ff4500] px-3 py-2.5 text-[13px] leading-5 text-[#3f3e3e] dark:text-[#c1c7d0] ${neoInset}`}>{children}</blockquote>,
          hr: () => <hr className="my-4 border-[#cdd3dc] dark:border-[#343a45]" />,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-[#e64100] underline underline-offset-2 hover:text-[#c93400] dark:text-[#ff885f] dark:hover:text-[#ffad91]">{children}</a>,
          pre: ({ children }) => {
            let code = "";
            const child = children as React.ReactElement<{ children?: React.ReactNode; className?: string }>;
            if (child && typeof child === "object" && "props" in child) {
              const codeChildren = child.props.children;
              code = Array.isArray(codeChildren) ? codeChildren.join("") : String(codeChildren ?? "");
            }
            const languageClass = child && typeof child === "object" && "props" in child ? child.props.className : undefined;
            const language = languageClass?.replace("language-", "") || "Code";
            return <div className={`mt-5 overflow-hidden rounded-2xl ${neoInset}`}><div className="flex items-center justify-between gap-3 border-b border-[#cdd3dc] px-3 py-2.5 dark:border-[#343a45]"><span className="text-[10px] font-bold uppercase tracking-wider text-[#686f7b] dark:text-[#a8adb7]">{language}</span><button type="button" onClick={() => void copyCode(code)} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${neoButton}`}>{copiedCode === code ? <Check size={12} /> : <Clipboard size={12} />}{copiedCode === code ? "Copied" : "Copy code"}</button></div><pre className="overflow-x-auto p-3 text-[12px] leading-5 text-[#282c34] sm:p-4 sm:leading-6 dark:text-[#e2e6ed]">{children}</pre></div>;
          },
          code: ({ children, className }) => className?.includes("language-") ? <code className="font-mono">{children}</code> : <code className="rounded-md bg-[#d2d8e1] px-1.5 py-0.5 font-mono text-[12px] text-[#d83b01] dark:bg-[#292e36] dark:text-[#ff885f]">{children}</code>,
          table: ({ children }) => <div className="my-3 max-w-full overflow-x-auto rounded-xl border border-[#cdd3dc] dark:border-[#343a45]"><table className="w-full border-collapse text-left text-xs">{children}</table></div>,
          th: ({ children }) => <th className="border-b border-[#cdd3dc] bg-[#d2d8e1] px-3 py-2 font-bold text-[#20242b] dark:border-[#343a45] dark:bg-[#292e36] dark:text-[#f5f7fa]">{children}</th>,
          td: ({ children }) => <td className="border-b border-[#cdd3dc] px-3 py-2 dark:border-[#343a45]">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function AiTutor({ lessonId, courseTitle, lessonTitle }: AiTutorProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<TutorLanguage>("English");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setError("");
    try {
      const response = await fetch(`/api/ai-tutor?lessonId=${lessonId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not load your tutor conversation.");
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your tutor conversation.");
    } finally {
      setLoadingHistory(false);
    }
  }, [lessonId]);

  useEffect(() => { void loadHistory(); }, [loadHistory]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, sending]);

  async function sendMessage(event?: FormEvent<HTMLFormElement>, suggestedText?: string) {
    event?.preventDefault();
    const text = (suggestedText ?? input).trim();
    if (!text || sending) return;
    setError("");
    setSending(true);
    setInput("");
    const temporaryId = `pending-${Date.now()}`;
    setMessages((current) => [...current, { id: temporaryId, role: "user", message: text }]);
    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, message: text, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "The AI Tutor couldn't answer. Please try again.");
      setMessages((current) => [...current.filter((item) => item.id !== temporaryId), data.userMessage, data.assistantMessage]);
    } catch (err) {
      setMessages((current) => current.filter((item) => item.id !== temporaryId));
      setInput(text);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function clearConversation() {
    if (sending || messages.length === 0) return;
    if (!window.confirm("Clear this lesson's AI Tutor conversation? This cannot be undone.")) return;
    setError("");
    try {
      const response = await fetch(`/api/ai-tutor?lessonId=${lessonId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not clear the conversation.");
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear the conversation.");
    }
  }

  return (
    <div className="flex min-w-0 max-w-none flex-col overflow-hidden rounded-[24px] border border-[#d5dce6] bg-[#e0e5ec] shadow-[8px_8px_18px_rgba(163,177,198,0.5),-8px_-8px_18px_rgba(255,255,255,0.75)] dark:border-[#252a33] dark:bg-[#1e2229] dark:shadow-[8px_8px_18px_rgba(5,7,10,0.48),-8px_-8px_18px_rgba(43,48,58,0.28)] sm:mx-0 sm:w-full">
      <div className="flex min-w-0 flex-col items-stretch justify-between gap-3 border-b border-[#cbd2dc] px-3 py-3 dark:border-[#343a45] sm:flex-row sm:items-center sm:px-4 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#ff4500] ${neoPanel}`}><Bot size={20} /></div>
          <div className="min-w-0"><h2 className="text-sm font-bold text-[#20242b] dark:text-[#f5f7fa] sm:text-base">CourseGuide AI Tutor</h2><p className="mt-0.5 line-clamp-2 break-words text-xs leading-5 text-[#626975] dark:text-[#a8adb7]">{lessonTitle} · {courseTitle}</p></div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <label htmlFor={`tutor-language-${lessonId}`} className="sr-only">Tutor response language</label>
          <select id={`tutor-language-${lessonId}`} value={language} onChange={(event) => setLanguage(event.target.value as TutorLanguage)} className={`max-w-[150px] rounded-xl px-3 py-2.5 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-[#ff4500]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec] dark:focus-visible:ring-offset-[#1e2229] ${neoInset}`}>
            <option value="English">English</option><option value="Hindi">हिन्दी</option><option value="Hinglish">Hinglish</option>
          </select>
          <button type="button" onClick={clearConversation} disabled={sending || messages.length === 0} title="Clear conversation" aria-label="Clear conversation" className={`flex h-10 w-10 items-center justify-center rounded-xl ${neoButton}`}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="h-[min(52vh,560px)] min-h-[260px] min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:h-[420px] sm:max-h-[520px] sm:px-4 sm:py-4">
        {loadingHistory ? <div className="flex h-full items-center justify-center gap-2 text-sm text-[#626975] dark:text-[#a8adb7]"><LoaderCircle className="animate-spin text-[#ff4500]" size={17} />Loading your conversation…</div> : messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center py-5 text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-[#ff4500] ${neoPanel}`}><MessageCircle size={24} /></div>
            <h3 className="mt-4 text-sm font-bold text-[#20242b] dark:text-[#f5f7fa] sm:text-base">What would you like to understand?</h3>
            <p className="mt-1.5 max-w-md text-xs leading-5 text-[#626975] dark:text-[#a8adb7] sm:text-sm sm:leading-6">Ask about <span className="font-semibold text-[#30343b] dark:text-[#e2e6ed]">{lessonTitle}</span>. The tutor uses saved notes and available transcript context when possible.</p>
            <div className="mt-5 flex w-full max-w-xl flex-wrap justify-center gap-2 px-1">{suggestions.map((question) => <button key={question} type="button" disabled={sending} onClick={() => void sendMessage(undefined, question)} className={`rounded-xl px-3 py-2.5 text-xs font-semibold ${neoButton}`}>{question}</button>)}</div>
          </div>
        ) : <div className="w-full min-w-0 space-y-4 sm:space-y-5">
          {messages.map((item) => { const isUser = item.role === "user"; return <div key={item.id} className={`flex w-full min-w-0 items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#ff4500] ${neoPanel}`}><Bot size={16} /></div>}
            <div className={`min-w-0 max-w-[86%] break-words sm:max-w-[78%] ${isUser ? "rounded-2xl rounded-br-md bg-[#ff4500] px-3.5 py-2.5 text-[13px] leading-5 text-white shadow-[4px_4px_9px_rgba(163,177,198,0.45)] sm:px-4 sm:py-3 sm:text-sm sm:leading-6 dark:bg-[orangered]" : `rounded-2xl rounded-bl-md px-3.5 py-3 text-[#30343b] sm:px-4 sm:py-3.5 dark:text-[#d5d9e0] ${neoPanel}`}`}>{isUser ? item.message : <TutorMarkdown content={item.message} />}</div>
            {isUser && <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#626975] ${neoPanel} dark:text-[#a8adb7]`}><UserRound size={15} /></div>}
          </div>; })}
          {sending && <div className="flex items-center gap-2 pl-10 text-xs font-medium text-[#626975] dark:text-[#a8adb7]"><LoaderCircle size={15} className="animate-spin text-[#ff4500]" />Tutor is thinking…</div>}
          <div ref={bottomRef} />
        </div>}
      </div>

      {error && <div role="alert" className="mx-3 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-[inset_2px_2px_5px_rgba(185,28,28,0.06)] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 sm:mx-4">{error}</div>}
      <form onSubmit={(event) => void sendMessage(event)} className="w-full min-w-0 border-t border-[#cbd2dc] px-2 py-3 dark:border-[#343a45] sm:px-3 sm:py-4">
        <div className={`flex min-w-0 items-end gap-2 rounded-2xl p-2 ${neoInset}`}>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Ask a question about this lesson…" aria-label="Ask the AI Tutor a question" rows={2} maxLength={4000} disabled={sending || loadingHistory} className="max-h-24 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-[13px] leading-5 text-[#30343b] outline-none placeholder:text-[#7a818d] disabled:opacity-60 sm:max-h-32 sm:min-h-11 sm:resize-y sm:px-3 sm:text-sm dark:text-[#f5f7fa] dark:placeholder:text-[#89919e]" />
          <button type="submit" disabled={sending || loadingHistory || !input.trim()} aria-label="Send message" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${neoAccent}`}>{sending ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}</button>
        </div>
        <p className="mt-2 px-1 text-[10px] text-[#7a818d] dark:text-[#89919e] sm:text-[11px]">Enter to send · Shift+Enter for a new line</p>
      </form>
    </div>
  );
}