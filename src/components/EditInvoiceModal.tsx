import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import type { Invoice, LineItem } from "@/types";
import { InvoiceItemsTable } from "@/components/InvoiceItemsTable";
import { DEFAULT_CATEGORIES } from "@/constants/products";
import { supabase } from "@/lib/supabase";

interface EditInvoiceModalProps {
    invoice: Invoice;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function EditInvoiceModal({ invoice, isOpen, onClose, onSave }: EditInvoiceModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        store_name: invoice.store_name,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        category: invoice.category || "Other",
        total_amount: invoice.total_amount,
        line_items: invoice.line_items || [],
        final_price: invoice.final_price,
        promotion_mechanism: invoice.promotion_mechanism
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            // Update invoice details
            const { error: invError } = await supabase
                .from("invoices")
                .update({
                    store_name: formData.store_name,
                    invoice_number: formData.invoice_number,
                    invoice_date: formData.invoice_date,
                    category: formData.category,
                    total_amount: formData.total_amount,
                    final_price: formData.final_price,
                    promotion_mechanism: formData.promotion_mechanism
                })
                .eq("id", invoice.id);

            if (invError) throw invError;

            // Update items - simplified approach: delete and re-insert (or update if we had IDs, but we might not have all)
            // Ideally we should upsert, but for simplicity let's delete old ones and insert new ones
            // OR just update the invoice total and assume items might need a more complex editor. 
            // The InvoiceItemsTable gives us `items`. 

            // First delete existing items
            const { error: delError } = await supabase
                .from("invoice_items")
                .delete()
                .eq("invoice_id", invoice.id);

            if (delError) throw delError;

            // Insert new items
            const newItems = formData.line_items.map(item => ({
                invoice_id: invoice.id,
                description: item.description || item.product_name || "Item",
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.amount,
                discount: item.discount,
                net_price: item.net_price,
                promotion_price: item.promotion_price
            }));

            const { error: insError } = await supabase
                .from("invoice_items")
                .insert(newItems);

            if (insError) throw insError;

            onSave();
            onClose();
        } catch (e: any) {
            console.error("Error updating invoice:", e);
            alert("Erreur lors de la mise à jour: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleItemsChange = (items: LineItem[]) => {
        // Recalculate total
        const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        setFormData({ ...formData, line_items: items, total_amount: total });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border shadow-xl flex flex-col overflow-hidden"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold">Modifier la Facture</h2>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Magasin</label>
                                    <input
                                        type="text"
                                        value={formData.store_name}
                                        onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">N° Facture</label>
                                    <input
                                        type="text"
                                        value={formData.invoice_number}
                                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date</label>
                                    <input
                                        type="date"
                                        value={formData.invoice_date}
                                        onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Catégorie</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/50"
                                    >
                                        {DEFAULT_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="Custom">Autre</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Articles</label>
                                <InvoiceItemsTable
                                    items={formData.line_items}
                                    onItemsChange={handleItemsChange}

                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Commentaire</label>
                                <textarea
                                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
                                    value={formData.promotion_mechanism || ""}
                                    onChange={(e) => setFormData({ ...formData, promotion_mechanism: e.target.value })}
                                    placeholder="Ajouter un commentaire..."
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-border">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">${formData.total_amount?.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Enregistrer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
