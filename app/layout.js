import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import CaptureBar from "@/components/CaptureBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PersonalOS",
  description: "La dashboard che tiene insieme la tua vita.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="app-shell">
          <TopBar />
          {children}
        </div>
        <CaptureBar />
      </body>
    </html>
  );
}
