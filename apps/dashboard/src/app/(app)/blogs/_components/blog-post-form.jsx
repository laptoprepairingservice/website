"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Code2,
  Eye,
  Folder,
  Globe,
  Hash,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Lock,
  Package,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Unlock,
  UploadCloud,
  User,
  X,
} from "lucide-react";

import {
  BLOG_STATUSES,
  blogPostFormSchema,
  calculateReadingTime,
  getBlogPostFormDefaults,
  slugify,
} from "../_lib/blog-schema";
import {
  createBlogPostAction,
  updateBlogPostAction,
  uploadBlogImageAction,
} from "../_actions/blog-actions";
import { FormRichTextEditor } from "@/components/ui/rich-text-editor";
import { BlogCategorySheet } from "./blog-category-sheet";
import { BlogTagSheet } from "./blog-tag-sheet";
import { ProductReferencePickerModal } from "./product-reference-picker-modal";
import { RelatedPostsPickerModal } from "./related-posts-picker-modal";
import { getProductAssetUrl } from "@/lib/supabase/storage";
import { formatPrice } from "@/lib/format";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import { Textarea } from "@ui/shadcn/components/textarea";
import { Badge } from "@ui/shadcn/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/shadcn/components/card";

export function BlogPostForm({
  mode = "new",
  initialValues = null,
  categories = [],
  tags = [],
  authors = [],
  referencedProducts = [],
  relatedPosts = [],
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [activeCategories, setActiveCategories] = useState(categories);
  const [activeTags, setActiveTags] = useState(tags);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  // References state
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [relatedPickerOpen, setRelatedPickerOpen] = useState(false);
  const [attachedProducts, setAttachedProducts] = useState(referencedProducts);
  const [attachedRelatedPosts, setAttachedRelatedPosts] = useState(relatedPosts);
  const [jsonldError, setJsonldError] = useState("");

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: getBlogPostFormDefaults({
      ...initialValues,
      category_ids: initialValues?.category_ids ?? categories.filter(c => initialValues?.blog_post_categories?.some(bpc => bpc.category_id === c.id)).map(c => c.id),
      tag_ids: initialValues?.tag_ids ?? tags.filter(t => initialValues?.blog_post_tags?.some(bpt => bpt.tag_id === t.id)).map(t => t.id),
      product_ids: initialValues?.product_ids ?? referencedProducts.map(p => p.id),
      related_post_ids: initialValues?.related_post_ids ?? relatedPosts.map(p => p.id),
    }),
  });

  // FAQ field array
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: "faqs",
  });

  const watchFaqs = watch("faqs");

  const watchTitle = watch("title");
  const watchSlug = watch("slug");
  const watchContent = watch("content");
  const watchStatus = watch("status");
  const watchImageUrl = watch("featured_image_url");
  const watchMetaTitle = watch("meta_title");
  const watchMetaDesc = watch("meta_description");
  const selectedCategoryIds = watch("category_ids") || [];
  const selectedTagIds = watch("tag_ids") || [];
  const watchReadingTime = watch("reading_time_minutes");

  // Auto-generate slug when title changes (if not locked)
  useEffect(() => {
    if (!slugLocked && watchTitle) {
      setValue("slug", slugify(watchTitle), { shouldValidate: true });
    }
  }, [watchTitle, slugLocked, setValue]);

  // Auto-update reading time based on content if not manually set
  useEffect(() => {
    if (watchContent) {
      const estimated = calculateReadingTime(watchContent);
      setValue("reading_time_minutes", estimated);
    }
  }, [watchContent, setValue]);

  // Keep product_ids & related_post_ids in sync with attached state
  useEffect(() => {
    setValue("product_ids", attachedProducts.map((p) => p.id));
  }, [attachedProducts, setValue]);

  useEffect(() => {
    setValue("related_post_ids", attachedRelatedPosts.map((p) => p.id));
  }, [attachedRelatedPosts, setValue]);

  // Handle image upload to blogs bucket
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("postId", initialValues?.id ? String(initialValues.id) : "draft");

    const res = await uploadBlogImageAction(formData);
    setUploadingImage(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    if (res?.publicUrl) {
      setValue("featured_image_url", res.publicUrl, { shouldValidate: true });
      toast.success("Featured image uploaded successfully!");
    }
  };

  // Toggle Category selection (multi-select)
  const toggleCategory = (catId) => {
    const current = selectedCategoryIds || [];
    const exists = current.includes(catId);
    const updated = exists ? current.filter((id) => id !== catId) : [...current, catId];
    setValue("category_ids", updated, { shouldValidate: true });
  };

  // Handle editor inline image upload to Supabase blogs storage bucket
  const handleEditorImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("postId", initialValues?.id ? String(initialValues.id) : "content");

    const res = await uploadBlogImageAction(formData);
    if (res?.error) {
      toast.error(res.error);
      throw new Error(res.error);
    }

    return res.publicUrl;
  };

  // Toggle Tag selection (multi-select)
  const toggleTag = (tagId) => {
    const current = selectedTagIds || [];
    const exists = current.includes(tagId);
    const updated = exists ? current.filter((id) => id !== tagId) : [...current, tagId];
    setValue("tag_ids", updated, { shouldValidate: true });
  };

  // Insert product reference card into editor at cursor & attach product
  const handleProductSelect = (product) => {
    // 1. Add to attached products list if not already there
    if (!attachedProducts.some((p) => p.id === product.id)) {
      setAttachedProducts((prev) => [...prev, product]);
    }

    // 2. If editor is available, insert clean reference card HTML
    if (editorRef.current) {
      const bannerImg = product.bannerUrl
        ? `<img src="${product.bannerUrl}" alt="${product.name}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; flex-shrink: 0;" />`
        : "";

      const priceText = product.price ? formatPrice(product.price) : "";

      const productCardHtml = `
<div class="product-reference-embed" data-product-id="${product.id}" style="margin: 1.25rem 0; padding: 0.85rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; background: #f8fafc; display: flex; align-items: center; gap: 1rem;">
  ${bannerImg}
  <div style="flex: 1; min-width: 0;">
    <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Featured Product</span>
    <p style="font-weight: 600; font-size: 0.95rem; margin: 0.2rem 0 0; color: #0f172a;">${product.name}</p>
    ${priceText ? `<p style="font-size: 0.85rem; font-weight: 700; color: #0284c7; margin: 0.25rem 0 0;">${priceText}</p>` : ""}
  </div>
</div><p></p>`;

      editorRef.current.chain().focus().insertContent(productCardHtml).run();
      toast.success(`Inserted reference to "${product.name}" into content.`);
    }

    setProductPickerOpen(false);
  };

  const removeAttachedProduct = (productId) => {
    setAttachedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleRelatedPostSelect = (post) => {
    if (!attachedRelatedPosts.some((p) => p.id === post.id)) {
      setAttachedRelatedPosts((prev) => [...prev, post]);
      toast.success(`Linked "${post.title}" as related post.`);
    }
    setRelatedPickerOpen(false);
  };

  const removeAttachedRelatedPost = (postId) => {
    setAttachedRelatedPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Submit Handler
  const onSubmit = async (values) => {
    let result;
    if (isEdit) {
      result = await updateBlogPostAction({ ...values, id: initialValues.id });
    } else {
      result = await createBlogPostAction(values);
    }

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Blog post updated!" : "Blog post created successfully!");
    router.push("/blogs");
    router.refresh();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Sticky Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon-sm" className="size-8">
              <Link href="/blogs">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {isEdit ? "Edit Blog Post" : "Create New Post"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isEdit ? `Editing: ${initialValues?.title}` : "Compose and publish a blog article"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/blogs">Discard</Link>
            </Button>

            {watchStatus === "draft" && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => {
                  setValue("status", "draft");
                  handleSubmit(onSubmit)();
                }}
              >
                <Save className="size-3.5 mr-1.5" />
                Save Draft
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : watchStatus === "published" ? (
                <Send className="size-3.5 mr-1.5" />
              ) : (
                <Check className="size-3.5 mr-1.5" />
              )}
              {isEdit ? "Update Post" : watchStatus === "published" ? "Publish Post" : "Create Post"}
            </Button>
          </div>
        </div>

        {/* Two-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Slug Card */}
            <Card className="rounded-xl border shadow-xs">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="post-title" className="text-sm font-semibold">
                    Article Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="post-title"
                    placeholder="Enter an engaging, descriptive title..."
                    className="text-lg font-semibold h-11"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Slug display with lock/unlock */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-slug" className="text-xs text-muted-foreground">
                      Permalink Slug
                    </Label>
                    <button
                      type="button"
                      onClick={() => setSlugLocked(!slugLocked)}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      {slugLocked ? (
                        <>
                          <Lock className="size-3" /> Locked
                        </>
                      ) : (
                        <>
                          <Unlock className="size-3" /> Edit freely
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center rounded-md border bg-muted/20 px-3 text-xs text-muted-foreground">
                    <span className="font-mono select-none">/blogs/</span>
                    <input
                      id="post-slug"
                      disabled={slugLocked}
                      className="h-8 flex-1 bg-transparent px-1 font-mono text-foreground focus:outline-none disabled:opacity-75"
                      {...register("slug")}
                    />
                  </div>
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-excerpt" className="text-xs font-medium">
                      Short Excerpt / Summary
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Shown in blog card previews and RSS
                    </span>
                  </div>
                  <Textarea
                    id="post-excerpt"
                    placeholder="Briefly describe the article in 1-2 sentences..."
                    rows={2}
                    className="text-sm resize-none"
                    {...register("excerpt")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rich Text Editor Card */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      Article Content
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Write formatted content using rich text, headings, lists, tables, and product references.
                    </CardDescription>
                  </div>

                  {/* Reference Product Toolbar Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium border-primary/30 hover:bg-primary/5 hover:text-primary"
                    onClick={() => setProductPickerOpen(true)}
                  >
                    <Package className="size-3.5 text-primary" />
                    Insert Product Reference
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <FormRichTextEditor
                  name="content"
                  control={control}
                  placeholder="Start writing your article here..."
                  minHeight="380px"
                  error={errors.content?.message}
                  editorRef={editorRef}
                  onUploadImage={handleEditorImageUpload}
                  extraToolbarSlot={() => (
                    <button
                      type="button"
                      onClick={() => setProductPickerOpen(true)}
                      title="Insert Product Reference Card"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Package className="size-3.5" />
                      <span>Product Embed</span>
                    </button>
                  )}
                />
              </CardContent>
            </Card>

            {/* Referenced Store Products Section */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="size-4 text-primary" />
                      Referenced Store Products ({attachedProducts.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Products linked to this post (saved in database relations and shown in article widgets).
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => setProductPickerOpen(true)}
                  >
                    <Plus className="size-3.5" />
                    Attach Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {attachedProducts.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                    No products attached yet. Click &quot;Attach Product&quot; to link products from your store.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachedProducts.map((p) => {
                      const banner = p.product_images?.find((img) => img.is_banner) || p.product_images?.[0];
                      const imageUrl = p.bannerUrl || (banner?.storage_path ? getProductAssetUrl(banner.storage_path) : null);
                      const price = p.price ?? p.product_variants?.[0]?.price;

                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-9 rounded bg-muted/50 border overflow-hidden flex items-center justify-center shrink-0">
                              {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageUrl} alt={p.name} className="size-full object-cover" />
                              ) : (
                                <Package className="size-4 text-muted-foreground/60" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate text-foreground">{p.name}</p>
                              {price != null && (
                                <p className="text-[11px] font-semibold text-primary">{formatPrice(price)}</p>
                              )}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => removeAttachedProduct(p.id)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Articles Section */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      Related Articles ({attachedRelatedPosts.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Recommend related reading at the end of the post.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => setRelatedPickerOpen(true)}
                  >
                    <Plus className="size-3.5" />
                    Link Article
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {attachedRelatedPosts.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                    No related articles linked yet. Click &quot;Link Article&quot; to associate other posts.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachedRelatedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-9 rounded bg-muted/50 border overflow-hidden flex items-center justify-center shrink-0">
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
                            <p className="text-xs font-medium truncate text-foreground">{post.title}</p>
                            <Badge variant="outline" className="text-[10px] py-0 capitalize">
                              {post.status}
                            </Badge>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeAttachedRelatedPost(post.id)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── FAQ Editor Card ── */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <HelpCircle className="size-4 text-primary" />
                      FAQs ({faqFields.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Saved to the database and used to auto-generate Schema.org FAQPage JSON-LD.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => appendFaq({ question: "", answer: "" })}
                  >
                    <Plus className="size-3.5" />
                    Add FAQ
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {faqFields.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                    No FAQs yet. Click &quot;Add FAQ&quot; to add a question &amp; answer pair.
                  </div>
                ) : (
                  faqFields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          FAQ #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFaq(index)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Question</label>
                        <input
                          placeholder="e.g. How long does laptop repair take?"
                          className="w-full h-8 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          {...register(`faqs.${index}.question`)}
                        />
                        {errors?.faqs?.[index]?.question && (
                          <p className="text-[11px] text-destructive">{errors.faqs[index].question.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Answer</label>
                        <textarea
                          rows={3}
                          placeholder="Provide a clear, concise answer..."
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                          {...register(`faqs.${index}.answer`)}
                        />
                        {errors?.faqs?.[index]?.answer && (
                          <p className="text-[11px] text-destructive">{errors.faqs[index].answer.message}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* ── Schema.org JSON-LD Card ── */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code2 className="size-4 text-primary" />
                      Schema.org JSON-LD
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Full article structured data (<code className="bg-muted px-0.5 rounded">BlogPosting</code>).
                      FAQs are merged in automatically when present.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => {
                      if (!watchTitle) {
                        toast.warning("Add a title first.");
                        return;
                      }
                      const siteUrl = "https://ranuja.in";
                      const faqs = watchFaqs?.filter(f => f.question && f.answer) ?? [];

                      // Base BlogPosting schema
                      const jsonld = {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: watchTitle,
                        description: watchMetaDesc || watchImageUrl || "",
                        url: `${siteUrl}/blogs/${watchSlug || ""}`,
                        ...(watchImageUrl ? {
                          image: {
                            "@type": "ImageObject",
                            url: watchImageUrl,
                          }
                        } : {}),
                        ...(watch("published_at") ? {
                          datePublished: new Date(watch("published_at")).toISOString(),
                          dateModified: new Date(watch("published_at")).toISOString(),
                        } : {}),
                        publisher: {
                          "@type": "Organization",
                          name: "Ranuja Enterprise",
                          url: siteUrl,
                        },
                        mainEntityOfPage: {
                          "@type": "WebPage",
                          "@id": `${siteUrl}/blogs/${watchSlug || ""}`,
                        },
                        // Merge FAQPage when FAQs are present
                        ...(faqs.length > 0 ? {
                          "@type": ["BlogPosting", "FAQPage"],
                          mainEntity: faqs.map(f => ({
                            "@type": "Question",
                            name: f.question,
                            acceptedAnswer: { "@type": "Answer", text: f.answer },
                          })),
                        } : {}),
                      };

                      setValue("schema_org_jsonld", JSON.stringify(jsonld, null, 2));
                      setJsonldError("");
                      toast.success(faqs.length > 0
                        ? "BlogPosting + FAQPage JSON-LD generated!"
                        : "BlogPosting JSON-LD generated!");
                    }}
                  >
                    <Sparkles className="size-3.5" />
                    Generate Article Schema
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Controller
                  name="schema_org_jsonld"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={12}
                      spellCheck={false}
                      placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "BlogPosting",\n  "headline": "Your article title",\n  "description": "...",\n  "url": "https://ranuja.in/blogs/your-slug"\n}'}
                      className="w-full rounded-md border border-input bg-muted/20 px-3 py-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                      onChange={(e) => {
                        field.onChange(e);
                        try {
                          if (e.target.value) JSON.parse(e.target.value);
                          setJsonldError("");
                        } catch {
                          setJsonldError("Invalid JSON — fix syntax before saving.");
                        }
                      }}
                    />
                  )}
                />
                {jsonldError && (
                  <p className="text-[11px] text-destructive font-medium">{jsonldError}</p>
                )}
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Injected as{" "}
                  <code className="bg-muted px-1 rounded text-[10px]">{'<script type="application/ld+json">'}</code>{" "}
                  on the blog detail page. Click <strong>Generate Article Schema</strong> to auto-fill from the
                  article fields above — FAQs are merged in when present. You can also paste any custom JSON-LD.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publishing Controls Card */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="post-status" className="text-xs font-medium">
                    Status
                  </Label>
                  <select
                    id="post-status"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    {...register("status")}
                  >
                    {BLOG_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Published Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="published-at" className="text-xs font-medium flex items-center gap-1.5">
                    <Calendar className="size-3 text-muted-foreground" />
                    Publish Date
                  </Label>
                  <Input
                    id="published-at"
                    type="datetime-local"
                    className="text-xs h-9"
                    {...register("published_at")}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to automatically set current time upon publishing.
                  </p>
                </div>

                {/* Author Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="author-id" className="text-xs font-medium flex items-center gap-1.5">
                    <User className="size-3 text-muted-foreground" />
                    Author
                  </Label>
                  <select
                    id="author-id"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    {...register("author_id")}
                  >
                    <option value="">Select Author (Current Admin)</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {[author.first_name, author.last_name].filter(Boolean).join(" ") || author.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Featured Post Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="is-featured"
                    type="checkbox"
                    className="size-4 rounded border-input text-primary focus:ring-ring"
                    {...register("is_featured")}
                  />
                  <Label htmlFor="is-featured" className="text-xs font-medium cursor-pointer">
                    Highlight as Featured Article
                  </Label>
                </div>

                {/* Reading Time */}
                <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" /> Reading Time:
                  </span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      className="h-7 w-14 text-xs font-medium text-right"
                      {...register("reading_time_minutes")}
                    />
                    <span>min read</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image Card */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  Featured Image
                </CardTitle>
                <CardDescription className="text-xs">
                  Thumbnail displayed in blog listings and social shares.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {watchImageUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border aspect-video bg-muted/40 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={watchImageUrl}
                      alt="Featured Preview"
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setValue("featured_image_url", "")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition flex flex-col items-center justify-center gap-2"
                  >
                    <UploadCloud className="size-6 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Click to upload image</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />

                {uploadingImage && (
                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                    <Loader2 className="size-3.5 animate-spin" /> Uploading image to storage...
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="img-url" className="text-[11px] text-muted-foreground">
                    Or paste image URL directly:
                  </Label>
                  <Input
                    id="img-url"
                    placeholder="https://images.unsplash.com/..."
                    className="h-8 text-xs font-mono"
                    {...register("featured_image_url")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="img-alt" className="text-[11px] text-muted-foreground">
                    Image Alt Text:
                  </Label>
                  <Input
                    id="img-alt"
                    placeholder="Describe image for accessibility & SEO"
                    className="h-8 text-xs"
                    {...register("featured_image_alt")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Card (Multi-select) */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Folder className="size-4 text-primary" />
                    Categories
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary font-medium hover:bg-primary/10"
                    onClick={() => setCategoryModalOpen(true)}
                  >
                    + Manage
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Select one or more categories for this post.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {activeCategories.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2 text-center">
                    No categories found.{" "}
                    <button
                      type="button"
                      onClick={() => setCategoryModalOpen(true)}
                      className="text-primary underline"
                    >
                      Create one
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {activeCategories.map((cat) => {
                      const isChecked = selectedCategoryIds.includes(cat.id);
                      return (
                        <label
                          key={cat.id}
                          className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition ${
                            isChecked ? "bg-primary/10 border-primary/40 font-medium" : "bg-card hover:bg-muted/40"
                          }`}
                        >
                          <span>{cat.name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat.id)}
                            className="size-3.5 rounded text-primary focus:ring-ring"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags Card (Multi-select) */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Hash className="size-4 text-primary" />
                    Tags
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary font-medium hover:bg-primary/10"
                    onClick={() => setTagModalOpen(true)}
                  >
                    + Manage
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Assign topical keywords to this post.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {activeTags.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2 text-center">
                    No tags found.{" "}
                    <button
                      type="button"
                      onClick={() => setTagModalOpen(true)}
                      className="text-primary underline"
                    >
                      Create tags
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {activeTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-2 py-1 rounded-md text-xs transition font-medium ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          #{tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO & Metadata Card */}
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  SEO & Social Metadata
                </CardTitle>
                <CardDescription className="text-xs">
                  Optimize how this article appears on Google and social feeds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="meta-title" className="text-xs">
                      Meta Title
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {(watchMetaTitle || watchTitle || "").length}/60
                    </span>
                  </div>
                  <Input
                    id="meta-title"
                    placeholder={watchTitle || "Enter SEO title..."}
                    className="h-8 text-xs"
                    {...register("meta_title")}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="meta-desc" className="text-xs">
                      Meta Description
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {(watchMetaDesc || "").length}/160
                    </span>
                  </div>
                  <Textarea
                    id="meta-desc"
                    placeholder="Concise summary for search engines..."
                    rows={2}
                    className="text-xs resize-none"
                    {...register("meta_description")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="canonical-url" className="text-xs">
                    Canonical URL (optional)
                  </Label>
                  <Input
                    id="canonical-url"
                    placeholder="https://example.com/original-article"
                    className="h-8 text-xs font-mono"
                    {...register("canonical_url")}
                  />
                </div>

                {/* Google Search Snippet Preview */}
                <div className="border rounded-lg p-3 bg-muted/20 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Google Search Preview
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono truncate">
                    https://yourwebsite.com/blogs/{watchSlug || "article-slug"}
                  </p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate">
                    {watchMetaTitle || watchTitle || "Article Title | Your Website"}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {watchMetaDesc || "Add a meta description to see how this post will preview in search results."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Category Sidebar Sheet */}
      <BlogCategorySheet
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onSuccess={async () => {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data } = await supabase.from("blog_categories").select("id, name, slug").order("name");
          if (data) setActiveCategories(data);
        }}
      />

      {/* Tag Sidebar Sheet */}
      <BlogTagSheet
        open={tagModalOpen}
        onOpenChange={setTagModalOpen}
        onSuccess={async () => {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data } = await supabase.from("blog_tags").select("id, name, slug").order("name");
          if (data) setActiveTags(data);
        }}
      />

      {/* Product Reference Picker Modal */}
      <ProductReferencePickerModal
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        alreadySelectedIds={attachedProducts.map((p) => p.id)}
        onSelectProduct={handleProductSelect}
      />

      {/* Related Posts Picker Modal */}
      <RelatedPostsPickerModal
        open={relatedPickerOpen}
        onOpenChange={setRelatedPickerOpen}
        currentPostId={initialValues?.id}
        alreadySelectedIds={attachedRelatedPosts.map((p) => p.id)}
        onSelectPost={handleRelatedPostSelect}
      />
    </>
  );
}
