"use client";



import { useCallback, useEffect, useRef, useState } from "react";



import { ArrowLeft, ArrowRight, AudioLines, CheckCircle2, CircleHelp, Code2, Mic, MicOff, Play, RotateCcw, Sparkles, Target, Trophy } from "lucide-react";



type Round = { id: string; title: string; detail: string; count: number };



type Answer = { question: string; answer: string; score: number; feedback: string; strengths: string[]; improvements: string[]; correctedCode?: string; round: string };



type McqQuestion = { category: string; question: string; options: string[]; correctIndex: number; explanation: string };

type CodingQuestion = { id: string; category: string; difficulty: string; question: string };



type Session = { mode: "round" | "mock"; roundIds: string[]; roundIndex: number; questionIndex: number; currentQuestion: string; codingQuestions?: CodingQuestion[]; currentCodingQuestion?: CodingQuestion; currentMcq?: McqQuestion; mcqQuestions?: McqQuestion[]; feedbackMode: "each" | "end"; answers: Answer[]; startedAt: string; completedAt?: string; status: "in_progress" | "completed"; mockVoiceDurationMinutes?: number; mockJobRole?: string; voiceInterview?: { enabled: boolean; jobRole: string; durationMinutes: number; deadlineAt: string; conversation: { role: "assistant" | "user"; content: string }[] } };





type Recognition = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((event: any) => void) | null; onerror: ((event: any) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };



type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };





/** Render generated interview text with readable fenced and inline code blocks. */
function RichQuestionText({ text, className = "" }: { text: string; className?: string }) {
    const cleanedText = text
        .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
        .replace(/\$([^$\n]+?)\$/g, "$1")
        .replace(/\\\(([\s\S]*?)\\\)/g, "$1")
        .replace(/\\\[([\s\S]*?)\\\]/g, "$1");
    const segments = cleanedText.split(/(```[\s\S]*?```)/g).filter(Boolean);

    const renderInline = (value: string) => value.split(/(`[^`]+`|\*\*.+?\*\*|\*[^*\n]+\*)/g).filter(Boolean).map((part, i) => {
        const code = part.match(/^`([^`]+)`$/);
        const bold = part.match(/^\*\*(.+?)\*\*$/);
        const italic = !bold && part.match(/^\*([^*]+)\*$/);
        if (code) return <code key={i} className="rounded-md bg-[#ff4500]/10 px-1.5 py-0.5 font-mono text-[0.88em] font-semibold text-[#c83a00] dark:text-[#ff8a5c]">{code[1]}</code>;
        if (bold) return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{bold[1]}</strong>;
        if (italic) return <em key={i} className="italic text-slate-600 dark:text-slate-300">{italic[1]}</em>;
        return <span key={i}>{part}</span>;
    });

    return <div className={className}>
        {segments.map((segment, index) => {
            const fenced = segment.match(/^```([\w+#.-]*)\n?([\s\S]*?)```$/);
            if (fenced) return <div key={index} className="neo-surface my-4 overflow-hidden rounded-2xl text-zinc-800 dark:text-zinc-100">
                <div className="flex items-center justify-between border-b border-black/[0.06] bg-black/[0.025] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.025]"><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{fenced[1] || "code"}</span><span className="rounded-lg bg-black/[0.04] px-2 py-1 text-[10px] font-semibold text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">Code</span></div>
                <pre className="overflow-x-auto bg-[#e0e5ec]/55 p-4 text-[13px] leading-6 text-zinc-800 shadow-[inset_3px_3px_7px_rgba(163,177,198,0.35),inset_-3px_-3px_7px_rgba(255,255,255,0.7)] dark:bg-[#1a1d23]/70 dark:text-zinc-100 dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.24),inset_-2px_-2px_6px_rgba(255,255,255,0.025)]"><code>{fenced[2].replace(/^\n|\n$/g, "")}</code></pre>
            </div>;
            return <div key={index} className="whitespace-pre-wrap">{segment.split("\n").map((line, lineIndex) => {
                const heading = line.match(/^(#{1,3})\s+(.+)$/);
                const bullet = line.match(/^\s*[-*]\s+(.+)$/);
                const numbered = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
                if (!line.trim()) return <div key={lineIndex} className="h-2" />;
                if (heading) return <h3 key={lineIndex} className={`${heading[1].length === 1 ? "mt-4 text-base" : "mt-3 text-sm"} mb-2 font-extrabold leading-snug first:mt-0 text-zinc-900 dark:text-white`}>{renderInline(heading[2])}</h3>;
                if (bullet) return <div key={lineIndex} className="ml-1 flex gap-2 py-0.5 leading-6"><span className="font-bold text-[#ff4500]">•</span><span>{renderInline(bullet[1])}</span></div>;
                if (numbered) return <div key={lineIndex} className="flex items-start gap-3 py-1"><span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff4500]/10 text-[11px] font-extrabold text-[#c83a00] dark:text-[#ff8a5c]">{numbered[1]}</span><span className="flex-1 leading-6">{renderInline(numbered[2])}</span></div>;
                return <p key={lineIndex} className="leading-6 text-slate-700 dark:text-slate-200">{renderInline(line)}</p>;
            })}</div>;
        })}
    </div>;
}

function completedStatus(session: Session | null): boolean { return session?.status === "completed"; }



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



    { id: "project", title: "Project / Advanced Technical", detail: "Your projects, tech stack, implementation, architecture and trade-offs", count: 4 },



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

            throw new Error("Something went wrong. Please try again.");

        }



        return data;

    } catch (error) {

        if (error instanceof Error && error.message.startsWith("Something went wrong.")) throw error;



        console.error("[Interview UI] Could not reach the interview API", {

            action,

            message: error instanceof Error ? error.message : String(error),

        });

        throw new Error("Could not connect to the interview service. Please try again.");

    }



}



