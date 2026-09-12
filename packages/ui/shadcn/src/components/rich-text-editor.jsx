"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Redo,
  RemoveFormatting,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo,
  Unlink,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
  className,
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent button clicks from stealing focus or collapsing editor selection
        e.preventDefault();
      }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30",
        isActive
          ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="bg-border my-1 h-5 w-[1px] shrink-0" />;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write product description...",
  disabled = false,
  error = false,
  minHeight = "180px",
  className,
  id,
  allowTables = true,
  onInsertSpecTemplate,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const savedSelectionRef = useRef(null);
  const linkInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
        },
        orderedList: {
          keepMarks: true,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 hover:opacity-80 transition-colors font-medium",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      ...(allowTables
        ? [
            Table.configure({
              resizable: true,
              HTMLAttributes: {
                class: "border-collapse table-auto w-full text-sm my-4 border border-border rounded-lg overflow-hidden",
              },
            }),
            TableRow,
            TableHeader.configure({
              HTMLAttributes: {
                class: "border border-border bg-muted/60 px-3 py-2 text-left font-semibold text-foreground text-xs uppercase tracking-wider",
              },
            }),
            TableCell.configure({
              HTMLAttributes: {
                class: "border border-border px-3 py-2 text-foreground/90 align-top",
              },
            }),
          ]
        : []),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      const isEditorEmpty = currentEditor.isEmpty;
      const html = isEditorEmpty ? "" : currentEditor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert max-w-none focus:outline-none px-4 py-3 text-sm leading-relaxed text-foreground",
          "[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:h-0",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2",
          "[&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1",
          "[&_p]:mb-2",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2",
          "[&_li]:my-0.5",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-muted-foreground",
          "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
          "[&_hr]:my-4 [&_hr]:border-border",
          "[&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:my-3 [&_table]:rounded-lg [&_table]:overflow-hidden",
          "[&_th]:border [&_th]:border-border [&_th]:bg-muted/70 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_th]:text-xs",
          "[&_td]:border [&_td]:border-border [&_td]:p-2.5 [&_td]:text-foreground/90 [&_td]:text-sm",
          "[&_.selectedCell]:bg-primary/10"
        ),
      },
    },
  });

  // Keep editable state in sync
  useEffect(() => {
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  // Keep external value in sync when value changes from outside (e.g. form reset or async load)
  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.isEmpty ? "" : editor.getHTML();
    const normalizedValue = value || "";

    if (normalizedValue !== currentHtml) {
      editor.commands.setContent(normalizedValue, false);
    }
  }, [value, editor]);

  // Focus link input when opened
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
      linkInputRef.current.select();
    }
  }, [showLinkInput]);

  const handleOpenLinkModal = () => {
    if (!editor) return;

    // Snapshot current selection before focus shifts
    const { from, to } = editor.state.selection;
    const isCollapsed = from === to;
    const selectedText = isCollapsed
      ? ""
      : editor.state.doc.textBetween(from, to, " ");
    const previousUrl = editor.getAttributes("link").href || "";

    savedSelectionRef.current = { from, to, isCollapsed, selectedText };
    setLinkUrl(previousUrl);
    setLinkText(selectedText);
    setShowLinkInput(true);
  };

  const handleApplyLink = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!editor) return;

    const trimmedUrl = linkUrl.trim();
    const saved = savedSelectionRef.current;

    if (!trimmedUrl) {
      // If URL is empty, remove link
      if (saved && !saved.isCollapsed) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: saved.from, to: saved.to })
          .unsetLink()
          .run();
      } else {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      }
      setShowLinkInput(false);
      setLinkUrl("");
      setLinkText("");
      return;
    }

    let finalUrl = trimmedUrl;
    if (
      !/^https?:\/\//i.test(finalUrl) &&
      !/^mailto:/i.test(finalUrl) &&
      !/^tel:/i.test(finalUrl)
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    if (saved && !saved.isCollapsed) {
      // Selected text exists -> apply link to the exact range
      editor
        .chain()
        .focus()
        .setTextSelection({ from: saved.from, to: saved.to })
        .setLink({ href: finalUrl })
        .run();
    } else if (editor.isActive("link")) {
      // Cursor inside an existing link
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl })
        .run();
    } else {
      // No text selected -> insert text with link
      const textToInsert = linkText.trim() || finalUrl;
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: textToInsert,
          marks: [{ type: "link", attrs: { href: finalUrl } }],
        })
        .run();
    }

    setShowLinkInput(false);
    setLinkUrl("");
    setLinkText("");
  };

  const handleCancelLink = () => {
    setShowLinkInput(false);
    setLinkUrl("");
    setLinkText("");
    if (editor) {
      editor.commands.focus();
    }
  };

  const handleInsertTable = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
      .run();
  };

  if (!isMounted || !editor) {
    return (
      <div
        className={cn(
          "rounded-xl border border-input bg-card shadow-xs transition-colors",
          error && "border-destructive",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        <div className="flex h-11 items-center gap-1 border-b border-border px-3 py-1.5 bg-muted/20 animate-pulse">
          <div className="h-6 w-24 rounded-md bg-muted" />
          <div className="h-6 w-32 rounded-md bg-muted" />
          <div className="h-6 w-20 rounded-md bg-muted" />
        </div>
        <div style={{ minHeight }} className="p-4 text-muted-foreground text-sm">
          {value ? "Loading editor..." : placeholder}
        </div>
      </div>
    );
  }

  const isTableActive = editor.isActive("table");

  return (
    <div
      id={id}
      className={cn(
        "group relative rounded-xl border border-input bg-card shadow-xs transition-all focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
        error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
        disabled && "pointer-events-none cursor-not-allowed opacity-50 bg-muted/40",
        className
      )}
    >
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-border bg-card/95 px-2 py-1.5 backdrop-blur-xs">
        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <AlignJustify className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists & Blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="size-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Links */}
        <ToolbarButton
          onClick={handleOpenLinkModal}
          isActive={editor.isActive("link")}
          title="Attach / Edit Link"
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        {editor.isActive("link") ? (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            <Unlink className="size-4" />
          </ToolbarButton>
        ) : null}

        {allowTables ? (
          <>
            <ToolbarSeparator />
            {/* Tables */}
            <ToolbarButton
              onClick={handleInsertTable}
              isActive={isTableActive}
              title={isTableActive ? "Table selected" : "Insert Table (3x2)"}
            >
              <TableIcon className="size-4" />
            </ToolbarButton>

            {isTableActive ? (
              <div className="flex items-center gap-0.5 rounded-lg border border-primary/30 bg-primary/5 px-1 py-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title="Add Row Below"
                  className="inline-flex h-7 items-center gap-0.5 rounded px-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Plus className="size-3" /> Row
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title="Delete Row"
                  className="inline-flex h-7 items-center rounded px-1 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Minus className="size-3" />
                </button>
                <div className="bg-border my-0.5 h-4 w-[1px]" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title="Add Column Right"
                  className="inline-flex h-7 items-center gap-0.5 rounded px-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Plus className="size-3" /> Col
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  title="Delete Column"
                  className="inline-flex h-7 items-center rounded px-1 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Minus className="size-3" />
                </button>
                <div className="bg-border my-0.5 h-4 w-[1px]" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  title="Delete Entire Table"
                  className="inline-flex h-7 items-center gap-1 rounded px-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ) : (
              <></>
            )}
          </>
        ) : null}

        <ToolbarSeparator />

        {/* Clear formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="size-4" />
        </ToolbarButton>
      </div>

      {/* Inline Link Popover / Input Bar */}
      {showLinkInput ? (
        <div
          role="region"
          aria-label="Link toolbar"
          className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 p-2.5 text-sm transition-all"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <LinkIcon className="size-3.5" />
            <span>Link URL:</span>
          </div>
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com or mailto:support@..."
            className="h-8 flex-1 min-w-[200px] rounded-md border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleApplyLink(e);
              } else if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                handleCancelLink();
              }
            }}
          />

          {savedSelectionRef.current?.isCollapsed ? (
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Display text (optional)"
              className="h-8 w-44 rounded-md border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApplyLink(e);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancelLink();
                }
              }}
            />
          ) : (
            <span className="max-w-[140px] truncate text-xs text-muted-foreground italic">
              Target: &quot;{savedSelectionRef.current?.selectedText}&quot;
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleApplyLink}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium shadow-xs cursor-pointer"
              title="Apply Link"
            >
              <Check className="size-3.5" />
              Apply
            </button>
            <button
              type="button"
              onClick={handleCancelLink}
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-md text-xs cursor-pointer"
              title="Cancel (Esc)"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Editor Content Area */}
      <div
        style={{ minHeight }}
        className="cursor-text"
        onClick={() => {
          if (!editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
