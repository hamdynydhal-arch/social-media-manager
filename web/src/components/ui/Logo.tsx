import Image from "next/image";

interface LogoProps {
  /** Height in px — width is set to 2× to match the banner's 2:1 aspect ratio */
  height?: number;
  className?: string;
}

export function Logo({ height = 48, className = "" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Spear5"
      height={height}
      width={height * 2}
      className={`shrink-0 object-contain ${className}`}
      priority
    />
  );
}
