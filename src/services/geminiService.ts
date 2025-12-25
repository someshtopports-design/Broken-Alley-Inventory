
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
            contents: `You are the AI Operations Director for "Broken Alley", a high-end streetwear brand. 
      Parse this user input into a structured business action: "${input}"
      
      CRITICAL INTELLIGENCE:
      - ALWAYS detecting SIZE is mandatory for product actions (e.g., S, M, L, XL, XXL). Default to 'M' if ambiguous but product is clear.
      - Detect "Manufacturing" contexts (e.g., fabric, stitching, factory payments).
      
      ACTION TYPES:
      1. **SALE**: Selling a product. Extract:
         - Customer Name, Phone, Address (if provided).
         - Item Name & Size.
         - Channel (Website, Store A, Store B). Default to 'Website' if vague.
         - Amount (if distinct from retail price).
         
      2. **EXPENSE**: Spending money. Categories:
         - "Marketing" (Ads, Collabs, Photoshoots)
         - "Manufacturing" (Fabric, Production, Factory, Stitching)
         - "Delivery" (Shipping, Dunzo, Porter)
         - "Travel" (Uber, Flight, Hotel)
         - "Samples" (Prototyping)
         - "Other"
         
      3. **TRANSFER**: Moving stock.
         - From/To: Home, Store A, Store B.
         - Quantity & Size.
         
      4. **PRODUCT_DROP**: Launching a new item.
         - Name, Cost, Sale Price.
         - Initial Size/Stock if mentioned.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: {
                            type: Type.STRING,
                            description: "One of 'sale', 'expense', 'transfer', 'product_drop'"
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
                                channel: { type: Type.STRING, description: "Sales channel" },
                                costPrice: { type: Type.NUMBER },
                                salePrice: { type: Type.NUMBER }
                            }
                        }
                    },
                    required: ["type", "data"]
                }
            }
        });

        // @ts-ignore
        const text = typeof response.text === 'function' ? response.text() : response.text;
        return JSON.parse(text);
    } catch (e) {
        console.error("AI Parse Error:", e);
        return null;
    }
};
