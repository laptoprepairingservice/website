import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-semibold text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-2xl font-semibold md:text-3xl">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home />
            Go Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">
            <Search />
            Browse Products
          </Link>
        </Button>
      </div>
    </div>
  );
}
