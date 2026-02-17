import type { Invoice } from "@/types";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();
const SITE_URL = window.location.origin;
const SITE_NAME = "Invoice AI Helper";

export async function extractInvoiceData(file: File): Promise<Partial<Invoice>> {
    if (!OPENROUTER_API_KEY) {
        console.error("OpenRouter API Key is missing");
        throw new Error("Missing OpenRouter API Key");
    }
    // Debug: Log key prefix to ensure it's loaded
    console.log("Using OpenRouter Key:", OPENROUTER_API_KEY.substring(0, 5) + "...");

    // Convert file to Base64
    const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });

    // Remove data URL prefix (e.g., "data:image/jpeg;base64,") for API usage if needed, 
    // but OpenRouter/Gemini usually accepts the full data URL or requires specific formatting.
    // Gemini 2.0 Flash via OpenRouter supports image inputs.

    const prompt = `
    Analyze this invoice image and extract the following information in strict JSON format:
    - invoice_number (string)
    - store_name (string)
    - invoice_date (string in YYYY-MM-DD format)
    - total_amount (number)
    - tax_amount (number)
    - discount_amount (number, default 0)
    - line_items (array of objects with: product_id, description, quantity, unit_price, discount, net_price, amount)
    - promotion_mechanism (string, look for specific promo codes or text description)

    If a field is missing, use null or 0.
    Return ONLY valid JSON.
  `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001", // Or appropriate model slug
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        // Clean markdown code blocks if present
        const cleanContent = content.replace(/```json\n?|```/g, "").trim();

        return JSON.parse(cleanContent);
    } catch (error) {
        console.error("AI Extraction Failed:", error);
        throw error;
    }
}
