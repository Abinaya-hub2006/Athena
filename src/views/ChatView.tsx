import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Trash2,
  Bookmark,
  CheckCircle2,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../lib/api';

interface Props {
  onRefreshSecondBrain: () => void;
}

export const ChatView: React.FC<Props> = ({ onRefreshSecondBrain }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);

  const promptSuggestions = [
    'Plan my evening — I only have 2 hours',
    'Remember that I am weak in DP state reduction',
    'I have an OS assignment due Friday',
    'I studied DBMS B+ Trees for 60 mins today',
    'What are my top priorities this week?'
  ];

  useEffect(() => {
    loadChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadChat = async () => {
    try {
      const history = await api.getChatHistory();
      if (history && history.length > 0) {
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || loading) return;

    setInput('');
    // Optimistic user message
    const userMsg: ChatMessage = {
      id: 'local-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.sendChatMessage(textToSend);
      if (response && response.message) {
        setMessages((prev) => [...prev, response.message]);
        if (response.toolInvocations && response.toolInvocations.length > 0) {
          // Second brain was updated (task added, memory stored, etc.)
          onRefreshSecondBrain();
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'athena',
        text: "I'm having trouble connecting right now, but your request is noted locally.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear conversation history? (Your memories and tasks remain safe)')) {
      await api.clearChatHistory();
      setMessages([]);
    }
  };

  // Speech Recognition
  const toggleSpeech = () => {
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };

    const SpeechRec = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser environment. Please use keyboard input.');
      return;
    }

    if (isListening && recognitionRef.current) {
      (recognitionRef.current as SpeechRecognitionInstance).stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in">
      {/* Top action header */}
      <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">Athena Reasoning Engine</span>
        </div>
        <button
          onClick={handleClearHistory}
          className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition-colors"
          title="Clear chat history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-600/20 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">How can Athena assist your second brain?</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Tell me what to remember, report what you studied, mention upcoming deadlines, or ask for a personalized study plan.
            </p>

            {/* Quick Prompt Chips */}
            <div className="mt-6 flex flex-col gap-2 max-w-sm mx-auto text-left">
              {promptSuggestions.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white text-xs text-left transition-all active:scale-98 flex items-center justify-between"
                >
                  <span className="truncate">{prompt}</span>
                  <span className="text-sky-400 text-xs ml-2">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {/* Message text with line breaks */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Tool Execution Tags (Real Second Brain Operations) */}
              {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                  {msg.toolInvocations.map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-950/80 border border-sky-500/20 text-[11px] text-sky-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold capitalize">{tool.name.replace(/_/g, ' ')}: </span>
                        <span className="text-slate-300">{tool.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 w-fit">
            <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
            <span>Athena is reasoning over your second brain...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-950 shrink-0 pb-safe">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeech}
            className={`p-2.5 rounded-xl border transition-all shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
            title={isListening ? 'Stop listening' : 'Voice dictation'}
            aria-label="Voice input"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening to your voice...' : 'Talk to Athena or ask to remember...'}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 active:scale-95 transition-all shadow-md shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// Simple web speech typing helpers
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionEvent {
  results: Array<Array<{ transcript: string }>>;
}
