import Link from "next/link";
import Image from "next/image";

export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <Link href="/" className={`logo brand-lockup ${dark ? "logo-dark" : "logo-light"}`} aria-label="RocketJump home">
      <Image
        className="brand-lockup-image"
        src={`/brand/rocketjump-primary-${dark ? "reverse" : "positive"}.png`}
        alt="RocketJump"
        width={1061}
        height={654}
        sizes="(max-width: 680px) 156px, 220px"
        loading="eager"
      />
    </Link>
  );
}
