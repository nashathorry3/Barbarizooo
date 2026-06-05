// Typed client for the Barbarizoo backend API.

import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const DEFAULT_TENANT_ID =
  process.env.NEXT_PUBLIC_TENANT_ID ?? "11111111-1111-1111-1111-111111111111";

// The salon (tenant) the public booking flow currently targets. The per-salon
// booking page sets this from the URL; otherwise it falls back to the default.
let activeTenant = DEFAULT_TENANT_ID;

export function setActiveTenant(id?: string): void {
  activeTenant = id && id.trim() ? id : DEFAULT_TENANT_ID;
}

export interface Salon {
  id: string;
  name: string;
  slug: string | null;
}

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

export type PaymentStatus =
  | "REQUIRES_PAYMENT"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED";

export interface DepositIntent {
  paymentId: string;
  providerRef: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
}

export interface Payment {
  id: string;
  bookingId: string;
  provider: string;
  type: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  providerRef: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  bookingId: string;
  type: string;
  channel: string;
  recipient: string;
  body: string;
  sendAt: string;
  status: string;
  sentAt: string | null;
}

export interface StudioSession {
  sessionId: string;
  privacyNotice: string;
}

export interface Hairstyle {
  id: string;
  name: string;
  category: string;
  gender: string;
  trendScore: number;
  recommendedCategory: string;
  description: string;
  matchScore: number;
}

export interface PreviewResult {
  styleId: string;
  styleName: string;
  renderStatus: string;
  message: string;
  recommendedCategory: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // Public booking flow identifies the salon via header; authenticated
      // requests derive the tenant from the token instead.
      "X-Tenant-Id": activeTenant,
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
  googleLogin: (idToken: string) =>
    request<TokenResponse>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
  me: () => request<AuthUser>("/api/v1/auth/me"),
  salon: (ref: string) => request<Salon>(`/api/v1/salons/${ref}`),
  updateSalon: (name: string, slug: string) =>
    request<Salon>("/api/v1/salons", {
      method: "PATCH",
      body: JSON.stringify({ name, slug }),
    }),
  services: () => request<Service[]>("/api/v1/services"),
  createService: (input: {
    name: string;
    category: string;
    durationMin: number;
    basePriceCents: number;
    staffIds: string[];
  }) =>
    request<Service>("/api/v1/services", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  deactivateService: (id: string) =>
    request<void>(`/api/v1/services/${id}`, { method: "DELETE" }),
  staff: () => request<Staff[]>("/api/v1/staff"),
  createStaff: (input: {
    displayName: string;
    role?: string;
    seniorityLevel?: string;
    color?: string;
  }) =>
    request<Staff>("/api/v1/staff", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  deactivateStaff: (id: string) =>
    request<void>(`/api/v1/staff/${id}`, { method: "DELETE" }),
  updateServiceStaff: (serviceId: string, staffIds: string[]) =>
    request<Service>(`/api/v1/services/${serviceId}/staff`, {
      method: "PUT",
      body: JSON.stringify({ staffIds }),
    }),
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
  createDeposit: (bookingId: string) =>
    request<DepositIntent>("/api/v1/payments/deposit", {
      method: "POST",
      body: JSON.stringify({ bookingId }),
    }),
  confirmDeposit: (providerRef: string) =>
    request<Payment>(`/api/v1/payments/deposit/${providerRef}/confirm`, {
      method: "POST",
    }),
  payments: () => request<Payment[]>("/api/v1/payments"),
  reminders: () => request<Reminder[]>("/api/v1/reminders"),
  dispatchReminders: () =>
    request<{ sent: number }>("/api/v1/reminders/dispatch", { method: "POST" }),
  studioSession: (consent: boolean) =>
    request<StudioSession>("/api/v1/studio/session", {
      method: "POST",
      body: JSON.stringify({ consent }),
    }),
  recommendations: (faceShape?: string, gender?: string, age?: number) => {
    const params = new URLSearchParams();
    if (faceShape) params.set("faceShape", faceShape);
    if (gender) params.set("gender", gender);
    if (age !== undefined) params.set("age", String(age));
    return request<Hairstyle[]>(`/api/v1/studio/recommendations?${params}`);
  },
  studioPreview: (sessionId: string, styleId: string, faceShape?: string) =>
    request<PreviewResult>("/api/v1/studio/preview", {
      method: "POST",
      body: JSON.stringify({ sessionId, styleId, faceShape }),
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
