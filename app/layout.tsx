import type { Metadata } from "next";
import "./globals.css";
import { MiniPlayer } from "@/components/audio/mini-player";
import { AudioProvider } from "@/lib/audio";
import { siteConfig } from "@/lib/site";
import { CustomCursor } from "@/components/ui/custom-cursor";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CustomCursor />
        <AudioProvider>
          {children}
          <MiniPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
