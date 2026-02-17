import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LogOut, Home, FileText, Settings, Sun, Moon, Menu, X, ChevronLeft, ChevronRight, ArrowRightLeft } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import logo from "@/assets/logo.png";

export function Layout() {
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

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
            { label: "Comparer", icon: ArrowRightLeft, path: "/compare" },
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
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 bg-card border-r border-border flex flex-col transition-all duration-300 md:sticky md:top-0 md:h-screen shadow-2xl md:shadow-sm overflow-hidden",
                mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
                isCollapsed ? "md:w-20" : "md:w-64"
            )}>
                <div className={cn("flex items-center gap-3 px-4 py-6", isCollapsed ? "justify-center" : "justify-between")}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 animate-in fade-in duration-300">
                            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold tracking-tight whitespace-nowrap text-foreground">AI Factures</span>
                        </div>
                    )}
                    {isCollapsed && <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />}

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col gap-2 mt-2 px-3 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={isCollapsed ? item.label : undefined}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                {!isCollapsed && <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-4 border-t border-border p-3 space-y-2 bg-card">
                    {/* User Profile */}
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3 px-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold shrink-0">
                                {profile?.name?.substring(0, 2) || "U"}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-sm font-semibold truncate text-foreground">{profile?.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{profile?.city}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-2">
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xs">
                                {profile?.name?.substring(0, 2) || "U"}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        title={isCollapsed ? (theme === 'dark' ? "Mode clair" : "Mode sombre") : undefined}
                        className={cn("w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors text-sm font-medium", isCollapsed && "justify-center")}
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
                        {!isCollapsed && <span className="truncate">{theme === 'dark' ? "Mode clair" : "Mode sombre"}</span>}
                    </button>
                    <button
                        onClick={handleSignOut}
                        title={isCollapsed ? "Déconnexion" : undefined}
                        className={cn("w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-sm font-medium", isCollapsed && "justify-center")}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span className="truncate">Déconnexion</span>}
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
