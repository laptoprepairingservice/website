"use client";

import Link from "next/link";

import List from "@/components/react-list";
import { Button } from "@ui/shadcn/components/button";

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">Manage catalog products and variants.</p>
        </div>
        <Button asChild>
          <Link href="/products/new">Add product</Link>
        </Button>
      </div>

      <List endpoint="products" select="id, public_id, name, product_variants(price), created_at">
        {({ items }) => (
          <div className="divide-y rounded-xl border">
            {items.length === 0 ? (
              <p className="text-muted-foreground p-4 text-sm">No products yet.</p>
            ) : (
              items.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.public_id}/edit`}
                  className="hover:bg-muted/40 flex items-center justify-between p-4 transition-colors"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-muted-foreground text-sm">Edit</span>
                </Link>
              ))
            )}
          </div>
        )}
      </List>
    </div>
  );
}
