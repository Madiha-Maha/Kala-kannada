import { GoogleGenAI, Modality, ThinkingLevel, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

function parseJson(text: string) {
  try {
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleanText;
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Original text:", text);
    return null;
  }
}

export async function analyzeCode(code: string, fileName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a professional code audit and analysis of the following file "${fileName}":
      
      ${code}
      
      Provide a deep dive into architecture, performance, and security.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            score: { type: Type.NUMBER, description: "Technical quality score 0-100" },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["Performance", "Security", "Logic", "Style"] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["type", "title", "description"]
              }
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "score", "insights", "recommendations"]
        }
      }
    });

    return parseJson(response.text || "{}");
  } catch (error) {
    console.error("Code Analysis Error:", error);
    return null;
  }
}

export async function chatWithForgeAI(message: string, history: any[]) {
  try {
    const validHistory = history.map(h => ({
      role: h.role,
      parts: Array.isArray(h.parts) ? h.parts : [{ text: String(h.parts) }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are Forge Intelligence, a sophisticated AI developer assistant. You provide high-precision, technical advice on software architecture, systems programming, and distributed systems. Your tone is professional, concise, and academic. You avoid fluff and focus on rigorous engineering principles.",
      },
      history: validHistory,
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Forge Intelligence offline. Retry synchronization.";
  } catch (error) {
    console.error("Forge AI Error:", error);
    return "The neural link was interrupted. Please attempt re-synchronization.";
  }
}
