"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Home } from "lucide-react";
import Image from "next/image";
import { PARTY_CONFIG } from "@/lib/config";
import Lightbox from "./Lightbox";

export default function Venues() {
  const venue = PARTY_CONFIG.venue_detail;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Image 11 (index 10) is the featured/hero image
  const featuredIdx = venue.images.length - 1; // last image = 11.png
  const featuredImage = venue.images[featuredIdx];
  const otherImages = venue.images.filter((_, i) => i !== featuredIdx);

  return (
    <section id="venue" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900">
            Venue
          </h2>
          <div className="section-divider-wine mt-6" />
        </motion.div>

        {/* Photo collage */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Top row: featured large image + 2 stacked */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            {/* Featured image - spans 2 columns */}
            <button
              onClick={() => setLightboxIndex(featuredIdx)}
              className="md:col-span-2 relative aspect-[16/10] rounded-xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={featuredImage}
                alt={`${venue.name} - Featured`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>

            {/* Right stack - 2 images */}
            <div className="grid grid-rows-2 gap-2">
              {otherImages.slice(0, 2).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(venue.images.indexOf(img))}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer"
                >
                  <Image
                    src={img}
                    alt={`${venue.name} - ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Bottom grid - remaining images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {otherImages.slice(2).map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(venue.images.indexOf(img))}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src={img}
                  alt={`${venue.name} - ${i + 3}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Venue info card */}
        <motion.div
          className="elegant-card p-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-2.5 mb-1">
            <Home size={20} className="text-gold-400 flex-shrink-0" />
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              {venue.name}
            </h3>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-wine-600">
              <Clock size={14} />
              <span className="font-sans text-xs font-semibold tracking-wide">
                {venue.timeRange}
              </span>
            </div>
          </div>

          <p className="font-sans text-sm text-neutral-600 leading-relaxed mb-5">
            {venue.description}
          </p>

          <div className="flex items-start gap-2 pt-4 border-t border-gold-100">
            <MapPin
              size={15}
              className="text-gold-400 mt-0.5 flex-shrink-0"
            />
            <span className="font-sans text-xs text-neutral-500 leading-relaxed">
              {venue.address}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={venue.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
