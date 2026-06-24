import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/shared/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Spear5 — منصة إدارة بوت التداول",
    template: "%s | Spear5",
  },
  description: "منصة احترافية لإدارة بوت تداول العملات الرقمية المتقدم",
  keywords: ["crypto", "trading bot", "binance", "تداول", "عملات رقمية"],
  authors: [{ name: "Spear5" }],
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                fontFamily: "Cairo, sans-serif",
                direction: "rtl",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
