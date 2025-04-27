import { UploadCloud, File, Loader, BookOpen } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
// 🆕  UI components for the language dropdown
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/**
 * Reader page
 * ────────────────────────────────────────────────────────────
 * Implements client-side viewing for PDF (native iframe),
 * EPUB (epub.js), and DOCX (mammoth).
 * Translation panel is a placeholder – wire it to Flask later.
 */

const languages = [
    "English",
    "Russian",
    "Arabic",
    "Hindi",
    "Indonesian",
    "Portuguese",
    "Bengali",
    "Turkish",
    "Somali",
    "Chinese",
    "Spanish",
    "French",
    "German",
    "Japanese",
    "Korean",
];

const models = [
    "gemini-2.5-flash-preview-04-17",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "llama-3.3-70b-versatile",
    "qwen-qwq-32b",
  ];

const Reader = () => {
  //#region ───────────── Types & State ─────────────
  type UploadedFile = { file: File; url: string; id: string };
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [response, setResponse] = useState<any>(null); // Store the backend response
  const [translations, setTranslations] = useState<
    { id: string; selectedText: string; context: string; response: any; expanded: boolean }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  // 🆕  state for the currently-chosen language
  const [targetLanguage, setTargetLanguage] = useState<string>(languages[0]);
  const [targetModel, setTargetModel] = useState<string>(models[0]);

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

  const handleTextSelect = async (text: string, context: string, language: string) => {
    setSelectedText(text);
    setContext(context);
    await sendToBackend(text, context, language);
  };

  const sendToBackend = async (text: string, context: string, language: string) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: targetModel,
          target_words: text,
          context: context,
          target_language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch translation");
      }

      const data = await response.json();

      setTranslations((prev) => [
        { id: crypto.randomUUID(), selectedText: text, context, response: data, expanded: true },
        ...prev.map((t) => ({ ...t, expanded: false })),
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setTranslations((prev) =>
      prev.map((t) => ({ ...t, expanded: t.id === id ? !t.expanded : false }))
    );
  };

  //#endregion

  const activeFile = files.find((f) => f.id === activeId) || null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* ───────────── Main layout ───────────── */}
      <main className="flex-1 pt-16 flex overflow-hidden">
        {/* Library Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-border bg-surface overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
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
            {/* 🆕 Language dropdown */}
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="w-full mb-2">
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select defaultValue={targetModel} onValueChange={setTargetModel}>
              <SelectTrigger className="w-full mb-2">
                <SelectValue placeholder="Choose model" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {/* Empty-state uploader for small screens */}
        {files.length === 0 && (
          <DropZone onDrop={onDrop} onClick={() => inputRef.current?.click()} />
        )}

        {/* Active reader panes */}
        {activeFile && (
          <section className="flex-1 grid grid-cols-12">
            <div className="col-span-12 md:col-span-8 lg:col-span-9 border-r border-border overflow-auto">
              <div className="h-full">
                <DocumentViewer
                  file={activeFile}
                  onTextSelect={handleTextSelect}
                  targetLanguage={targetLanguage}
                />
              </div>
            </div>
            <div className="hidden md:block col-span-4 lg:col-span-3 h-full">
              <TranslationPanel
                translations={translations}
                loading={loading}
                toggleExpand={toggleExpand}
              />
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

/** Drop-zone for first-time upload */
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
const DocumentViewer = ({
  file,
  onTextSelect,
  targetLanguage,
}: {
  file: { file: File; url: string };
  onTextSelect: (selectedText: string, context: string, language: string) => void;
  targetLanguage: string;
}) => {
  const type = getType(file.file.name);
  switch (type) {
    case "pdf":
      return <PdfViewer url={file.url} />;
      case "epub":
        return (
          <EpubViewer
            url={file.url}
            file={file.file}
            onTextSelect={onTextSelect}
            targetLanguage={targetLanguage}
          />
        );
      
    case "docx":
      return (
        <DocxViewer
          file={file.file}
          onTextSelect={onTextSelect}
          targetLanguage={targetLanguage}
        />
      );
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
 */
const PdfViewer = ({ url }: { url: string }) => (
  <iframe src={url} title="PDF document" className="w-full h-full" style={{ border: "none" }} />
);

/** EPUB Viewer – epub.js (v0.3.x) */
import ePub, { Book, Rendition } from "epubjs";
const EpubViewer = ({
  url,
  file,
  onTextSelect,
  targetLanguage,
}: {
  url: string;
  file: File;
  onTextSelect: (selectedText: string, context: string, language: string) => void;
  targetLanguage: string;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  //to keep track of the pages 
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inputPage, setInputPage] = useState<number>(1);

  useEffect(() => {
    const init = async () => {
      if (!containerRef.current) return;

      //Actually read the file
      const arrayBuffer = await file.arrayBuffer();

      //Pass raw bytes, NOT blob url
      bookRef.current = ePub(arrayBuffer);

      renditionRef.current = bookRef.current.renderTo(containerRef.current, {
        width: "100%",
        height: "100%",
      });
      renditionRef.current.display();

      await bookRef.current.ready;
      await bookRef.current.locations.generate(5000);

      setTotalPages(bookRef.current.locations.length())
      renditionRef.current.on("relocated", (location) => {
        if (!bookRef.current?.locations || !location?.start?.cfi) {
          setCurrentPage(1);
          return;
        }
      
        const percentage = bookRef.current.locations.percentageFromCfi(location.start.cfi);
        const page = Math.round(percentage * bookRef.current.locations.length()); // 🔥
        setCurrentPage(page || 1);
      });

      // Add text selection capture
      renditionRef.current.on('selected', (cfiRange, contents) => {
        const selection = contents.window.getSelection()?.toString();
        if (selection && selection.trim().length > 0) {
          const selectedText = selection.trim();
          const context = selectedText;
          onTextSelect(selectedText, context, targetLanguage);
        }
      });
    };
    init();

    return () => {
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
    };
  }, [file]);

  const goNext = () => {
    renditionRef.current?.next();
  };

  const goPrev = () => {
    renditionRef.current?.prev();
  };

  const goToPage = (pageNum: number) => {
    if (!bookRef.current || !renditionRef.current || totalPages === 0) return;
  
    const location = pageNum-1; // 🔥 Page number → location % (0 to 1)
    const cfi = bookRef.current.locations.cfiFromPercentage(location);
  
    if (cfi) {
      renditionRef.current.display(cfi);
    }
  };

  return (
    <div className="flex flex-col h-full">
    {/* 🆕 Page Controls */}
    <div className="flex justify-center p-2 gap-2 border-b border-border items-center">
      <button onClick={goPrev} className="px-3 py-2 bg-gray-200 rounded">
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={goNext} className="px-3 py-2 bg-gray-200 rounded">
        Next
      </button>
      <input
        type="number"
        min="1"
        max={totalPages}
        value={inputPage}
        placeholder="Page #"
        onChange={(e) => {
          const value = parseInt(e.target.value);
          if (!isNaN(value)) {
            setInputPage(value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            goToPage(inputPage);
          }
        }}
        className="w-16 border p-1 rounded text-center"
      />
    </div>
  
    {/* 🆕 EPUB Viewer */}
    <div ref={containerRef} className="flex-1 overflow-auto" />
  </div>
  
  );

 // return <div ref={containerRef} className="h-full" />;
};


/** DOCX Viewer – convert to HTML via mammoth.browser */
const DocxViewer = ({
  file,
  onTextSelect,
  targetLanguage,
}: {
  file: File;
  onTextSelect: (selectedText: string, context: string, language: string) => void;
  targetLanguage: string;
}) => {
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

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();
      const parentElement = selection.anchorNode?.parentElement;
      const fullText = parentElement?.textContent || "";
      const context = getContext(selectedText, fullText);
      onTextSelect(selectedText, context, targetLanguage);
    }
  };

  const getContext = (selected: string, fullText: string) => {
    const words = fullText.split(/\s+/);
    const selectedWords = selected.trim().split(/\s+/);
    const scope = selectedWords.length * 5;

    const selectionIndex = words.findIndex((_, idx) =>
      words.slice(idx, idx + selectedWords.length).join(" ") === selected
    );

    if (selectionIndex === -1) return fullText;

    const start = Math.max(0, selectionIndex - scope);
    const end = Math.min(words.length, selectionIndex + selectedWords.length + scope);

    const contextWords = words.slice(start, end);
    return contextWords.join(" ");
  };

  if (!html) return <LoaderSpinner />;
  return (
    <article
      className="prose lg:prose-lg mx-auto p-8"
      dangerouslySetInnerHTML={{ __html: html }}
      onMouseUp={handleMouseUp}
    />
  );
};

/** Translation placeholder */
const TranslationPanel = ({
  translations,
  loading,
  toggleExpand,
}: {
  translations: { id: string; selectedText: string; context: string; response: any; expanded: boolean }[];
  loading: boolean;
  toggleExpand: (id: string) => void;
}) => (
  <div className="h-full flex flex-col overflow-auto">
    <Card className="flex-1 rounded-none border-l-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Translations
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 overflow-auto px-4 py-2 text-sm text-secondary">
        {loading && <LoaderSpinner />}
        {translations.map((t) => (
          <div
            key={t.id}
            className={`border rounded p-3 mb-2 cursor-pointer ${
              t.expanded ? "border-primary bg-gray-100" : "border-gray-300"
            }`}
            onClick={() => toggleExpand(t.id)}
          >
            {t.expanded ? (
              <div>
                <p>
                  <strong>Selected Text:</strong> {t.selectedText}
                </p>
                {t.response.translation !== "X" && (
                  <p>
                    <strong>Translation:</strong> {t.response.translation}
                  </p>
                )}
                {t.response.definition !== "X" && (
                  <p>
                    <strong>Definition:</strong> {t.response.definition}
                  </p>
                )}
                {t.response.explanation !== "X" && (
                  <p>
                    <strong>Explanation:</strong> {t.response.explanation}
                  </p>
                )}
                {t.response.synonyms !== "X" && (
                  <p>
                    <strong>Synonyms:</strong> {t.response.synonyms}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="truncate">
                  <strong>Selected Text:</strong> {t.selectedText}
                </p>
              </div>
            )}
          </div>
        ))}
        {!loading && translations.length === 0 && (
          <p className="text-center text-secondary">Highlight text to see translations here.</p>
        )}
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