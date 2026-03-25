"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { UserPlus, Users, Camera, User } from "lucide-react";
import Image from "next/image";
import { PARTY_CONFIG } from "@/lib/config";

interface Attendee {
  id: string;
  name: string;
  photo?: string;
  rsvp: "attending" | "maybe" | "declined";
  timestamp: string;
}

const statusConfig = {
  attending: { label: "Attending", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-400" },
  maybe: { label: "Maybe", bg: "bg-neutral-100", border: "border-neutral-200", text: "text-neutral-600", dot: "bg-neutral-400" },
  declined: { label: "Declined", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600", dot: "bg-rose-400" },
};

function Avatar({ photo, name, size = "sm", faded = false }: { photo?: string; name: string; size?: "sm" | "md"; faded?: boolean }) {
  const dim = size === "md" ? "w-16 h-16" : "w-9 h-9";
  const textSize = size === "md" ? "text-lg" : "text-xs";

  if (photo) {
    return (
      <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 ${faded ? "opacity-40" : ""}`}>
        <Image src={photo} alt={name} width={64} height={64} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${dim} rounded-full flex items-center justify-center flex-shrink-0 ${faded ? "bg-neutral-100 opacity-40" : "bg-gradient-to-br from-gold-100 to-gold-200"}`}>
      {faded ? (
        <User size={size === "md" ? 24 : 14} className="text-neutral-400" />
      ) : (
        <span className={`font-serif ${textSize} font-bold text-gold-700`}>
          {name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </span>
      )}
    </div>
  );
}

export default function Attendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [name, setName] = useState("");
  const [rsvp, setRsvp] = useState<"attending" | "maybe" | "declined">("attending");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttendees = useCallback(async () => {
    try {
      const res = await fetch("/api/attendees");
      if (res.ok) setAttendees(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchAttendees();
    const interval = setInterval(fetchAttendees, 8000);
    return () => clearInterval(interval);
  }, [fetchAttendees]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);

    // Read as data URL for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Check if guest with same name exists
      const existing = attendees.find(
        (a) => a.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (existing) {
        await fetch("/api/attendees", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existing.id,
            rsvp,
            photo: photoData || undefined,
          }),
        });
      } else {
        await fetch("/api/attendees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            rsvp,
            photo: photoData || undefined,
          }),
        });
      }

      setName("");
      setRsvp("attending");
      setPhotoPreview(null);
      setPhotoData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchAttendees();
    } catch { /* ignore */ }
    setLoading(false);
  };

  // Group attendees
  const attending = attendees.filter((a) => a.rsvp === "attending");
  const maybe = attendees.filter((a) => a.rsvp === "maybe");
  const declined = attendees.filter((a) => a.rsvp === "declined");
  const rsvpedNames = new Set(attendees.map((a) => a.name.toLowerCase()));
  const noRsvp = PARTY_CONFIG.invitedGuests.filter(
    (g) => !rsvpedNames.has(g.toLowerCase())
  );

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
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
            List
          </h2>
          <div className="section-divider mt-6" />
          <p className="mt-4 font-sans text-sm text-neutral-500">
            <Users size={16} className="inline mr-1.5 text-gold-400" />
            {attending.length} attending
            {maybe.length > 0 && ` · ${maybe.length} maybe`}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT — RSVP Form */}
          <motion.div
            className="elegant-card p-8"
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo upload */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-gold-300 hover:border-gold-400 transition-colors flex items-center justify-center overflow-hidden group"
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
                      <Camera size={24} />
                      <span className="text-[10px] font-sans mt-1">
                        Add photo
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
                <p className="font-sans text-xs text-neutral-400 mt-2">
                  Optional
                </p>
              </div>

              {/* Name */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="gold-input"
                required
              />

              {/* RSVP buttons */}
              <div className="flex gap-2">
                {(["attending", "maybe", "declined"] as const).map((option) => {
                  const cfg = statusConfig[option];
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRsvp(option)}
                      className={`flex-1 py-3 rounded-lg border-2 text-sm font-sans font-medium transition-all ${
                        rsvp === option
                          ? `${cfg.border} ${cfg.bg} ${cfg.text}`
                          : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="gold-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {success
                  ? "Added!"
                  : loading
                    ? "Saving..."
                    : "Submit RSVP"}
              </button>
            </form>
          </motion.div>

          {/* RIGHT — Guest List */}
          <motion.div
            className="elegant-card p-6 md:max-h-[600px] md:overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {groups.length === 0 && noRsvp.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <Users size={36} className="mb-3 text-gold-200" />
                <p className="font-sans text-sm">No RSVPs yet — be the first!</p>
              </div>
            )}

            {/* RSVP groups */}
            {groups.map((group, gi) => (
              <div key={group.key} className={gi > 0 ? "mt-6" : ""}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${group.config.dot}`} />
                  <span className={`font-sans text-xs font-semibold uppercase tracking-wider ${group.config.text}`}>
                    {group.config.label} ({group.items.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {group.items.map((guest) => (
                    <div
                      key={guest.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${group.config.bg} ${group.config.border}`}
                    >
                      <Avatar photo={guest.photo} name={guest.name} />
                      <span className={`font-sans text-sm font-medium ${group.config.text}`}>
                        {guest.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Awaiting RSVP */}
            {noRsvp.length > 0 && (
              <>
                <div className={`my-6 h-[1px] bg-neutral-200 ${groups.length === 0 ? "hidden" : ""}`} />
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
