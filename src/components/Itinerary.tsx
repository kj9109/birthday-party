"use client";

import { motion } from "framer-motion";
import { PARTY_CONFIG } from "@/lib/config";

export default function Itinerary() {
  return (
    <section id="schedule" className="py-24 px-6">
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
            The Evening&apos;s
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
            Agenda
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="timeline-line" />

          <div className="space-y-8">
            {PARTY_CONFIG.itinerary.map((item, index) => (
              <motion.div
                key={index}
                className="relative flex items-start gap-6 pl-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="timeline-dot mt-1.5" />
                <div className="elegant-card flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <span className="font-sans text-sm font-semibold text-gold-400 tracking-wider">
                      {item.time}
                    </span>
                    <div className="hidden sm:block w-8 h-[1px] bg-gold-200" />
                    <h3 className="font-serif text-xl font-bold text-neutral-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-sans text-sm text-neutral-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
