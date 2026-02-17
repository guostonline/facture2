import { supabase } from "@/lib/supabase";
import type { Invoice, InvoiceData, LineItem } from "@/types";

export async function fetchInvoices() {
    const { data, error } = await supabase
        .from("invoices")
        .select(`
      *,
      line_items:invoice_items(*),
      user:users(name, city, email)
    `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fetch Invoices Error:", error);
        throw error;
    }

    return data as Invoice[];
}

export async function createInvoice(invoiceData: InvoiceData, userId: string, imageUrl: string) {
    // 1. Create Invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
            user_id: userId,
            invoice_number: invoiceData.invoice_number,
            store_name: invoiceData.store_name,
            invoice_date: invoiceData.invoice_date,
            total_amount: invoiceData.total_amount,
            final_price: invoiceData.final_price,
            tax_amount: invoiceData.tax_amount,
            discount_amount: invoiceData.discount_amount,
            image_url: imageUrl,
            promotion_mechanism: invoiceData.promotion_mechanism,
            original_text: invoiceData.original_text,
            status: "pending"
        })
        .select()
        .single();

    if (invoiceError) {
        console.error("Create Invoice Error:", invoiceError);
        throw invoiceError;
    }

    // 2. Create Line Items
    if (invoiceData.line_items && invoiceData.line_items.length > 0) {
        const items = invoiceData.line_items.map((item: LineItem) => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount
        }));

        const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(items);

        if (itemsError) {
            console.error("Create Items Error:", itemsError);
            // Ideally rollback invoice creation or handle partial failure
            throw itemsError;
        }
    }

    return invoice;
}

export async function updateInvoiceStatus(invoiceId: string, status: 'approved' | 'rejected' | 'skipped') {
    const { data, error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", invoiceId)
        .select()
        .single();

    if (error) {
        console.error("Update Status Error:", error);
        throw error;
    }

    return data;
}
