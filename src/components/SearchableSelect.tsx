import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder: string;
    label?: string;
    defaultOptionLabel?: string; // Text for the "All"/"Reset" option
    defaultOptionValue?: string; // Value for the "All"/"Reset" option (e.g., "all" or "")
}

export function SearchableSelect({
    value,
    onChange,
    options,
    placeholder,
    label,
    defaultOptionLabel,
    defaultOptionValue
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options
    const filteredOptions = options.filter(option =>
        option && option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-2" ref={dropdownRef}>
            {label && <label className="text-sm font-medium text-muted-foreground">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-muted/50 rounded-xl text-sm font-medium transition-colors border border-transparent focus:border-blue-500/50 outline-none",
                        isOpen && "ring-2 ring-blue-500/20 border-blue-500/50"
                    )}
                >
                    <span className={cn("truncate", !value && "text-muted-foreground")}>
                        {value === defaultOptionValue ? defaultOptionLabel || placeholder : value || placeholder}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-2", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-card border border-border rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95 overflow-hidden">
                        <div className="p-2 border-b border-border/50">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1">
                            {defaultOptionLabel && (
                                <button
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                                        value === defaultOptionValue ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-muted/50"
                                    )}
                                    onClick={() => {
                                        onChange(defaultOptionValue || "");
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    <span>{defaultOptionLabel}</span>
                                    {value === defaultOptionValue && <Check className="w-3.5 h-3.5" />}
                                </button>
                            )}

                            {filteredOptions.length === 0 ? (
                                <div className="p-3 text-center text-xs text-muted-foreground">
                                    Aucun résultat
                                </div>
                            ) : (
                                filteredOptions.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            onChange(option);
                                            setIsOpen(false);
                                            setSearchTerm("");
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                                            value === option ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-muted/50"
                                        )}
                                    >
                                        <span className="truncate mr-2">{option}</span>
                                        {value === option && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
