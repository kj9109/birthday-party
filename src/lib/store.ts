// Simple in-memory store for development
// For production on Vercel, replace with Vercel KV, Supabase, or any database

export interface Message {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

export interface Question {
  id: string;
  question: string;
  name?: string;
  timestamp: string;
}

export interface Attendee {
  id: string;
  name: string;
  photo?: string;
  rsvp: "attending" | "maybe" | "declined";
  timestamp: string;
}

interface Store {
  messages: Message[];
  questions: Question[];
  attendees: Attendee[];
}

const store: Store = {
  messages: [],
  questions: [],
  attendees: [],
};

export function getData<K extends keyof Store>(key: K): Store[K] {
  return store[key];
}

export function setData<K extends keyof Store>(key: K, data: Store[K]): void {
  store[key] = data;
}
