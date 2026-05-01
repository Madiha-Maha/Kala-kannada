import { GoogleGenAI, Modality } from "@google/genai";

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
      const binaryString = window.atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 16-bit PCM (2 bytes per sample)
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error("AudioContext not supported");
        return;
      }

      const audioCtx = new AudioContextClass();
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => {
        audioCtx.close().catch(console.error);
      };
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
      contents: "Create a very short, simple 3-sentence children's story in Kannada. Topic: Nature, Animals, or Friendship. Provide response in JSON: { \"title\": \"\", \"content\": \"(Kannada script)\", \"transliteration\": \"\", \"translation\": \"\" }",
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
      contents: "Tell me one interesting, lesser-known fact about Karnataka's culture, art, or history. Provide response in JSON: { \"title\": \"\", \"description\": \"\", \"kanTitle\": \"(Kannada name if any)\" }",
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

