import { UploadCloud, File, Loader, BookOpen, X } from "lucide-react";
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
 * Implements client-side viewing for
 * EPUB (epub.js), DOCX (mammoth), and TXT (plain‑text).
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
  "llama-3.1-8b-instant",
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
    {
      id: string;
      selectedText: string;
      context: string;
      response: any;
      expanded: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  // 🆕  state for the currently-chosen language
  const [targetLanguage, setTargetLanguage] = useState<string>(languages[0]);
  const [targetModel, setTargetModel] = useState<string>(models[0]);

  // Clear everything
  const clearTranslations = useCallback(() => {
    setTranslations([]);
    setSelectedText("");
    setContext("");
    setResponse(null);
  }, []);

  // ─── Clear on switch ───────────────────────────────────────────────────────────
  useEffect(() => {
    // whenever language, model or file changes, wipe out all previous translations
    setTranslations([]);
    setSelectedText("");
    setContext("");
    setResponse(null);
  }, [targetLanguage, targetModel, activeId]);

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

  const handleTextSelect = async (
    text: string,
    context: string,
    language: string
  ) => {
    setSelectedText(text);
    setContext(context);
    await sendToBackend(text, context, language);
  };

  const sendToBackend = async (
    text: string,
    context: string,
    language: string
  ) => {
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
        {
          id: crypto.randomUUID(),
          selectedText: text,
          context,
          response: data,
          expanded: true,
        },
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
                accept=".epub,.docx,.txt"
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
            {files.length === 0 && (
              <p className="text-center text-secondary mt-10">No files yet.</p>
            )}
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
        {files.length === 0 && <DropZone onDrop={onDrop} onClick={() => inputRef.current?.click()} />}

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
                clearTranslations={clearTranslations}
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
    <p className="text-secondary text-sm mt-1">EPUB, DOCX, TXT</p>
  </div>
);

/** Determine renderer by file extension */
const getType = (name: string) => {
  if (name.match(/\.epub$/i)) return "epub";
  if (name.match(/\.docx$/i)) return "docx";
  if (name.match(/\.txt$/i)) return "txt";
  return "unknown";
};

/** Wrapper to choose renderer */
const DocumentViewer = ({
  file,
  onTextSelect,
  targetLanguage,
}: {
  file: { file: File; url: string };
  onTextSelect: (
    selectedText: string,
    context: string,
    language: string
  ) => void;
  targetLanguage: string;
}) => {
  const type = getType(file.file.name);
  switch (type) {
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
    case "txt":
      return (
        <TextViewer
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

/** EPUB Viewer – epub.js (v0.3.x) */
import ePub, { Book, Rendition } from "epubjs";
import { set } from "date-fns";
const EpubViewer = ({
  url,
  file,
  onTextSelect,
  targetLanguage,
}: {
  url: string;
  file: File;
  onTextSelect: (
    selectedText: string,
    context: string,
    language: string
  ) => void;
  targetLanguage: string;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  //to keep track of the pages
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const init = async () => {
      if (!containerRef.current) return;

      renditionRef.current?.destroy();
      bookRef.current?.destroy();

      // Reset states
      setCurrentPage(1);
      setTotalPages(0);

      // Load the EPUB file
      const arrayBuffer = await file.arrayBuffer();
      bookRef.current = ePub(arrayBuffer);

      renditionRef.current = bookRef.current.renderTo(containerRef.current, {
        width: "100%",
        height: "100%",
        flow: "paginated", // Use paginated flow
      });
      renditionRef.current.display();

      bookRef.current.loaded.spine.then((spine) => {
        if (spine) {
          setTotalPages(spine.length);
        }
      });

      // Add text selection capture
      renditionRef.current.on("selected", (cfiRange, contents) => {
        const selection = contents.window.getSelection()?.toString();
        if (selection && selection.trim().length > 0) {
          const selectedText = selection.trim();
          const context = selectedText; // For EPUB, we can use the selected text as context
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

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      renditionRef.current?.next();
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      renditionRef.current?.prev();
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-2 bg-gray-100 border-b">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto" />
    </div>
  );
};

/** DOCX Viewer – convert to HTML via mammoth.browser */
const DocxViewer = ({
  file,
  onTextSelect,
  targetLanguage,
}: {
  file: File;
  onTextSelect: (
    selectedText: string,
    context: string,
    language: string
  ) => void;
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
    const end = Math.min(
      words.length,
      selectionIndex + selectedWords.length + scope
    );

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

/** TXT Viewer – read plain text and render */
const TextViewer = ({
  file,
  onTextSelect,
  targetLanguage,
}: {
  file: File;
  onTextSelect: (
    selectedText: string,
    context: string,
    language: string
  ) => void;
  targetLanguage: string;
}) => {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const content = await file.text();
      setText(content);
    };
    load();
  }, [file]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();
      const fullText = text || "";
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
    const end = Math.min(
      words.length,
      selectionIndex + selectedWords.length + scope
    );

    const contextWords = words.slice(start, end);
    return contextWords.join(" ");
  };

  if (!text) return <LoaderSpinner />;

  return (
    <pre
      className="whitespace-pre-wrap p-8 max-w-none"
      onMouseUp={handleMouseUp}
    >
      {text}
    </pre>
  );
};

/** Translation placeholder */
const TranslationPanel = ({
  translations,
  loading,
  toggleExpand,
  clearTranslations,
}: {
  translations: {
    id: string;
    selectedText: string;
    context: string;
    response: any;
    expanded: boolean;
  }[];
  loading: boolean;
  toggleExpand: (id: string) => void;
  clearTranslations: () => void;
}) => (
  <div className="h-full flex flex-col overflow-auto">
    <Card className="flex-1 rounded-none border-l-0">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Translations
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={clearTranslations}
            disabled={translations.length === 0}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
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
          <p className="text-center text-secondary">
            Highlight text to see translations here.
          </p>
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
