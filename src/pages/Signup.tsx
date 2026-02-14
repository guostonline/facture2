import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

// Data mapping Agencies to CDZs
const AGENCY_CDZ_MAP: Record<string, string[]> = {
    "AGADIR": ["CHAKIB EL FIL", "BOUTMEZGUINE MOSTAFA"],
    "OUJDA": ["MOHAMED KANI", "RACHID MADANE"],
    "FES": ["AHMED RAJA"],
    "TANGER": ["CDZ TANGER DET", "MOHAMED ELBAHOUDI"],
    "CASA": ["IZEN NABIL", "TOUMLILT HASSAN", "ABOULHASSANE ABDELOUAHE", "FAYCEL OUDGHIRI", "BADEREDDINE HAFID"],
    "RABAT": ["BAALAKI YOUSSEF", "BOULEMDARAT AHMED", "HASSAN EL AOUNI"],
    "MEKNES": ["HAMZA EL BIAD", "CDZ MEKNES DET"],
    "MARRAKECH": ["HADDOU OUAIJANE", "MESKOURI IDDER"],
    "SIEGE": []
};

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [agency, setAgency] = useState("");
    const [isManualCdz, setIsManualCdz] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email.endsWith("@madec.co.ma")) {
            setError("Email must be from @madec.co.ma domain");
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
                        role: "user"
                    }
                }
            });

            if (authError) throw authError;

            if (user) {
                // Profile creation is now handled by a database trigger on auth.users
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
        setName(""); // Reset CDZ name when agency changes
        setIsManualCdz(false);
    };

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
                            {Object.keys(AGENCY_CDZ_MAP).map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {agency === "SIEGE" ? "Nom complet" : "Nom du CDZ"}
                        </label>
                        {agency === "SIEGE" ? (
                            <input
                                type="text"
                                placeholder="Entrez votre nom complet"
                                required
                                className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        ) : (
                            <>
                                <select
                                    required
                                    disabled={!agency}
                                    className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                                    value={isManualCdz ? "OTHER" : name}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "OTHER") {
                                            setIsManualCdz(true);
                                            setName("");
                                        } else {
                                            setIsManualCdz(false);
                                            setName(val);
                                        }
                                    }}
                                >
                                    <option value="">Sélectionnez le CDZ</option>
                                    {agency && AGENCY_CDZ_MAP[agency]?.map((cdz) => (
                                        <option key={cdz} value={cdz}>{cdz}</option>
                                    ))}
                                    <option value="OTHER">Autre (Saisir manuellement)</option>
                                </select>

                                {isManualCdz && (
                                    <input
                                        type="text"
                                        placeholder="Entrez votre nom complet"
                                        required
                                        autoFocus
                                        className="w-full mt-2 px-4 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all animate-in fade-in slide-in-from-top-1"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                )}
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
