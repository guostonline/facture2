import { useState, useMemo } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { EditInvoiceModal } from "@/components/EditInvoiceModal";
import type { Invoice } from "@/types";
import { Loader2, TrendingUp, TrendingDown, Minus, Store, ShoppingBag, RotateCcw } from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Compare() {
    const { data: invoices, isLoading, refetch, isRefetching } = useInvoices();
    const [mode, setMode] = useState<'stores' | 'products'>('products');

    // Store Comparison State
    const [selectedStore1, setSelectedStore1] = useState<string>("");
    const [selectedStore2, setSelectedStore2] = useState<string>("");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Product Analysis State
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [filterCity, setFilterCity] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterUser, setFilterUser] = useState<string>("all");
    const [priceMetric, setPriceMetric] = useState<'unit_price' | 'net_price' | 'promotion_price'>('unit_price');
    const [hideZero, setHideZero] = useState<boolean>(false);



    // --- Store Logic ---
    // Get unique store names
    const storeNames = Array.from(new Set(invoices?.map(i => i.user?.name).filter(Boolean) || [])).sort();

    // Filters Data
    const cities = useMemo(() => Array.from(new Set(invoices?.map(i => i.user?.city).filter((c): c is string => !!c) || [])).sort(), [invoices]);
    const categories = useMemo(() => Array.from(new Set(invoices?.map(i => i.category).filter((c): c is string => !!c) || [])).sort(), [invoices]);
    const filteredUsers = useMemo(() => {
        let filtered = invoices || [];
        if (filterCity !== "all") {
            filtered = filtered.filter(i => i.user?.city === filterCity);
        }
        return Array.from(new Set(filtered.map(i => i.user?.name).filter((n): n is string => !!n) || [])).sort();
    }, [invoices, filterCity]);

    const invoices1 = invoices?.filter(i => i.user?.name === selectedStore1 && i.status === 'approved') || [];
    const invoices2 = invoices?.filter(i => i.user?.name === selectedStore2 && i.status === 'approved') || [];

    const total1 = invoices1.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
    const total2 = invoices2.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);

    const count1 = invoices1.length;
    const count2 = invoices2.length;

    const diffTotal = total1 - total2;

    // --- Product Logic ---
    const allProducts = useMemo(() => {
        const products = new Set<string>();
        invoices?.forEach(inv => {
            if (filterCategory !== "all" && inv.category !== filterCategory) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (inv as any).line_items?.forEach((item: any) => {
                if (item.description) products.add(item.description);
            });
        });
        return Array.from(products).sort();
    }, [invoices]);

    const productData = useMemo(() => {
        if (!selectedProduct) return [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = [];
        invoices?.forEach(inv => {
            if (filterCity !== "all" && inv.user?.city !== filterCity) return;
            if (filterCategory !== "all" && inv.category !== filterCategory) return;
            if (filterUser !== "all" && inv.user?.name !== filterUser) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (inv as any).line_items?.forEach((item: any) => {
                if (item.description === selectedProduct) {
                    let price = item.unit_price || 0;
                    if (priceMetric === 'net_price') price = item.net_price ?? 0;
                    if (priceMetric === 'promotion_price') price = item.promotion_price ?? 0;

                    if (hideZero && price === 0) return;

                    data.push({
                        date: inv.invoice_date || inv.created_at,
                        price: price,
                        store: inv.user?.name || inv.store_name || "Inconnu",
                        invoice_number: inv.invoice_number,
                        city: inv.user?.city || "-",
                        invoice_id: inv.id
                    });
                }
            });
        });
        return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [selectedProduct, invoices, filterCity, filterUser, filterCategory, priceMetric, hideZero]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Menu / Comparaison</div>
                    <h1 className="text-3xl font-bold text-foreground">Outils d'Analyse</h1>
                    <p className="text-muted-foreground mt-2">Analysez les performances des magasins ou l'évolution des prix.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="p-2.5 rounded-xl bg-white dark:bg-card border border-border/50 shadow-sm hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors disabled:opacity-50"
                        title="Actualiser les données"
                    >
                        <RotateCcw className={cn("w-5 h-5 text-muted-foreground", isRefetching && "animate-spin")} />
                    </button>

                    {/* Mode Switcher */}
                    <div className="bg-gray-100 dark:bg-muted p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => setMode('stores')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                mode === 'stores' ? "bg-white dark:bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Store className="w-4 h-4" />
                            CDZ
                        </button>
                        <button
                            onClick={() => setMode('products')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                mode === 'products' ? "bg-white dark:bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Produits
                        </button>
                    </div>
                </div>
            </div>

            {mode === 'stores' ? (
                <div className="space-y-8 animate-in slide-in-from-left-4 fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Store 1 Selection */}
                        <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
                            <label className="text-sm font-medium text-muted-foreground">CDZ A</label>
                            <select
                                value={selectedStore1}
                                onChange={(e) => setSelectedStore1(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-muted/50 border-none rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none"
                            >
                                <option value="">Sélectionner un CDZ</option>
                                {storeNames.map(store => (
                                    <option key={`a-${store}`} value={store}>{store}</option>
                                ))}
                            </select>

                            <div className="pt-4 space-y-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                                    <p className="text-sm text-blue-600/80 dark:text-blue-400 mb-1">Chiffre d'affaires</p>
                                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">${total1.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 p-4 bg-gray-50 dark:bg-muted/30 rounded-2xl">
                                        <p className="text-xs text-muted-foreground mb-1">Volume</p>
                                        <p className="text-xl font-bold">{count1} <span className="text-sm font-normal text-muted-foreground">factures</span></p>
                                    </div>
                                    <div className="flex-1 p-4 bg-gray-50 dark:bg-muted/30 rounded-2xl">
                                        <p className="text-xs text-muted-foreground mb-1">Panier Moyen</p>
                                        <p className="text-xl font-bold">${count1 ? (total1 / count1).toFixed(0) : 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Store 2 Selection */}
                        <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
                            <label className="text-sm font-medium text-muted-foreground">CDZ B</label>
                            <select
                                value={selectedStore2}
                                onChange={(e) => setSelectedStore2(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-muted/50 border-none rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-purple-500/20 outline-none"
                            >
                                <option value="">Sélectionner un CDZ</option>
                                {storeNames.map(store => (
                                    <option key={`b-${store}`} value={store}>{store}</option>
                                ))}
                            </select>

                            <div className="pt-4 space-y-4">
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl">
                                    <p className="text-sm text-purple-600/80 dark:text-purple-400 mb-1">Chiffre d'affaires</p>
                                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">${total2.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 p-4 bg-gray-50 dark:bg-muted/30 rounded-2xl">
                                        <p className="text-xs text-muted-foreground mb-1">Volume</p>
                                        <p className="text-xl font-bold">{count2} <span className="text-sm font-normal text-muted-foreground">factures</span></p>
                                    </div>
                                    <div className="flex-1 p-4 bg-gray-50 dark:bg-muted/30 rounded-2xl">
                                        <p className="text-xs text-muted-foreground mb-1">Panier Moyen</p>
                                        <p className="text-xl font-bold">${count2 ? (total2 / count2).toFixed(0) : 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Details */}
                    {selectedStore1 && selectedStore2 && (
                        <div className="bg-white dark:bg-card rounded-3xl border border-border/50 p-8 shadow-sm text-center">
                            <h2 className="text-xl font-bold mb-6">Analyse Comparative</h2>

                            <div className="flex items-center justify-center gap-8 md:gap-16">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground mb-1">{selectedStore1}</p>
                                    <p className="text-2xl font-bold text-foreground">${total1.toLocaleString()}</p>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                                        diffTotal > 0 ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" :
                                            diffTotal < 0 ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30" : "bg-gray-100 text-gray-500"
                                    )}>
                                        {diffTotal > 0 ? <TrendingUp className="w-6 h-6" /> :
                                            diffTotal < 0 ? <TrendingDown className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-bold px-3 py-1 rounded-full",
                                        diffTotal > 0 ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" :
                                            diffTotal < 0 ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300" : "bg-gray-100 dark:bg-muted"
                                    )}>
                                        {diffTotal === 0 ? "Égalité" : `+${Math.abs(diffTotal).toLocaleString()} $`}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-2">Différence</p>
                                </div>

                                <div className="text-left">
                                    <p className="text-sm text-muted-foreground mb-1">{selectedStore2}</p>
                                    <p className="text-2xl font-bold text-foreground">${total2.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Product Analysis UI
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/50 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Product Filter - Top Priority */}
                            <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-4">
                                <SearchableSelect
                                    label="Produit"
                                    placeholder="Choisir un produit..."
                                    value={selectedProduct}
                                    onChange={setSelectedProduct}
                                    options={allProducts}
                                />
                            </div>

                            {/* Agence Filter */}
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="Agence"
                                    placeholder="Toutes"
                                    value={filterCity}
                                    onChange={setFilterCity}
                                    options={cities}
                                    defaultOptionLabel="Toutes"
                                    defaultOptionValue="all"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="Gamme"
                                    placeholder="Toutes"
                                    value={filterCategory}
                                    onChange={setFilterCategory}
                                    options={categories}
                                    defaultOptionLabel="Toutes"
                                    defaultOptionValue="all"
                                />
                            </div>

                            {/* User Filter */}
                            <div className="space-y-2">
                                <SearchableSelect
                                    label="Utilisateur"
                                    placeholder="Tous"
                                    value={filterUser}
                                    onChange={setFilterUser}
                                    options={filteredUsers}
                                    defaultOptionLabel="Tous"
                                    defaultOptionValue="all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            {/* Price Metric Selector */}
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'unit_price', label: 'Prix Unitaire' },
                                    { id: 'net_price', label: 'Prix Net' },
                                    { id: 'promotion_price', label: 'Promotion' }
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPriceMetric(m.id as any)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                            priceMetric === m.id
                                                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                                                : "bg-transparent border-gray-200 text-muted-foreground hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-muted/50"
                                        )}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* Hide Zero Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                <input
                                    type="checkbox"
                                    checked={hideZero}
                                    onChange={(e) => setHideZero(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                                />
                                Masquer 0.00 dh
                            </label>
                        </div>
                    </div>

                    {selectedProduct && (
                        <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Évolution du prix : <span className="text-blue-600 dark:text-blue-400">{selectedProduct}</span></h3>
                                {productData.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        {productData.length} relevés de prix trouvés
                                    </div>
                                )}
                            </div>

                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={productData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: fr })}
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${Number(value).toFixed(2)} dh`}
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--card)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                            labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy', { locale: fr })}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(value: any) => [
                                                <span className="font-bold text-foreground">{Number(value).toFixed(2)} dh</span>,
                                                <span className="text-muted-foreground">Prix</span>
                                            ]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                                            activeDot={{ r: 6, fill: "#2563eb" }}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detailed Data Table for Product */}
                            <div className="mt-8 overflow-hidden rounded-2xl border border-border/50">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-gray-50 dark:bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Agence</th>
                                            <th className="px-6 py-4">Utilisateur</th>
                                            <th className="px-6 py-4 text-right">Prix Unitaire</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 bg-white dark:bg-card">
                                        {productData.map((row, i) => (
                                            <tr
                                                key={i}
                                                className="hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    const invoice = invoices?.find(inv => inv.id === row.invoice_id);
                                                    if (invoice) {
                                                        setSelectedInvoice(invoice);
                                                        setIsEditModalOpen(true);
                                                    }
                                                }}
                                            >
                                                <td className="px-6 py-4 font-medium text-foreground">{format(new Date(row.date), 'dd/MM/yyyy')}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{row.city}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{row.store}</td>
                                                <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">{row.price.toFixed(2)} dh</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {selectedInvoice && (
                <EditInvoiceModal
                    invoice={selectedInvoice}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={() => {
                        refetch();
                        setIsEditModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
