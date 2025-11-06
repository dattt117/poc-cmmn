import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  metadataBase: new URL(""),
  title: "POC CMMN",
  description: "Giải pháp CMMN",
  keywords: ["CMMN", "POC", "CMMN", "CMMN", "CMMN"],
  openGraph: {
    title: "POC CMMN",
    description: "Giải pháp CMMN",
    url: "",
    siteName: "POC CMMN",
    images: [
      {
        url: "https://www.brookings.edu/wp-content/uploads/2017/11/metro_20171121_tech-empowers-tech-polarizes-mark-muro.jpg",
        width: 1200,
        height: 630
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "POC CMMN",
    description: "Giải pháp CMMN",
    images: [
      "https://www.brookings.edu/wp-content/uploads/2017/11/metro_20171121_tech-empowers-tech-polarizes-mark-muro.jpg"
    ]
  },
  robots: {
    index: true,
    follow: false,
    googleBot: {
      index: true,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
