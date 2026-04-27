'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Mic, MicOff, Plus, Sparkles, ChevronRight,
  User, Loader2, Menu, X, Trash2, MessageSquare,
  Globe, Zap,
} from 'lucide-react';

/* ─── Types ─── */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/* ─── Suggestion prompts (multilingual demo) ─── */
const SUGGESTIONS = [
  { text: "Sun'iy intellekt kelajagi haqida gapir", lang: "🇺🇿 O'zbek" },
  { text: "Explain quantum computing simply", lang: "🇬🇧 English" },
  { text: "Напиши стихотворение о весне", lang: "🇷🇺 Русский" },
  { text: "اشرح لي كيف تعمل الشبكات العصبية", lang: "🇸🇦 العربية" },
];

/* ─── Simple markdown renderer ─── */
function renderContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

/* ─── Main Component ─── */
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  /* ─── Responsive sidebar ─── */
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ─── Auto-scroll ─── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ─── Auto-resize textarea ─── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  /* ─── Voice recognition ─── */
  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Brauzeringiz ovozli kirishni qo'llab-quvvatlamaydi. Chrome yoki Edge ishlating.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    // No lang = browser uses user's system language; model auto-detects
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (e: any) => {
      console.error('Speech error:', e.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  }, [isListening]);

  /* ─── Send message ─── */
  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const content = (overrideText ?? input).trim();
      if (!content || isLoading) return;

      const userId = `u-${Date.now()}`;
      const assistantId = `a-${Date.now() + 1}`;

      const userMsg: Message = {
        id: userId,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput('');
      setIsLoading(true);
      setStreamingId(assistantId);
      if (isMobile) setSidebarOpen(false);

      try {
        const apiMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const raw = decoder.decode(value);
          const lines = raw.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const { text } = JSON.parse(data);
              if (text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + text }
                      : m,
                  ),
                );
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err) {
        console.error('Chat error:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    '⚠️ Xatolik yuz berdi. Iltimos, GROQ_API_KEY ni tekshiring va qaytadan urinib ko\'ring.',
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        setStreamingId(null);
      }
    },
    [input, messages, isLoading, isMobile],
  );

  /* ─── Keyboard handler ─── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  const isEmpty = messages.length === 0;

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="relative flex h-screen bg-[#08090f] text-[#e2e4f0] overflow-hidden">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`
          fixed md:relative z-30 md:z-auto
          flex flex-col w-[260px] h-full
          bg-[#0a0b14] border-r border-white/[0.06]
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${!sidebarOpen && !isMobile ? 'md:w-0 md:border-0 md:overflow-hidden' : ''}
        `}
        style={{ minWidth: sidebarOpen || isMobile ? undefined : 0 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h1 className="font-syne font-bold text-[15px] gradient-text leading-none">
                ASENA AI
              </h1>
              <p className="text-[9px] text-[#3a3d55] mt-0.5 tracking-widest uppercase">
                Powered by Groq
              </p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-white/[0.06] text-[#6b7090] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* New Chat button */}
        <div className="px-3 pt-3 flex-shrink-0">
          <button
            onClick={clearChat}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.01] text-[12px] text-[#8b90b0] hover:bg-white/[0.05] hover:text-white hover:border-violet-500/30 transition-all duration-200 group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Yangi suhbat</span>
            <kbd className="ml-auto text-[9px] text-[#3a3d55] border border-white/[0.06] rounded px-1.5 py-0.5">
              Ctrl N
            </kbd>
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto px-3 mt-3">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#2e3050]">
            Suhbatlar
          </p>

          {messages.length > 0 ? (
            <button
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] text-[#8b90b0] hover:bg-white/[0.04] hover:text-white transition-all group"
              onClick={() => {}}
            >
              <MessageSquare size={13} className="flex-shrink-0 text-violet-500/60" />
              <span className="truncate text-left">
                {messages[0]?.content.slice(0, 28)}
                {messages[0]?.content.length > 28 ? '…' : ''}
              </span>
            </button>
          ) : (
            <div className="px-3 py-8 flex flex-col items-center gap-2">
              <MessageSquare size={28} className="text-[#1e2035]" />
              <p className="text-[11px] text-[#2e3050] text-center">
                Hali suhbat yo'q
              </p>
            </div>
          )}
        </div>

        {/* Model info */}
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Zap size={12} className="text-emerald-400" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#6b7090]">Llama 3.3 70B</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* User placeholder (Phase 2: Google Auth) */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-300">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#8b90b0] group-hover:text-white transition-colors truncate">
                Mehmon foydalanuvchi
              </p>
              <p className="text-[9px] text-[#2e3050]">
                Kirish uchun bosqich 2
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <main className="relative flex-1 flex flex-col min-w-0 z-10">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] bg-[#08090f]/80 backdrop-blur-md flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#6b7090] hover:text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={17} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] text-[#6b7090]">
              Groq · Llama 3.3 70B Versatile
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[#4a5070] border border-white/[0.05] rounded-full px-2.5 py-1">
              <Globe size={11} />
              <span>Har qanday til</span>
            </div>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Suhbatni tozalash"
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#4a5070] hover:text-red-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </header>

        {/* Messages container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          {isEmpty ? (
            /* ─── Empty State ─── */
            <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 animate-fade-up">
              {/* Logo */}
              <div className="relative mb-7 animate-float">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-2xl">
                  <Sparkles size={36} className="text-white" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 opacity-20 blur-lg animate-glow-pulse" />
              </div>

              <h2 className="font-syne font-extrabold text-3xl md:text-4xl text-center mb-3 gradient-text-shimmer">
                ASENA AI
              </h2>
              <p className="text-[#6b7090] text-center text-[13px] max-w-sm mb-2 leading-relaxed">
                Aqlli yordamchingiz. Har qanday tilda savol bering — men sizga yordam berishga tayyorman.
              </p>
              <div className="flex items-center gap-1.5 mb-10 text-[11px] text-[#4a5070]">
                <Zap size={11} className="text-violet-400" />
                <span>Ultra-fast Groq inference</span>
              </div>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text)}
                    className="suggestion-card flex flex-col gap-1.5 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.01] text-left group"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="text-[10px] text-[#4a5070] flex items-center gap-1">
                      {s.lang}
                    </span>
                    <span className="text-[12px] text-[#8b90b0] group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                      {s.text}
                    </span>
                    <ChevronRight
                      size={12}
                      className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity mt-auto self-end"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ─── Messages ─── */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 animate-fade-up ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ animationDelay: '0ms' }}
                >
                  {/* AI Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/10 mt-0.5">
                      <Sparkles size={14} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end max-w-[80%]' : 'items-start max-w-[85%] md:max-w-[75%]'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      /* User bubble */
                      <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-violet-600/25 to-violet-900/30 border border-violet-500/15 text-[14px] leading-relaxed text-white/90">
                        {msg.content}
                      </div>
                    ) : (
                      /* AI message */
                      <div className="text-[14px] leading-[1.85] text-[#c8cae0] message-content">
                        {msg.content ? (
                          <span dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                        ) : (
                          /* Loading dots */
                          <span className="inline-flex items-center gap-1 py-2">
                            {[0, 150, 300].map((delay) => (
                              <span
                                key={delay}
                                className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                                style={{ animationDelay: `${delay}ms` }}
                              />
                            ))}
                          </span>
                        )}
                        {/* Streaming cursor */}
                        {streamingId === msg.id && msg.content && (
                          <span className="inline-block w-[2px] h-4 bg-violet-400 ml-0.5 align-middle animate-cursor-blink" />
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-[9px] text-[#2e3050] mt-1.5 px-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#13141f] border border-white/[0.08] flex items-center justify-center mt-0.5">
                      <User size={14} className="text-[#6b7090]" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ─── Input Area ─── */}
        <div className="flex-shrink-0 px-4 pt-2 pb-4 bg-gradient-to-t from-[#08090f] via-[#08090f]/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            {/* Voice indicator */}
            {isListening && (
              <div className="flex items-center justify-center gap-2 mb-2 text-[12px] text-red-400 animate-pulse">
                <div className="flex gap-0.5">
                  {[1, 1.5, 2, 1.5, 1].map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 rounded-full bg-red-400 animate-bounce"
                      style={{
                        height: `${h * 10}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <span>Tinglanmoqda — gapiring...</span>
                <div className="flex gap-0.5">
                  {[1, 1.5, 2, 1.5, 1].map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 rounded-full bg-red-400 animate-bounce"
                      style={{
                        height: `${h * 10}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Input box */}
            <div
              className="input-wrapper flex items-end gap-2 px-4 py-3 bg-[#0f1019] rounded-2xl border border-white/[0.08] transition-all duration-200 shadow-2xl shadow-black/40"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? '🎙 Gapiring, tinglanmoqda...'
                    : "Xabar yozing... (Shift+Enter = yangi qator)"
                }
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-[14px] text-white placeholder-[#2e3050] resize-none outline-none max-h-[180px] leading-relaxed py-0.5 disabled:opacity-50"
              />

              <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
                {/* Voice button */}
                <button
                  onClick={toggleVoice}
                  title={isListening ? "To'xtatish (Esc)" : 'Ovozli kirish'}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isListening
                      ? 'bg-red-500/15 text-red-400 border border-red-500/25 animate-pulse'
                      : 'text-[#4a5070] hover:text-violet-400 hover:bg-violet-500/10'
                  }`}
                >
                  {isListening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>

                {/* Send button */}
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white disabled:opacity-25 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-[10px] text-[#1e2035] mt-2">
              ASENA AI · O'zbek · English · Русский · العربية · 中文 · Español · va boshqalar
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
