export interface UserProfile {
    id: string;
    email: string;
    name: string;
    city: string;
    role: "user" | "admin";
}

export interface LineItem {
    description: string; // kept for backward compatibility
    product_name?: string; // new field preference
    product_id?: string | null;
    quantity: number;
    unit_price: number;
    amount: number; // total
    discount?: number | null;
    net_price?: number | null;
}

export interface InvoiceData {
    invoice_number: string;
    store_name: string;
    invoice_date: string;
    total_amount: number;
    tax_amount: number;
    discount_amount: number;
    line_items: LineItem[];
    category?: string;
    original_text?: string;
    promotion_mechanism?: string;
    // Helper accessors or fields for UI components that expect 'date' or 'items' could be mapped at runtime, 
    // but we'll stick to 'invoice_date' and 'line_items' in the type and map in components or usage.
}

export interface Invoice extends InvoiceData {
    id: string;
    created_at: string;
    submitted_by?: string; // keeping for backward compat if needed, but user object is better
    user?: {
        name: string;
        city: string;
        email: string;
    };
    status: "pending" | "approved" | "rejected" | "skipped";
    category?: string;
    image_url: string;
}
