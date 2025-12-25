
import { GoogleGenAI, Type } from "@google/genai";

// Ensure this ENV var is set in Vercel
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseBusinessInput = async (input: string) => {
    if (!process.env.API_KEY) {
        console.warn("Missing API KEY");
        return null;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: `You are the operations manager for "Broken Alley", a streetwear brand. 
      Parse this business activity: "${input}"
      
      CRITICAL: Always look for a "size" (e.g., S, M, L, XL, XXL, Small, Medium, Large, Oversized).
      
      Rules:
      1. If they mention spending money (marketing, travel, samples, ads, delivery portal), it's an "expense".
      2. If they mention selling a product, it's a "sale". Extract customer details and SIZE.
      3. If they mention moving items between locations (Home, Store A, Store B), it's a "transfer". Extract SIZE.
      
      Current Channels: "Website", "Store A", "Store B".
      Expense Categories: "Samples", "Marketing", "Delivery", "Travel", "Production", "Other".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: {
                            type: Type.STRING,
                            description: "One of 'sale', 'expense', or 'transfer'"
                        },
                        data: {
                            type: Type.OBJECT,
                            properties: {
                                amount: { type: Type.NUMBER },
                                itemName: { type: Type.STRING },
                                size: { type: Type.STRING, description: "Size of the item (e.g. M, L, XL)" },
                                customerName: { type: Type.STRING },
                                customerPhone: { type: Type.STRING },
                                customerAddress: { type: Type.STRING },
                                category: { type: Type.STRING, description: "Category for expense" },
                                description: { type: Type.STRING },
                                from: { type: Type.STRING, description: "Source location" },
                                to: { type: Type.STRING, description: "Destination location" },
                                quantity: { type: Type.NUMBER },
                                channel: { type: Type.STRING, description: "Sales channel" }
                            }
                        }
                    },
                    required: ["type", "data"]
                }
            }
        });

        // @ts-ignore - aligning with user's previous working code usage
        return JSON.parse(response.text);
    } catch (e) {
        console.error("AI Parse Error:", e);
        return null;
    }
};
