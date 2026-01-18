import { GoogleGenAI, Type } from "@google/genai";
import { IPOData, IPOStatus, ScanResult } from "../types";

// Initialize Gemini
// NOTE: We use the API Key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchLiveIPOData = async (): Promise<ScanResult> => {
  const modelId = "gemini-3-flash-preview"; // Excellent for speed and tool use

  const currentDate = new Date().toDateString();

  const prompt = `
    Current Date: ${currentDate}.
    Task: Search the internet for the absolute latest IPO (Initial Public Offering) data in Nepal from sources like "Sharesansar", "MeroLagani", "Nepali Paisa", and "CDSC".

    CRITICAL REQUIREMENT: 
    You must distinguish between different "Share Types" / "Target Groups". 
    Do not just list "General Public" IPOs. You must explicitly find IPOs for:
    1. "Foreign Employment" (Migrant Workers) - THIS IS VERY IMPORTANT.
    2. "Project Affected Locals"
    3. "General Public"
    4. "Mutual Funds"

    If a company (e.g., a Hotel, Hydropower, or Manufacturing) has an IPO open specifically for "Foreign Employment", list it as a SEPARATE entry or clearly mark it. Do not assume all IPOs are for the general public.

    Find information about:
    1. IPOs currently open for subscription (Check for Foreign Employment deadlines specifically).
    2. IPOs approved by SEBON but not yet open.
    3. Recently closed IPOs.

    For each company, EXTRACT DEEP DETAILS:
    - Company Name & Sector
    - Share Type: EXACTLY who can apply? (e.g., "Foreign Employment", "General Public", "Locals").
    - Total Units offered & Price per unit
    - Opening and Closing dates
    - Status (OPEN, COMING_SOON, CLOSED)
    - Brief description/news summary.
    - Application Quotas: Minimum and Maximum units.
    - Credit Rating (e.g., "ICRA NP Double B").
    - Project Background (e.g., "Hotel Forest project details", "Hydropower capacity").
    - Risk Factors.
    
    Also provide a very short 1-sentence summary of the overall market sentiment.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable live internet access
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

  } catch (error) {
    console.error("Gemini Scan Error:", error);
    // Return mock data fallback if API fails or key is missing
    return {
      ipos: [
        {
          companyName: "Example Hotel Forest Ltd (Fallback)",
          sector: "Hotel & Tourism",
          shareType: "Foreign Employment",
          units: 120000,
          price: 100,
          openingDate: "2024-05-20",
          closingDate: "2024-06-05",
          status: IPOStatus.OPEN,
          description: "Exclusive quota for Nepalese citizens working abroad. Fallback data shown due to connection error.",
          minUnits: 10,
          maxUnits: 2000,
          rating: "CARE NP BB",
          projectDescription: "A luxury resort project.",
          risks: "Tourism fluctuation risks."
        },
        {
          companyName: "Solu Hydropower Limited",
          sector: "Hydropower",
          shareType: "General Public",
          units: 1200000,
          price: 100,
          openingDate: "2024-05-20",
          closingDate: "2024-05-24",
          status: IPOStatus.OPEN,
          description: "General public issuance for Solu Hydro.",
          minUnits: 10,
          maxUnits: 10000,
          rating: "ICRA NP BB+",
          projectDescription: "Run-of-River project details...",
          risks: "Hydrological risks."
        }
      ],
      newsSummary: "System could not connect to live intelligence network.",
      lastUpdated: new Date().toLocaleTimeString(),
    };
  }
};