export default function InterviewsClient({ userName, userId }: { userName: string; userId: number }) {



    const [selectedRound, setSelectedRound] = useState("technical");

    const [jobRole, setJobRole] = useState("Software Engineer");

    const [durationMinutes, setDurationMinutes] = useState(10);

    const [secondsLeft, setSecondsLeft] = useState(600);

    const [autoVoice, setAutoVoice] = useState(false);

    const [timeExpired, setTimeExpired] = useState(false);

    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const answerRef = useRef("");

    const autoVoiceRef = useRef(false);

    const timeExpiredRef = useRef(false);

    const submitVoiceTurnRef = useRef<((expired?: boolean) => Promise<void>) | null>(null);

    const voiceTurnInFlightRef = useRef(false);

    const startRecordingRef = useRef<(() => void) | null>(null);



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



    const [voiceAvailable, setVoiceAvailable] = useState(false);



    const recognitionRef = useRef<Recognition | null>(null);

    const activeAudioRef = useRef<HTMLAudioElement | null>(null);

    const activeAudioUrlRef = useRef<string | null>(null);

    const interviewActiveRef = useRef(false);



    const cancelInterviewMedia = useCallback(() => {

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        silenceTimerRef.current = null;

        recognitionRef.current?.stop();

        recognitionRef.current = null;

        window.speechSynthesis?.cancel();

        if (activeAudioRef.current) {

            activeAudioRef.current.onended = null;

            activeAudioRef.current.onerror = null;

            activeAudioRef.current.pause();

            activeAudioRef.current.src = "";

            activeAudioRef.current = null;

        }

        if (activeAudioUrlRef.current) {

            URL.revokeObjectURL(activeAudioUrlRef.current);

            activeAudioUrlRef.current = null;

        }

        setListening(false);

        setSpeaking(false);

    }, []);



    const sessionRef = useRef<Session | null>(null);



    useEffect(() => { sessionRef.current = session; }, [session]);

    useEffect(() => { autoVoiceRef.current = autoVoice; }, [autoVoice]);

    useEffect(() => { timeExpiredRef.current = timeExpired; }, [timeExpired]);

    useEffect(() => { answerRef.current = answer; }, [answer]);

    useEffect(() => {

        if (!session?.voiceInterview?.enabled || completedStatus(session)) return;

        const update = () => {

            const left = Math.max(0, Math.ceil((new Date(session.voiceInterview!.deadlineAt).getTime() - Date.now()) / 1000));

            setSecondsLeft(left);

            if (left <= 0 && !timeExpiredRef.current) {

                setTimeExpired(true);

                timeExpiredRef.current = true;

                // Mark the deadline only. Never finish while between turns or while the

                // interviewer is speaking; let the candidate answer, then submit after

                // five seconds of silence and let the API produce the closing response.

            }

        };

        update();

        const id = window.setInterval(update, 1000);

        return () => window.clearInterval(id);

    }, [session?.voiceInterview?.deadlineAt, session?.status, listening, speaking]);



    useEffect(() => {



        const speechWindow = window as SpeechWindow;



        setVoiceAvailable(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));



        return () => { interviewActiveRef.current = false; cancelInterviewMedia(); };



    }, [cancelInterviewMedia]);



    const speak = useCallback(async (text: string, activeSessionId?: number, activeSession?: Session) => {

        if (!text || typeof window === "undefined" || !interviewActiveRef.current) return;

        cancelInterviewMedia();

        const shouldAutoListen = autoVoiceRef.current;

        const beginListening = () => {

            setSpeaking(false);

            // Even if the deadline passed during the AI response, allow one final

            // candidate answer. The five-second silence handler submits it as final.

            if (shouldAutoListen) window.setTimeout(() => startRecordingRef.current?.(), 250);

        };

        try {

            const currentId = activeSessionId ?? sessionId;

            const currentSession = activeSession ?? sessionRef.current;

            if (currentId && currentSession?.voiceInterview?.enabled) {

                const response = await fetch("/api/interviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "speak", sessionId: currentId, session: currentSession, text }) });

                if (response.ok && response.headers.get("content-type")?.includes("audio")) {

                    const blob = await response.blob();

                    const audioUrl = URL.createObjectURL(blob);

                    activeAudioUrlRef.current = audioUrl;

                    const audio = new Audio(audioUrl);

                    activeAudioRef.current = audio;

                    audio.onplay = () => setSpeaking(true);

                    await new Promise<void>((resolve) => {

                        audio.onended = () => {

                            URL.revokeObjectURL(audioUrl);

                            if (activeAudioUrlRef.current === audioUrl) activeAudioUrlRef.current = null;

                            if (activeAudioRef.current === audio) activeAudioRef.current = null;

                            if (!interviewActiveRef.current) { resolve(); return; }

                            beginListening();

                            resolve();

                        };

                        audio.onerror = () => {

                            URL.revokeObjectURL(audioUrl);

                            if (activeAudioUrlRef.current === audioUrl) activeAudioUrlRef.current = null;

                            if (activeAudioRef.current === audio) activeAudioRef.current = null;

                            setSpeaking(false);

                            if (interviewActiveRef.current) fallbackSpeak(text, () => { beginListening(); resolve(); }); else resolve();

                        };

                        void audio.play().catch(() => {

                            URL.revokeObjectURL(audioUrl);

                            if (activeAudioUrlRef.current === audioUrl) activeAudioUrlRef.current = null;

                            if (activeAudioRef.current === audio) activeAudioRef.current = null;

                            setSpeaking(false);

                            if (interviewActiveRef.current) fallbackSpeak(text, () => { beginListening(); resolve(); }); else resolve();

                        });

                    });

                    return;

                }

            }

        } catch (ttsError) {

            console.warn("[Interview Voice] Magpie TTS unavailable; using browser voice", ttsError);

        }

        fallbackSpeak(text, beginListening);

    }, [sessionId, cancelInterviewMedia]);



    const fallbackSpeak = (text: string, onEnd: () => void) => {

        if (!interviewActiveRef.current) return;

        if (!("speechSynthesis" in window)) { onEnd(); return; }

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.rate = 0.96; utterance.pitch = 1.02;

        utterance.onstart = () => setSpeaking(true);

        utterance.onend = onEnd;

        utterance.onerror = onEnd;

        window.speechSynthesis.speak(utterance);

    };



    const startInterview = async (mode: "round" | "mock") => {



        interviewActiveRef.current = true;

        setLoading(true); setError(""); setLatestEvaluation(null); setRoundSummary(null); setAnswer(""); setSelectedOption(null); setQuestionExplanation(null); setExplanationLoading(false);



        try {



            const excludedQuestions: string[] = [];



            const isVoiceRound = mode === "round" && ["technical", "project", "hr"].includes(selectedRound);

            setAutoVoice(isVoiceRound); autoVoiceRef.current = isVoiceRound; setTimeExpired(false); timeExpiredRef.current = false; setSecondsLeft(durationMinutes * 60);

            const data = await requestApi({

                action: "start", mode, roundId: selectedRound, feedbackMode, excludedQuestions,

                jobRole: selectedRound === "hr" ? "General HR / Managerial Candidate" : jobRole, durationMinutes,

            });



            setSessionId(data.sessionId); setSession(data.session); sessionRef.current = data.session; setRound(data.round);

            if (data.round?.id !== "aptitude" && data.round?.id !== "coding") await speak(data.session.currentQuestion, data.sessionId, data.session);



        } catch (e) { setError(e instanceof Error ? e.message : "Could not start interview."); }



        finally { setLoading(false); }



    };



    const startRecording = () => {

        const speechWindow = window as SpeechWindow;

        const Constructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

        if (!Constructor) { setError("Speech recognition is not supported by this browser. Try the latest Chrome or Edge."); return; }

        // Even after the deadline, keep listening for the candidate's final answer.

        setError("");

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        const recognition = new Constructor();

        recognition.lang = "en-IN"; recognition.interimResults = true; recognition.continuous = true;

        let lastFinal = "";

        const armSilenceTimer = () => {

            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

            silenceTimerRef.current = setTimeout(() => {

                recognition.stop();

                setListening(false);

                if (autoVoiceRef.current) void submitVoiceTurnRef.current?.(timeExpiredRef.current);

            }, 5000);

        };

        recognition.onresult = (event) => {

            let finalText = ""; let interimText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {

                const transcript = event.results[i][0]?.transcript || "";

                if (event.results[i].isFinal) finalText += transcript; else interimText += transcript;

            }

            if (finalText.trim()) lastFinal = [lastFinal, finalText.trim()].filter(Boolean).join(" ");

            const visible = [lastFinal, interimText.trim()].filter(Boolean).join(" ");

            setAnswer(visible); answerRef.current = visible;

            armSilenceTimer();

        };

        recognition.onerror = (event) => {

            setListening(false);

            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

            if (event.error === "not-allowed") setError("Microphone permission was blocked. Allow microphone access in your browser settings.");

            else if (event.error !== "no-speech" && event.error !== "aborted") setError(`Speech recognition error: ${event.error}`);

            if (autoVoiceRef.current && timeExpiredRef.current) void submitVoiceTurnRef.current?.(true);

        };

        recognition.onend = () => {

            setListening(false);

            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

            if (autoVoiceRef.current && !loading) void submitVoiceTurnRef.current?.(timeExpiredRef.current);

        };

        recognitionRef.current = recognition;

        try { recognition.start(); setListening(true); if (autoVoiceRef.current) armSilenceTimer(); }

        catch { setError("The microphone could not start. Please try again."); }

    };

    startRecordingRef.current = startRecording;



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



    const submitVoiceTurn = async (expired = false) => {

        if (!sessionId || !sessionRef.current || loading || voiceTurnInFlightRef.current) return;

        const spokenAnswer = answerRef.current.trim();

        const silenceTimeout = !spokenAnswer && !expired && autoVoiceRef.current;

        if (!spokenAnswer && !expired && !silenceTimeout) return;

        voiceTurnInFlightRef.current = true;

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        recognitionRef.current?.stop(); setListening(false); setLoading(true); setError("");

        try {

            const data = await requestApi({ action: "voice-turn", sessionId, session: sessionRef.current, answer: spokenAnswer, timeExpired: expired || timeExpiredRef.current, silenceTimeout });

            setLatestEvaluation(data.evaluation || null);

            setAnswer(""); answerRef.current = "";

            setRound(data.round || round);

            if (data.finished) {

                // Keep the interview screen visible while the final AI response is playing.

                // The API may already mark the persisted session completed, but the UI must

                // not switch to the evaluation page until speech playback has finished.

                const completedSession = data.session as Session;

                const speakingSession: Session = { ...completedSession, status: "in_progress", completedAt: undefined };

                sessionRef.current = speakingSession;

                setSession(speakingSession);

                setAutoVoice(false); autoVoiceRef.current = false; setTimeExpired(true); timeExpiredRef.current = true;

                await speak(data.finalResponse || data.session.currentQuestion, sessionId, completedSession);

                // Only now reveal the completed evaluation page, after the AI audio ends.

                sessionRef.current = completedSession;

                setSession(completedSession);

            } else {

                const nextSession = data.session as Session;

                const roundChanged = data.roundChanged === true;

                if (roundChanged) {

                    const nextVoiceEnabled = Boolean(nextSession.voiceInterview?.enabled);

                    setAutoVoice(nextVoiceEnabled); autoVoiceRef.current = nextVoiceEnabled;

                    setTimeExpired(false); timeExpiredRef.current = false;

                    setSecondsLeft((nextSession.voiceInterview?.durationMinutes || 10) * 60);

                    setSelectedOption(null); setQuestionExplanation(null); setRoundSummary(null);

                }

                sessionRef.current = nextSession; setSession(nextSession);

                await speak(data.response || nextSession.currentQuestion, sessionId, nextSession);

            }

        } catch (e) { setError(e instanceof Error ? e.message : "Could not process your spoken answer."); }

        finally { setLoading(false); voiceTurnInFlightRef.current = false; }

    };

    submitVoiceTurnRef.current = submitVoiceTurn;



    const submitAnswer = async () => {

        if (autoVoiceRef.current) { await submitVoiceTurn(timeExpiredRef.current); return; }



        const isMcq = round?.id === "aptitude";



        if (!sessionId || !session || loading || (isMcq ? selectedOption === null : !answer.trim())) return;



        stopRecording(); window.speechSynthesis?.cancel(); setSpeaking(false); setLoading(true); setError(""); setRoundSummary(null);



        try {



            const submittedAnswer = isMcq && selectedOption !== null ? `${String.fromCharCode(65 + selectedOption)}. ${session.currentMcq?.options[selectedOption] || ""}` : answer.trim();



            const data = await requestApi({ action: "answer", sessionId, session, answer: submittedAnswer, language: round?.id === "coding" ? selectedLanguage : undefined });



            setLatestEvaluation(data.evaluation || null); setRoundSummary(data.roundSummary || null); setAnswer(""); answerRef.current = ""; setSelectedOption(null); setQuestionExplanation(null);

            const nextSession = data.session as Session;

            const nextVoiceEnabled = Boolean(nextSession.voiceInterview?.enabled);

            setAutoVoice(nextVoiceEnabled); autoVoiceRef.current = nextVoiceEnabled;

            if (data.round?.id !== round?.id && nextVoiceEnabled) {

                setTimeExpired(false); timeExpiredRef.current = false;

                setSecondsLeft((nextSession.voiceInterview?.durationMinutes || 10) * 60);

            }

            sessionRef.current = nextSession; setSession(nextSession); setRound(data.round);



            if (data.finished) { /* evaluation is shown in the current session only */ }



            else if (data.session?.currentQuestion && data.round?.id !== "aptitude" && data.round?.id !== "coding") void speak(data.session.currentQuestion, sessionId, nextSession);



        } catch (e) { setError(e instanceof Error ? e.message : "Could not submit your answer."); }



        finally { setLoading(false); }



    };



    const finishEarly = async () => {



        if (!sessionId) return;



        setAutoVoice(false); autoVoiceRef.current = false; if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); stopRecording(); window.speechSynthesis?.cancel(); setLoading(true);



        try { const data = await requestApi({ action: "finish", sessionId, session }); sessionRef.current = data.session; setSession(data.session); setRound(null); setLatestEvaluation(null); }



        catch (e) { setError(e instanceof Error ? e.message : "Could not finish interview."); }



        finally { setLoading(false); }



    };



    const reset = () => { interviewActiveRef.current = false; cancelInterviewMedia(); setAutoVoice(false); autoVoiceRef.current = false; setTimeExpired(false); timeExpiredRef.current = false; sessionRef.current = null; setSession(null); setSessionId(null); setRound(null); setAnswer(""); setSelectedOption(null); setQuestionExplanation(null); setExplanationLoading(false); setLatestEvaluation(null); setRoundSummary(null); setError(""); setListening(false); setSpeaking(false); };



    const completed = session?.status === "completed";



    const average = session ? getSessionAverage(session.answers) : 0;



    const roundProgress = session && round ? Math.min(100, Math.round((session.questionIndex / round.count) * 100)) : 0;



    return <main className="min-h-screen bg-[#e0e5ec] px-4 pb-16 pt-5 text-[#242833] transition-colors dark:bg-[#1a1d23] dark:text-[#f5f7fa] sm:px-6 sm:pt-5">



        <div className="mx-auto w-full max-w-7xl">



            {!session ? <>



                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">



                    <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-2 text-sm font-semibold text-[#ff4500]"><Sparkles size={16} /> AI Interview Preparation</div><h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Practice for your next <span className="text-[#ff4500]">big opportunity.</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">Hi {userName.split(" ")[0]}, practice placement interviews with MCQ-based online assessments, voice interviews, and actionable feedback.</p></div>



                </div>



                <div className="grid w-full min-w-0 grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">




                    <section className="neo-surface w-full min-w-0 rounded-[28px] p-5 sm:p-7">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-2xl bg-[#ff4500]/10 p-3 text-[#ff4500]">
                                <Target size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Practice a single round</h2>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    Focus on the skills you want to improve.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {ROUNDS.map((item, index) => (
                                <div key={item.id} className="space-y-2">
                                    <button
                                        onClick={() => setSelectedRound(item.id)}
                                        className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition duration-200 ${selectedRound === item.id
                                                ? "neo-inset ring-1 ring-[#ff4500]/30"
                                                : "neo-button"
                                            }`}
                                    >
                                        {/* Round number */}
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-extrabold ${selectedRound === item.id
                                                    ? "bg-[#ff4500] text-white shadow-[3px_3px_6px_rgba(0,0,0,0.22),-2px_-2px_5px_rgba(255,255,255,0.12)]"
                                                    : "neo-inset text-zinc-500"
                                                }`}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* Round information */}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold">{item.title}</p>
                                            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                                                {item.detail}
                                            </p>
                                        </div>

                                        {/* Duration / question count */}
                                        <span className="text-xs font-semibold text-zinc-500">
                                            {["technical", "project", "hr"].includes(item.id)
                                                ? "Timed"
                                                : `${item.count} Qs`}
                                        </span>
                                    </button>

                                    {/* Timed round notice */}
                                    {selectedRound === item.id &&
                                        ["technical", "project", "hr"].includes(item.id) && (
                                            <p className="rounded-xl bg-[#ff4500]/[0.06] px-4 py-3 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                                                Five seconds of silence submits your answer.
                                            </p>
                                        )}

                                    {/* Selected round settings */}
                                    {selectedRound === item.id && (
                                        <>
                                            {["technical", "project", "hr"].includes(item.id) && (
                                                <div
                                                    className={`mt-3 grid gap-4 rounded-2xl neo-inset p-4 ${selectedRound === "project"
                                                            ? "sm:grid-cols-1"
                                                            : "sm:grid-cols-2"
                                                        }`}
                                                >
                                                    {/* Job role */}
                                                    {!["project", "hr"].includes(selectedRound) && (
                                                        <div>
                                                            <label
                                                                htmlFor="interview-job-role"
                                                                className="mb-2 block text-sm font-bold"
                                                            >
                                                                Job role
                                                            </label>

                                                            <select
                                                                id="interview-job-role"
                                                                value={jobRole}
                                                                onChange={(e) => setJobRole(e.target.value)}
                                                                className="w-full neo-surface-sm rounded-xl border border-transparent bg-[#e0e5ec] px-3 py-3 text-sm outline-none focus:border-[#ff4500]/50 focus:ring-2 focus:ring-[#ff4500]/10 dark:bg-[#1a1d23]"
                                                            >
                                                                <optgroup label="Software development">
                                                                    <option>Software Engineer</option>
                                                                    <option>Frontend Developer</option>
                                                                    <option>Backend Developer</option>
                                                                    <option>Full-Stack Developer</option>
                                                                    <option>Java Developer</option>
                                                                    <option>Python Developer</option>
                                                                    <option>Mobile App Developer</option>
                                                                    <option>Game Developer</option>
                                                                    <option>Blockchain Developer</option>
                                                                </optgroup>

                                                                <optgroup label="AI and data">
                                                                    <option>AI Engineer</option>
                                                                    <option>Machine Learning Engineer</option>
                                                                    <option>Deep Learning Engineer</option>
                                                                    <option>Generative AI Engineer</option>
                                                                    <option>NLP Engineer</option>
                                                                    <option>Computer Vision Engineer</option>
                                                                    <option>Data Analyst</option>
                                                                    <option>Data Scientist</option>
                                                                    <option>Data Engineer</option>
                                                                </optgroup>

                                                                <optgroup label="Infrastructure and security">
                                                                    <option>Cybersecurity Analyst</option>
                                                                    <option>Security Engineer / Penetration Tester</option>
                                                                    <option>Cloud Engineer</option>
                                                                    <option>DevOps Engineer</option>
                                                                    <option>Site Reliability Engineer</option>
                                                                    <option>Network Engineer</option>
                                                                    <option>Database Engineer / DBA</option>
                                                                    <option>Embedded Systems Engineer</option>
                                                                </optgroup>

                                                                <optgroup label="Quality, design and product">
                                                                    <option>QA / Test Automation Engineer</option>
                                                                    <option>UI/UX Engineer</option>
                                                                    <option>Business Analyst</option>
                                                                    <option>Product Analyst</option>
                                                                    <option>Solutions Architect</option>
                                                                </optgroup>
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* Interview duration */}
                                                    <div>
                                                        <label
                                                            htmlFor="interview-duration"
                                                            className="mb-2 block text-sm font-bold"
                                                        >
                                                            Interview duration
                                                        </label>

                                                        <select
                                                            id="interview-duration"
                                                            value={durationMinutes}
                                                            onChange={(e) =>
                                                                setDurationMinutes(Number(e.target.value))
                                                            }
                                                            className="w-full neo-surface-sm rounded-xl border border-transparent bg-[#e0e5ec] px-3 py-3 text-sm outline-none focus:border-[#ff4500]/50 focus:ring-2 focus:ring-[#ff4500]/10 dark:bg-[#1a1d23]"
                                                        >
                                                            {(selectedRound === "hr"
                                                                ? [5, 10, 15]
                                                                : [5, 10, 15, 20, 30]
                                                            ).map((minutes) => (
                                                                <option key={minutes} value={minutes}>
                                                                    {minutes} minutes
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Start interview */}
                                            <button
                                                disabled={loading}
                                                onClick={() => void startInterview("round")}
                                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4500] px-5 py-4 font-bold text-white shadow-[4px_4px_8px_rgba(181,59,10,0.22),-3px_-3px_7px_rgba(255,255,255,0.18)] transition hover:-translate-y-0.5 hover:bg-[#ed4100] active:translate-y-0 disabled:opacity-60 dark:shadow-[4px_4px_10px_rgba(0,0,0,0.3),-3px_-3px_8px_rgba(255,255,255,0.025)]"
                                            >
                                                <Play size={18} fill="currentColor" />
                                                {loading
                                                    ? "Preparing your interview…"
                                                    : "Start selected round"}
                                                <ArrowRight size={17} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>




                    <div className="grid min-w-0 grid-cols-1 content-start gap-6">



                        <section className="neo-surface overflow-hidden rounded-[28px] p-6 sm:p-7"><div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-[#ff4500]/10 p-3 text-[#ff4500]"><Trophy size={22} /></div><div><h2 className="text-xl font-bold">Full mock interview</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Work through all five placement rounds.</p></div></div><div className="mb-5 grid grid-cols-5 gap-2">{ROUNDS.map((item, index) => <div key={item.id} className="text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04] text-sm font-bold dark:bg-white/[0.06]">{index + 1}</div><p className="mt-2 text-[10px] font-semibold leading-4 text-zinc-500">{["Aptitude", "Coding", "Technical", "Project", "HR"][index]}</p></div>)}</div><div className="neo-inset mb-5 grid gap-4 rounded-2xl p-4 sm:grid-cols-2"><div><label htmlFor="mock-job-role" className="mb-2 block text-sm font-bold">Job role (Round 3)</label><select id="mock-job-role" value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="w-full neo-surface-sm rounded-xl border border-transparent bg-[#e0e5ec] px-3 py-3 text-sm outline-none focus:border-[#ff4500]/50 focus:ring-2 focus:ring-[#ff4500]/10 dark:bg-[#1a1d23]"><option>Software Engineer</option><option>Frontend Developer</option><option>Backend Developer</option><option>Full-Stack Developer</option><option>Java Developer</option><option>Python Developer</option><option>AI Engineer</option><option>Machine Learning Engineer</option><option>Data Analyst</option><option>Data Scientist</option><option>Cybersecurity Analyst</option><option>Cloud Engineer</option><option>DevOps Engineer</option><option>QA / Test Automation Engineer</option><option>Business Analyst</option></select></div><div><label htmlFor="mock-duration" className="mb-2 block text-sm font-bold">Duration for voice rounds.</label><select id="mock-duration" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="w-full neo-surface-sm rounded-xl border border-transparent bg-[#e0e5ec] px-3 py-3 text-sm outline-none focus:border-[#ff4500]/50 focus:ring-2 focus:ring-[#ff4500]/10 dark:bg-[#1a1d23]">{[5, 10, 15].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes each</option>)}</select></div></div><button disabled={loading} onClick={() => void startInterview("mock")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4500] px-5 py-4 font-bold text-white transition hover:bg-[#ed4100] disabled:opacity-60"><Sparkles size={18} />{loading ? "Preparing your interview…" : "Start full mock interview"}</button></section>



                        <section className="neo-surface rounded-[28px] p-6"><h3 className="mb-4 font-bold">Feedback preference</h3><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setFeedbackMode("each")} className={`rounded-2xl p-4 text-left transition ${feedbackMode === "each" ? "neo-inset ring-1 ring-[#ff4500]/45" : "neo-button"}`}><p className="font-bold">After every answer</p><p className="mt-1 text-xs leading-5 text-zinc-500">Get a score and tips before the next question.</p></button><button onClick={() => setFeedbackMode("end")} className={`rounded-2xl p-4 text-left transition ${feedbackMode === "end" ? "neo-inset ring-1 ring-[#ff4500]/45" : "neo-button"}`}><p className="font-bold">At the end of each round</p><p className="mt-1 text-xs leading-5 text-zinc-500">Keep the interview flowing, then review the round.</p></button></div><p className="mt-4 text-xs leading-5 text-zinc-500"><AudioLines size={14} className="mr-1 inline" /> Online Assessment uses on-screen MCQs. Coding answers use a code editor. Other rounds use spoken questions and microphone answers.</p></section>



                    </div>



                </div>



            </> : <>



                <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><button onClick={reset} className="neo-button inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"><ArrowLeft size={16} /> Interview dashboard</button>{!completed && <button onClick={() => void finishEarly()} disabled={loading} className="rounded-xl px-4 py-3 text-sm font-semibold text-zinc-500 hover:text-[#ff4500]">Finish early</button>}</div>



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

                </section> : <div className={`grid w-full min-w-0 grid-cols-1 items-start gap-5 ${round?.id === "coding" ? "xl:grid-cols-[minmax(0,1fr)_280px]" : "lg:grid-cols-[minmax(0,1fr)_320px]"}`}>



                    <section className="neo-surface w-full min-w-0 rounded-[26px] p-4 sm:p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#ff4500]">{round?.title || "Interview round"}</p><p className="mt-1 text-xs text-zinc-500">{session.mode === "mock" ? `Round ${session.roundIndex + 1} of ${session.roundIds.length}` : "Individual round practice"}{session.voiceInterview?.enabled ? " · Adaptive voice conversation" : ` · Question ${session.questionIndex + 1} of ${round?.count || "—"}`}</p></div><div className="rounded-xl bg-black/[0.04] px-3 py-2 text-xs font-semibold dark:bg-white/[0.06]">{session.feedbackMode === "each" ? "Live feedback" : "Round-end feedback"}</div></div><div className="mb-6 h-2 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]"><div className="h-full rounded-full bg-[#ff4500] transition-all" style={{ width: `${roundProgress}%` }} /></div><div className={`mb-5 rounded-[20px] bg-black/[0.025] p-4 dark:bg-white/[0.025] sm:p-5 ${round?.id === "coding" ? "max-h-[min(58vh,620px)] overflow-y-auto" : ""}`}>{session.voiceInterview?.enabled && <div className={`mb-5 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${secondsLeft <= 30 ? "bg-red-500/10 text-red-700 dark:text-red-300" : "bg-[#ff4500]/[0.07] text-zinc-700 dark:text-zinc-200"}`}><div className="flex items-center gap-2"><AudioLines size={17} className="text-[#ff4500]" /><span className="text-sm font-bold">{timeExpired ? "Finishing current answer…" : "Voice interview"}</span></div><span className="font-mono text-lg font-extrabold">{Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:{(secondsLeft % 60).toString().padStart(2, "0")}</span></div>}<div className="mb-4 flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500"><CircleHelp size={16} /> {round?.id === "aptitude" ? (session.currentMcq?.category || "Multiple-choice question") : "Your question"}</span></div><RichQuestionText text={session.currentQuestion} className={round?.id === "coding" ? "text-[15px] font-medium leading-6 sm:text-base sm:leading-7" : "text-xl font-bold leading-8 sm:text-2xl"} /></div>{round?.id === "coding" && <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#ff4500]/10 px-3 py-1.5 font-bold text-[#ff4500]">{session.currentCodingQuestion?.id || "Coding question"}</span><span className="rounded-full bg-black/[0.05] px-3 py-1.5 font-semibold text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-300">{session.currentCodingQuestion?.category || "Coding"}</span><span className="rounded-full bg-black/[0.05] px-3 py-1.5 font-semibold text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-300">{session.currentCodingQuestion?.difficulty || "Practice"}</span></div><button type="button" disabled={explanationLoading || loading} onClick={() => void explainQuestion()} className="neo-surface-sm inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[#ff4500] transition hover:-translate-y-0.5 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.6)] disabled:cursor-not-allowed disabled:opacity-60"><CircleHelp size={16} />{explanationLoading ? "Explaining…" : "Explain Question"}</button></div>}{round?.id === "coding" && questionExplanation && <section className="neo-surface relative mb-5 overflow-hidden rounded-[24px] p-4 sm:p-6"><div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/80 dark:bg-white/[0.08]" /><div className="mb-5 flex flex-wrap items-start gap-3"><div className="neo-surface-sm flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[#ff4500]"><Sparkles size={19} /></div><div className="min-w-0 flex-1"><h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-lg">Understand the question</h3><p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">A simple explanation to help you think it through</p></div><span className="rounded-full bg-[#ff4500]/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#ff4500]">Hint only</span></div><div className="rounded-[18px] bg-black/[0.025] px-4 py-4 text-sm leading-7 text-zinc-700 shadow-[inset_3px_3px_7px_rgba(163,177,198,0.22),inset_-3px_-3px_7px_rgba(255,255,255,0.7)] dark:bg-white/[0.025] dark:text-zinc-200 dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.18),inset_-2px_-2px_7px_rgba(255,255,255,0.025)] sm:px-5 sm:py-5"><RichQuestionText text={questionExplanation} className="space-y-2" /></div><div className="neo-surface-sm mt-4 flex items-start gap-2 rounded-xl px-3 py-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400"><CircleHelp size={15} className="mt-0.5 shrink-0 text-[#ff4500]" /><p>Use these hints to understand the task. Your solution is still yours to discover.</p></div></section>}



                        {round?.id === "aptitude" ? <div className="mb-5 space-y-3">{(session.currentMcq?.options || []).map((option, index) => <button key={`${index}-${option}`} type="button" disabled={loading} onClick={() => setSelectedOption(index)} className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left transition duration-200 disabled:cursor-not-allowed ${selectedOption === index ? "neo-inset ring-2 ring-[#ff4500]/60" : "neo-button"}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${selectedOption === index ? "bg-[#ff4500] text-white" : "neo-inset text-zinc-600 dark:text-zinc-300"}`}>{String.fromCharCode(65 + index)}</span><span className="min-w-0 flex-1 pt-1 text-sm font-medium leading-6"><RichQuestionText text={option} /></span></button>)}</div> : round?.id === "coding" ? <div className="mb-5 space-y-3"><div className="overflow-hidden rounded-2xl border border-slate-700/20 bg-[#18212f] shadow-[inset_3px_3px_8px_rgba(0,0,0,0.22),inset_-2px_-2px_6px_rgba(255,255,255,0.03)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3"><label htmlFor="interview-answer" className="flex items-center gap-2 text-sm font-bold text-slate-100"><Code2 size={16} /> Your solution</label><div className="flex flex-wrap items-center gap-2"><label htmlFor="coding-language" className="text-xs font-semibold text-slate-300">Language</label><select id="coding-language" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} disabled={loading} className="rounded-xl border border-white/10 bg-[#202b3a] px-3 py-2 text-sm font-semibold text-slate-100 outline-none transition focus:border-[#ff4500]/70 focus:ring-2 focus:ring-[#ff4500]/20 disabled:opacity-60"><option value="C">C</option><option value="C++">C++</option><option value="C#">C#</option><option value="Java">Java</option><option value="Python">Python</option><option value="JavaScript">JavaScript</option><option value="TypeScript">TypeScript</option><option value="Go">Go</option><option value="Rust">Rust</option><option value="PHP">PHP</option><option value="Ruby">Ruby</option><option value="Kotlin">Kotlin</option><option value="Swift">Swift</option></select><span className="rounded-lg bg-white/[0.08] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">Code editor</span></div></div><div className="flex bg-[#111923]">

                            <div aria-hidden="true" className="select-none border-r border-white/[0.07] px-3 py-4 text-right font-mono text-sm leading-6 text-slate-600">{Array.from({ length: Math.max(14, answer.split("\n").length) }, (_, i) => <div key={i}>{i + 1}</div>)}</div>

                            <textarea id="interview-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => { const el = e.currentTarget; if (e.key === "Tab") { e.preventDefault(); const start = el.selectionStart; const end = el.selectionEnd; const next = answer.slice(0, start) + "  " + answer.slice(end); setAnswer(next); requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; }); } else if (e.key === "Enter") { const start = el.selectionStart; const before = answer.slice(0, start); const currentLine = before.split("\n").pop() || ""; const indent = currentLine.match(/^\s*/)?.[0] || ""; if (indent) { e.preventDefault(); const next = answer.slice(0, start) + "\n" + indent + answer.slice(el.selectionEnd); setAnswer(next); requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 1 + indent.length; }); } } }} rows={18} spellCheck={false} autoCapitalize="off" autoCorrect="off" placeholder={selectedLanguage === 'Python' ? '# Write your solution here…\n# You may include code and explain your approach.' : selectedLanguage === 'SQL' ? '-- Write your solution here…' : '// Write your solution here…\n// You may include code and explain your approach.'} className="min-h-[336px] min-w-0 flex-1 resize-y bg-transparent p-4 font-mono text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-[#ff4500]/60" />

                        </div></div><p className="text-xs leading-5 text-zinc-500">Choose your programming language, then write your solution.</p></div> : <div className="mb-5"><div className="rounded-2xl bg-black/[0.025] p-5 dark:bg-white/[0.03]"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Mic size={17} className="text-[#ff4500]" /> Your spoken answer</div><p className="min-h-16 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">{answer || (listening ? "Listening… speak clearly into your microphone." : "Tap Start speaking and answer naturally. You do not need to type.")}</p><div className="mt-4 flex flex-wrap gap-3">{session.voiceInterview?.enabled ? <span className="inline-flex items-center gap-2 rounded-xl bg-[#ff4500]/10 px-4 py-3 text-sm font-bold text-[#c83a00] dark:text-[#ff8a5c]"><Mic size={16} /> {speaking ? "AI speaking…" : listening ? "Listening automatically…" : loading ? "Thinking…" : timeExpired ? "Time is up — wrapping up" : "Hands-free mode enabled"}</span> : <><button disabled={!voiceAvailable || listening || loading} onClick={startRecording} className="inline-flex items-center gap-2 rounded-xl bg-[#ff4500] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Mic size={16} /> Start speaking</button><button disabled={!listening} onClick={stopRecording} className="neo-surface-sm inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"><MicOff size={16} /> Stop recording</button></>}</div>{!voiceAvailable && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">This browser does not support built-in speech recognition. Use the latest Chrome or Edge for microphone answers.</p>}</div></div>}



                        {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</p>}



                        {!session.voiceInterview?.enabled && <><button disabled={(round?.id === "aptitude" ? selectedOption === null : !answer.trim()) || loading || listening} onClick={() => void submitAnswer()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4500] px-5 py-4 font-bold text-white transition hover:bg-[#e83f00] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Reviewing your answer…" : "Submit answer & continue"}<ArrowRight size={17} /></button><p className="mt-3 text-center text-xs text-zinc-500">{round?.id === "aptitude" ? "Choose one option, then submit." : round?.id === "coding" ? "Submit your code and approach for AI review." : listening ? "Stop recording before submitting your answer." : "Your answers and feedback are available in this session."}</p></>}



                        {latestEvaluation && session.feedbackMode === "each" && <div className="neo-surface mt-6 rounded-[24px] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">Feedback on your answer</h3><span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-sm font-extrabold text-[#ff4500]">{round?.id === "aptitude" ? (latestEvaluation.score === 1 ? "Correct" : "Incorrect") : `${latestEvaluation.score}/100`}</span></div><div className="neo-surface-sm mt-4 rounded-2xl p-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300"><RichQuestionText text={latestEvaluation.feedback} /></div>{latestEvaluation.strengths.length > 0 && <div className="mt-4 rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.025]"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">What went well</p>{latestEvaluation.strengths.map((item, i) => <p key={i} className="mb-1 flex gap-2 text-sm"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />{item}</p>)}</div>}{latestEvaluation.improvements.length > 0 && <div className="mt-4 rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.025]"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#ff4500]">How to correct it</p>{latestEvaluation.improvements.map((item, i) => <p key={i} className="mb-1 text-sm leading-6">• {item}</p>)}</div>}{round?.id === "coding" && latestEvaluation.correctedCode?.trim() && <section className="neo-surface-sm mt-5 rounded-2xl p-4 sm:p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-extrabold text-zinc-900 dark:text-white">Corrected answer</h4><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">A complete example in {selectedLanguage}</p></div><button type="button" onClick={() => { void navigator.clipboard?.writeText(latestEvaluation.correctedCode || ""); }} className="neo-surface-sm rounded-xl px-3 py-2 text-xs font-bold text-[#ff4500]">Copy code</button></div><RichQuestionText text={`\`\`\`${selectedLanguage}\n${latestEvaluation.correctedCode.trim()}\n\`\`\``} /></section>}</div>}



                        {roundSummary && <div className="mt-5 rounded-2xl bg-[#ff4500]/[0.06] p-5"><h3 className="font-bold">Round summary</h3><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{roundSummary}</p></div>}



                    </section>



                    <aside className="w-full min-w-0 space-y-4 xl:sticky xl:top-5"><section className="neo-surface rounded-[26px] p-5"><h3 className="mb-4 font-bold">Interview progress</h3><div className="space-y-3">{ROUNDS.filter((item) => session.roundIds.includes(item.id)).map((item) => { const active = round?.id === item.id; const done = session.answers.filter((a) => a.round === item.id).length >= item.count; return <div key={item.id} className={`flex items-center gap-3 rounded-xl p-3 ${active ? "bg-[#ff4500]/10" : ""}`}><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${done ? "bg-emerald-500/10 text-emerald-600" : active ? "bg-[#ff4500] text-white" : "bg-black/[0.04] text-zinc-500 dark:bg-white/[0.05]"}`}>{done ? <CheckCircle2 size={17} /> : ROUNDS.findIndex((r) => r.id === item.id) + 1}</div><div className="min-w-0 flex-1"><p className={`text-sm font-semibold ${active ? "text-[#ff4500]" : ""}`}>{item.title}</p>{!(["technical", "project", "hr"].includes(item.id)) && <p className="mt-1 text-xs text-zinc-500">{session.answers.filter((a) => a.round === item.id).length}/{item.count} answered</p>}</div></div>; })}</div></section><section className="neo-surface rounded-[26px] p-5"><h3 className="mb-3 font-bold">Quick reminders</h3><ul className="space-y-3 text-sm leading-5 text-zinc-600 dark:text-zinc-300">{round?.id === "coding" ? <><li>• Break the problem into clear steps before coding.</li><li>• Consider empty inputs, duplicates, boundaries, and other edge cases.</li><li>• Prefer readable variable names and a complete solution.</li><li>• Include time and space complexity when relevant.</li></> : round?.id === "aptitude" ? <><li>• 5 questions each from four categories.</li><li>• Quantitative aptitude: percentages, ratios, time and work, profit and loss.</li><li>• Logical reasoning, verbal ability and technical fundamentals.</li><li>• Select one option; the score and explanation appear after submission.</li></> : <><li>• Think aloud and structure your response.</li><li>• For technical questions, explain the reason behind your answer.</li><li>• If you do not know something, explain what you do know.</li><li>• Speak clearly; you can replay the question any time.</li></>}</ul></section></aside>



                </div>}



            </>}



            {error && !session && <p role="alert" className="mt-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">{error}</p>}



        </div>



    </main>;



}