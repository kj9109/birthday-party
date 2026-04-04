"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Users,
  Camera,
  User,
  Check,
  Calendar,
  PartyPopper,
} from "lucide-react";
import Image from "next/image";
import { PARTY_CONFIG } from "@/lib/config";
import type { Guest } from "@/lib/types";
import { CALENDAR_LINKS, EVENT_LABELS } from "@/lib/types";

const statusConfig = {
  attending: {
    label: "Attending",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  maybe: {
    label: "Maybe",
    bg: "bg-neutral-100",
    border: "border-neutral-200",
    text: "text-neutral-600",
    dot: "bg-neutral-400",
  },
  declined: {
    label: "Declined",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    dot: "bg-rose-400",
  },
};

function Avatar({
  photoUrl,
  name,
  size = "sm",
  faded = false,
}: {
  photoUrl?: string;
  name: string;
  size?: "sm" | "md";
  faded?: boolean;
}) {
  const dim = size === "md" ? "w-16 h-16" : "w-9 h-9";
  const textSize = size === "md" ? "text-lg" : "text-xs";

  if (photoUrl) {
    return (
      <div
        className={`${dim} rounded-full overflow-hidden flex-shrink-0 ${faded ? "opacity-40" : ""}`}
      >
        <Image
          src={photoUrl}
          alt={name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center flex-shrink-0 ${
        faded
          ? "bg-neutral-100 opacity-40"
          : "bg-gradient-to-br from-gold-100 to-gold-200"
      }`}
    >
      {faded ? (
        <User size={size === "md" ? 24 : 14} className="text-neutral-400" />
      ) : (
        <span
          className={`font-serif ${textSize} font-bold text-gold-700`}
        >
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </span>
      )}
    </div>
  );
}

async function uploadToBlob(file: File): Promise<string | null> {
  try {
    const { upload } = await import("@vercel/blob/client");
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/blob-upload",
    });
    return blob.url;
  } catch {
    // Blob not configured, fall back to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

export default function Attendees() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"attending" | "maybe" | "declined">(
    "attending"
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [plusOneName, setPlusOneName] = useState("");
  const [comment, setComment] = useState("");
  const [events, setEvents] = useState({
    dinnerParty: true,
    stayingOver: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEvents, setSubmittedEvents] = useState(events);
  const [submittedStatus, setSubmittedStatus] = useState(status);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/guests");
      if (res.ok) setGuests(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 8000);
    return () => clearInterval(interval);
  }, [fetchGuests]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleEvent = (key: keyof typeof events) => {
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setStatus("attending");
    setPhotoFile(null);
    setPhotoPreview(null);
    setPlusOneName("");
    setComment("");
    setEvents({ dinnerParty: true, stayingOver: false });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      // Upload photo if selected
      let photoUrl: string | undefined;
      if (photoFile) {
        const url = await uploadToBlob(photoFile);
        if (url) photoUrl = url;
      }

      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          status,
          photoUrl,
          comment: comment.trim() || undefined,
          plusOneName: plusOneName.trim() || undefined,
          events,
        }),
      });

      if (res.ok) {
        setSubmittedEvents({ ...events });
        setSubmittedStatus(status);
        setSubmitted(true);
        resetForm();
        fetchGuests();
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  // Group guests
  const attending = guests.filter((g) => g.status === "attending");
  const maybe = guests.filter((g) => g.status === "maybe");
  const declined = guests.filter((g) => g.status === "declined");
  const rsvpedNames = new Set(guests.map((g) => g.name.toLowerCase()));
  const noRsvp = PARTY_CONFIG.invitedGuests.filter(
    (g) => !rsvpedNames.has(g.toLowerCase())
  );

  // Find parent guest name for plus-ones
  const guestById = new Map(guests.map((g) => [g.id, g]));

  const groups = [
    { key: "attending", items: attending, config: statusConfig.attending },
    { key: "maybe", items: maybe, config: statusConfig.maybe },
    { key: "declined", items: declined, config: statusConfig.declined },
  ].filter((g) => g.items.length > 0);

  return (
    <section id="guests" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">The Guest</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            List
          </h2>
          <div className="section-divider mt-6" />
          <p className="mt-4 font-sans text-sm text-neutral-500">
            <Users size={16} className="inline mr-1.5 text-gold-400" />
            <strong className="text-neutral-700">{attending.length}</strong>{" "}
            attending
            {maybe.length > 0 && ` · ${maybe.length} maybe`}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT: RSVP Form */}
          <motion.div
            className="elegant-card p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center py-6 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    {submittedStatus === "attending" ? (
                      <PartyPopper size={28} className="text-emerald-500" />
                    ) : submittedStatus === "maybe" ? (
                      <Check size={28} className="text-neutral-500" />
                    ) : (
                      <Check size={28} className="text-rose-400" />
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white mb-1">
                    {submittedStatus === "attending"
                      ? "You're on the list! 🎉"
                      : submittedStatus === "maybe"
                        ? "Got it, hope you can make it!"
                        : "We'll miss you!"}
                  </h3>
                  <p className="font-sans text-sm text-neutral-500 mb-6">
                    {submittedStatus === "attending"
                      ? "Check your email for a confirmation with all the details."
                      : submittedStatus === "maybe"
                        ? "We'll save a spot. Let us know when you decide!"
                        : "Maybe next time. We'll be thinking of you!"}
                  </p>

                  {/* Calendar links for checked events */}
                  {submittedStatus !== "declined" &&
                    Object.values(submittedEvents).some(Boolean) && (
                      <div className="w-full space-y-2 mb-6">
                        <p className="font-sans text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                          Add to your calendar
                        </p>
                        {submittedEvents.dinnerParty && (
                          <a
                            href={CALENDAR_LINKS.dinnerParty}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gold-200 hover:border-gold-400 transition-colors text-sm font-sans"
                          >
                            <Calendar
                              size={16}
                              className="text-gold-400"
                            />
                            <span>{EVENT_LABELS.dinnerParty}</span>
                          </a>
                        )}
                        {submittedEvents.stayingOver && (
                          <a
                            href={CALENDAR_LINKS.stayingOver}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gold-200 hover:border-gold-400 transition-colors text-sm font-sans"
                          >
                            <Calendar
                              size={16}
                              className="text-gold-400"
                            />
                            <span>{EVENT_LABELS.stayingOver}</span>
                          </a>
                        )}
                      </div>
                    )}

                  <button
                    onClick={() => setSubmitted(false)}
                    className="font-sans text-sm text-gold-500 hover:text-gold-600 underline underline-offset-2"
                  >
                    Submit another RSVP
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <UserPlus size={20} className="text-gold-400" />
                    <h3 className="font-serif text-xl font-bold text-white">
                      RSVP
                    </h3>
                  </div>

                  {/* Photo upload */}
                  <div className="flex flex-col items-center mb-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-full border-2 border-dashed border-gold-300 hover:border-gold-400 transition-colors flex items-center justify-center overflow-hidden group"
                    >
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gold-400 group-hover:text-gold-500 transition-colors">
                          <Camera size={20} />
                          <span className="text-[9px] font-sans mt-0.5">
                            Photo
                          </span>
                        </div>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>

                  {/* Name & Email */}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name *"
                    className="gold-input"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email *"
                    className="gold-input"
                    required
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="gold-input"
                  />

                  {/* RSVP status */}
                  <div className="flex gap-2">
                    {(["attending", "maybe", "declined"] as const).map(
                      (option) => {
                        const cfg = statusConfig[option];
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setStatus(option)}
                            className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-sans font-medium transition-all ${
                              status === option
                                ? `${cfg.border} ${cfg.bg} ${cfg.text}`
                                : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
                            }`}
                          >
                            {cfg.label}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Event checkboxes */}
                  {status !== "declined" && (
                    <div className="space-y-2">
                      <p className="font-sans text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        I&apos;ll be there for:
                      </p>
                      {(
                        [
                          "dinnerParty",
                          "stayingOver",
                        ] as const
                      ).map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={events[key]}
                            onChange={() => toggleEvent(key)}
                            className="gold-checkbox"
                          />
                          <span className="font-sans text-sm text-neutral-700 group-hover:text-white transition-colors">
                            {EVENT_LABELS[key]}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Plus-one */}
                  <input
                    type="text"
                    value={plusOneName}
                    onChange={(e) => setPlusOneName(e.target.value)}
                    placeholder="Bringing a +1? Their name (optional)"
                    className="gold-input"
                  />

                  {/* Comment */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any comments or requests? (dietary needs, questions, etc.)"
                    rows={2}
                    className="gold-input resize-none"
                  />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !name.trim() || !email.trim()}
                    className="gold-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit RSVP"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RIGHT: Guest List */}
          <motion.div
            className="elegant-card p-6 md:max-h-[700px] md:overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {groups.length === 0 && noRsvp.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <Users size={36} className="mb-3 text-gold-200" />
                <p className="font-sans text-sm">
                  No RSVPs yet. Be the first!
                </p>
              </div>
            )}

            {groups.map((group, gi) => (
              <div key={group.key} className={gi > 0 ? "mt-6" : ""}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${group.config.dot}`}
                  />
                  <span
                    className={`font-sans text-xs font-semibold uppercase tracking-wider ${group.config.text}`}
                  >
                    {group.config.label} ({group.items.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {group.items.map((guest) => {
                    const parentGuest = guest.plusOneOf
                      ? guestById.get(guest.plusOneOf)
                      : null;
                    return (
                      <div
                        key={guest.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${group.config.bg} ${group.config.border}`}
                      >
                        <Avatar
                          photoUrl={guest.photoUrl}
                          name={guest.name}
                        />
                        <div className="min-w-0">
                          <span
                            className={`font-sans text-sm font-medium ${group.config.text} block truncate`}
                          >
                            {guest.name}
                          </span>
                          {parentGuest && (
                            <span className="font-sans text-[11px] text-neutral-400">
                              +1 of {parentGuest.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {noRsvp.length > 0 && (
              <>
                <div
                  className={`my-6 h-[1px] bg-neutral-200 ${groups.length === 0 ? "hidden" : ""}`}
                />
                <div>
                  <span className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 block">
                    Awaiting RSVP ({noRsvp.length})
                  </span>
                  <div className="space-y-2">
                    {noRsvp.map((guestName) => (
                      <div
                        key={guestName}
                        className="flex items-center gap-3 px-3 py-2.5"
                      >
                        <Avatar name={guestName} faded />
                        <span className="font-sans text-sm text-neutral-400">
                          {guestName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
