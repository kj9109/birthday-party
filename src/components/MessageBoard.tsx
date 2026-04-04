"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

export default function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) setMessages(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    const el = messagesEndRef.current;
    if (el?.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: text.trim() }),
      });
      if (res.ok) {
        setText("");
        fetchMessages();
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <section id="messages" className="py-24 px-6 bg-[#111]">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">
            Wishes &
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            Messages
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        <motion.div
          className="elegant-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Messages list */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <MessageCircle size={40} className="mb-3 text-gold-200" />
                <p className="font-sans text-sm">
                  Be the first to leave a message!
                </p>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-200 to-gold-300 flex items-center justify-center">
                        <span className="font-serif text-xs font-bold text-gold-800">
                          {msg.name[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="font-sans text-sm font-semibold text-white">
                        {msg.name}
                      </span>
                    </div>
                    <span className="font-sans text-xs text-neutral-400">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-neutral-600 leading-relaxed pl-10">
                    {msg.message}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-4"
          >
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="gold-input flex-shrink-0 w-36"
                required
              />
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a birthday wish..."
                className="gold-input flex-1"
                required
              />
              <button
                type="submit"
                disabled={loading || !name.trim() || !text.trim()}
                className="gold-button px-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
