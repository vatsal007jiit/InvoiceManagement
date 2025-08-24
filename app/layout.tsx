import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Invoice Management System",
  description: "A secure invoice management system built with Next.js",
  keywords: ["invoice", "management", "fintech", "secure", "nextjs"],
  authors: [{ name: "Invoice Management Team" }],
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRConfig value={swrConfig}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
