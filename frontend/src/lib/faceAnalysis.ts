// In-browser face analysis for the AI Hairstyle Preview.
// Reads face shape, age, and gender straight from a selfie — no manual input,
// no server, GDPR-friendly (the photo never leaves the browser).

export type FaceAnalysis = {
  faceShape: "OVAL" | "ROUND" | "SQUARE" | "HEART" | "LONG";
  age: number;
  gender: "MALE" | "FEMALE";
  genderConfidence: number;
};

// Models are fetched once from a CDN and cached by the browser.
const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

let modelsLoaded = false;

type Point = { x: number; y: number };
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Classify face shape from 68 facial landmarks (heuristic geometry). */
function faceShapeFromLandmarks(p: Point[]): FaceAnalysis["faceShape"] {
  const foreheadW = dist(p[17], p[26]); // outer eyebrow ends
  const cheekW = dist(p[1], p[15]); // widest cheekbone span
  const jawW = dist(p[4], p[12]); // lower jaw span
  const browMid = { x: (p[17].x + p[26].x) / 2, y: (p[17].y + p[26].y) / 2 };
  const faceH = dist(p[8], browMid) * 1.3; // chin→brow, extrapolated for forehead

  const ratio = faceH / cheekW;

  if (ratio > 1.6) return "LONG";
  if (foreheadW > cheekW * 1.02 && jawW < cheekW * 0.9) return "HEART";
  if (jawW > cheekW * 0.92 && foreheadW > cheekW * 0.92 && ratio < 1.3) return "SQUARE";
  if (ratio < 1.25) return "ROUND";
  return "OVAL";
}

/**
 * Detect a single face in the image and return its shape, age, and gender.
 * Returns null if no face is found.
 */
export async function analyzeFace(img: HTMLImageElement): Promise<FaceAnalysis | null> {
  const faceapi = await import("@vladmandic/face-api");

  if (!modelsLoaded) {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
    modelsLoaded = true;
  }

  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416 }))
    .withFaceLandmarks()
    .withAgeAndGender();

  if (!detection) return null;

  return {
    faceShape: faceShapeFromLandmarks(detection.landmarks.positions),
    age: Math.round(detection.age),
    gender: detection.gender === "male" ? "MALE" : "FEMALE",
    genderConfidence: detection.genderProbability,
  };
}

/** Load a data-URL into an HTMLImageElement (needed by the detector). */
export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
