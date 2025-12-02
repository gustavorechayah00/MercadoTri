
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Category, Condition, ChatMessage, AIProvider } from "../types";
import { configService } from "./mockBackend";

// --- PROMPTS ---
const SYSTEM_INSTRUCTION = `
Eres un experto tasador de equipamiento deportivo especializado en Triatlón, Ciclismo, Natación y Running.
Tu trabajo es analizar imágenes de productos deportivos y extraer datos estructurados para ayudar a un usuario a vender el artículo.
Debes generar el título y la descripción de venta en ESPAÑOL.
Sé preciso con la detección de la marca y la condición.
`;

const BOT_SYSTEM_INSTRUCTION = `
ROL:
Eres un triatleta experto y apasionado que ayuda a otros deportistas en la comunidad "Mercado Tri". 
Actúas como ese amigo que sabe todo sobre bicis y equipamiento. Tu objetivo es asesorar con buena onda y conocimiento técnico real.

PERSONALIDAD Y TONO (CRÍTICO):
1.  **100% HUMANO**: Nunca digas "Soy una inteligencia artificial" ni "Como modelo de lenguaje".
2.  **ARGENTINO / RIOPLATENSE**: Habla de "vos". Usa expresiones naturales (ej: "¡Qué nave esa bici!", "Dale para adelante").
3.  **EMPÁTICO Y CASUAL**: Respuestas cortas y al pie.
4.  **OPINIÓN PROPIA**: Si el usuario está viendo un producto, OPINA sobre él basándote en el contexto.

CONTEXTO DE PANTALLA:
Recibirás un texto describiendo lo que el usuario ve. Úsalo para dar respuestas precisas.

IMPORTANTE:
- Escucha el audio del usuario y responde en texto.
- Usa emojis de vez en cuando 🚴‍♂️🔥🏊‍♂️.
`;

// --- HELPER: OPENAI CALLER ---
const callOpenAI = async (apiKey: string, model: string, messages: any[], responseFormat?: any) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model || 'gpt-4o',
            messages: messages,
            response_format: responseFormat,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`OpenAI Error: ${err.error?.message || response.statusText}`);
    }
    return await response.json();
};

// --- MAIN FUNCTIONS ---

export const analyzeProductImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  // 1. Fetch Dynamic Settings
  const settings = await configService.getSettings();
  const provider = settings.aiProvider;
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  try {
    if (provider === 'openai') {
        // --- OPENAI IMPLEMENTATION ---
        if (!settings.openaiApiKey) throw new Error("API Key de OpenAI no configurada.");
        
        const messages = [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { 
                role: "user", 
                content: [
                    { type: "text", text: "Analiza esta imagen y devuelve JSON con: title, category, brand, condition, description, suggestedPrice, tags." },
                    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
                ] 
            }
        ];

        const data = await callOpenAI(settings.openaiApiKey, settings.openaiModel || 'gpt-4o', messages, { type: "json_object" });
        const result = JSON.parse(data.choices[0].message.content);

        // Normalize result
        return {
            title: result.title || "Artículo Desconocido",
            category: (result.category as Category) || Category.OTHER,
            brand: result.brand || "Genérico",
            condition: (result.condition as Condition) || Condition.USED_GOOD,
            description: result.description || "Sin descripción.",
            suggestedPrice: result.suggestedPrice || 0,
            tags: result.tags || [],
            confidenceScore: 0.9
        };

    } else {
        // --- GEMINI IMPLEMENTATION (Default) ---
        // Fallback to process.env if DB key is missing (for backward compat or dev)
        const apiKey = settings.geminiApiKey || process.env.API_KEY; 
        if (!apiKey) throw new Error("API Key de Gemini no configurada.");

        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: settings.geminiModel || "gemini-2.5-flash",
          contents: {
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
              { text: "Analiza esta imagen. Identifica el producto deportivo, marca, categoría, condición visual y sugiere un precio en USD. Genera un título y una descripción de venta atractiva en ESPAÑOL." }
            ]
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Cycling", "Running", "Swimming", "Triathlon", "Other"] },
                brand: { type: Type.STRING },
                condition: { type: Type.STRING, enum: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
                description: { type: Type.STRING },
                suggestedPrice: { type: Type.NUMBER },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidenceScore: { type: Type.NUMBER }
              },
              required: ["title", "category", "brand", "condition", "description", "suggestedPrice", "tags"]
            }
          }
        });

        const result = JSON.parse(response.text || "{}");
        return {
          title: result.title || "Artículo Desconocido",
          category: (result.category as Category) || Category.OTHER,
          brand: result.brand || "Genérico",
          condition: (result.condition as Condition) || Condition.USED_GOOD,
          description: result.description || "Sin descripción.",
          suggestedPrice: result.suggestedPrice || 0,
          tags: result.tags || [],
          confidenceScore: result.confidenceScore || 0.5
        };
    }

  } catch (error: any) {
    console.error("AI Analysis Failed:", error);
    throw new Error(`Falló el análisis de IA (${provider}): ${error.message}`);
  }
};

export const chatWithTriBot = async (audioBase64: string, history: ChatMessage[], screenContext: string): Promise<string> => {
  const settings = await configService.getSettings();
  const provider = settings.aiProvider;
  const cleanBase64 = audioBase64.split(',')[1] || audioBase64;
  
  try {
      const recentHistory = history.slice(-3).map(h => `${h.sender === 'user' ? 'Usuario' : 'TriBot'}: ${h.text}`).join('\n');
      const promptText = `
        CONTEXTO ACTUAL DE LA PANTALLA: ${screenContext}
        HISTORIAL RECIENTE: ${recentHistory}
        INSTRUCCIÓN: Escucha (o lee) el input del usuario y responde.
      `;

      if (provider === 'openai') {
         // OpenAI Audio/Vision logic is complex via REST. 
         // For ChatBot context, we will fallback to text-only if audio is passed, 
         // OR we assume the user just wants text response. 
         // *Simulated Audio Transcription for OpenAI*: Real implementation requires Whisper API.
         // For now, we will fail gracefully or assume text input if we refactor.
         // But TriBot sends AUDIO.
         
         // NOTE: Implementing OpenAI Whisper + Chat here requires 2 calls.
         // To keep it simple: We return a placeholder message if they try audio with OpenAI without Whisper.
         return "TriBot con audio requiere configuración avanzada de OpenAI (Whisper). Por ahora usa Gemini para audio.";
         
      } else {
        // --- GEMINI (Native Audio Support) ---
        const apiKey = settings.geminiApiKey || process.env.API_KEY;
        if (!apiKey) throw new Error("API Key de Gemini no configurada.");

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: settings.geminiModel || "gemini-2.5-flash",
            contents: {
                parts: [
                    { inlineData: { mimeType: "audio/wav", data: cleanBase64 } },
                    { text: promptText }
                ]
            },
            config: { systemInstruction: BOT_SYSTEM_INSTRUCTION }
        });

        return response.text || "No entendí, ¿podés repetir?";
      }

  } catch (error) {
    console.error("TriBot Error:", error);
    return "Uy, se me cortó la conexión. Probá de nuevo.";
  }
};
