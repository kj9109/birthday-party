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
  venue: "New Hope Winery → Chimney Hill Estate Inn",
  address: "New Hope, PA & Lambertville, NJ",

  // Hero section
  tagline: "You're Invited",
  subtitle: "A Weekend of Elegance & Celebration",

  // Weekend itinerary
  itinerary: [
    {
      day: "Saturday",
      date: "May 2",
      events: [
        { time: "2:00 PM", title: "Party Begins — New Hope Winery", description: "Wine tasting, live music, good vibes" },
        { time: "5:00 PM", title: "Party Continues — Chimney Hill Estate Inn", description: "Settle in, explore the grounds" },
        { time: "7:00 PM", title: "Dinner at the Inn", description: "A wonderful meal together" },
      ],
    },
    {
      day: "Sunday",
      date: "May 3",
      events: [
        { time: "8:00 AM", title: "Breakfast at the Inn", description: "Gourmet breakfast to start the morning" },
        { time: "Afternoon", title: "Party Concludes", description: "Until next time!" },
      ],
    },
  ],

  // Venues
  venues: {
    winery: {
      name: "New Hope Winery",
      timeRange: "2:00 PM – 5:00 PM",
      description:
        "A historic mid-18th century winery in the heart of Bucks County. What started as a hay barn has become one of New Hope's most beloved destinations — featuring wine tastings, live music at The Note (their 250-seat music venue), and The Tavern restaurant & bar in the original barn. OpenTable Diners' Choice award winner. We'll kick off Daria's birthday celebration here with wine, food, and great company.",
      address: "6123 Lower York Road, New Hope, PA 18938",
      images: [
        "/images/venues/winery/1.jpg",
        "/images/venues/winery/2.jpg",
        "/images/venues/winery/3.jpg",
        "/images/venues/winery/4.jpg",
        "/images/venues/winery/5.jpg",
        "/images/venues/winery/6.jpg",
        "/images/venues/winery/7.jpg",
        "/images/venues/winery/8.jpg",
        "/images/venues/winery/9.jpg",
      ],
    },
    inn: {
      name: "Chimney Hill Estate Inn",
      timeRange: "5:00 PM – whenever!",
      description:
        "A charming B&B estate on 8.5 acres in Lambertville, NJ — just minutes from New Hope across the Delaware River. The property features a rustic-meets-luxury farmhouse style spread across seven historic buildings (dating to the 1820s), with alpacas on the grounds, hot tubs, a sauna & cold plunge, and gourmet breakfast each morning. This is where we'll continue the party, have dinner, stay the night, and close out the weekend together. Think fireplaces, jacuzzi tubs, lush gardens, and good conversation under the stars.",
      address: "207 Goat Hill Road, Lambertville, NJ 08530",
      images: [
        "/images/venues/inn/1.jpg",
        "/images/venues/inn/2.jpg",
        "/images/venues/inn/3.jpg",
        "/images/venues/inn/4.jpg",
        "/images/venues/inn/5.webp",
        "/images/venues/inn/6.jpeg",
        "/images/venues/inn/7.jpeg",
        "/images/venues/inn/8.jpeg",
        "/images/venues/inn/9.jpeg",
      ],
    },
  },

  // Initial checklist items
  defaultChecklist: [
    "Book the venue",
    "Send out invitations",
    "Order the cake",
    "Arrange flowers & decorations",
    "Plan the music playlist",
    "Coordinate catering menu",
    "Set up photo booth",
    "Prepare party favors",
    "Confirm guest dietary restrictions",
    "Arrange transportation",
  ],
};
