"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Bot, Check, Clipboard, LoaderCircle, MessageCircle, Send, Trash2, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type TutorRole = "user" | "assistant";
type TutorLanguage = "English" | "Hindi" | "Hinglish";
type TutorMessage = { id: number | string; role: TutorRole; message: string; createdAt?: string };
type AiTutorProps = { lessonId: number; courseTitle: string; lessonTitle: string };

const suggestions = ["Explain the main concept simply", "Give me a practical example", "What should I remember from this lesson?"];

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
    <div className="tutor-markdown min-w-0 break-words text-sm leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mt-3 text-sm leading-7 text-[#3f3e3e] first:mt-0 last:mb-0 dark:text-[#a8adb7]">{children}</p>,
          h1: ({ children }) => <h1 className="mt-2 text-lg font-bold text-black first:mt-0 dark:text-[#f5f7fa]">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-8 border-b border-[#cdd3dc] pb-2.5 text-base font-bold text-black first:mt-0 dark:border-[#30353e] dark:text-[#f5f7fa]">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-5 text-sm font-bold text-black first:mt-0 dark:text-[#f5f7fa]">{children}</h3>,
          h4: ({ children }) => <h4 className="mt-5 text-sm font-bold text-black first:mt-0 dark:text-[#f5f7fa]">{children}</h4>,
          strong: ({ children }) => <strong className="font-semibold text-black dark:text-[#f5f7fa]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="my-2 space-y-1 pl-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1 pl-1">{children}</ol>,
          li: ({ children, node }) => {
            const ordered = node?.position?.start?.column === 1;
            return <li className="mt-2 flex items-start gap-3 text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]"><span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff4500] dark:bg-[orangered]" /><span className="min-w-0 flex-1">{children}</span></li>;
          },
          blockquote: ({ children }) => <blockquote className="mt-4 rounded-r-xl border-l-[3px] border-[#ff4500] bg-[#d7dde6] px-4 py-3 text-sm leading-6 text-[#3f3e3e] dark:bg-[#20252d] dark:text-[#c1c7d0]">{children}</blockquote>,
          hr: () => <hr className="my-4 border-[#cdd3dc] dark:border-[#30353e]" />,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-[#e64100] underline underline-offset-2 hover:text-red-600 dark:text-[#ff885f]">{children}</a>,
          pre: ({ children }) => {
            let code = "";
            const child = children as React.ReactElement<{ children?: React.ReactNode }>;
            if (child && typeof child === "object" && "props" in child) {
              const codeChildren = child.props.children;
              code = Array.isArray(codeChildren) ? codeChildren.join("") : String(codeChildren ?? "");
            }
            const languageClass = child && typeof child === "object" && "props" in child ? (child.props as { className?: string }).className : undefined;
            const language = languageClass?.replace("language-", "") || "Code";
            return <div className="mt-5 overflow-hidden rounded-[18px] border border-[#cdd3dc] bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.6)] dark:border-[#30353e] dark:bg-[#171a20] dark:shadow-[inset_3px_3px_6px_rgba(5,7,10,0.5),inset_-3px_-3px_6px_rgba(43,48,58,0.25)]"><div className="flex items-center justify-between gap-3 border-b border-[#cdd3dc] px-4 py-2.5 dark:border-[#30353e]"><span className="text-[10px] font-semibold uppercase tracking-wider text-[#666d79] dark:text-[#a8adb7]">{language}</span><button type="button" onClick={() => void copyCode(code)} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#ff4500] transition hover:bg-[#d2d8e1] dark:text-[#ff885f] dark:hover:bg-[#292e36]">{copiedCode === code ? <Check size={12} /> : <Clipboard size={12} />}{copiedCode === code ? "Copied" : "Copy code"}</button></div><pre className="overflow-x-auto p-4 text-[12px] leading-6 text-[#282c34] dark:text-[#e2e6ed]">{children}</pre></div>;
          },
          code: ({ children, className }) => {
            const isBlock = Boolean(className?.includes("language-"));
            return isBlock ? <code className="font-mono">{children}</code> : <code className="rounded-md bg-[#d2d8e1] px-1.5 py-0.5 font-mono text-[12px] text-[#d83b01] dark:bg-[#292e36] dark:text-[#ff885f]">{children}</code>;
          },
          table: ({ children }) => <div className="my-3 max-w-full overflow-x-auto rounded-[12px] border border-[#cdd3dc] dark:border-[#30353e]"><table className="w-full border-collapse text-left text-xs">{children}</table></div>,
          th: ({ children }) => <th className="border-b border-[#cdd3dc] bg-[#d2d8e1] px-3 py-2 font-bold text-black dark:border-[#30353e] dark:bg-[#292e36] dark:text-[#f5f7fa]">{children}</th>,
          td: ({ children }) => <td className="border-b border-[#cdd3dc] px-3 py-2 dark:border-[#30353e]">{children}</td>,
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
    <div className="overflow-hidden rounded-[24px] bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:shadow-[9px_9px_16px_rgba(5,7,10,0.75),-9px_-9px_16px_rgba(43,48,58,0.75)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cbd2dc] px-4 py-4 dark:border-[#343a45] sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#e0e5ec] text-[#ff4500] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:bg-[#1e2229] dark:text-[orangered]"><Bot size={20} /></div>
          <div className="min-w-0"><h2 className="text-sm font-bold text-black dark:text-[#f5f7fa]">CourseGuide AI Tutor</h2><p className="mt-0.5 truncate text-xs text-[#3f3e3e] dark:text-[#a8adb7]">{lessonTitle} · {courseTitle}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`tutor-language-${lessonId}`} className="sr-only">Tutor response language</label>
          <select id={`tutor-language-${lessonId}`} value={language} onChange={(event) => setLanguage(event.target.value as TutorLanguage)} className="rounded-[10px] bg-[#e0e5ec] px-3 py-2 text-xs font-medium text-[#3f3e3e] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] outline-none dark:bg-[#1e2229] dark:text-[#a8adb7]">
            <option value="English">English</option><option value="Hindi">हिन्दी</option><option value="Hinglish">Hinglish</option>
          </select>
          <button type="button" onClick={clearConversation} disabled={sending || messages.length === 0} title="Clear conversation" aria-label="Clear conversation" className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#686d75] hover:text-red-600 disabled:opacity-40 dark:text-[#a8adb7]"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="h-[420px] overflow-y-auto px-4 py-5 sm:px-5">
        {loadingHistory ? <div className="flex h-full items-center justify-center gap-2 text-sm text-[#555b65] dark:text-[#a8adb7]"><LoaderCircle className="animate-spin" size={17} />Loading your conversation…</div> : messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e0e5ec] text-[#ff4500] shadow-[inset_5px_5px_9px_rgba(163,177,198,0.65),inset_-5px_-5px_9px_rgba(255,255,255,0.85)] dark:bg-[#1e2229]"><MessageCircle size={23} /></div>
            <h3 className="mt-4 text-base font-bold text-black dark:text-[#f5f7fa]">What would you like to understand?</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#3f3e3e] dark:text-[#a8adb7]">Ask about <span className="font-semibold">{lessonTitle}</span>. The tutor uses saved notes and available transcript context when possible.</p>
            <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">{suggestions.map((question) => <button key={question} type="button" disabled={sending} onClick={() => void sendMessage(undefined, question)} className="rounded-full bg-[#e0e5ec] px-3 py-2 text-xs font-medium text-[#3f3e3e] shadow-[4px_4px_8px_rgba(163,177,198,0.5),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:text-[#ff4500] disabled:opacity-50 dark:bg-[#1e2229] dark:text-[#a8adb7]">{question}</button>)}</div>
          </div>
        ) : <div className="space-y-4">
          {messages.map((item) => { const isUser = item.role === "user"; return <div key={item.id} className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[#ff4500] dark:bg-[#1e2229]"><Bot size={16} /></div>}
            <div className={`min-w-0 max-w-[88%] break-words rounded-[17px] px-4 py-3 ${isUser ? "whitespace-pre-wrap bg-[#ff4500] text-sm leading-6 text-white dark:bg-[orangered]" : "bg-[#e0e5ec] text-[#30343b] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.45),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:bg-[#1e2229] dark:text-[#d5d9e0]"}`}>{isUser ? item.message : <TutorMarkdown content={item.message} />}</div>
            {isUser && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e0e5ec] text-[#686d75] dark:bg-[#1e2229] dark:text-[#a8adb7]"><UserRound size={15} /></div>}
          </div>; })}
          {sending && <div className="flex items-center gap-2 text-xs text-[#555b65] dark:text-[#a8adb7]"><LoaderCircle size={15} className="animate-spin" />Tutor is thinking…</div>}
          <div ref={bottomRef} />
        </div>}
      </div>

      {error && <div role="alert" className="mx-4 mb-3 rounded-[12px] bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200 sm:mx-5">{error}</div>}
      <form onSubmit={(event) => void sendMessage(event)} className="border-t border-[#cbd2dc] p-3 dark:border-[#343a45] sm:p-4">
        <div className="flex items-end gap-2 rounded-[16px] bg-[#e0e5ec] p-2 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:bg-[#1e2229]">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Ask a question about this lesson…" aria-label="Ask the AI Tutor a question" rows={2} maxLength={4000} disabled={sending || loadingHistory} className="max-h-32 min-h-11 flex-1 resize-y bg-transparent px-3 py-2 text-sm text-[#30343b] outline-none placeholder:text-[#777d86] disabled:opacity-60 dark:text-[#f5f7fa]" />
          <button type="submit" disabled={sending || loadingHistory || !input.trim()} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#ff4500] text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[orangered]">{sending ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}</button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-[#777d86] dark:text-[#89919e]">Enter to send · Shift+Enter for a new line</p>
      </form>
    </div>
  );
}
