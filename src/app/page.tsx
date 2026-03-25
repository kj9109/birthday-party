import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Itinerary from "@/components/Itinerary";
import Venues from "@/components/Venues";
import Attendees from "@/components/Attendees";
import MessageBoard from "@/components/MessageBoard";
import VideoWish from "@/components/VideoWish";
import PrivateQuestions from "@/components/PrivateQuestions";
import { PARTY_CONFIG } from "@/lib/config";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />

      <div className="section-divider" />
      <Itinerary />

      <div className="section-divider" />
      <Venues />

      <div className="section-divider" />
      <Attendees />

      <div className="section-divider" />
      <MessageBoard />

      <div className="section-divider" />
      <VideoWish />

      <div className="section-divider" />
      <PrivateQuestions />

      {/* Footer */}
      <footer className="py-16 px-6 text-center border-t border-gold-100">
        <p className="font-script text-2xl text-gold-400 mb-2">With Excitement</p>
        <p className="font-sans text-sm text-neutral-400 tracking-wide">
          Celebrating {PARTY_CONFIG.name} &middot; May 2–3, 2026
        </p>
        <div className="section-divider mt-8" />
      </footer>
    </main>
  );
}
