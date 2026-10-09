export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="ADVERTEX">
      <defs>
        <linearGradient id="advx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="0.55" stopColor="#4f8cff" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#advx-g)" />
      <path d="M32 13 L50 51 H41.5 L32 30 L22.5 51 H14 Z" fill="#fff" />
      <circle cx="32" cy="44" r="4" fill="#0b0d12" />
    </svg>
  );
}
