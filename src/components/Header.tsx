import Link from "next/link";

export default function Header() {
  return (
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
    </header>
  );
}
