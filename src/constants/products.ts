
export type Category = "Bouillon" | "Mayonnaise" | "Soup" | "Seasoning" | "Other";

export interface ProductRule {
    keyword: string;
    category: string;
}

export const PRODUCT_RULES: ProductRule[] = [
    { keyword: "knorr", category: "Bouillon" },
    { keyword: "ideal", category: "Dairy" },
    { keyword: "vio", category: "Water" },
    { keyword: "danone", category: "Dairy" },
];

export const DEFAULT_CATEGORIES = [
    "Bouillon",
    "Mayonnaise",
    "Soup",
    "Seasoning",
    "Dairy",
    "Water",
    "Beverage",
    "Snack",
    "Other"
];

export function detectCategory(text: string): string {
    const lowerText = text.toLowerCase();
    for (const rule of PRODUCT_RULES) {
        if (lowerText.includes(rule.keyword.toLowerCase())) {
            return rule.category;
        }
    }
    return "Other";
}
