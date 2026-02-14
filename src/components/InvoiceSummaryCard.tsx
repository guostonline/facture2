import { motion } from "framer-motion";
import { Store, Calendar, Hash, DollarSign, Percent, Receipt, Stamp } from "lucide-react";
import type { InvoiceData } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
    metadata: InvoiceData;
}

export function InvoiceSummaryCard({ metadata }: Props) {
    const fields = [
        {
            icon: Hash,
            label: "N° Facture",
            value: metadata.invoice_number
        },
        {
            icon: Store,
            label: "Magasin",
            value: metadata.store_name
        },
        {
            icon: Calendar,
            label: "Date",
            value: metadata.invoice_date
        },
        {
            icon: DollarSign,
            label: "Total",
            value: metadata.total_amount != null ? `${metadata.total_amount.toFixed(2)} DH` : null
        },
        {
            icon: Receipt,
            label: "TVA",
            value: metadata.tax_amount != null ? `${metadata.tax_amount.toFixed(2)} DH` : null
        },
        {
            icon: Percent,
            label: "Remise",
            value: metadata.discount_amount != null ? `${metadata.discount_amount.toFixed(2)} DH` : "0.00 DH"
        },
        {
            icon: Stamp,
            label: "Droit de Timbre",
            value: metadata.total_amount != null ? `${(metadata.total_amount * 0.0025).toFixed(2)} DH` : "0.00 DH"
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-6"
        >
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Résumé de la Facture
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fields.map((f) => (
                    <div key={f.label} className={cn(
                        "flex items-center gap-3",
                        f.label === "Total" && "col-span-2 md:col-span-1 bg-primary/5 p-3 rounded-xl border border-primary/10"
                    )}>
                        <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                            f.label === "Total" ? "bg-primary text-white w-12 h-12" : "bg-primary/10 text-primary"
                        )}>
                            <f.icon className={cn("h-4 w-4", f.label === "Total" && "h-6 w-6")} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">{f.label}</p>
                            <p className={cn(
                                "font-medium truncate",
                                f.label === "Total" ? "text-2xl font-bold text-primary" : "text-sm"
                            )}>{f.value ?? "—"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
