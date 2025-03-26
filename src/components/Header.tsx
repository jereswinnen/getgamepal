"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchInput from "./SearchInput";

export default function Header() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="py-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">
            <Link href="/">GamePal</Link>
          </h1>

          <div className="flex-1 max-w-md">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search games..."
            />
          </div>

          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:underline">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:underline">
                  Games
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:underline">
                  Search
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
