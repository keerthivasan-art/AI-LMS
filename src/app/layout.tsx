import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
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
  title: "AI-LMS | Intelligent Learning Management System",
  description:
    "AI-Powered Learning platform built for teachers and students. Smart classrooms, AI tutoring, assignment management, and progress tracking.",
  keywords: ["AI", "LMS", "Education", "Learning Management System", "AI Tutor", "Classrooms"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
