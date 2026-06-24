"use client";
import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-12 w-auto" }: LogoProps) {
  return (
    <button
      onClick={() => window.location.reload()}
      className={`flex items-center justify-center shrink-0 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none ${className}`}
      title="تحديث الصفحة"
      aria-label="Refresh Page"
    >
      <div className="rounded-full overflow-hidden aspect-square flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/30">
        <Image
          src="/logo.png"
          alt="Spear5 Wealth Reactor"
          width={180}
          height={180}
          className="object-cover h-full w-full"
          priority
        />
      </div>
    </button>
  );
}
