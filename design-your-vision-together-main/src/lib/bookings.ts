import type { ServiceId } from "./services";

export type Booking = {
  id: string;
  workerId: string;
  workerName: string;
  service: ServiceId;
  area: string;
  note?: string;
  createdAt: string;
  status: "upcoming" | "completed";
};

const KEY = "findlocals.bookings";

export function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

export function saveBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(bookings));
  window.dispatchEvent(new Event("findlocals:bookings"));
}

export function addBooking(input: {
  workerId: string;
  workerName: string;
  service: ServiceId;
  area: string;
  note?: string;
}) {
  const booking: Booking = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "upcoming",
    ...input,
  };
  saveBookings([booking, ...loadBookings()]);
  return booking;
}
