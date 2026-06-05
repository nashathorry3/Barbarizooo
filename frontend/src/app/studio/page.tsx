"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, type Hairstyle } from "@/lib/api";

type Step = "consent" | "capture" | "results";

const GENDERS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Any", value: "" },
];

export default function StudioPage() {
  const [step, setStep] = useState<Step>("consent");
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("MALE");
  const [styles, setStyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setError("Camera not accessible — please upload a photo instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  function snapPhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function getRecommendations() {
    setLoading(true);
    setError(null);
    try {
      const ageNum = age ? parseInt(age, 10) : undefined;
      const results = await api.recommendations(
        undefined,
        gender || undefined,
        ageNum
      );
      setStyles(results);
      setStep("results");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Stop camera stream when navigating away.
  useEffect(() => () => stopCamera(), []);

  /* ── Step 1: Consent ─────────────────────────────────────────── */
  if (step === "consent") {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-7 text-white shadow-card">
          <div className="text-4xl">✂️</div>
          <h1 className="mt-2 text-2xl font-bold">AI Hairstyle Preview</h1>
          <p className="mt-1 text-white/80">
            Take a selfie, enter your age — get 12+ personalised haircut ideas
            ranked by trend score and age-group fit.
          </p>
        </div>

        <div className="card space-y-4 p-6">
          <div className="flex gap-3">
            <span className="text-2xl">🔒</span>
            <div className="text-sm">
              <p className="font-medium text-slate-800">Your photo stays private</p>
              <p className="text-slate-500">
                Processed in the EU, never stored or used to identify you. GDPR-compliant.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I consent to photo processing for the style preview.
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={() => setStep("capture")}
            disabled={!consent}
            className="btn-primary w-full disabled:opacity-40"
          >
            Start → Take photo
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 2: Camera + age ────────────────────────────────────── */
  if (step === "capture") {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Your photo &amp; details</h1>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="card overflow-hidden">
          {/* Photo preview / camera view */}
          {photo ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt="Your selfie"
                className="max-h-72 w-full rounded-t-2xl object-cover"
              />
              <button
                onClick={() => setPhoto(null)}
                className="absolute right-3 top-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs text-white hover:bg-black/70"
              >
                Retake
              </button>
            </div>
          ) : cameraActive ? (
            <div className="relative bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-72 w-full rounded-t-2xl object-cover"
              />
              <button
                onClick={snapPhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-lg hover:bg-slate-100"
              >
                📷 Snap
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="text-6xl">📷</div>
              <p className="text-sm text-slate-500">
                Take a selfie or upload a photo to get started
              </p>
              <div className="flex gap-3">
                <button onClick={startCamera} className="btn-primary">
                  Open camera
                </button>
                <label className="btn-ghost cursor-pointer">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Age + gender */}
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Age *
              </label>
              <input
                type="number"
                min={13}
                max={99}
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Style for
              </label>
              <div className="flex gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    className={`chip flex-1 ${gender === g.value ? "chip-on" : "chip-off"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={getRecommendations}
          disabled={!photo || !age || loading}
          className="btn-primary w-full disabled:opacity-40"
        >
          {loading ? "Generating ideas…" : `Get my haircut ideas →`}
        </button>

        <button
          onClick={() => {
            stopCamera();
            setStep("consent");
          }}
          className="btn-ghost w-full text-sm"
        >
          ← Back
        </button>
      </div>
    );
  }

  /* ── Step 3: Results ─────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header row with photo thumbnail */}
      <div className="flex items-center gap-4">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="Your photo"
            className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-brand object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {styles.length} haircut ideas for you
          </h1>
          <p className="text-slate-500 text-sm">
            Ranked by trend score &amp; age-group fit · age {age}
            {gender ? ` · ${gender.toLowerCase()}` : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setStep("capture");
            setPhoto(null);
            setStyles([]);
          }}
          className="btn-ghost text-sm"
        >
          ← Redo
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {styles.map((s, i) => (
          <div key={s.id} className="card flex flex-col p-4">
            {/* Visual placeholder — icon reflects category/gender */}
            <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-5xl">
              {s.category === "BEARD"
                ? "🧔"
                : s.gender === "FEMALE"
                  ? "💇‍♀️"
                  : "💇"}
            </div>

            <div className="flex items-start justify-between gap-1">
              <h3 className="font-semibold leading-tight text-sm">{s.name}</h3>
              {i === 0 && (
                <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  #1
                </span>
              )}
              {i === 1 && (
                <span className="flex-shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  #2
                </span>
              )}
              {i === 2 && (
                <span className="flex-shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
                  #3
                </span>
              )}
            </div>

            <p className="mt-1 flex-1 text-xs text-slate-500 leading-relaxed">
              {s.description}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span title="German trend score">🔥 {s.trendScore}</span>
              <span>·</span>
              <span title="Match score for you">⭐ {s.matchScore}</span>
              <span>·</span>
              <span className="capitalize">{s.category.toLowerCase()}</span>
            </div>

            <Link
              href={`/?category=${s.recommendedCategory}`}
              className="mt-3 block rounded-lg bg-brand px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
            >
              Book this look
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
