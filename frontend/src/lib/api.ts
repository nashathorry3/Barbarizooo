// Typed client for the Barbarizoo backend API.

import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const TENANT_ID =
  process.env.NEXT_PUBLIC_TENANT_ID ?? "11111111-1111-1111-1111-111111111111";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  tenantId: string;
}

export interface TokenResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  basePriceCents: number;
  vatRate: number;
  staffIds: string[];
}

export interface Staff {
  id: string;
  displayName: string;
  role: string;
  seniorityLevel: string;
  color: string;
}

export interface Slot {
  start: string;
  end: string;
  priceCents: number;
}

export interface Availability {
  date: string;
  serviceId: string;
  staffId: string;
  durationMin: number;
  slots: Slot[];
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  customerName: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  priceCents: number;
  source: string;
}

export interface CreateBookingInput {
  serviceId: string;
  staffId: string;
  startsAt: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  marketingConsent?: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // Public booking flow identifies the salon via header; authenticated
      // requests derive the tenant from the token instead.
      "X-Tenant-Id": TENANT_ID,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail: unknown;
    try {
      detail = (await res.json())?.detail;
    } catch {
      detail = res.statusText;
    }
    throw new Error(
      typeof detail === "string" ? detail : `Request failed (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AuthUser>("/api/v1/auth/me"),
  services: () => request<Service[]>("/api/v1/services"),
  staff: () => request<Staff[]>("/api/v1/staff"),
  availability: (serviceId: string, staffId: string, date: string) =>
    request<Availability>(
      `/api/v1/availability?serviceId=${serviceId}&staffId=${staffId}&date=${date}`
    ),
  bookings: () => request<Booking[]>("/api/v1/bookings"),
  createBooking: (input: CreateBookingInput) =>
    request<Booking>("/api/v1/bookings", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateBookingStatus: (id: string, status: BookingStatus) =>
    request<Booking>(`/api/v1/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export function euro(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateTimeLabel(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
