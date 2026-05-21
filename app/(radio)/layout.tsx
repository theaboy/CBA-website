import { Hanken_Grotesk, Bebas_Neue, Big_Shoulders, DM_Sans, JetBrains_Mono } from "next/font/google";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-big-shoulders",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export default function RadioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${hanken.variable} ${bebas.variable} ${bigShoulders.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      {children}
    </div>
  );
}
