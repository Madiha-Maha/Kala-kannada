import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

function parseJson(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Original text:", text);
    return {};
  }
}

export async function generatePracticeSentence(level: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a simple practice sentence in Kannada for a beginner learning the topic: ${level}. 
      Provide the response in JSON format with the following structure:
      {
        "kannada": "sentence in Kannada script",
        "transliteration": "pronunciation in English",
        "english": "English translation",
        "explanation": "brief grammatical tip"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return parseJson(response.text || "{}");
  } catch (error) {
    console.error("Generate Practice Sentence Error:", error);
    return {};
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
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstruction || "You are a distinguished Kannada language mentor. Your purpose is to facilitate fluent conversation and deep cultural understanding. Communicate with professional elegance. When providing Kannada, always include the script (ಅಕ್ಷರ), the standard transliteration, and the English meaning. Maintain a supportive, human-like persona. Avoid any technical references to being an artificial intelligence.",
      },
      history: history,
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I apologize, but I could not process your request at this moment. Could you please try again?";
  } catch (error) {
    console.error("Dialogue Error:", error);
    return "I seem to be experiencing a brief delay in communication. Please attempt your response once more.";
  }
}

export async function generateInfiniteLesson() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a unique, advanced-level Kannada practice session. 
      Generate 5 challenging items (phrases or words) about complex real-world situations (e.g., banking, law, poetry, or deep philosophy).
      Format as JSON: { "title": "Mastery Session", "items": [ { "q": "Kannada script", "a": "transliteration", "t": "meaning" } ] }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return parseJson(response.text || "{}");
  } catch (error) {
    console.error("Infinite Lesson Error:", error);
    return { title: "Mastery Lab", items: [] };
  }
}

export async function generateStory() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create an interactive 3-scene mini-story in Kannada for beginners. 
      Theme: Daily Adventure. 
      Format as JSON: 
      { 
        "title": "Story Title",
        "scenes": [
          {
            "id": "start",
            "text": "Kannada script text for first scene",
            "transliteration": "pronunciation",
            "translation": "English meaning",
            "imageSearchTerm": "one word for background image",
            "choices": [
              { "text": "Action option 1", "next": "scene2_a" },
              { "text": "Action option 2", "next": "scene2_b" }
            ]
          },
          ... up to 3 scenes plus ending scenes ...
        ]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return parseJson(response.text || "{}");
  } catch (error) {
    console.error("Generate Story Error:", error);
    return {};
  }
}

export async function generateCultureFact() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tell me one unique fact about Karnataka's culture. Include a search term for an image.
      Provide response in JSON: { "title": "Fact Title", "description": "fact details", "kanTitle": "Kannada Title", "imageTerm": "search keyword" }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return parseJson(response.text || "{}");
  } catch (error) {
    console.error("Generate Culture Fact Error:", error);
    return {};
  }
}

