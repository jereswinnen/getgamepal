import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="container mx-auto text-center">
        <p className="mb-4">
          © {new Date().getFullYear()} GamePal. All rights reserved.
        </p>
        <div className="flex justify-center gap-6">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link
            href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
            className="hover:underline"
            target="_blank"
          >
            Terms and Conditions
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
