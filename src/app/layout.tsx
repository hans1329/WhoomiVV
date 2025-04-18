import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Whoomi - Web3 AI Character Platform",
  description: "Create and interact with your AI doppelganger in the Web3 world",
  alternates: {
    languages: {
      'en-US': '/',
      'ko-KR': '/?lang=ko'
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default language is English, but will be dynamically switched by client components
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 