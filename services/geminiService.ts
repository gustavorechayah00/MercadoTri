
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Category, Condition, ChatMessage, AIProvider } from "../types";
import { configService, productService } from "./mockBackend";

// --- PROMPTS ---
const SYSTEM_INSTRUCTION = `
Eres un experto tasador de equipamiento deportivo y moderador de contenido.
Tu tarea principal es doble:
1. MODERACIÓN ÉTICA (PRIORIDAD MÁXIMA):
   - Analiza la imagen en busca de contenido ofensivo, sexualmente explícito, pornografía, violencia, símbolos de odio, discriminación política, religiosa o racial.
   - Si detectas CUALQUIERA de estos elementos, establece "isSafe" en false y explica la razón en "safetyReason".
   - Si la imagen no tiene relación con productos deportivos (ej: una selfie, un paisaje sin contexto, comida), también puedes marcarla como insegura o irrelevante.

2. ANÁLISIS DE PRODUCTO:
   - Solo si la imagen es segura, extrae los datos del producto deportivo.
   - Genera título y descripción en ESPAÑOL.
`;

const BOT_SYSTEM_INSTRUCTION = `
ROL:
Eres "TriBot", el asistente experto de Mercado Tri.
Tu objetivo es ayudar a los usuarios a encontrar productos en nuestra base de datos y asesorarlos sobre triatlón.

CONOCIMIENTO:
Tienes acceso al INVENTARIO ACTUAL de la tienda (listado abajo).
- Si te preguntan por un producto, busca en tu lista de inventario.
- IMPORTANTE: Cuando recomiendes un producto específico del inventario, DEBES usar estrictamente el siguiente formato para crear un enlace:
  [Título del Producto](ID:id_del_producto)
  Ejemplo: "Te recomiendo la [Bicicleta Cervelo P5](ID:123-abc) que está a buen precio."
- Si no encuentras algo, sugiere productos similares o di que no hay stock por ahora.
- Eres experto técnico: puedes explicar diferencias entre bicis de ruta y triatlón, tipos de neoprenos, etc.

PERSONALIDAD:
- Profesional, objetivo y servicial (Tono Neutro).
- Hablas español neutro, claro y sin modismos regionales.
- Evita el uso de jerga local o excesiva informalidad.

FORMATO DE RESPUESTA:
- Usa el formato de enlace [Titulo](ID:uuid) siempre que menciones un item específico.
- Usa listas con viñetas (*) para enumerar opciones.
- Usa negritas (**) para resaltar características clave o precios.
- Separa las ideas en párrafos cortos.
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
                    { type: "text", text: "Analiza esta imagen. Devuelve JSON con: isSafe, safetyReason, title, category, brand, condition, description, suggestedPrice, tags." },
                    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
                ] 
            }
        ];

        const data = await callOpenAI(settings.openaiApiKey, settings.openaiModel || 'gpt-4o', messages, { type: "json_object" });
        const result = JSON.parse(data.choices[0].message.content);

        if (result.isSafe === false) {
             throw new Error(`Imagen rechazada por moderación: ${result.safetyReason || 'Contenido inapropiado detectado.'}`);
        }

        return {
            title: result.title || "Artículo Desconocido",
            category: (result.category as Category) || Category.OTHER,
            brand: result.brand || "Genérico",
            condition: (result.condition as Condition) || Condition.USED_GOOD,
            description: result.description || "Sin descripción.",
            suggestedPrice: result.suggestedPrice || 0,
            tags: result.tags || [],
            confidenceScore: 0.9,
            isSafe: true
        };

    } else {
        // --- GEMINI IMPLEMENTATION (Default) ---
        const apiKey = settings.geminiApiKey || process.env.API_KEY; 
        if (!apiKey) throw new Error("API Key de Gemini no configurada.");

        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: settings.geminiModel || "gemini-2.5-flash",
          contents: {
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
              { text: "Analiza esta imagen. Verifica seguridad ética y moral primero. Si es segura, identifica el producto deportivo." }
            ]
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isSafe: { type: Type.BOOLEAN },
                safetyReason: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Cycling", "Running", "Swimming", "Triathlon", "Other"] },
                brand: { type: Type.STRING },
                condition: { type: Type.STRING, enum: ["New", "Used - Like New", "Used - Good", "Used - Fair"] },
                description: { type: Type.STRING },
                suggestedPrice: { type: Type.NUMBER },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidenceScore: { type: Type.NUMBER }
              },
              required: ["isSafe", "title", "category", "brand", "condition", "description", "suggestedPrice", "tags"]
            }
          }
        });

        const result = JSON.parse(response.text || "{}");
        
        if (result.isSafe === false) {
            throw new Error(`Imagen rechazada por moderación: ${result.safetyReason || 'Contenido inapropiado detectado.'}`);
        }

        return {
          title: result.title || "Artículo Desconocido",
          category: (result.category as Category) || Category.OTHER,
          brand: result.brand || "Genérico",
          condition: (result.condition as Condition) || Condition.USED_GOOD,
          description: result.description || "Sin descripción.",
          suggestedPrice: result.suggestedPrice || 0,
          tags: result.tags || [],
          confidenceScore: result.confidenceScore || 0.5,
          isSafe: true
        };
    }

  } catch (error: any) {
    console.error("AI Analysis Failed:", error);
    throw error;
  }
};

export const chatWithTriBot = async (input: { type: 'audio' | 'text', content: string }, history: ChatMessage[], screenContext: string): Promise<string> => {
  const settings = await configService.getSettings();
  const provider = settings.aiProvider;
  
  try {
      // --- RAG: Fetch Products ---
      const products = await productService.getAll();
      const publishedProducts = products.filter(p => p.status === 'published');
      
      const inventoryContext = publishedProducts.length > 0 
        ? publishedProducts.map(p => `- ${p.title} (ID:${p.id}) | ${p.category} | $${p.price} | Marca: ${p.brand}`).join('\n')
        : "No hay productos publicados en este momento.";

      const recentHistory = history.slice(-5).map(h => `${h.sender === 'user' ? 'Usuario' : 'TriBot'}: ${h.text}`).join('\n');
      
      const promptText = `
        CONTEXTO VISUAL PANTALLA: ${screenContext}
        
        INVENTARIO DISPONIBLE (Usa los IDs provistos para crear enlaces):
        ${inventoryContext}

        HISTORIAL RECIENTE:
        ${recentHistory}
        
        ${input.type === 'text' ? `PREGUNTA DEL USUARIO: ${input.content}` : 'INSTRUCCIÓN: El usuario envió un audio. Responde a lo que escuchas.'}
      `;

      if (provider === 'openai') {
         if (input.type === 'audio') {
             return "TriBot con audio requiere configuración avanzada de OpenAI (Whisper). Por favor escribe tu consulta.";
         }
         
         if (!settings.openaiApiKey) throw new Error("OpenAI API Key missing");
         
         const messages = [
            { role: "system", content: BOT_SYSTEM_INSTRUCTION },
            { role: "user", content: promptText }
         ];
         
         const data = await callOpenAI(settings.openaiApiKey, settings.openaiModel || 'gpt-4o', messages);
         return data.choices[0].message.content;

      } else {
        // --- GEMINI (Native Audio & Text) ---
        const apiKey = settings.geminiApiKey || process.env.API_KEY;
        if (!apiKey) throw new Error("API Key de Gemini no configurada.");

        const ai = new GoogleGenAI({ apiKey });
        
        const parts: any[] = [];
        
        // Add Audio Part if exists
        if (input.type === 'audio') {
            const cleanBase64 = input.content.split(',')[1] || input.content;
            parts.push({ inlineData: { mimeType: "audio/wav", data: cleanBase64 } });
        }
        
        // Add Text Part
        parts.push({ text: promptText });

        const response = await ai.models.generateContent({
            model: settings.geminiModel || "gemini-2.5-flash",
            contents: { parts },
            config: { systemInstruction: BOT_SYSTEM_INSTRUCTION }
        });

        return response.text || "No entendí, ¿podrías repetir?";
      }

  } catch (error) {
    console.error("TriBot Error:", error);
    return "Estoy teniendo problemas para conectar con la base de datos. Por favor intenta nuevamente.";
  }
};

export const generateShopName = async (userName: string, userEmail: string): Promise<string> => {
    const settings = await configService.getSettings();
    const apiKey = settings.geminiApiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key de Gemini no configurada.");

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Genera un nombre creativo y corto para una tienda de triatlón. 
    El dueño se llama "${userName}" y su email es "${userEmail}".
    Usa esta info para inspirarte. El nombre debe sonar profesional y deportivo.
    Solo devuelve el nombre sugerido, nada más. Sin comillas.`;

    const response = await ai.models.generateContent({
        model: settings.geminiModel || "gemini-2.5-flash",
        contents: { parts: [{ text: prompt }] }
    });
    
    return response.text?.trim() || "TriShop";
};
