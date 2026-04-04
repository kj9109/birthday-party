"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Home } from "lucide-react";
import { PARTY_CONFIG } from "@/lib/config";
import PhotoCarousel from "./PhotoCarousel";

export default function Venues() {
  const venue = PARTY_CONFIG.venue_detail;

  return (
    <section id="venue" className="py-24 px-6 bg-[#111]">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">The</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            Venue
          </h2>
          <div className="section-divider-wine mt-6" />
        </motion.div>

        <motion.div
          className="elegant-card overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Photo carousel */}
          <div className="p-4 pb-0">
            <PhotoCarousel images={venue.images} alt={venue.name} />
          </div>

          {/* Venue info */}
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <Home size={20} className="text-gold-400 flex-shrink-0" />
              <h3 className="font-serif text-xl font-bold text-white">
                {venue.name}
              </h3>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-wine-400">
                <Clock size={14} />
                <span className="font-sans text-xs font-semibold tracking-wide">
                  {venue.timeRange}
                </span>
              </div>
            </div>

            <p className="font-sans text-sm text-neutral-400 leading-relaxed mb-5">
              {venue.description}
            </p>

            <div className="flex items-start gap-2 pt-4 border-t border-white/10">
              <MapPin
                size={15}
                className="text-gold-400 mt-0.5 flex-shrink-0"
              />
              <span className="font-sans text-xs text-neutral-500 leading-relaxed">
                {venue.address}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
