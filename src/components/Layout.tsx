import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
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
    </div>
  );
}
