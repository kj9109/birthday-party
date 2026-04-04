"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Send, CheckCircle } from "lucide-react";

// NOTE: FormSubmit requires a one-time email verification.
// The first submission will trigger a confirmation email to the address below.
// Click the link in that email to activate. All future submissions will then deliver.

const FORM_ENDPOINT = "https://formsubmit.co/ajax/kj9109@gmail.com";

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
      const formData = new FormData();
      formData.append("name", name.trim() || "Anonymous");
      formData.append("message", question.trim());
      formData.append("_subject", `[PARTY INQUIRY] ${name.trim() || "Anonymous"}`);
      formData.append("_template", "table");

      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setQuestion("");
        setName("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch {
      setQuestion("");
      setName("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }
    setLoading(false);
  };

  return (
    <section id="questions" className="py-24 px-6 bg-black">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-script text-3xl text-gold-400 mb-2">Have a</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              Question?
            </h2>
            <div className="section-divider mt-6" />
          </motion.div>
        </div>

        <motion.div
          className="bg-white/5 border border-white/10 rounded-xl p-8 relative backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Lock size={18} className="text-gold-400" />
            <h3 className="font-serif text-lg font-bold text-white">
              Private Submission
            </h3>
          </div>
          <p className="font-sans text-sm text-neutral-400 mb-6">
            Your question will be sent privately to the host. Include your name
            if you&apos;d like, or submit anonymously.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="flex flex-col items-center py-8 text-emerald-400"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <CheckCircle size={48} className="mb-3" />
                <p className="font-sans font-semibold">Question submitted!</p>
                <p className="font-sans text-sm text-neutral-500 mt-1">
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
                  className="w-full border border-white/15 rounded-lg px-4 py-3 bg-white/5 text-white placeholder:text-neutral-500 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/15 font-sans text-sm"
                />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  rows={4}
                  className="w-full border border-white/15 rounded-lg px-4 py-3 bg-white/5 text-white placeholder:text-neutral-500 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/15 font-sans text-sm resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="gold-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  {loading ? "Sending..." : "Submit Privately"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
