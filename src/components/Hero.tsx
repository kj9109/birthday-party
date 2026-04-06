"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";
import Image from "next/image";
import { PARTY_CONFIG } from "@/lib/config";

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(`${targetDate}T15:00:00-04:00`).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function Hero() {
  const countdown = useCountdown(PARTY_CONFIG.date);

  const partyDate = new Date(PARTY_CONFIG.date + "T00:00:00");
  const formattedDate = partyDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 md:pt-0 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-50/40 rounded-full blur-3xl" />
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-gold-400/30 hidden md:block" />
      <div className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-gold-400/30 hidden md:block" />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-b-2 border-l-2 border-gold-400/30 hidden md:block" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-gold-400/30 hidden md:block" />

      <motion.div
        className="relative text-center max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Tagline */}
        <motion.div
          className="mb-4 inline-flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <Image src="/images/wine1.png" alt="" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-contain -scale-x-100" />
            <p className="font-script text-4xl md:text-5xl text-gold-600">
              {PARTY_CONFIG.tagline}
            </p>
            <Image src="/images/wine1.png" alt="" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
          </div>
          {/* Calligraphic swash underline */}
          <svg viewBox="0 0 200 12" className="w-48 md:w-64 mt-1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 8 C30 2, 50 2, 70 6 S110 10, 130 5 S170 1, 190 6"
              stroke="#722F37"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M30 10 C50 5, 80 4, 100 7 S140 11, 170 6"
              stroke="#722F37"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </motion.div>

        {/* Photo */}
        <motion.div
          className="mx-auto mb-6 w-52 h-52 md:w-80 md:h-80 lg:w-[340px] lg:h-[340px] rounded-full overflow-hidden border-4 border-gold-400/60 shadow-2xl shadow-neutral-900/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Image
            src="/daria.jpg"
            alt="Daria"
            width={340}
            height={340}
            className="w-full h-full object-cover object-top"
            priority
          />
        </motion.div>

        {/* Name */}
        <motion.h1
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-neutral-900 mb-2 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {PARTY_CONFIG.name}&apos;s
          <br />
          <span className="text-gold-gradient">Birthday</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="font-sans text-lg md:text-xl text-wine-600 tracking-widest uppercase mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {PARTY_CONFIG.subtitle}
        </motion.p>

        {/* Divider */}
        <motion.div
          className="section-divider-wine mb-16"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        />

        {/* Date & venue details */}
        <motion.div
          className="flex flex-col items-center text-center gap-3 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p className="font-sans text-base md:text-lg font-bold tracking-wide text-neutral-900">
            {formattedDate}
          </p>
          <p className="font-sans text-sm md:text-base font-semibold text-gold-600 tracking-wide">
            {PARTY_CONFIG.endTime}
          </p>

          <div className="flex items-center gap-2 my-1">
            <div className="w-6 h-[1px] bg-wine-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <div className="w-6 h-[1px] bg-wine-500" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gold-500 flex-shrink-0" />
              <p className="font-sans text-sm font-bold text-neutral-700 tracking-wide">
                Chimney Hill Estate Inn
              </p>
            </div>
            <p className="font-sans text-xs text-neutral-500 tracking-wide">
              207 Goat Hill Rd, Lambertville, NJ 08530
            </p>
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          className="grid grid-cols-4 gap-4 md:gap-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          {[
            { value: countdown.days, label: "Days" },
            { value: countdown.hours, label: "Hours" },
            { value: countdown.minutes, label: "Minutes" },
            { value: countdown.seconds, label: "Seconds" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="elegant-card p-3 md:p-5 mb-2">
                <span className="font-serif text-3xl md:text-4xl font-bold text-neutral-900">
                  {String(item.value).padStart(2, "0")}
                </span>
              </div>
              <span className="font-sans text-xs tracking-widest uppercase text-neutral-500">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#schedule"
        className="absolute bottom-8 text-gold-500 animate-float"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <ChevronDown size={28} />
      </motion.a>
    </section>
  );
}
