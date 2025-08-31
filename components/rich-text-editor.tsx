"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Enter product description...",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState(content);
  const [activeTab, setActiveTab] = useState("visual");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onChange(html);
    },
    immediatelyRender: false,
  });

  // Sync content when prop changes
  useEffect(() => {
    if (editor && content !== htmlContent) {
      setHtmlContent(content);
      editor.commands.setContent(content);
    }
  }, [content, editor, htmlContent]);

  // Handle tab switching
  const handleTabChange = (tab: string) => {
    if (tab === "html" && editor) {
      // Switching to HTML mode - get current content
      const currentHtml = editor.getHTML();
      setHtmlContent(currentHtml);
    } else if (tab === "visual" && editor) {
      // Switching to visual mode - set HTML content
      editor.commands.setContent(htmlContent);
    }
    setActiveTab(tab);
  };

  // Handle HTML textarea changes
  const handleHtmlChange = (value: string) => {
    setHtmlContent(value);
    onChange(value);
  };

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .toggleLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setIsLinkPopoverOpen(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setIsLinkPopoverOpen(false);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="border rounded-md">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b p-2">
          <TabsList className="h-8">
            <TabsTrigger value="visual" className="text-xs px-2 py-1">
              Visual
            </TabsTrigger>
            <TabsTrigger value="html" className="text-xs px-2 py-1">
              <Code className="h-3 w-3 mr-1" />
              HTML
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Visual Editor Tab */}
        <TabsContent value="visual" className="m-0">
          <div className="flex flex-wrap gap-1 border-b p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "bg-accent" : ""}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "bg-accent" : ""}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "bg-accent" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "bg-accent" : ""}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px bg-border mx-1" />
            <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={editor.isActive("link") ? "bg-accent" : ""}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      type="url"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLink();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" size="sm" onClick={removeLink}>
                      Remove Link
                    </Button>
                    <Button type="button" size="sm" onClick={addLink}>
                      Add Link
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <div className="w-px bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <EditorContent 
            editor={editor} 
            className="prose prose-sm max-w-none p-3 min-h-[150px] focus:outline-none"
            placeholder={placeholder}
          />
        </TabsContent>

        {/* HTML Editor Tab */}
        <TabsContent value="html" className="m-0">
          <Textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            placeholder="Edit HTML directly..."
            className="min-h-[200px] font-mono text-sm border-0 focus:ring-0 resize-none"
            rows={10}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}