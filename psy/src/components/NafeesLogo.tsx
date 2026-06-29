interface NafeesLogoProps {
  size?: number;
}

export default function NafeesLogo({ size = 56 }: NafeesLogoProps) {
  const h = Math.round(size * 0.7);
  return (
    <svg
      viewBox="110 68 180 120"
      width={size}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 120,148 A 80,80 0 0,1 280,148"
        stroke="rgba(247,245,242,0.92)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 147,148 A 53,53 0 0,1 253,148"
        stroke="rgba(156,204,232,0.82)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 172,148 A 28,28 0 0,1 228,148"
        stroke="rgba(122,158,138,0.78)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="200" cy="176" r="9" fill="#C4956A" />
    </svg>
  );
}
