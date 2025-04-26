import { UploadCloud, File, Loader, BookOpen } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Reader page
 * ────────────────────────────────────────────────────────────
 * Implements client‑side viewing for PDF (native iframe),
 * EPUB (epub.js), and DOCX (mammoth).
 * Translation panel is a placeholder – wire it to Flask later.
 */

const Reader = () => {
  //#region ───────────── Types & State ─────────────
  type UploadedFile = { file: File; url: string; id: string };
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  //#endregion

  //#region ───────────── Upload helpers ────────────
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    const newFiles: UploadedFile[] = Array.from(fl).map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      id: crypto.randomUUID(),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    if (newFiles.length) setActiveId(newFiles[0].id);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );
  //#endregion

  const activeFile = files.find((f) => f.id === activeId) || null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* ───────────── Main layout ───────────── */}
      <main className="flex-1 pt-16 flex overflow-hidden">
        {/* Library Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-border bg-surface overflow-y-auto">
          <div className="p-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold flex-1">Your Library</h2>
            <Button size="icon" variant="ghost" onClick={() => inputRef.current?.click()}>
              <UploadCloud className="w-5 h-5" />
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.epub,.docx"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-4rem)] p-2 pr-0">
            {files.length === 0 && <p className="text-center text-secondary mt-10">No files yet.</p>}
            {files.map((f) => (
              <Button
                key={f.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 mb-1 px-3 py-2 rounded-lg",
                  activeId === f.id && "bg-accent/20"
                )}
                onClick={() => setActiveId(f.id)}
              >
                <File className="w-4 h-4" />
                <span className="truncate flex-1 text-left">{f.file.name}</span>
              </Button>
            ))}
          </ScrollArea>
        </aside>

        {/* Empty‑state uploader for small screens */}
        {files.length === 0 && (
          <DropZone onDrop={onDrop} onClick={() => inputRef.current?.click()} />
        )}

        {/* Active reader panes */}
        {activeFile && (
          <section className="flex-1 grid grid-cols-12">
            <div className="col-span-12 md:col-span-8 lg:col-span-9 border-r border-border overflow-auto">
              <DocumentViewer file={activeFile} />
            </div>
            <div className="hidden md:block col-span-4 lg:col-span-3 h-full">
              <TranslationPanel />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Reader;

//#region ─────────── Components ───────────

/** Drop‑zone for first‑time upload */
const DropZone = ({ onDrop, onClick }: { onDrop: any; onClick: any }) => (
  <div
    className="flex-1 flex flex-col items-center justify-center cursor-pointer"
    onDragOver={(e) => e.preventDefault()}
    onDrop={onDrop}
    onClick={onClick}
  >
    <UploadCloud className="w-10 h-10 mb-4" />
    <p className="text-lg font-medium">Click or drop files here</p>
    <p className="text-secondary text-sm mt-1">PDF, EPUB, DOCX</p>
  </div>
);

/** Determine renderer by file extension */
const getType = (name: string) => {
  if (name.match(/\.pdf$/i)) return "pdf";
  if (name.match(/\.epub$/i)) return "epub";
  if (name.match(/\.docx$/i)) return "docx";
  return "unknown";
};

/** Wrapper to choose renderer */
const DocumentViewer = ({ file }: { file: { file: File; url: string } }) => {
  const type = getType(file.file.name);
  switch (type) {
    case "pdf":
      return <PdfViewer url={file.url} />;
    case "epub":
      return <EpubViewer url={file.url} />;
    case "docx":
      return <DocxViewer file={file.file} />;
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-secondary">Unsupported file type</p>
        </div>
      );
  }
};

/**
 * PDF Viewer – native browser rendering via iframe
 * ------------------------------------------------------------------
 * We rely on the browser's built‑in PDF renderer, which removes the
 * need for react‑pdf / pdfjs‑dist. Most modern browsers (Chrome,
 * Edge, Safari, Firefox) support this natively. The iframe is sized
 * to fill the available reader pane.
 */
const PdfViewer = ({ url }: { url: string }) => (
  <iframe
    src={url}
    title="PDF document"
    className="w-full h-full"
    style={{ border: "none" }}
  />
);

/** EPUB Viewer – epub.js (v0.3.x) */
import ePub, { Book, Rendition } from "epubjs";
const EpubViewer = ({ url }: { url: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!containerRef.current) return;
      bookRef.current = ePub(url, {});
      renditionRef.current = bookRef.current.renderTo(containerRef.current, {
        width: "100%",
        height: "100%",
      });
      renditionRef.current.display();
    };
    init();
    return () => {
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
    };
  }, [url]);

  return <div ref={containerRef} className="h-full" />;
};

/** DOCX Viewer – convert to HTML via mammoth.browser */
const DocxViewer = ({ file }: { file: File }) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { default: mammoth } = await import("mammoth/mammoth.browser");
      const arrayBuffer = await file.arrayBuffer();
      const { value } = await mammoth.convertToHtml({ arrayBuffer });
      setHtml(value);
    };
    load();
  }, [file]);

  if (!html) return <LoaderSpinner />;
  return (
    <article
      className="prose lg:prose-lg mx-auto p-8"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/** Translation placeholder */
const TranslationPanel = () => (
  <div className="h-full flex flex-col">
    <Card className="flex-1 rounded-none border-l-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Translation & Context
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 overflow-auto px-6 py-4 text-sm text-secondary">
        Highlight text in the document to see translations and contextual examples
        here. Hook this panel up to your Flask backend.
      </CardContent>
    </Card>
  </div>
);

/** Loader */
const LoaderSpinner = () => (
  <div className="flex items-center justify-center py-20 animate-pulse text-primary">
    <Loader className="w-6 h-6" />
  </div>
);

//#endregion
