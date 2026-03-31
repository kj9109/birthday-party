// ============================================
// PARTY CONFIGURATION
// Edit these values to customize your party!
// ============================================

export const PARTY_CONFIG = {
  // Birthday person's name
  name: "Daria",

  // Party date and time
  date: "2026-05-02",
  time: "2:00 PM",
  endTime: "2:00 PM – whenever!",

  // Venue details
  venue: "Chimney Hill Estate Inn",
  address: "Lambertville, NJ",

  // Hero section
  tagline: "You're Invited",
  subtitle: "A weekend of celebration with friends & family",

  // Weekend itinerary
  itinerary: [
    {
      day: "Saturday",
      date: "May 2",
      events: [
        { time: "2:00 PM", title: "Party Begins at Chimney Hill Estate Inn", description: "Settle in, explore the grounds" },
        { time: "7:00 PM", title: "Dinner at the Inn", description: "Catered Italian Classics" },
      ],
    },
    {
      day: "Sunday",
      date: "May 3",
      events: [
        { time: "8:00 AM", title: "Breakfast at the Inn", description: "Breakfast to start the morning, for those who stayed over" },
        { time: "Afternoon", title: "Party Concludes", description: "Until next time!" },
      ],
    },
  ],

  // Venue
  venue_detail: {
    name: "Chimney Hill Estate Inn",
    timeRange: "2:00 PM – whenever!",
    description:
      "A charming B&B estate on 8.5 acres in Lambertville, NJ. The property features a rustic-meets-luxury farmhouse style spread across seven historic buildings (dating to the 1820s), with alpacas on the grounds, hot tubs, a sauna & cold plunge, and gourmet breakfast each morning. This is where we'll celebrate, have dinner, stay the night, and close out the weekend together. Think fireplaces, jacuzzi tubs, lush gardens, and good conversation under the stars.",
    address: "207 Goat Hill Road, Lambertville, NJ 08530",
    images: [
      "/images/venues/inn/exterior1.png",
      "/images/venues/inn/exterior2.png",
      "/images/venues/inn/exterior3.png",
      "/images/venues/inn/exterior4.png",
      "/images/venues/inn/exterior5.png",
      "/images/venues/inn/Interior1.png",
      "/images/venues/inn/Interior2.png",
      "/images/venues/inn/interior3.png",
      "/images/venues/inn/interior4.png",
    ],
  },

  // Invited guest names (for "Awaiting RSVP" display)
  // Add names here. Anyone who RSVPs will move out of this list automatically.
  invitedGuests: [] as string[],
};
