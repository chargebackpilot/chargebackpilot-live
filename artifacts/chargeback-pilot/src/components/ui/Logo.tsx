interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * ChargebackPilot shield mark.
 * Blue gradient shield with a bold check inside and an orbiting "return"
 * swoosh — the swoosh implies money/value coming back to you, the shield
 * implies protection. Designed to read at 16px (favicon) up to 96px+.
 */
export function Logo({ className = "", size = 28 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="ChargebackPilot Logo"
    >
      <defs>
        <linearGradient id="cbp-shield" x1="14" y1="6" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="cbp-swoosh" x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* Orbiting return-swoosh — left side fades, right side bold */}
      <path
        d="M 8 36 C 8 18, 24 8, 40 12"
        stroke="url(#cbp-swoosh)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
      <path
        d="M 56 28 C 56 46, 40 56, 24 52"
        stroke="url(#cbp-swoosh)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Shield body */}
      <path
        d="M 32 7 L 50 13 L 50 32 C 50 44, 42 52, 32 56 C 22 52, 14 44, 14 32 L 14 13 Z"
        fill="url(#cbp-shield)"
      />
      {/* Inner shield highlight for depth */}
      <path
        d="M 32 11 L 46 15.5 L 46 31 C 46 41, 39.5 48, 32 51.5 C 24.5 48, 18 41, 18 31 L 18 15.5 Z"
        fill="none"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="1"
      />

      {/* Bold checkmark */}
      <path
        d="M 22 32.5 L 29 39.5 L 43 24.5"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

interface LogoLockupProps {
  className?: string;
  size?: number;
}

/**
 * Full logo lockup: shield + "Chargeback" (dark) + "Pilot" (blue gradient).
 * Use this instead of <Logo/> + <span> whenever the brand wordmark is wanted.
 */
export function LogoLockup({ className = "", size = 28 }: LogoLockupProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Logo size={size} />
      <span className="font-extrabold tracking-tight text-[1.05rem] sm:text-[1.15rem] leading-none">
        <span className="text-slate-900">Chargeback</span>
        <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
          Pilot
        </span>
      </span>
    </span>
  );
}
