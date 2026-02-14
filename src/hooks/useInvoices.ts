import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInvoices, createInvoice } from "@/services/invoices";
import type { InvoiceData } from "@/types";
import { uploadInvoiceImage } from "@/services/storage";

export function useInvoices() {
    return useQuery({
        queryKey: ["invoices"],
        queryFn: fetchInvoices,
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            data,
            file,
            userId
        }: {
            data: InvoiceData;
            file: File;
            userId: string;
        }) => {
            // 1. Upload Image
            const imageUrl = await uploadInvoiceImage(file, userId);

            // 2. Create Invoice Record
            const newInvoice = await createInvoice(data, userId, imageUrl);

            return newInvoice;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });
}

export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'skipped' }) => {
            const { updateInvoiceStatus } = await import("@/services/invoices");
            return updateInvoiceStatus(id, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });
}
