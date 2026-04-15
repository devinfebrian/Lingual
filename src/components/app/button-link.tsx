import Link, { LinkProps } from "next/link";

import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ButtonLink({
  href,
  className,
  variant,
  size,
  children,
}: LinkProps &
  Pick<ButtonProps, "variant" | "size" | "className"> & {
    children: React.ReactNode;
  }) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant, size }),
        "inline-flex",
        className,
      )}
    >
      {children}
    </Link>
  );
}
