"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Users, Check, X, HelpCircle } from "lucide-react";

interface Attendee {
  id: string;
  name: string;
  email?: string;
  rsvp: "attending" | "maybe" | "declined";
  timestamp: string;
}

const rsvpConfig = {
  attending: { icon: Check, color: "text-emerald-500", bg: "bg-emerald-50", label: "Attending" },
  maybe: { icon: HelpCircle, color: "text-amber-500", bg: "bg-amber-50", label: "Maybe" },
  declined: { icon: X, color: "text-red-400", bg: "bg-red-50", label: "Declined" },
};

export default function Attendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rsvp, setRsvp] = useState<"attending" | "maybe" | "declined">("attending");
  const [loading, setLoading] = useState(false);

  const fetchAttendees = useCallback(async () => {
    try {
      const res = await fetch("/api/attendees");
      if (res.ok) setAttendees(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchAttendees();
    const interval = setInterval(fetchAttendees, 10000);
    return () => clearInterval(interval);
  }, [fetchAttendees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, rsvp }),
      });
      if (res.ok) {
        setName("");
        setEmail("");
        setRsvp("attending");
        fetchAttendees();
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const attendingCount = attendees.filter((a) => a.rsvp === "attending").length;
  const maybeCount = attendees.filter((a) => a.rsvp === "maybe").length;

  return (
    <section id="guests" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">
            The Guest
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
            List
          </h2>
          <div className="section-divider mt-6" />
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-neutral-500">
              <Users size={18} className="text-gold-400" />
              <span className="font-sans text-sm">
                {attendingCount} attending
                {maybeCount > 0 && ` · ${maybeCount} maybe`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Attendee grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence>
            {attendees.map((attendee) => {
              const config = rsvpConfig[attendee.rsvp];
              const Icon = config.icon;
              return (
                <motion.div
                  key={attendee.id}
                  className="elegant-card p-4 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                    <span className="font-serif text-lg font-bold text-gold-700">
                      {getInitials(attendee.name)}
                    </span>
                  </div>
                  <p className="font-sans text-sm font-semibold text-neutral-800 mb-1">
                    {attendee.name}
                  </p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}>
                    <Icon size={12} />
                    {config.label}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* RSVP Form */}
        <motion.div
          className="elegant-card p-8 max-w-lg mx-auto relative corner-decoration"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <UserPlus size={20} className="text-gold-400" />
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              RSVP
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="gold-input"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              className="gold-input"
            />

            <div className="flex gap-2">
              {(["attending", "maybe", "declined"] as const).map((option) => {
                const config = rsvpConfig[option];
                const Icon = config.icon;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRsvp(option)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-sans font-medium transition-all ${
                      rsvp === option
                        ? "border-gold-400 bg-gold-50 text-gold-700"
                        : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
                    }`}
                  >
                    <Icon size={16} />
                    {config.label}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="gold-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add to Guest List"}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
