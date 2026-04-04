"use client";

import { motion } from "framer-motion";
import { PARTY_CONFIG } from "@/lib/config";

export default function Itinerary() {
  return (
    <section id="schedule" className="py-24 px-6 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">
            The Weekend
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            Itinerary
          </h2>
          <div className="section-divider-wine mt-6" />
        </motion.div>

        {/* Weekend timeline */}
        <div className="space-y-12">
          {PARTY_CONFIG.itinerary.map((dayGroup, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: dayIndex * 0.15 }}
            >
              {/* Day header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wine-600 to-wine-700 flex items-center justify-center text-white font-serif font-bold text-sm shadow-md shadow-wine-900/40">
                  {dayIndex + 1}
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {dayGroup.day}
                  </h3>
                  <p className="font-sans text-sm text-gold-400/80 tracking-wide">
                    {dayGroup.date}
                  </p>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-wine-700/50 to-transparent" />
              </div>

              {/* Events */}
              <div className="relative pl-12">
                <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-gold-400/60 via-wine-600/40 to-gold-400/60" />

                <div className="space-y-5">
                  {dayGroup.events.map((event, eventIndex) => (
                    <motion.div
                      key={eventIndex}
                      className="relative flex items-start gap-5"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.4, delay: eventIndex * 0.1 }}
                    >
                      <div className="absolute -left-[29px] top-1.5 timeline-dot" />
                      <div className="elegant-card flex-1 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1.5">
                          <span className="font-sans text-sm font-semibold text-wine-400 tracking-wider">
                            {event.time}
                          </span>
                          <div className="hidden sm:block w-6 h-[1px] bg-wine-700/50" />
                          <h4 className="font-serif text-lg font-bold text-white">
                            {event.title}
                          </h4>
                        </div>
                        <p className="font-sans text-sm text-neutral-400 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
