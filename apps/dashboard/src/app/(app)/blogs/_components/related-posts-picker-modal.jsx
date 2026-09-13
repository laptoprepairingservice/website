"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/shadcn/components/dialog";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { Badge } from "@ui/shadcn/components/badge";

export function RelatedPostsPickerModal({
  open,
  onOpenChange,
  currentPostId,
  alreadySelectedIds = [],
  onSelectPost,
}) {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      searchPosts("");
    }
  }, [open]);

  const searchPosts = async (term = "") => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("blog_posts")
      .select("id, title, slug, status, published_at, featured_image_url")
      .order("created_at", { ascending: false })
      .limit(20);

    if (currentPostId) {
      query = query.neq("id", currentPostId);
    }

    if (term.trim()) {
      query = query.ilike("title", `%${term.trim()}%`);
    }

    const { data, error } = await query;
    setLoading(false);
    if (!error && data) {
      setPosts(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            Select Related Articles
          </DialogTitle>
          <DialogDescription>
            Choose existing blog posts to show as related content.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search posts by title..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchPosts(e.target.value);
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[420px] space-y-2 mt-3 pr-1">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
              <Loader2 className="size-5 animate-spin mr-2" /> Searching posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
              No articles found.
            </div>
          ) : (
            posts.map((post) => {
              const isSelected = alreadySelectedIds.includes(post.id);
              return (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 transition gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-md overflow-hidden bg-muted/40 border flex items-center justify-center shrink-0">
                      {post.featured_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="size-full object-cover"
                        />
                      ) : (
                        <BookOpen className="size-4 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{post.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="capitalize text-[10px] py-0">
                          {post.status}
                        </Badge>
                        <span className="truncate">/{post.slug}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "secondary" : "default"}
                    onClick={() => onSelectPost?.(post)}
                  >
                    {isSelected ? "Linked" : <><Plus className="size-3.5 mr-1" /> Link</>}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
