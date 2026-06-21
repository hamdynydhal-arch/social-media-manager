import Image from "next/image";

interface LogoProps {
  /** Diameter of the circular logo in px */
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className = "" }: LogoProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full overflow-hidden aspect-square flex items-center justify-center ring-1 ring-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.15)] ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Spear5"
        height={size}
        width={size * 2}
        className="object-cover scale-110"
        priority
      />
    </div>
  );
}
