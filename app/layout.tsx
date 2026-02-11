import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExitLayer | Find Out Your Exit Price",
  description: "Most agencies are worth 1-2x profit. Yours could be worth 4-6x. Take the free 2-minute assessment to find out where you stand.",
  metadataBase: new URL('https://app.exitlayer.io'),
  openGraph: {
    title: "Don't Spend Another Year Building Something You Can't Sell",
    description: "Most agencies are worth 1-2x profit. Yours could be worth 4-6x. Find out where you stand.",
    url: 'https://app.exitlayer.io',
    siteName: 'ExitLayer',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ExitLayer - Find Out Your Exit Price',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Don't Spend Another Year Building Something You Can't Sell",
    description: "Most agencies are worth 1-2x profit. Yours could be worth 4-6x. Find out where you stand.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
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
