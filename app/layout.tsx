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
  metadataBase: new URL("https://poc-cmmn.vercel.app"),
  title: "POC CMMN",
  description: "Giải pháp CMMN",
  keywords: ["CMMN", "POC", "CMMN", "CMMN", "CMMN"],
  openGraph: {
    type: "website",
    title: "POC CMMN",
    description: "Giải pháp CMMN",
    url: "https://poc-cmmn.vercel.app",
    siteName: "POC CMMN",
    locale: "vi_VN",
    images: [
      {
        url: "https://www.syte.ai/wp-content/uploads/2021/10/Glossary-Images-1-24_23-1024x625.jpg",
        width: 1024,
        height: 625,
        alt: "POC CMMN",
        type: "image/jpeg"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "POC CMMN",
    description: "Giải pháp CMMN",
    images: [
      {
        url: "https://www.syte.ai/wp-content/uploads/2021/10/Glossary-Images-1-24_23-1024x625.jpg",
        alt: "POC CMMN"
      }
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
