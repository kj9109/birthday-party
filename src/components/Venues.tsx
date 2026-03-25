"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Wine, Home } from "lucide-react";
import { PARTY_CONFIG } from "@/lib/config";
import PhotoCarousel from "./PhotoCarousel";

const venueIcon = {
  winery: Wine,
  inn: Home,
};

export default function Venues() {
  const venues = [
    { key: "winery" as const, data: PARTY_CONFIG.venues.winery },
    { key: "inn" as const, data: PARTY_CONFIG.venues.inn },
  ];

  return (
    <section id="venues" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-script text-3xl text-gold-400 mb-2">The</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
            Venues
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        {/* Split view */}
        <div className="grid md:grid-cols-2 gap-8">
          {venues.map(({ key, data }, index) => {
            const Icon = venueIcon[key];
            return (
              <motion.div
                key={key}
                className="elegant-card overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                {/* Photo carousel */}
                <div className="p-4 pb-0">
                  <PhotoCarousel images={data.images} alt={data.name} />
                </div>

                {/* Venue info */}
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-1">
                    <Icon size={20} className="text-gold-400 flex-shrink-0" />
                    <h3 className="font-serif text-xl font-bold text-neutral-900">
                      {data.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-gold-500">
                      <Clock size={14} />
                      <span className="font-sans text-xs font-semibold tracking-wide">
                        {data.timeRange}
                      </span>
                    </div>
                  </div>

                  <p className="font-sans text-sm text-neutral-600 leading-relaxed mb-5">
                    {data.description}
                  </p>

                  <div className="flex items-start gap-2 pt-4 border-t border-gold-100">
                    <MapPin
                      size={15}
                      className="text-gold-400 mt-0.5 flex-shrink-0"
                    />
                    <span className="font-sans text-xs text-neutral-500 leading-relaxed">
                      {data.address}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
