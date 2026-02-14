import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LogOut, Home, FileText, Settings, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import logo from "@/assets/logo.png";

export function Layout() {
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    const navItems = profile?.role === 'admin'
        ? [
            { label: "Tableau de Bord", icon: Settings, path: "/admin" },
            // Admin can still access "/" via the "Create Invoice" button, but it's not in the menu.
        ]
        : [
            { label: "Tableau de Bord", icon: Home, path: "/" },
            { label: "Historique", icon: FileText, path: "/history" },
        ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background flex font-sans text-slate-900 dark:text-slate-50">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white dark:bg-card border-b border-border h-16 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="text-lg font-bold tracking-tight">AI Analyse Factures</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-card border-r border-slate-200 dark:border-border p-6 flex flex-col gap-6 transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 md:h-screen shadow-2xl md:shadow-sm overflow-y-auto",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between md:justify-start gap-3 px-2">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tight">AI Analyse Factures</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col gap-1 mt-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-md dark:bg-slate-800"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-muted"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-border">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center text-slate-600 font-bold">
                            {profile?.name?.substring(0, 2) || "U"}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-semibold truncate">{profile?.name}</div>
                            <div className="text-xs text-slate-500 truncate">{profile?.city}</div>
                        </div>
                    </div>

                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-muted rounded-xl transition-colors text-sm font-medium mb-1"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {theme === 'dark' ? "Mode clair" : "Mode sombre"}
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-auto pt-20 md:pt-8 w-full">
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
