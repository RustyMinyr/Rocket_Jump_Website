import Link from "next/link";
import Image from "next/image";

export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <Link href="/" className={`logo supplied-logo ${dark ? "logo-dark" : "logo-light"}`} aria-label="RocketJump home">
      {/* Exact supplied brand artwork, tightly cropped for reliable header and footer placement. */}
      <Image
        src="/brand/rocketjump-logo-header.png"
        alt=""
        width={960}
        height={450}
        priority
        unoptimized
        className="supplied-logo-image"
      />
      <span className="sr-only">RocketJump</span>
    </Link>
  );
}
