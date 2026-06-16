/**
 * Barbarizooo brand logo — a vector interpretation of the razor-"B" mark plus the
 * brown wordmark. Crisp at any size and tiny in bytes.
 *
 * Swapping in the exact PNG later: drop your file at `frontend/public/logo.png`
 * and replace the <Logo /> usage in the header with:
 *   <img src="/logo.png" alt="Barbarizooo" className="h-9 w-auto" />
 */

/** The standalone razor-B icon (also used for the favicon). */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Barbarizooo">
      <defs>
        <linearGradient id="bz-mark" x1="14" y1="6" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0a4d37" />
          <stop offset="0.55" stopColor="#15795a" />
          <stop offset="1" stopColor="#33b083" />
        </linearGradient>
      </defs>
      {/* The bold "B": vertical stem + two open bowls */}
      <g
        fill="none"
        stroke="url(#bz-mark)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 8 V56" />
        <path d="M20 9 H34 A12 11 0 0 1 34 31 H20" />
        <path d="M20 33 H37 A13 12 0 0 1 37 55 H20" />
      </g>
      {/* Straight razor laid across the stem: steel blade, pivot pin, folded handle */}
      <path d="M13 53 L31 24" stroke="#c9efdd" strokeWidth="6" strokeLinecap="round" />
      <path d="M13 53 L31 24" stroke="#4fc79a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M13 53 L8 61" stroke="#0a4d37" strokeWidth="4" strokeLinecap="round" />
      <circle cx="13" cy="53" r="3.3" fill="#0a4d37" />
      <circle cx="13" cy="53" r="1.2" fill="#c9efdd" />
    </svg>
  );
}

/** Full lockup: mark + "barbarizooo" wordmark, for the header. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0 transition duration-300 group-hover:rotate-6 group-hover:scale-110" />
      <span className="text-xl font-bold lowercase tracking-tight text-[#6b4329]">
        barbarizooo
      </span>
    </span>
  );
}
