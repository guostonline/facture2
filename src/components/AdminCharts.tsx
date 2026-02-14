import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import type { Invoice } from '@/types';
import { format } from 'date-fns';

interface AdminChartsProps {
    invoices: Invoice[] | undefined;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AdminCharts({ invoices }: AdminChartsProps) {
    // 1. Chart by Agence (User City)
    const agenceData = useMemo(() => {
        if (!invoices) return [];
        const counts: Record<string, number> = {};
        invoices.forEach(inv => {
            // Group by User City as "Agence"
            const city = inv.user?.city || "Ville Inconnue";
            // Normalize city name (capitalize first letter)
            const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
            counts[normalizedCity] = (counts[normalizedCity] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [invoices]);

    // 2. Chart by CDZ/User - assuming "user.name" maps to CDZ/Agent
    const cdzData = useMemo(() => {
        if (!invoices) return [];
        const counts: Record<string, number> = {};
        invoices.forEach(inv => {
            const agent = inv.user?.name || "Unknown";
            counts[agent] = (counts[agent] || 0) + (inv.total_amount || 0); // Using Total Amount or Count? User didn't specify.
            // Let's use COUNT for consistency with "chart by agence" usually implying count, 
            // but for "User/CDZ" performance is often measured in volume.
            // Let's stick to COUNT for now as it's simpler visual.
            // Actually, let's use COUNT for both to be safe.
        });

        // Re-calculating as COUNT
        const countsByCount: Record<string, number> = {};
        invoices.forEach(inv => {
            const agent = inv.user?.name || "Unknown";
            countsByCount[agent] = (countsByCount[agent] || 0) + 1;
        });

        return Object.entries(countsByCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [invoices]);

    if (!invoices || invoices.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart by Agence (City) */}
            <div className="bg-white dark:bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-foreground">Factures par Agence (Ville)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={agenceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                {agenceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart by CDZ (User) */}
            <div className="bg-white dark:bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-foreground">Performance par CDZ (Top 10)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={cdzData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {cdzData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
