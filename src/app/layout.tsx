import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/main-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RETELL - Podcast Discovery Platform",
  description: "The platform for podcast discovery and content sharing. Upload your podcasts and discover new content from creators worldwide.",
  keywords: ["podcast", "licensing", "marketplace", "content", "distribution"],
  authors: [{ name: "RETELL Team" }],
  creator: "RETELL",
  publisher: "RETELL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
