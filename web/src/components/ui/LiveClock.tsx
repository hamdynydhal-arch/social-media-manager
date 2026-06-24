"use client";
import { useState, useEffect } from 'react';

export function LiveClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <span className="opacity-0">...</span>;

  return (
    <span className="text-[#D4AF37] font-mono mx-1 inline-flex items-center gap-2" dir="rtl">
      <span>
        {time.toLocaleDateString('ar-QA-u-nu-latn', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </span>
      <span className="text-slate-500 opacity-70">-</span>
      <span dir="ltr">
        {time.toLocaleTimeString('ar-QA-u-nu-latn', {
          hour12: false,
        })}
      </span>
    </span>
  );
}
