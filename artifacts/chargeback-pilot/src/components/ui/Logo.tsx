export function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      role="img"
      aria-label="ChargebackPilot Logo"
      className="w-6 h-6"
    >
      <defs>
        <linearGradient id="shieldStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#082054" />
          <stop offset="45%" stopColor="#2058ff" />
          <stop offset="100%" stopColor="#0a4bff" />
        </linearGradient>
        <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b2a7c" />
          <stop offset="40%" stopColor="#2c7dff" />
          <stop offset="100%" stopColor="#0787ff" />
        </linearGradient>
        <radialGradient id="shieldFill" cx="50%" cy="40%" r="80%" fx="45%" fy="35%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f4f9ff" />
          <stop offset="100%" stopColor="#e8f0ff" />
        </radialGradient>
      </defs>

      <path
        d="M18 72C25 52 44 34 69 28C87 24 103 36 105 53C106 63 101 72 93 78C88 82 81 84 73 84C56 84 39 78 26 66C24 64 20 72 18 72Z"
        fill="url(#ringGradient)"
        opacity="0.96"
      />
      <path
        d="M35 22L60 12L85 22C94 30 98 45 92 60C86 78 69 96 60 100C51 96 34 78 28 60C22 45 26 30 35 22Z"
        fill="url(#shieldFill)"
        stroke="url(#shieldStroke)"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M30 80C42 72 60 66 80 66C90 66 98 70 104 76C99 82 94 86 88 88C78 92 66 92 54 88C42 84 31 78 30 80Z"
        fill="url(#ringGradient)"
        opacity="0.96"
      />
      <path
        d="M43 58L54 70L77 46"
        fill="none"
        stroke="#06103a"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
