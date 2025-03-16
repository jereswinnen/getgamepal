import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "GamePal - Your Ultimate Gaming Companion",
  description:
    "Discover, track, and share your gaming experiences with GamePal, powered by IGDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen p-8`}
      >
        <header className="py-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              <Link href="/">GamePal</Link>
            </h1>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/games" className="hover:underline">
                    Games
                  </Link>
                </li>
                <li>
                  <Link href="/api/docs" className="hover:underline">
                    API
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="container mx-auto py-12">{children}</main>

        <footer className="bg-black/[.03] dark:bg-white/[.03] py-8 mt-12">
          <div className="container mx-auto text-center">
            <p className="mb-4">
              © {new Date().getFullYear()} GamePal. All rights reserved.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
