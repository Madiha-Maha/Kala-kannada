import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generatePracticeSentence(level: string) {
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

  return JSON.parse(response.text || "{}");
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
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768;
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
}

export async function chatWithAi(message: string, history: any[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a friendly Kannada language tutor named Kala. Help the user learn Kannada. Speak mostly in English but provide Kannada translations and transliterations for key phrases. Keep responses short, encouraging, and educational. Always provide Kannada script and its English pronunciation (transliteration). If the user asks for a chat, start by greeting them in Kannada.",
    },
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result.text || "";
}

export async function generateStory() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Create a very short, simple 3-sentence children's story in Kannada. Topic: Nature, Animals, or Friendship. Provide response in JSON: { \"title\": \"\", \"content\": \"(Kannada script)\", \"transliteration\": \"\", \"translation\": \"\" }",
    config: {
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function generateCultureFact() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Tell me one interesting, lesser-known fact about Karnataka's culture, art, or history. Provide response in JSON: { \"title\": \"\", \"description\": \"\", \"kanTitle\": \"(Kannada name if any)\" }",
    config: {
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || "{}");
}
