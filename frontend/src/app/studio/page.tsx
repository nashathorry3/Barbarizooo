"use client";

import Link from "next/link";
import { useState } from "react";
import {
  api,
  type Hairstyle,
  type PreviewResult,
  type StudioSession,
} from "@/lib/api";

const FACE_SHAPES = ["OVAL", "ROUND", "SQUARE", "HEART", "LONG"];
const GENDERS = ["MALE", "FEMALE", "UNISEX"];

export default function StudioPage() {
  const [session, setSession] = useState<StudioSession | null>(null);
  const [consent, setConsent] = useState(false);
  const [faceShape, setFaceShape] = useState("OVAL");
  const [gender, setGender] = useState("MALE");
  const [styles, setStyles] = useState<Hairstyle[]>([]);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function start() {
    setError(null);
    try {
      const s = await api.studioSession(consent);
      setSession(s);
      loadRecommendations(faceShape, gender);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function loadRecommendations(shape: string, g: string) {
    setLoading(true);
    try {
      setStyles(await api.recommendations(shape, g));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function tryStyle(style: Hairstyle) {
    if (!session) return;
    try {
      setPreview(await api.studioPreview(session.sessionId, style.id, faceShape));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // --- Consent gate ---
  if (!session) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold">AI Hairstyle Preview</h1>
        <p className="text-slate-500">
          Get style recommendations tailored to your face shape and current
          German trends, then book the matching service.
        </p>
        <div className="card p-6">
          <p className="text-sm text-slate-600">
            Your photo (if you provide one) is processed in the EU, never used to
            identify you, and deleted at the end of the session (GDPR).
          </p>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I consent to processing for the style preview.
          </label>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
          <button
            onClick={start}
            disabled={!consent}
            className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-40"
          >
            Start preview
          </button>
        </div>
      </div>
    );
  }

  // --- Studio ---
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Hairstyle Preview</h1>
        <p className="text-slate-500">Recommendations ranked for you.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-6 card p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Face shape
          </label>
          <div className="flex flex-wrap gap-2">
            {FACE_SHAPES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFaceShape(s);
                  loadRecommendations(s, gender);
                }}
                className={`rounded-full border px-3 py-1 text-sm ${
                  faceShape === s
                    ? "border-brand bg-brand text-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Gender
          </label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGender(g);
                  loadRecommendations(faceShape, g);
                }}
                className={`rounded-full border px-3 py-1 text-sm ${
                  gender === g
                    ? "border-brand bg-brand text-white"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {preview && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          <span className="font-semibold">{preview.styleName}</span> —{" "}
          {preview.message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading recommendations…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((s, i) => (
            <div
              key={s.id}
              className="flex flex-col card p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{s.name}</h3>
                {i === 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Best match
                  </span>
                )}
              </div>
              <p className="mt-1 flex-1 text-sm text-slate-500">
                {s.description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span>🔥 trend {s.trendScore}</span>
                <span>· match {s.matchScore}</span>
                <span>· {s.category}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => tryStyle(s)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-slate-300"
                >
                  Try
                </button>
                <Link
                  href={`/?category=${s.recommendedCategory}`}
                  className="flex-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
                >
                  Book this look
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
