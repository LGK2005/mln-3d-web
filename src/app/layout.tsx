import type { Metadata } from "next";
import {
  Playfair_Display,
  Source_Serif_4,
  Montserrat,
} from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-label",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Triết Học Mác-Lênin 3D — Lý Luận Nhận Thức",
  description:
    "Khám phá lý luận nhận thức duy vật biện chứng qua trải nghiệm 3D tương tác, lấy cảm hứng từ Civilization VI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${playfairDisplay.variable} ${sourceSerif4.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
