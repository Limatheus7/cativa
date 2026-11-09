import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Jost } from "next/font/google";
import { SCRIPT_TEMA } from "@/lib/tema-script";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

// Fonte do ingresso de presença (kit de design dos ingressos).
const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Cativa",
  description: "Sua cadeira cativa na história do seu time.",
  applicationName: "Cativa",
  appleWebApp: { capable: true, title: "Cativa", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1F4D3A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${fraunces.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        {/* Aplica o modo claro/escuro antes da primeira pintura. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
