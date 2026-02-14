import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "@/hooks/useInvoices";
import { AdminInvoiceTable } from "@/components/AdminInvoiceTable";
import { EditInvoiceModal } from "@/components/EditInvoiceModal";
import type { Invoice } from "@/types";
import {
    Users, Plus, Search, Filter,
    ChevronDown, Clock, FileText, CreditCard
} from "lucide-react";
import { AdminCharts } from "@/components/AdminCharts";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { data: invoices, isLoading, error, refetch } = useInvoices();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const totalInvoices = invoices?.length || 0;
    const pendingInvoices = invoices?.filter(i => i.status === 'pending').length || 0;
    const approvedInvoices = invoices?.filter(i => i.status === 'approved').length || 0;

    // Filter logic
    const filteredInvoices = invoices?.filter(invoice => {
        const matchesSearch =
            invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const handleEdit = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsEditModalOpen(true);
    };

    const handleSaveEditedInvoice = () => {
        refetch(); // Refresh list after edit
        setIsEditModalOpen(false);
        setSelectedInvoice(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    {/* Breadcrumb or simple title */}
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Menu / Factures</div>
                    <h1 className="text-3xl font-bold text-foreground">Factures</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                    >
                        <Plus className="w-5 h-5" />
                        Créer une facture
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Card 1 */}
                <div className="bg-white dark:bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gray-100 dark:bg-muted rounded-full">
                        <Clock className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold">${(pendingInvoices * 100).toLocaleString()}</h3> {/* Mock amount */}
                        <p className="text-sm text-muted-foreground">Montant impayé</p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white dark:bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gray-100 dark:bg-muted rounded-full">
                        <FileText className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold">{pendingInvoices}</h3>
                        <p className="text-sm text-muted-foreground">Total brouillons</p>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white dark:bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gray-100 dark:bg-muted rounded-full">
                        <CreditCard className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold">{totalInvoices}</h3>
                        <p className="text-sm text-muted-foreground">Total factures</p>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white dark:bg-card border border-border/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gray-100 dark:bg-muted rounded-full">
                        <Users className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold">08 <span className="text-sm font-normal text-muted-foreground">jours</span></h3>
                        <p className="text-sm text-muted-foreground">Délai moyen de paiement</p>
                    </div>
                </div>

                {/* Card 5 (Different Style) */}
                <div className="bg-gray-50 dark:bg-muted/30 border border-border/50 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="z-10 space-y-1">
                        <div className="p-2 bg-white dark:bg-card rounded-xl shadow-sm w-fit mb-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">05 <span className="text-sm font-normal text-muted-foreground">factures</span></h3>
                        <p className="text-xs text-muted-foreground">Prévu aujourd'hui</p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
                </div>
            </div>

            {/* Charts Section */}
            <AdminCharts invoices={invoices} />

            {/* Main Content Card */}
            <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 space-y-6">

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher par numéro..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-muted/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                        <div className="flex items-center bg-gray-50 dark:bg-muted/50 rounded-2xl p-1">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Toutes <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] rounded-full">{totalInvoices}</span>
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Impayées <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 text-[10px] rounded-full">{pendingInvoices}</span>
                            </button>
                            <button
                                onClick={() => setFilterStatus('approved')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === 'approved' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Validées <span className="ml-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] rounded-full">{approvedInvoices}</span>
                            </button>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-muted/50 hover:bg-gray-100 dark:hover:bg-muted text-sm font-medium rounded-2xl transition-colors whitespace-nowrap">
                            <Filter className="w-4 h-4" />
                            Filtrer
                        </button>

                        <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-muted/50 hover:bg-gray-100 dark:hover:bg-muted text-sm font-medium rounded-2xl transition-colors whitespace-nowrap">
                            Plus récents
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {error ? (
                    <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl">
                        Échec du chargement des factures.
                    </div>
                ) : (
                    <AdminInvoiceTable
                        invoices={filteredInvoices}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                    />
                )}
            </div>

            {selectedInvoice && (
                <EditInvoiceModal
                    invoice={selectedInvoice}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveEditedInvoice}
                />
            )}
        </div>
    );
}
