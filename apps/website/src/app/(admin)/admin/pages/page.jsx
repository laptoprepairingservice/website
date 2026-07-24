"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PAGES = [
  { id: "1", title: "About Us", slug: "/about", status: "Published", updated: "Jan 15, 2026" },
  { id: "2", title: "Privacy Policy", slug: "/privacy", status: "Published", updated: "Jan 10, 2026" },
  { id: "3", title: "Return Policy", slug: "/returns", status: "Published", updated: "Jan 10, 2026" },
  { id: "4", title: "Terms & Conditions", slug: "/terms", status: "Published", updated: "Jan 10, 2026" },
  { id: "5", title: "Contact", slug: "/contact", status: "Published", updated: "Jan 5, 2026" },
];

export default function AdminPagesPage() {
  const [editing, setEditing] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Page saved");
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Static Pages</h1>
          <p className="mt-1 text-muted-foreground">Manage content pages with rich text editor</p>
        </div>
        <Button onClick={() => setEditing({ title: "", slug: "", content: "" })}>
          <Plus />
          New Page
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/30 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Slug</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {PAGES.map((page) => (
          <div key={page.id} className="grid grid-cols-12 items-center gap-4 border-b border-border px-6 py-4 last:border-0">
            <div className="col-span-4 font-medium">{page.title}</div>
            <div className="col-span-2 text-sm text-muted-foreground">{page.slug}</div>
            <div className="col-span-2">
              <Badge variant="success">{page.status}</Badge>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">{page.updated}</div>
            <div className="col-span-2 text-right">
              <Button variant="outline" size="sm" onClick={() => setEditing(page)}>Edit</Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>{editing.id ? "Edit Page" : "New Page"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Title" id="pageTitle">
                <Input id="pageTitle" defaultValue={editing.title} required />
              </FormField>
              <FormField label="Slug" id="pageSlug">
                <Input id="pageSlug" defaultValue={editing.slug} required placeholder="/about" />
              </FormField>
              <FormField label="Content" id="pageContent">
                <Textarea
                  id="pageContent"
                  defaultValue={editing.content}
                  rows={12}
                  placeholder="Rich text editor content..."
                  className="font-mono text-sm"
                />
              </FormField>
              <div className="flex gap-3">
                <Button type="submit">Save Page</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
