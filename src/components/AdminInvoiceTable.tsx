import { useState } from "react";
import { format } from "date-fns";
import type { Invoice } from "@/types";
import { useUpdateInvoiceStatus } from "@/hooks/useInvoices";
import { Loader2, Eye, Check, X, Edit, Slash } from "lucide-react"; // Import new icons
import { cn } from "@/lib/utils";

interface AdminInvoiceTableProps {
    invoices: Invoice[] | undefined;
    isLoading: boolean;
    onEdit: (invoice: Invoice) => void;
}

export function AdminInvoiceTable({ invoices, isLoading, onEdit }: AdminInvoiceTableProps) {
    const updateStatus = useUpdateInvoiceStatus();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected' | 'skipped') => {
        setUpdatingId(id);
        try {
            await updateStatus.mutateAsync({ id, status: newStatus });
        } catch (error) {
            console.error("Failed to update status", error);
            alert(`Erreur lors de la mise à jour: ${(error as any).message || "Erreur inconnue"}`);
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!invoices || invoices.length === 0) {
        return (
            <div className="text-center p-16 text-muted-foreground bg-gray-50/50 dark:bg-muted/10 rounded-3xl border border-dashed">
                <p>Aucune facture trouvée.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white dark:bg-card rounded-3xl border border-border/50">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/50 bg-gray-50/50 dark:bg-muted/10">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Statut</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Numéro</th>
                            <th className="px-6 py-4 font-semibold">Catégorie</th>
                            <th className="px-6 py-4 font-semibold">Client</th>
                            <th className="px-6 py-4 font-semibold">Total</th>
                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="group hover:bg-blue-50/50 dark:hover:bg-muted/20 transition-colors">
                                {/* Status */}
                                <td className="px-6 py-5">
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm",
                                        invoice.status === 'approved' ? "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                            invoice.status === 'rejected' ? "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                invoice.status === 'skipped' ? "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                                                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    )}>
                                        {invoice.status === 'approved' && "Validée"}
                                        {invoice.status === 'rejected' && "Rejetée"}
                                        {invoice.status === 'skipped' && "Ignorée"}
                                        {invoice.status === 'pending' && "En attente"}
                                    </span>
                                </td>

                                {/* Date */}
                                <td className="px-6 py-5 font-medium text-foreground">
                                    {format(new Date(invoice.invoice_date || invoice.created_at), "dd.MM.yyyy")}
                                </td>

                                {/* Number */}
                                <td className="px-6 py-5 text-muted-foreground font-mono">
                                    {invoice.invoice_number || "#---"}
                                </td>

                                {/* Category */}
                                <td className="px-6 py-5 text-foreground">
                                    <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium border border-border">
                                        {invoice.category || "Other"}
                                    </span>
                                </td>

                                {/* Customer */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs uppercase shadow-sm">
                                            {invoice.user?.name?.substring(0, 2) || "??"}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-foreground text-sm">{invoice.user?.name || "Utilisateur Inconnu"}</div>
                                            <div className="text-[11px] text-muted-foreground">{invoice.store_name}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Total */}
                                <td className="px-6 py-5 font-bold text-foreground">
                                    ${invoice.total_amount?.toFixed(0)}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {invoice.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(invoice.id, 'approved')}
                                                    disabled={updatingId === invoice.id}
                                                    className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-lg transition-all"
                                                    title="Approuver"
                                                >
                                                    {updatingId === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(invoice.id, 'rejected')}
                                                    disabled={updatingId === invoice.id}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-all"
                                                    title="Rejeter"
                                                >
                                                    {updatingId === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(invoice.id, 'skipped')}
                                                    disabled={updatingId === invoice.id}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-muted text-gray-500 rounded-lg transition-all"
                                                    title="Ignorer/Sauter"
                                                >
                                                    {updatingId === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Slash className="w-4 h-4" />}
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => onEdit(invoice)}
                                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-all"
                                            title="Modifier"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <a
                                            href={invoice.image_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all"
                                            title="Voir Image"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
