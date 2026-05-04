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

export async function generatePracticeSentence(level: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a simple practice sentence in Kannada for a beginner learning the topic: ${level}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kannada: { type: Type.STRING },
            transliteration: { type: Type.STRING },
            english: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["kannada", "transliteration", "english", "explanation"]
        }
      }
    });

    return parseJson(response.text || "{}") || {
      kannada: "ನಮಸ್ಕಾರ",
      transliteration: "Namaskara",
      english: "Hello",
      explanation: "A traditional greeting."
    };
  } catch (error) {
    console.error("Generate Practice Sentence Error:", error);
    return {
      kannada: "ನಮಸ್ಕಾರ",
      transliteration: "Namaskara",
      english: "Hello",
      explanation: "A traditional greeting."
    };
  }
}

let globalAudioCtx: AudioContext | null = null;

export async function speakText(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly in Kannada: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;

    if (base64Audio) {
      if (!globalAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          globalAudioCtx = new AudioContextClass();
        }
      }

      if (!globalAudioCtx) {
        console.error("AudioContext not supported");
        return;
      }

      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const numSamples = Math.floor(len / 2);
      const float32 = new Float32Array(numSamples);
      const dataView = new DataView(bytes.buffer);

      for (let i = 0; i < numSamples; i++) {
        const sample = dataView.getInt16(i * 2, true); 
        float32[i] = sample / 32768.0;
      }
      
      if (globalAudioCtx.state === 'suspended') {
        await globalAudioCtx.resume();
      }

      const buffer = globalAudioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = globalAudioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(globalAudioCtx.destination);
      source.start(0);
    }
  } catch (error) {
    console.error("Narration Audio Error:", error);
  }
}

export async function chatWithAi(message: string, history: any[], systemInstruction?: string) {
  try {
    // Filter history to ensure it strictly follows the role/parts structure
    const validHistory = history.map(h => ({
      role: h.role,
      parts: Array.isArray(h.parts) ? h.parts : [{ text: String(h.parts) }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstruction || "You are a distinguished Kannada language mentor. Your purpose is to facilitate fluent conversation and deep cultural understanding. Communicate with professional elegance. When providing Kannada, always include the script (ಅಕ್ಷರ), the standard transliteration, and the English meaning. Maintain a supportive, human-like persona. Avoid any technical references to being an artificial intelligence.",
      },
      history: validHistory,
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I apologize, but I could not process your request at this moment.";
  } catch (error) {
    console.error("Dialogue Error:", error);
    return "I seem to be experiencing a brief delay in communication. Please attempt your response once more.";
  }
}

export async function generateInfiniteLesson() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a unique, advanced-level Kannada practice session about complex real-world situations.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING, description: "Kannada script" },
                  a: { type: Type.STRING, description: "English transliteration answer" },
                  t: { type: Type.STRING, description: "English meaning/hint" }
                },
                required: ["q", "a", "t"]
              }
            }
          },
          required: ["title", "items"]
        }
      }
    });
    return parseJson(response.text || "{}") || { title: "Mastery Lab", items: [] };
  } catch (error) {
    console.error("Infinite Lesson Error:", error);
    return { title: "Mastery Lab", items: [] };
  }
}

export async function generateStory() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create an interactive 3-scene mini-story in Kannada for beginners about a daily adventure in Karnataka.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  imageSearchTerm: { type: Type.STRING },
                  choices: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        next: { type: Type.STRING }
                      },
                      required: ["text", "next"]
                    }
                  }
                },
                required: ["id", "text", "transliteration", "translation", "imageSearchTerm", "choices"]
              }
            }
          },
          required: ["title", "scenes"]
        }
      }
    });
    const parsed = parseJson(response.text || "{}");
    if (parsed && parsed.scenes && parsed.scenes.length > 0) return parsed;
    throw new Error("Invalid story structure");
  } catch (error) {
    console.error("Generate Story Error:", error);
    return {
      title: "An Ancient Tale",
      scenes: [
        {
          id: "start",
          text: "ಒಂದಾನೊಂದು ಕಾಲದಲ್ಲಿ...",
          transliteration: "Ondaanondu kaaladalli...",
          translation: "Once upon a time...",
          imageSearchTerm: "palace",
          choices: [{ text: "Listen more", next: "end" }]
        },
        {
          id: "end",
          text: "ಕಥೆ ಇಲ್ಲಿಗೆ ಮುಕ್ತಾಯವಾಯಿತು.",
          transliteration: "Kathe illige muktaayavaayitu.",
          translation: "The story concluded here.",
          imageSearchTerm: "celebration",
          choices: []
        }
      ]
    };
  }
}

export async function generateCultureFact() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tell me one unique and prestigious fact about Karnataka's culture, art, or history.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            kanTitle: { type: Type.STRING },
            imageTerm: { type: Type.STRING }
          },
          required: ["title", "description", "kanTitle", "imageTerm"]
        }
      }
    });
    return parseJson(response.text || "{}") || {
      title: "Land of Gold",
      description: "Karnataka is known for its rich sandalwood and gold mines of Kolar.",
      kanTitle: "ಚಿನ್ನದ ನಾಡು",
      imageTerm: "temple"
    };
  } catch (error) {
    console.error("Generate Culture Fact Error:", error);
    return {
      title: "Land of Gold",
      description: "Karnataka is known for its rich sandalwood and gold mines of Kolar.",
      kanTitle: "ಚಿನ್ನದ ನಾಡು",
      imageTerm: "temple"
    };
  }
}

