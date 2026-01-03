
"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <header className="fixed top-4 right-4 z-50 flex items-center gap-4">
      {children}
      <Link href="/settings" passHref>
        <Button variant="ghost" size="icon" className="text-primary hover:text-accent-foreground hover:bg-accent/50">
          <Settings className="h-6 w-6" />
          <span className="sr-only">Settings</span>
        </Button>
      </Link>
    </header>
  );
}
