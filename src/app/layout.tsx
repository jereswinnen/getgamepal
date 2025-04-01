import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - GamePal",
    default: "GamePal - Remember your gaming memories",
  },
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
      <body className={`${dmSans.variable} font-sans antialiased min-h-screen`}>
        <Header />
        <main className="container mx-auto py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
