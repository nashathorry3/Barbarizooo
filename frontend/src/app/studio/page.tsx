"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, type Hairstyle } from "@/lib/api";
import { analyzeFace, loadImage, type FaceAnalysis } from "@/lib/faceAnalysis";

type Step = "consent" | "capture" | "results";

const FACE_SHAPES = ["OVAL", "ROUND", "SQUARE", "HEART", "LONG"];
const GENDERS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
];

export default function StudioPage() {
  const [step, setStep] = useState<Step>("consent");
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [face, setFace] = useState<FaceAnalysis | null>(null);
  const [styles, setStyles] = useState<Hairstyle[]>([]);
  const [adjusting, setAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
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

  async function fetchStyles(f: { faceShape?: string; gender?: string; age?: number }) {
    return api.recommendations(f.faceShape, f.gender, f.age);
  }

  // The core flow: read the face from the selfie, then fetch matching styles.
  async function analyzeAndRecommend() {
    if (!photo) return;
    setAnalyzing(true);
    setError(null);
    try {
      const img = await loadImage(photo);
      const result = await analyzeFace(img);
      if (!result) {
        setError("Couldn't detect a face clearly. Try a brighter, front-facing photo — or skip to popular styles.");
        setAnalyzing(false);
        return;
      }
      setFace(result);
      setStyles(await fetchStyles(result));
      setStep("results");
    } catch {
      setError("Face analysis failed to load. Check your connection, or skip to popular styles.");
    } finally {
      setAnalyzing(false);
    }
  }

  // Fallback when no face is detected: show trend-ranked styles without a profile.
  async function skipToPopular() {
    setAnalyzing(true);
    setError(null);
    try {
      setFace(null);
      setStyles(await fetchStyles({}));
      setStep("results");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  // Re-run recommendations after the user manually tweaks the detected profile.
  async function applyAdjust(next: FaceAnalysis) {
    setFace(next);
    setStyles(await fetchStyles(next));
  }

  useEffect(() => () => stopCamera(), []);

  /* ── Step 1: Consent ─────────────────────────────────────────── */
  if (step === "consent") {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-7 text-white shadow-card">
          <div className="text-4xl">✂️</div>
          <h1 className="mt-2 text-2xl font-bold">AI Hairstyle Preview</h1>
          <p className="mt-1 text-white/80">
            Just take a selfie. Our AI reads your face shape, age and gender and
            suggests 12+ haircuts that suit you — no typing.
          </p>
        </div>

        <div className="card space-y-4 p-6">
          <div className="flex gap-3">
            <span className="text-2xl">🔒</span>
            <div className="text-sm">
              <p className="font-medium text-slate-800">Your photo never leaves your device</p>
              <p className="text-slate-500">
                Analysis runs entirely in your browser — the image is never uploaded or stored. GDPR-friendly.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            I consent to on-device photo analysis for the style preview.
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={() => setStep("capture")}
            disabled={!consent}
            className="btn-primary w-full disabled:opacity-40"
          >
            Start → Take selfie
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 2: Selfie ──────────────────────────────────────────── */
  if (step === "capture") {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Take your selfie</h1>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="card overflow-hidden">
          {photo ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Your selfie" className="max-h-80 w-full rounded-t-2xl object-cover" />
              <button
                onClick={() => {
                  setPhoto(null);
                  setError(null);
                }}
                className="absolute right-3 top-3 rounded-lg bg-black/50 px-2.5 py-1 text-xs text-white hover:bg-black/70"
              >
                Retake
              </button>
            </div>
          ) : cameraActive ? (
            <div className="relative bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} autoPlay playsInline muted className="max-h-80 w-full rounded-t-2xl object-cover" />
              <button
                onClick={snapPhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-lg hover:bg-slate-100"
              >
                📷 Snap
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="text-6xl">🤳</div>
              <p className="text-sm text-slate-500">Face the camera, good lighting, hair visible.</p>
              <div className="flex gap-3">
                <button onClick={startCamera} className="btn-primary">Open camera</button>
                <label className="btn-ghost cursor-pointer">
                  Upload photo
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          )}
        </div>

        {photo && (
          <button onClick={analyzeAndRecommend} disabled={analyzing} className="btn-primary w-full disabled:opacity-60">
            {analyzing ? "Reading your face…" : "Analyze my face → get 12+ styles"}
          </button>
        )}

        {error && photo && (
          <button onClick={skipToPopular} disabled={analyzing} className="btn-ghost w-full text-sm">
            Skip — show popular styles instead
          </button>
        )}

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
      <div className="flex items-center gap-4">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="You" className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-brand object-cover" />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{styles.length} styles that suit you</h1>
          {face ? (
            <p className="text-sm text-slate-500">
              Detected:{" "}
              <span className="font-medium capitalize">{face.faceShape.toLowerCase()} face</span> ·{" "}
              ~{face.age} yrs · {face.gender.toLowerCase()}{" "}
              <button onClick={() => setAdjusting((v) => !v)} className="ml-1 text-brand hover:underline">
                {adjusting ? "close" : "adjust"}
              </button>
            </p>
          ) : (
            <p className="text-sm text-slate-500">Popular styles ranked by German trend score.</p>
          )}
        </div>
        <button
          onClick={() => {
            setStep("capture");
            setPhoto(null);
            setFace(null);
            setStyles([]);
            setAdjusting(false);
          }}
          className="btn-ghost text-sm"
        >
          ← Redo
        </button>
      </div>

      {/* Manual override of the detected profile */}
      {adjusting && face && (
        <div className="card flex flex-wrap items-end gap-4 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Face shape</label>
            <div className="flex flex-wrap gap-1.5">
              {FACE_SHAPES.map((s) => (
                <button
                  key={s}
                  onClick={() => applyAdjust({ ...face, faceShape: s as FaceAnalysis["faceShape"] })}
                  className={`chip ${face.faceShape === s ? "chip-on" : "chip-off"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Gender</label>
            <div className="flex gap-1.5">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => applyAdjust({ ...face, gender: g.value as FaceAnalysis["gender"] })}
                  className={`chip ${face.gender === g.value ? "chip-on" : "chip-off"}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Age</label>
            <input
              type="number"
              min={13}
              max={99}
              value={face.age}
              onChange={(e) => applyAdjust({ ...face, age: Number(e.target.value) })}
              className="input w-24 py-1.5"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {styles.map((s, i) => (
          <div key={s.id} className="card flex flex-col p-4">
            <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-5xl">
              {s.category === "BEARD" ? "🧔" : s.gender === "FEMALE" ? "💇‍♀️" : "💇"}
            </div>

            <div className="flex items-start justify-between gap-1">
              <h3 className="text-sm font-semibold leading-tight">{s.name}</h3>
              {i < 3 && (
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    i === 0
                      ? "bg-emerald-100 text-emerald-700"
                      : i === 1
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-violet-100 text-violet-600"
                  }`}
                >
                  #{i + 1}
                </span>
              )}
            </div>

            <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{s.description}</p>

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
