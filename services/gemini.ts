import { GoogleGenAI, Type } from "@google/genai";
import { IPOData, IPOStatus, ScanResult } from "../types";

// Helper to safely retrieve API key
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.API_KEY) {
      // @ts-ignore
      return import.meta.env.API_KEY;
    }
  } catch (e) {}
  return '';
};

const apiKey = getApiKey();

// --- PROMPT TEMPLATE ---
const getPrompt = () => {
  const currentDate = new Date().toDateString();
  return `
    Current Date: ${currentDate}.
    Task: Search the internet for the absolute latest IPO (Initial Public Offering) data in Nepal from sources like "Sharesansar", "MeroLagani", "Nepali Paisa", and "CDSC".

    CRITICAL REQUIREMENT: 
    You must distinguish between different "Share Types" / "Target Groups". 
    Do not just list "General Public" IPOs. You must explicitly find IPOs for:
    1. "Foreign Employment" (Migrant Workers) - THIS IS VERY IMPORTANT.
    2. "Project Affected Locals"
    3. "General Public"
    4. "Mutual Funds"

    If a company has an IPO open specifically for "Foreign Employment", list it as a SEPARATE entry.

    Find information about:
    1. IPOs currently open for subscription.
    2. IPOs approved by SEBON but not yet open.
    3. Recently closed IPOs.

    For each company, EXTRACT:
    - Company Name & Sector
    - Share Type (e.g., "Foreign Employment", "General Public").
    - Total Units & Price
    - Opening and Closing dates
    - Status (OPEN, COMING_SOON, CLOSED)
    - Description
    - Min/Max Units
    - Rating, Project Info, Risks.
    
    Also provide a 1-sentence market news summary.
  `;
};

// --- STRATEGY 1: OPENROUTER (Perplexity Online) ---
// Used when the key starts with 'sk-or-'
const fetchOpenRouter = async (key: string): Promise<ScanResult> => {
  console.log("Using OpenRouter Mode with Perplexity Online...");
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nepal-ipo-radar.vercel.app", 
      },
      body: JSON.stringify({
        model: "perplexity/llama-3.1-sonar-large-128k-online", // Has live internet access
        messages: [
          {
            role: "system",
            content: "You are a helpful financial assistant. You MUST return data in valid JSON format only, with no markdown formatting."
          },
          {
            role: "user",
            content: getPrompt() + `
            
            RETURN JSON ONLY matching this structure:
            {
              "newsSummary": "string",
              "ipos": [
                {
                  "companyName": "string",
                  "sector": "string",
                  "shareType": "string",
                  "units": number,
                  "price": number,
                  "openingDate": "string",
                  "closingDate": "string",
                  "status": "OPEN" | "COMING_SOON" | "CLOSED",
                  "description": "string",
                  "minUnits": number,
                  "maxUnits": number,
                  "rating": "string",
                  "projectDescription": "string",
                  "risks": "string"
                }
              ]
            }`
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Clean markdown if present
    const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonString);

    return {
      ipos: parsed.ipos || [],
      newsSummary: parsed.newsSummary || "Market data retrieved via OpenRouter.",
      lastUpdated: new Date().toLocaleTimeString(),
    };

  } catch (error) {
    console.error("OpenRouter Fetch Error:", error);
    throw error;
  }
};

// --- STRATEGY 2: GOOGLE GENAI SDK ---
// Used when key is a standard Google key
const fetchGoogleGenAI = async (key: string): Promise<ScanResult> => {
  console.log("Using Google GenAI SDK Mode...");
  const ai = new GoogleGenAI({ apiKey: key });
  const modelId = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model: modelId,
    contents: getPrompt(),
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          newsSummary: { type: Type.STRING },
          ipos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                companyName: { type: Type.STRING },
                sector: { type: Type.STRING },
                shareType: { type: Type.STRING, description: "e.g. Foreign Employment, General Public, Locals" },
                units: { type: Type.NUMBER },
                price: { type: Type.NUMBER },
                openingDate: { type: Type.STRING },
                closingDate: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["OPEN", "COMING_SOON", "CLOSED", "LISTED"] },
                description: { type: Type.STRING },
                minUnits: { type: Type.NUMBER },
                maxUnits: { type: Type.NUMBER },
                rating: { type: Type.STRING },
                projectDescription: { type: Type.STRING },
                risks: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  if (response.text) {
    const data = JSON.parse(response.text);
    return {
      ipos: data.ipos || [],
      newsSummary: data.newsSummary || "No summary available.",
      lastUpdated: new Date().toLocaleTimeString(),
    };
  }
  throw new Error("No data returned from Gemini");
};

// --- MAIN EXPORT ---
export const fetchLiveIPOData = async (): Promise<ScanResult> => {
  if (!apiKey) {
    console.error("No API Key found");
    // Return empty fallback structure or throw
    return { ipos: [], newsSummary: "API Key missing.", lastUpdated: "Error" };
  }

  // Detect Key Type
  if (apiKey.startsWith('sk-or-')) {
    return fetchOpenRouter(apiKey);
  } else {
    return fetchGoogleGenAI(apiKey);
  }
};