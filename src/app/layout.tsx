import type { Metadata } from "next";

import { AppProvider } from "@/components/app/app-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kotoba Companion",
  description:
    "A mobile-first beginner Japanese learning app with guided lessons, milestones, and an admin publishing workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
