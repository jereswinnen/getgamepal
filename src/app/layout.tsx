import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
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
      <body
        className={`${dmSans.variable} o-wrapper font-sans antialiased min-h-screen`}
      >
        <AuthProvider>
          <main className="o-grid y-12">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
