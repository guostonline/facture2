import { useState } from "react";
import type { InvoiceData } from "@/types";
import { useCreateInvoice } from "@/hooks/useInvoices";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Save, X } from "lucide-react";
import { InvoiceItemsTable } from "@/components/InvoiceItemsTable";

interface InvoiceReviewProps {
    data: InvoiceData;
    file: File;
    onCancel: () => void;
    onSuccess: () => void;
}

export function InvoiceReview({ data, file, onCancel, onSuccess }: InvoiceReviewProps) {
    const { user } = useAuth();
    const createInvoice = useCreateInvoice();

    const [formData, setFormData] = useState<InvoiceData>(data);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            await createInvoice.mutateAsync({
                data: formData,
                file: file,
                userId: user.id
            });
            onSuccess();
        } catch (error) {
            console.error("Failed to save invoice:", error);
            // Ideally show error toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateField = (field: keyof InvoiceData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Review Fetched Data</h2>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Store Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.store_name || ""}
                            onChange={e => updateField("store_name", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Invoice Number</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.invoice_number || ""}
                            onChange={e => updateField("invoice_number", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.invoice_date || ""}
                            onChange={e => updateField("invoice_date", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Montant Total</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.total_amount || 0}
                            onChange={e => updateField("total_amount", parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Articles ({formData.line_items?.length || 0})</label>
                    <InvoiceItemsTable
                        items={formData.line_items || []}
                        onItemsChange={(items) => updateField("line_items", items)}

                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Promotion / Comments</label>
                    <textarea
                        className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                        value={formData.promotion_mechanism || ""}
                        placeholder="Describe any promotion mechanism or add notes..."
                        onChange={e => updateField("promotion_mechanism", e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors font-medium"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Invoice
                    </button>
                </div>
            </form>
        </div>
    );
}
