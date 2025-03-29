"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <header className="py-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="relative">
              <Image
                src="/branding@2x.png"
                alt="GamePal"
                width={40}
                height={40}
                priority
              />
            </Link>

            <nav>
              <ul className="flex items-center gap-4">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/discover">Discover</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <IconSearch
                  size={16}
                  className="absolute left-2 top-2.5 text-muted-foreground"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="h-9 w-full rounded-md border border-input bg-white dark:bg-black px-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
                  placeholder="Search games..."
                />
              </div>
            </form>

            <Button variant="default" size="sm">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                Download for iOS
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
