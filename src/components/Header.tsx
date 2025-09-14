"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { IconBrandApple, IconSearch, IconUser } from "@tabler/icons-react";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const { user, loading } = useAuth();

  const navItems = [
    { label: "Features", path: "/#features" },
    { label: "Platinum", path: "/#platinum" },
    { label: "Support", path: "/#support" },
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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear cookies manually to ensure complete sign-out
    document.cookie =
      "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure";
    document.cookie =
      "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure";
    document.cookie =
      "supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure";

    // Redirect to home page and refresh
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b shadow-sm">
      <div className="o-wrapper py-6">
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
                <IconSearch
                  className="absolute left-2 top-2.5 text-muted-foreground"
                  size={16}
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="h-9 w-full rounded-full bg-black/5 px-8 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden dark:bg-white/5"
                  placeholder="Search games..."
                />
              </div>
            </form>

            <div className="flex items-center gap-3">
              <Button size="sm">
                <Link
                  href="https://apps.apple.com/app/gamepal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <IconBrandApple size={16} />
                  Download the App
                </Link>
              </Button>
              {!loading && (
                <Button variant="default" size="sm" asChild>
                  <Link
                    href={user ? "/dashboard" : "/auth"}
                    className="flex items-center gap-1"
                  >
                    <IconUser size={16} />
                    My account
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
