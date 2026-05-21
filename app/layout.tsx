import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import { MiniPlayer } from "@/components/audio/mini-player";
import { AudioProvider } from "@/lib/audio";
import { siteConfig } from "@/lib/site";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { SiteNav } from "@/components/navigation/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-title",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cba.example"),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.title}`
  },
  description: siteConfig.description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cinzel.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CustomCursor />
        <AudioProvider>
          <SiteNav />
          {children}
          <SiteFooter />
          <MiniPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
