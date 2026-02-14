import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Invoice } from "@/types";
import { FileText, Calendar, DollarSign, Store, Tag } from "lucide-react";

interface InvoiceListProps {
    invoices: Invoice[] | undefined;
    isLoading: boolean;
}

export function InvoiceList({ invoices, isLoading }: InvoiceListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!invoices || invoices.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune facture trouvée. Téléchargez votre première !</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invoices.map((invoice) => (
                <div
                    key={invoice.id}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-300 group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold truncate max-w-[150px]">{invoice.store_name}</h3>
                                <span className="text-xs text-muted-foreground">{invoice.invoice_number}</span>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            invoice.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                            {invoice.status === 'approved' ? 'Approuvée' : invoice.status === 'rejected' ? 'Rejetée' : 'En attente'}
                        </span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(invoice.invoice_date || invoice.created_at), "PPP", { locale: fr })}</span>
                        </div>

                        {invoice.promotion_mechanism && (
                            <div className="flex items-start gap-2 text-xs bg-accent/50 p-2 rounded-md mt-2">
                                <Tag className="w-3 h-3 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{invoice.promotion_mechanism}</span>
                            </div>
                        )}

                        <div className="border-t border-border mt-4 pt-3 flex justify-between items-center text-foreground font-medium">
                            <span>Total</span>
                            <div className="flex items-center text-lg text-primary">
                                <DollarSign className="w-4 h-4" />
                                {invoice.total_amount?.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Action Footer (Review / Details) could go here */}
                </div>
            ))}
        </div>
    );
}
