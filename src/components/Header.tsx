"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass } from "@phosphor-icons/react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Discover", path: "/discover" },
    { label: "About", path: "/about" },
  ];

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

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="py-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-8">
          <div className="flex items-center gap-8">
            <Link href="/">
              <span className="text-xl font-semibold">GamePal</span>
            </Link>

            <nav>
              <ul className="flex items-center gap-5 [&>li>a]:opacity-60 [&>li>a]:hover:opacity-100 [&>li>a]:transition-opacity">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={
                        isActive(item.path) ? "!opacity-100 font-semibold" : ""
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center justify-end gap-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-2 top-2.5 text-muted-foreground"
                  size={16}
                  weight="bold"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="h-9 w-full rounded-full bg-black/5 px-8 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
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
