export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "attending" | "maybe" | "declined";
  photoUrl?: string;
  comment?: string;
  plusOneName?: string;
  plusOneOf?: string;
  events: {
    dinnerParty: boolean;
    stayingOver: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VideoWish {
  id: string;
  guestName: string;
  videoUrl: string;
  createdAt: string;
}

export const CALENDAR_LINKS = {
  dinnerParty: "https://calendar.app.google/S3ZKKgYusCVBGMv16",
  stayingOver: "https://calendar.app.google/2obwus6mZ7FLZ4kUA",
} as const;

export const EVENT_LABELS = {
  dinnerParty: "Dinner & Evening Party",
  stayingOver: "Staying Over",
} as const;
