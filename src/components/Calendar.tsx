"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { PARTY_CONFIG } from "@/lib/config";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const partyDate = new Date(PARTY_CONFIG.date + "T00:00:00");
  const [currentMonth, setCurrentMonth] = useState(partyDate.getMonth());
  const [currentYear, setCurrentYear] = useState(partyDate.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isPartyDay = (day: number) =>
    day === partyDate.getDate() &&
    currentMonth === partyDate.getMonth() &&
    currentYear === partyDate.getFullYear();

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <section id="calendar" className="py-24 px-6 bg-white">
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">
            Save the
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
            Date
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
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevMonth}
              className="p-2 text-neutral-400 hover:text-gold-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 text-neutral-400 hover:text-gold-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center font-sans text-xs font-semibold text-neutral-400 tracking-wider uppercase py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const party = isPartyDay(day);
              const today = isToday(day);

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-full text-sm font-sans transition-all ${
                    party
                      ? "bg-gradient-to-br from-gold-400 to-gold-500 text-white font-bold shadow-lg shadow-gold-200/50 scale-110"
                      : today
                        ? "border-2 border-gold-300 text-gold-600 font-semibold"
                        : "text-neutral-600 hover:bg-gold-50"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gold-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gold-400 to-gold-500" />
              <span className="font-sans text-xs text-neutral-500">
                Party Day
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-gold-300" />
              <span className="font-sans text-xs text-neutral-500">Today</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
