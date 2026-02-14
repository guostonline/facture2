import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
import { AGENCES, CDZ_LIST, CDA_LIST, VENDEURS_GROS } from "@/constants/agencies";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [agency, setAgency] = useState("");
    const [role, setRole] = useState("CDZ");
    const [isManualName, setIsManualName] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Derived list of names based on Agency and Role
    const availableNames = useMemo(() => {
        if (!agency) return [];
        if (role === "CDZ") return CDZ_LIST.filter(i => i.agence === agency).map(i => i.cdz);
        if (role === "CDA") return CDA_LIST.filter(i => i.agence === agency).map(i => i.cda);
        if (role === "Vendeur Gros") return VENDEURS_GROS.filter(i => i.agence === agency).map(i => i.vendeur);
        return [];
    }, [agency, role]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email.endsWith("@madec.co.ma")) {
            setError("L'email doit appartenir au domaine @madec.co.ma");
            setLoading(false);
            return;
        }

        try {
            const { data: { user }, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        city: agency,
                        role: "user",
                        job_title: role
                    }
                }
            });

            if (authError) throw authError;

            if (user) {
                navigate("/");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAgency(e.target.value);
        setName("");
        setIsManualName(false);
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
        setName("");
        setIsManualName(false);
    };

    const showManualInput = role === "Autre" || role === "Siège" || isManualName || availableNames.length === 0;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <ThemeToggle className="absolute top-4 right-4 z-50" />

            {/* Background gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-2xl p-8 space-y-6 relative z-10">
                <div className="text-center flex flex-col items-center">
                    <img src={logo} alt="Logo" className="w-16 h-16 mb-4 object-contain" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AI Analyse Factures
                    </h1>
                    <p className="text-muted-foreground mt-2">Créez votre compte</p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Agence</label>
                        <select
                            required
                            className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            value={agency}
                            onChange={handleAgencyChange}
                        >
                            <option value="">Sélectionnez l'agence</option>
                            {AGENCES.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fonction / Rôle</label>
                        <select
                            required
                            className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            value={role}
                            onChange={handleRoleChange}
                        >
                            <option value="CDZ">CDZ</option>
                            <option value="CDA">CDA (Chef d'Agence)</option>
                            <option value="Vendeur Gros">Vendeur Gros</option>
                            <option value="Siège">Siège</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nom complet</label>
                        {showManualInput ? (
                            <input
                                type="text"
                                placeholder="Entrez votre nom complet"
                                required
                                className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all animate-in fade-in"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        ) : (
                            <>
                                <select
                                    required
                                    disabled={!agency}
                                    className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                                    value={isManualName ? "OTHER" : name}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "OTHER") {
                                            setIsManualName(true);
                                            setName("");
                                        } else {
                                            setIsManualName(false);
                                            setName(val);
                                        }
                                    }}
                                >
                                    <option value="">Sélectionnez votre nom</option>
                                    {availableNames.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                    <option value="OTHER">Autre (Saisir manuellement)</option>
                                </select>
                            </>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email (@madec.co.ma)</label>
                        <input
                            type="email"
                            placeholder="nom@madec.co.ma"
                            required
                            className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Créez un mot de passe"
                                required
                                className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25"
                    >
                        {loading ? "Création du compte..." : "S'inscrire"}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
                    <Link to="/login" className="text-primary hover:underline font-medium">
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
}
