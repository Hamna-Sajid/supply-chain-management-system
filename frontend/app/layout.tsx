import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WMS – Warehouse Manager",
  description: "Warehouse Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-screen bg-[#f0f2f0] text-[#1a2e1a] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
