"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Upload,
  Heart,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import type { VideoWish as VideoWishType } from "@/lib/types";

const BLOB_AVAILABLE = true; // Will gracefully fail if not configured

async function uploadVideoToBlob(file: File): Promise<string | null> {
  try {
    const { upload } = await import("@vercel/blob/client");
    const blob = await upload(`birthday-videos/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/blob-upload",
    });
    return blob.url;
  } catch {
    return null;
  }
}

export default function VideoWish() {
  const [name, setName] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [wishes, setWishes] = useState<VideoWishType[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWishes = useCallback(async () => {
    try {
      const res = await fetch("/api/upload-video");
      if (res.ok) setWishes(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const MAX_SIZE_MB = 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) {
      setVideoFile(null);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please keep it under ${MAX_SIZE_MB}MB. Try recording at 720p or trimming the clip.`
      );
      setVideoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setVideoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !videoFile) return;

    setLoading(true);
    setError("");

    try {
      // Upload video to Vercel Blob
      const videoUrl = await uploadVideoToBlob(videoFile);

      if (!videoUrl) {
        setError(
          "Video storage is not configured yet. Please email your video to kj9109@gmail.com with the subject line '[BIRTHDAY VIDEO]'."
        );
        setLoading(false);
        return;
      }

      // Save record
      const res = await fetch("/api/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name.trim(),
          videoUrl,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setName("");
        setVideoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchWishes();
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError(
        "Something went wrong. Please try emailing your video to kj9109@gmail.com instead."
      );
    }
    setLoading(false);
  };

  return (
    <section
      id="video"
      className="py-24 px-6 bg-gradient-to-b from-[#0A0A0A] via-wine-900/20 to-[#0A0A0A]"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">Send a</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            Birthday Wish
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        <motion.div
          className="elegant-card p-8 md:p-10 relative border-gold-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Prompt */}
          <div className="flex items-start gap-3 mb-8">
            <Heart
              size={22}
              className="text-gold-400 mt-0.5 flex-shrink-0"
              fill="currentColor"
            />
            <div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                Record a video for Daria
              </h3>
              <p className="font-sans text-sm text-neutral-600 leading-relaxed">
                Record a short video (15–60 seconds) of yourself wishing Daria
                a happy birthday, and telling her why she is special to you:
                what impact she&apos;s had on your life.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="flex flex-col items-center py-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <CheckCircle size={56} className="text-emerald-500 mb-4" />
                <p className="font-serif text-xl font-bold text-white mb-1">
                  Thank you!
                </p>
                <p className="font-sans text-sm text-neutral-500 text-center mb-6">
                  Your video message has been saved. Daria will love it.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-sans text-sm text-gold-500 hover:text-gold-600 underline underline-offset-2"
                >
                  Submit another video
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="gold-input"
                  required
                />

                {/* File upload area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gold-300 hover:border-gold-400 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {videoFile ? (
                    <div className="flex flex-col items-center">
                      <Video size={32} className="text-gold-400 mb-2" />
                      <p className="font-sans text-sm font-semibold text-neutral-800">
                        {videoFile.name}
                      </p>
                      <p className="font-sans text-xs text-neutral-400 mt-1">
                        {(videoFile.size / 1024 / 1024).toFixed(1)} MB,
                        Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gold-400 group-hover:text-gold-500 transition-colors">
                      <Upload size={32} className="mb-2" />
                      <p className="font-sans text-sm font-medium text-neutral-700">
                        Click to upload your video
                      </p>
                      <p className="font-sans text-xs text-neutral-400 mt-1">
                        MP4, MOV, or WebM · Under {MAX_SIZE_MB}MB
                      </p>
                      <p className="font-sans text-xs text-neutral-400 mt-0.5">
                        Tip: Record on your phone at 720p for best results
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-rose-500 bg-rose-50 rounded-lg p-3">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <p className="font-sans text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !name.trim() || !videoFile}
                  className="gold-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video size={16} />
                  {loading ? "Uploading..." : "Send Video Wish"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Who has submitted */}
        {wishes.length > 0 && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-sans text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Video wishes received ({wishes.length})
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {wishes.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-50 border border-gold-200"
                >
                  <User size={12} className="text-gold-500" />
                  <span className="font-sans text-xs font-medium text-gold-700">
                    {w.guestName}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
