"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid, List, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MEDIA = [
  { id: "1", name: "rtx-4090-hero.jpg", url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop", size: "245 KB" },
  { id: "2", name: "ryzen-processor.jpg", url: "https://images.unsplash.com/photo-1555617981-dac3880abab0?w=400&h=300&fit=crop", size: "189 KB" },
  { id: "3", name: "gaming-monitor.jpg", url: "https://images.unsplash.com/photo-1527443220154-e67de187ae52?w=400&h=300&fit=crop", size: "312 KB" },
  { id: "4", name: "mechanical-keyboard.jpg", url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop", size: "198 KB" },
];

export default function AdminMediaPage() {
  const [view, setView] = useState("grid");

  const handleUpload = () => {
    toast.success("Files uploaded");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Media Library</h1>
          <p className="mt-1 text-muted-foreground">Upload and manage store media assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => setView("grid")} aria-label="Grid view">
            <Grid />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => setView("list")} aria-label="List view">
            <List />
          </Button>
          <Button onClick={handleUpload}>
            <Upload />
            Upload
          </Button>
        </div>
      </div>

      <Input placeholder="Search media..." className="max-w-sm" />

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {MEDIA.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-square bg-muted/30">
                <Image src={item.url} alt={item.name} fill className="object-cover" sizes="200px" />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.size}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {MEDIA.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                <Image src={item.url} alt={item.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
