import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import type { LineItem } from "@/types";

interface Props {
    items: LineItem[];
    onItemsChange: (items: LineItem[]) => void;
}

const columns = [
    { key: "product_id", label: "Réf", type: "text" },
    { key: "description", label: "Produit", type: "text" }, // using 'description' as main product name field in local context, but we can map/show 'product_name' if needed
    { key: "quantity", label: "Qté", type: "number" },
    { key: "unit_price", label: "P.U.", type: "number" },
    { key: "discount", label: "Remise", type: "number" },
    { key: "net_price", label: "Prix Net", type: "number" },
    { key: "amount", label: "Total", type: "number" }, // Using 'amount' for total
] as const;

export function InvoiceItemsTable({ items, onItemsChange }: Props) {
    const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);

    const handleChange = (rowIdx: number, key: string, value: string) => {
        const updated = items.map((item, i) => {
            if (i !== rowIdx) return item;
            const col = columns.find((c) => c.key === key);
            const isNum = col?.type === "number";
            const newVal = isNum ? (value === "" ? 0 : parseFloat(value)) : value;

            // Ideally recalculate totals/net price if qty/price changes, but for now just update the field
            return {
                ...item,
                [key]: newVal,
            };
        });
        // Trigger recalculation logic if needed here or in parent
        onItemsChange(updated);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl overflow-hidden"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                {columns.map((col) => {
                                    const isEditing = editingCell?.row === rowIdx && editingCell?.col === col.key;
                                    const rawValue = item[col.key as keyof LineItem];
                                    const displayValue = rawValue != null ? String(rawValue) : "";

                                    return (
                                        <td key={col.key} className="px-4 py-2">
                                            {isEditing ? (
                                                <Input
                                                    autoFocus
                                                    type={col.type}
                                                    step={col.type === "number" ? "0.01" : undefined}
                                                    value={displayValue}
                                                    onChange={(e) => handleChange(rowIdx, col.key, e.target.value)}
                                                    onBlur={() => setEditingCell(null)}
                                                    onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                                                    className="h-8 text-sm bg-background border-input"
                                                />
                                            ) : (
                                                <span
                                                    className="cursor-pointer hover:text-primary transition-colors block min-h-[1.5rem]"
                                                    onClick={() => setEditingCell({ row: rowIdx, col: col.key })}
                                                >
                                                    {col.key === "amount" || col.key === "unit_price" || col.key === "net_price" || col.key === "discount"
                                                        ? (typeof rawValue === 'number' ? `${rawValue.toFixed(2)} DH` : rawValue)
                                                        : (displayValue || "—")}
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground px-4 py-3">
                Cliquez pour modifier • {items.length} article{items.length !== 1 ? "s" : ""}
            </p>
        </motion.div>
    );
}
