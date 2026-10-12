"use client";

import * as React from "react";
import {
  Brain,
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Code,
  GraduationCap,
  HelpCircle,
  FileText,
  Zap,
  MessageSquare,
  ChevronDown,
  Info,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

export interface Session {
  id: string;
  title: string;
  subject: string;
  tutorMode: string;
  messages: Message[];
  createdAt?: string;
}

const SUBJECTS = [
  { id: "Computer Science", name: "Computer Science", icon: Code, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  { id: "Mathematics", name: "Mathematics", icon: GraduationCap, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
  { id: "Physics & Science", name: "Physics & Science", icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { id: "General Learning", name: "General Learning", icon: BookOpen, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  { id: "Literature & History", name: "Literature & History", icon: FileText, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
];

const TUTOR_MODES = [
  {
    id: "socratic",
    name: "Socratic Tutor",
    description: "Guides step-by-step with hints & questions without blurting out the answer.",
    icon: HelpCircle,
    badge: "Recommended",
  },
  {
    id: "explainer",
    name: "Concept Explainer",
    description: "Breaks complex ideas into simple real-world analogies and key points.",
    icon: Lightbulb,
  },
  {
    id: "coder",
    name: "Code Mentor",
    description: "Senior dev assistant that debugs, explains algorithms & Big-O complexity.",
    icon: Code,
  },
  {
    id: "exam_prep",
    name: "Exam Prep & Quizzes",
    description: "Generates multiple choice questions, mock tests and scoring rubrics.",
    icon: GraduationCap,
  },
  {
    id: "summarizer",
    name: "Study Summarizer",
    description: "Converts notes and topics into bullet points and active recall sheets.",
    icon: FileText,
  },
];

const PROMPT_SUGGESTIONS: Record<string, string[]> = {
  socratic: [
    "How does calculus integration relate to real-world area calculation?",
    "Why is gravity weaker than electromagnetism?",
    "Can you help me solve a multi-step physics friction problem?",
  ],
  explainer: [
    "Explain how Transformer architecture works in AI in plain English.",
    "What is the difference between TCP and UDP networking?",
    "Explain the concept of entropy in thermodynamics with an analogy.",
  ],
  coder: [
    "Write a TypeScript binary search tree with deletion & level-order traversal.",
    "Debug my recursive Fibonacci function in Python that is timing out.",
    "Explain how Big-O time and space complexity works for QuickSort.",
  ],
  exam_prep: [
    "Give me a 3-question quiz on Data Structures & Algorithms with answers.",
    "What are the top 5 most tested concepts in SAT Math?",
    "Generate practice flashcards for AP Computer Science A.",
  ],
  summarizer: [
    "Summarize the key events and impact of the Industrial Revolution.",
    "Summarize the 3 laws of Newton's motion with formula cheat sheets.",
    "Create a 1-page summary of Object Oriented Programming principles.",
  ],
};

interface AiTutorContainerProps {
  userRole?: string;
  userName?: string;
}

export function AiTutorContainer({ userRole: _userRole = "STUDENT", userName = "Learner" }: AiTutorContainerProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState("Computer Science");
  const [selectedMode, setSelectedMode] = React.useState("socratic");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Load user sessions on mount
  React.useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/ai-tutor/sessions");
        if (res.ok) {
          const data = await res.json();
          if (data.sessions && data.sessions.length > 0) {
            setSessions(data.sessions);
            setActiveSessionId(data.sessions[0].id);
            setMessages(data.sessions[0].messages || []);
            setSelectedSubject(data.sessions[0].subject || "Computer Science");
            setSelectedMode(data.sessions[0].tutorMode || "socratic");
          }
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
      }
    }
    loadSessions();
  }, []);

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: Session = {
      id: newId,
      title: "New Study Session",
      subject: selectedSubject,
      tutorMode: selectedMode,
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages([]);
    toast.success("Created new AI Tutor session!");
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai-tutor/sessions?id=${id}`, { method: "DELETE" });
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      if (activeSessionId === id) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id);
          setMessages(updated[0].messages || []);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
      toast.info("Session deleted");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSession = (s: Session) => {
    setActiveSessionId(s.id);
    setMessages(s.messages || []);
    setSelectedSubject(s.subject || "Computer Science");
    setSelectedMode(s.tutorMode || "socratic");
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage || input).trim();
    if (!textToSend || isGenerating) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const userMessage: Message = {
      id: `user-${now}`,
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsGenerating(true);

    // Create assistant placeholder message
    const assistantMessageId = `assistant-${now + 1}`;
    const placeholderAssistantMsg: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, placeholderAssistantMsg]);

    try {
      const response = await fetch("/api/ai-tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          subject: selectedSubject,
          tutorMode: selectedMode,
          sessionId: activeSessionId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to reach AI Tutor service");
      }

      const returnedSessionId = response.headers.get("X-Session-Id");
      if (returnedSessionId && returnedSessionId !== activeSessionId) {
        setActiveSessionId(returnedSessionId);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentStreamedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        currentStreamedText = currentStreamedText + chunk;
        const nextContent = currentStreamedText;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: nextContent } : m
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with AI Tutor. Please try again.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: "⚠️ I encountered a temporary connection issue. Please resend your prompt or try another mode!",
              }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentModeInfo = TUTOR_MODES.find((m) => m.id === selectedMode) || TUTOR_MODES[0];
  const currentSubjectInfo = SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] bg-[#0B0F17] text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* LEFT SIDEBAR: History & Mode Controls */}
      <div className="w-full lg:w-80 bg-[#0F172A]/90 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col shrink-0">
        {/* Tutor Header & New Session */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Brain className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                24/7 AI Tutor
                <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-1 py-0 font-mono">
                  Online
                </Badge>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Smart Subject Assistant</p>
            </div>
          </div>

          <Button
            onClick={handleNewSession}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 gap-1 rounded-xl h-8 px-2.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </Button>
        </div>

        {/* Configuration Selectors */}
        <div className="p-4 space-y-3.5 border-b border-slate-800/80 bg-slate-900/40">
          {/* Subject Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Target Subject
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 text-slate-200 text-xs h-9 rounded-xl font-medium"
                >
                  <div className="flex items-center gap-2 truncate">
                    <currentSubjectInfo.icon className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{currentSubjectInfo.name}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Select Academic Field
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                {SUBJECTS.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <DropdownMenuItem
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub.id)}
                      className={cn(
                        "flex items-center gap-2.5 cursor-pointer py-2 text-xs font-medium rounded-lg",
                        selectedSubject === sub.id ? "bg-indigo-600/20 text-indigo-300 font-bold" : "hover:bg-slate-800"
                      )}
                    >
                      <SubIcon className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>{sub.name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tutor Persona / Mode Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Pedagogical Persona
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 text-slate-200 text-xs h-9 rounded-xl font-medium"
                >
                  <div className="flex items-center gap-2 truncate">
                    <currentModeInfo.icon className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="truncate">{currentModeInfo.name}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Choose Teaching Style
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                {TUTOR_MODES.map((mode) => {
                  const ModeIcon = mode.icon;
                  return (
                    <DropdownMenuItem
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 cursor-pointer py-2.5 px-3 text-xs rounded-lg",
                        selectedMode === mode.id ? "bg-purple-600/20 text-purple-200" : "hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between w-full font-semibold">
                        <div className="flex items-center gap-2">
                          <ModeIcon className="h-4 w-4 text-purple-400 shrink-0" />
                          <span>{mode.name}</span>
                        </div>
                        {mode.badge && (
                          <Badge variant="secondary" className="text-[9px] bg-indigo-500/20 text-indigo-300 py-0 px-1 border-0">
                            {mode.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight pl-6">{mode.description}</p>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Session History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Recent Conversations</span>
            <span className="text-slate-400">{sessions.length}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-medium text-slate-400">No active history</p>
              <p className="text-[11px] text-slate-400 mt-1">Start a conversation to store your tutor sessions!</p>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = activeSessionId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSession(s)}
                  className={cn(
                    "group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all duration-150 border",
                    isActive
                      ? "bg-slate-800/90 text-white border-indigo-500/40 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Brain className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-400" : "text-slate-400")} />
                    <div className="truncate">
                      <p className="font-medium truncate text-slate-200">{s.title || "Untitled Session"}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.subject}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    className="h-6 w-6 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Persona Active Status Card */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <currentModeInfo.icon className="h-4 w-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-200 block truncate">
                Active: {currentModeInfo.name}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Context: {selectedSubject}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA: Chat Messages & Input */}
      <div className="flex-1 flex flex-col bg-[#0B0F17] relative min-w-0">
        {/* Top Header Bar */}
        <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between bg-[#0F172A]/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                <span>{selectedSubject} Study Workspace</span>
                <Badge variant="outline" className={cn("text-[10px] border px-2 py-0.5 rounded-full font-semibold", currentSubjectInfo.color)}>
                  {selectedSubject}
                </Badge>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                Persona: <span className="text-purple-300 font-semibold">{currentModeInfo.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMessages([]);
                      toast.info("Cleared conversation view");
                    }}
                    className="h-8 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    <span>Clear</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-900 border-slate-700 text-xs">
                  Reset view messages
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-10 px-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 mx-auto mb-5 shadow-xl shadow-indigo-500/20 animate-bounce-slow">
                <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Brain className="h-8 w-8 text-indigo-400" />
                </div>
              </div>

              <h2 className="text-xl font-extrabold text-white tracking-tight mb-2">
                How can I guide your learning today, {userName}?
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                I am your 24/7 AI Tutor. Select your persona and subject, or pick one of the instant starter prompts below!
              </p>

              {/* Starter Prompt Chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {(PROMPT_SUGGESTIONS[selectedMode] || PROMPT_SUGGESTIONS.socratic).map((prompt, idx) => (
                  <Card
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3.5 bg-slate-900/60 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all duration-200 group rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium group-hover:text-white leading-snug">
                        {prompt}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 md:gap-4 max-w-3xl mx-auto transition-all",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md",
                      isUser
                        ? "bg-gradient-to-tr from-indigo-600 to-blue-600"
                        : "bg-gradient-to-tr from-purple-600 to-pink-600"
                    )}
                  >
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={cn("flex flex-col min-w-0 max-w-[85%]", isUser ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {isUser ? userName : `AI Tutor (${currentModeInfo.name})`}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "p-4 rounded-2xl text-xs md:text-sm leading-relaxed relative group shadow-lg font-sans",
                        isUser
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                      )}
                    >
                      {msg.content ? (
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      ) : (
                        <div className="flex items-center gap-1.5 py-1 px-2 text-indigo-400">
                          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                          <span className="text-xs font-mono animate-pulse">Thinking & Synthesizing...</span>
                        </div>
                      )}

                      {/* Copy Action Button */}
                      {!isUser && msg.content && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Form */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A]/80 backdrop-blur-md shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-3xl mx-auto relative flex items-center"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask your AI Tutor about ${selectedSubject}... (Shift+Enter for new line)`}
              rows={1}
              disabled={isGenerating}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl py-3.5 pl-4 pr-14 text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[50px] max-h-[140px] shadow-inner font-medium"
            />

            <Button
              type="submit"
              disabled={!input.trim() || isGenerating}
              size="icon"
              className={cn(
                "absolute right-2.5 bottom-2.5 h-8 w-8 rounded-xl transition-all shadow-md",
                input.trim() && !isGenerating
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                  : "bg-slate-800 text-slate-500 border-0 cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="max-w-3xl mx-auto flex items-center justify-between mt-2 px-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3 text-indigo-400" />
              AI Tutor provides interactive study guidance. Verify critical formulas.
            </span>
            <span className="font-mono">OpenAI & Custom Pedagogical Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
