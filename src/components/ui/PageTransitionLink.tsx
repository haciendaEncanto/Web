"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePageTransition } from "@/components/ui/PageTransitionProvider";

type PageTransitionLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function PageTransitionLink({
  href,
  onClick,
  children,
  ...rest
}: PageTransitionLinkProps) {
  const router = useRouter();
  const startTransition = usePageTransition();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onClick?.(e);
    startTransition();
    router.push(href);
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
