import { supabase } from "@/lib/supabase";

export async function uploadInvoiceImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
        .from("invoices")
        .upload(filePath, file);

    if (error) {
        throw error;
    }

    const { data } = supabase.storage
        .from("invoices")
        .getPublicUrl(filePath);

    return data.publicUrl;
}
