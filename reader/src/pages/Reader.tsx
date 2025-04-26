import { useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Document, Page, pdfjs } from "react-pdf";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Reader = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<"pdf" | "epub" | "docx" | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            
            const extension = selectedFile.name.split('.').pop()?.toLowerCase();
            if (extension === "pdf") {
                setFileType("pdf");
            } else if (extension === "epub") {
                setFileType("epub");
            } else if (extension === "docx") {
                setFileType("docx");
            } else {
                alert("Unsupported file format. Please upload a PDF, EPUB, or DOCX file.");
                setFile(null);
                setFileType(null);
            }
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const renderDocumentViewer = () => {
        if (!file) {
            return (
                <div className="flex flex-col items-center justify-center h-[70vh] border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">Upload a PDF, EPUB, or DOCX file to view</p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                    >
                        Select File
                    </button>
                </div>
            );
        }

        switch (fileType) {
            case "pdf":
                return (
                    <div className="pdf-container h-[70vh] overflow-auto bg-white rounded-lg shadow-md">
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="flex flex-col items-center"
                        >
                            <Page pageNumber={pageNumber} />
                        </Document>
                    </div>
                );
            case "epub":
                return (
                    <div className="epub-container h-[70vh] overflow-auto bg-white rounded-lg shadow-md p-4">
                        <p className="text-center">EPUB Reader</p>
                        {/* EPUB viewer implementation would go here */}
                        <p className="text-center text-gray-500">Viewing: {file.name}</p>
                    </div>
                );
            case "docx":
                return (
                    <div className="docx-container h-[70vh] overflow-auto bg-white rounded-lg shadow-md p-4">
                        <p className="text-center">DOCX Reader</p>
                        {/* DOCX viewer implementation would go here */}
                        <p className="text-center text-gray-500">Viewing: {file.name}</p>
                    </div>
                );
            default:
                return <div>Unsupported file format</div>;
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            
            <main className="flex-1 pt-16 container mx-auto px-4 py-6">
                <h1 className="text-2xl font-semibold mb-6 text-primary">Document Reader</h1>
                
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Main document viewer */}
                    <div className="flex-1">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange} 
                            accept=".pdf,.epub,.docx" 
                            className="hidden" 
                        />
                        {renderDocumentViewer()}
                    </div>
                    
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-white shadow-md rounded-lg p-4 border border-border h-fit">
                        <h2 className="text-xl font-medium mb-4">Document Info</h2>
                        
                        {file ? (
                            <>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">Filename</p>
                                    <p className="font-medium truncate">{file.name}</p>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">File Type</p>
                                    <p className="font-medium">{fileType?.toUpperCase()}</p>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">File Size</p>
                                    <p className="font-medium">{Math.round(file.size / 1024)} KB</p>
                                </div>
                                
                                {fileType === "pdf" && (
                                    <>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Pages</p>
                                            <p className="font-medium">{numPages}</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <button 
                                                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                                disabled={pageNumber <= 1}
                                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                            >
                                                Prev
                                            </button>
                                            <span className="text-sm">
                                                {pageNumber} / {numPages}
                                            </span>
                                            <button 
                                                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                                                disabled={pageNumber >= numPages}
                                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                                
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors mt-2"
                                >
                                    Change Document
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        setFile(null);
                                        setFileType(null);
                                    }}
                                    className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-2"
                                >
                                    Close Document
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-500 mb-4">No document loaded</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                                >
                                    Upload Document
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Reader;