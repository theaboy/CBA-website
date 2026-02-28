import type { Metadata } from "next";
import "./globals.css";
import { MiniPlayer } from "@/components/audio/mini-player";
import { AudioProvider } from "@/lib/audio";
import { siteConfig } from "@/lib/site";

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
      <body>
        <AudioProvider>
          {children}
          <MiniPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
