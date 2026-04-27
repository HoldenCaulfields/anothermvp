import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import CreateIdeaModal from "@/components/cards/CreateIdeaModal";
import HiddingBottomBar from "@/components/HiddingBottomBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ['vietnamese'],
  weight: ['400', '700', '900']
});

export const metadata: Metadata = {
  title: "LovelyNet",
  description: "Build for creators, by creators. Nơi kết nối ý tưởng và hiện thực hóa dự án.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}
      >
        <Navbar />
        {children}
        <HiddingBottomBar />
        <CreateIdeaModal />
      </body>
    </html>
  );
}
