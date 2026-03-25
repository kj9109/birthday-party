"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Send, CheckCircle } from "lucide-react";

export default function PrivateQuestions() {
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          name: name.trim() || undefined,
        }),
      });
      if (res.ok) {
        setQuestion("");
        setName("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <section id="questions" className="py-24 px-6">
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">
            Have a
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
            Question?
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        <motion.div
          className="elegant-card p-8 relative corner-decoration"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Lock size={18} className="text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-neutral-900">
              Private Submission
            </h3>
          </div>
          <p className="font-sans text-sm text-neutral-500 mb-6">
            Your question will be sent privately to the host. Include your name
            if you&apos;d like, or submit anonymously.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="flex flex-col items-center py-8 text-emerald-500"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <CheckCircle size={48} className="mb-3" />
                <p className="font-sans font-semibold">
                  Question submitted!
                </p>
                <p className="font-sans text-sm text-neutral-400 mt-1">
                  The host will see your question privately.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="gold-input"
                />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  rows={4}
                  className="gold-input resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="gold-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  {loading ? "Submitting..." : "Submit Privately"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
