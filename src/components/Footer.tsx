import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="container mx-auto text-center text-sm text-muted-foreground flex flex-col gap-2 py-4">
        <p>© {new Date().getFullYear()} GamePal. All rights reserved.</p>
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link
            href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
            className="hover:underline"
            target="_blank"
          >
            Terms and Conditions
          </Link>
          <Link
            href="https://www.threads.net/@gamepalapp"
            className="hover:underline"
          >
            Threads
          </Link>
        </div>
      </div>
    </footer>
  );
}
