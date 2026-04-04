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
  tagline: "Like Fine Wine",
  subtitle: "Surprise Party",

  // Itinerary
  itinerary: [
    {
      day: "Saturday",
      date: "May 2",
      events: [
        { time: "2:00 PM", title: "Party Starts", description: "Daria arrives at 2:30, and will be surprised to see everyone" },
        { time: "3:00 PM", title: "Apps, Drinks, Games, and Live Music", description: "After Daria arrives, relax and have fun" },
        { time: "7:00 PM", title: "Dinner", description: "Plenty of food and drink. Catered Italian classics." },
        { time: "9:00 PM", title: "Evening Festivities", description: "Fire, sauna, hot tub outside; singing, music, nightcaps inside" },
      ],
    },
  ],

  // Overnight note (shown below itinerary)
  overnightNote: "We have the property booked until 11:00 AM Sunday morning. Guests who cannot get home safely or would prefer to stay at the property can be accommodated \u2014 up to 8 rooms are available. Breakfast and coffee will be available in the morning.",

  // Venue
  venue_detail: {
    name: "Chimney Hill Estate Inn",
    timeRange: "2:00 PM – whenever!",
    description:
      "A charming B&B estate on 8.5 acres in Lambertville, NJ. The property features a rustic-meets-luxury farmhouse style spread across seven historic buildings (dating to the 1820s), with alpacas on the grounds, hot tubs, a sauna & cold plunge, and gourmet breakfast each morning. This is where we'll celebrate, have dinner, stay the night, and close out the weekend together. Think fireplaces, jacuzzi tubs, lush gardens, and good conversation under the stars.",
    address: "207 Goat Hill Road, Lambertville, NJ 08530",
    images: [
      "/images/venues/inn/1.png",
      "/images/venues/inn/2.png",
      "/images/venues/inn/3.png",
      "/images/venues/inn/4.png",
      "/images/venues/inn/5.png",
      "/images/venues/inn/6.png",
      "/images/venues/inn/7.png",
      "/images/venues/inn/8.png",
      "/images/venues/inn/9.png",
      "/images/venues/inn/10.png",
      "/images/venues/inn/11.png",
    ],
  },

  // Invited guest names (for "Awaiting RSVP" display)
  // Add names here. Anyone who RSVPs will move out of this list automatically.
  invitedGuests: [] as string[],
};
