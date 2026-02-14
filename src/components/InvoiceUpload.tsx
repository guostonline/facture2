import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Image as ImageIcon, FileText, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractInvoiceData } from "@/services/ai";
import type { InvoiceData } from "@/types";

interface InvoiceUploadProps {
    onDataExtracted: (data: InvoiceData, file: File) => void;
    className?: string;
}

export function InvoiceUpload({ onDataExtracted, className }: InvoiceUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            setError("Veuillez télécharger une image ou un PDF.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError("La taille du fichier doit être inférieure à 10 Mo.");
            return;
        }

        setError(null);
        setSelectedFile(file);

        if (file.type === "application/pdf") {
            setPreviewUrl("pdf");
            triggerExtraction(file);
        } else {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            triggerExtraction(file);
        }
    }, []);

    const triggerExtraction = async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const extractedData = await extractInvoiceData(file);
            onDataExtracted(extractedData as InvoiceData, file);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Échec de l'extraction des données. Veuillez réessayer.");
            setLoading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleRemove = useCallback(() => {
        if (previewUrl && previewUrl !== "pdf") {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        setLoading(false);
    }, [previewUrl]);

    // Manual trigger if needed (though auto is requested)
    const handleExtract = () => {
        if (selectedFile) triggerExtraction(selectedFile);
    };

    return (
        <div className={cn("w-full max-w-2xl mx-auto py-10", className)}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span className="gradient-text">Assistant</span> Facture IA
                </h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Téléchargez une image de facture et laissez l'IA extraire toutes les données instantanément.
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {selectedFile && previewUrl ? (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass rounded-2xl p-6 relative bg-card/70 backdrop-blur-xl border border-border/50"
                    >
                        <button
                            onClick={handleRemove}
                            disabled={loading}
                            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive text-destructive-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {selectedFile.type === "application/pdf" ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <FileText className="h-16 w-16 text-primary" />
                                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <motion.img
                                layoutId="invoice-image"
                                src={previewUrl}
                                alt="Aperçu de la facture"
                                className="w-full rounded-xl object-contain max-h-[400px]"
                            />
                        )}

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            {selectedFile.name}
                        </p>

                        {loading && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20">
                                <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                                <p className="text-sm font-medium text-foreground">Extraction en cours...</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={cn(
                            "glass rounded-2xl p-12 border-2 border-dashed transition-all duration-300 cursor-pointer bg-card/70 backdrop-blur-xl",
                            isDragging
                                ? "border-primary bg-primary/5 scale-[1.02]"
                                : "border-border hover:border-primary/50"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="flex flex-col items-center gap-5">
                            <motion.div
                                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                                className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20"
                            >
                                <Upload className="h-7 w-7 text-white" />
                            </motion.div>

                            <div className="text-center">
                                <p className="text-lg font-semibold text-foreground">
                                    Déposez votre facture ici
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    ou cliquez pour parcourir • JPG, PNG, PDF
                                </p>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-input bg-background/50 hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    Parcourir
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cameraInputRef.current?.click();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-input bg-background/50 hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
                                >
                                    <Camera className="h-4 w-4" />
                                    Caméra
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error & manual retry if needed */}
            {error && !loading && (
                <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mt-8"
                >
                    <div className="mb-4 p-4 text-center text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                        {error}
                    </div>
                    <button
                        onClick={handleExtract}
                        className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-lg"
                    >
                        <Sparkles className="h-5 w-5" />
                        Réessayer l'extraction
                    </button>
                </motion.div>
            )}

            {/* Hidden Inputs */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                }}
            />
            <input
                ref={cameraInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
}
