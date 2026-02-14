import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useInvoices } from "@/hooks/useInvoices";
import { supabase } from "@/lib/supabase";
import { InvoiceUpload } from "@/components/InvoiceUpload";
import { InvoiceSummaryCard } from "@/components/InvoiceSummaryCard";
import { InvoiceItemsTable } from "@/components/InvoiceItemsTable";
import { InvoiceList } from "@/components/InvoiceList";
import type { InvoiceData, LineItem } from "@/types";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_CATEGORIES, detectCategory } from "@/constants/products";

export default function Dashboard() {
    const { user } = useAuth();
    const { data: invoices, isLoading, error, refetch } = useInvoices();
    const [extractedData, setExtractedData] = useState<InvoiceData | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [category, setCategory] = useState<string>("Other");

    const handleDataExtracted = (data: InvoiceData, file: File) => {
        // Ensure line_items have required fields and deduplicate
        const enrichedItemsRaw = data.line_items.map(item => ({
            ...item,
            product_name: item.product_name || item.description,
            amount: item.amount || (item.quantity * item.unit_price),
            discount: item.discount ?? 0,
            net_price: item.net_price ?? 0
        }));

        // Deduplicate items based on product name
        // We assume that if the same product name appears twice, it's an AI extraction artifact
        const uniqueItemsMap = new Map();
        enrichedItemsRaw.forEach(item => {
            const key = item.product_name?.toLowerCase().trim();
            if (key && !uniqueItemsMap.has(key)) {
                uniqueItemsMap.set(key, item);
            }
        });
        const enrichedItems = Array.from(uniqueItemsMap.values());

        // Detect category from items or store name
        const combinedText = `${data.store_name} ${enrichedItems.map(i => i.product_name).join(" ")}`;
        const detected = detectCategory(combinedText);
        setCategory(detected);

        // Recalculate total if 0
        const calculatedTotal = enrichedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const finalTotal = data.total_amount > 0 ? data.total_amount : calculatedTotal;

        setExtractedData({
            ...data,
            line_items: enrichedItems,
            total_amount: finalTotal
        });
        setFile(file);
    };

    const handleItemsChange = (items: LineItem[]) => {
        if (!extractedData) return;

        const newTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);

        setExtractedData({
            ...extractedData,
            line_items: items,
            total_amount: newTotal
        });
    };

    const handleReset = () => {
        setExtractedData(null);
        setFile(null);
        setCategory("Other");
    };

    const handleSave = async () => {
        if (!extractedData || !file || !user) return;
        setIsSaving(true);
        try {
            // Upload image
            const ext = file.name.split(".").pop() || "jpg";
            const path = `${crypto.randomUUID()}.${ext}`;
            const { error: uploadErr } = await supabase.storage
                .from("invoices")
                .upload(path, file);
            if (uploadErr) throw uploadErr;

            const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(path);

            // Insert invoice
            const { data: invoice, error: invErr } = await supabase
                .from("invoices")
                .insert({
                    user_id: user.id,
                    invoice_number: extractedData.invoice_number,
                    store_name: extractedData.store_name,
                    invoice_date: extractedData.invoice_date,
                    total_amount: extractedData.total_amount,
                    tax_amount: extractedData.tax_amount ?? 0,
                    discount_amount: extractedData.discount_amount ?? 0,
                    image_url: urlData.publicUrl,
                    status: 'pending',
                    category: category
                })
                .select("id")
                .single();
            if (invErr) throw invErr;

            // Insert items
            const itemRows = extractedData.line_items.map((item) => ({
                invoice_id: invoice.id,
                description: item.description || item.product_name || "Item",
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.amount
            }));

            const { error: itemsErr } = await supabase.from("invoice_items").insert(itemRows);
            if (itemsErr) throw itemsErr;

            // Refresh list
            refetch();
            handleReset();
        } catch (e: any) {
            console.error(e);
            alert("Échec de l'enregistrement de la facture : " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Mes Factures
                    </h1>
                    <p className="text-muted-foreground mt-1">Gérez et suivez vos soumissions.</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {extractedData && file ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8"
                    >
                        {/* Left Column: Image Preview */}
                        <div className="lg:col-span-1 space-y-6">
                            <motion.div
                                className="glass rounded-2xl p-4 sticky top-6 max-h-[80vh] overflow-hidden flex items-center justify-center bg-card/50"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                {file.type === "application/pdf" ? (
                                    <div className="w-full aspect-[3/4] flex flex-col items-center justify-center bg-muted/30 rounded-xl">
                                        <p className="text-muted-foreground font-medium">Document PDF</p>
                                        <p className="text-xs text-muted-foreground mt-1">{file.name}</p>
                                    </div>
                                ) : (
                                    <motion.img
                                        layoutId="invoice-image"
                                        src={URL.createObjectURL(file)}
                                        alt="Facture originale"
                                        className="w-full h-auto rounded-xl object-contain"
                                    />
                                )}
                            </motion.div>
                        </div>

                        {/* Right Column: Data Review */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Category Selection */}
                            <div className="glass rounded-2xl p-6">
                                <label className="block text-sm font-medium mb-2">Catégorie</label>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {DEFAULT_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="Custom">Autre (Ajouter...)</option>
                                    </select>
                                    {category === "Custom" && (
                                        <input
                                            type="text"
                                            placeholder="Nouvelle catégorie"
                                            className="flex-1 px-4 py-2 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>

                            <InvoiceSummaryCard metadata={extractedData} />
                            <InvoiceItemsTable items={extractedData.line_items} onItemsChange={handleItemsChange} />

                            <div className="flex flex-wrap justify-end gap-3 pt-4">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-muted-foreground hover:bg-muted/50 transition-colors text-sm font-medium"
                                >
                                    <RotateCcw className="h-4 w-4" /> Nouvelle Facture
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <InvoiceUpload onDataExtracted={handleDataExtracted} />
                )}
            </AnimatePresence>

            <div className="pt-8 border-t border-border">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Historique Récent</h2>

                {error ? (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                        Échec du chargement des factures. Veuillez réessayer plus tard.
                    </div>
                ) : (
                    <InvoiceList invoices={invoices} isLoading={isLoading} />
                )}
            </div>
        </div>
    );
}
