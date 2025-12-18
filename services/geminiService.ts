
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ThemeSuggestion, 
  AspectRatio, 
  StudioAngle, 
  InfluencerScene,
  OutfitInput
} from "../types";

// Helper to create a fresh AI instance for every call as per SDK guidelines
const getAI = () => {
  const manualKey = localStorage.getItem('VISION_API_KEY');
  const envKey = process.env.API_KEY;
  const key = manualKey || envKey;
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Robust Error Handling & Retry Logic
 */
export const isAuthError = (error: any): boolean => {
  const msg = error?.message?.toLowerCase() || "";
  return msg.includes('api key') || msg.includes('unauthorized') || msg.includes('not found') || msg.includes('permission');
};

export const isQuotaError = (error: any): boolean => {
  const msg = error?.message?.toLowerCase() || "";
  return msg.includes('quota') || msg.includes('limit exceeded') || msg.includes('429') || msg.includes('exhausted');
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (isQuotaError(err) && i < retries - 1) {
        const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await delay(waitTime);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export const safeSaveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

/**
 * NEW: Generic Analysis for Marketing & Intelligence
 */
export const runTextAnalysis = async (systemInstruction: string, prompt: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction
      }
    });
    return res.text || "No analysis generated.";
  });
};

/**
 * TEXT & ANALYSIS TASKS (Using High-Quota Gemini 3 Flash)
 */
export const generateDescriptionFromImage = async (imageBase64: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Analyze this product in detail. Provide a professional e-commerce description emphasizing materials, shape, and premium qualities. Max 50 words." }
        ]
      }
    });
    return res.text || "Professional product shoot.";
  });
};

export const analyzeProductContext = async (imageBase64: string, description: string, category: string): Promise<ThemeSuggestion[]> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Based on this product (${description}) in category ${category}, suggest 4 diverse professional photography themes (e.g., 'Minimalist Studio', 'Industrial Loft', 'Nature Sunlight'). Return as a JSON array of {title, prompt}. Output ONLY JSON.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              prompt: { type: Type.STRING }
            },
            required: ["title", "prompt"]
          }
        }
      }
    });
    try {
      return JSON.parse(res.text || "[]");
    } catch {
      return [];
    }
  });
};

export const suggestInfluencerScenes = async (productImages: string[], description: string, gender: string): Promise<InfluencerScene[]> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: productImages[0].split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Suggest 4 diverse Indian influencer video scenes for this product: ${description}. Targeting ${gender} influencer. Return as JSON array of {title, description, persona, setting}. Output ONLY JSON.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              persona: { type: Type.STRING },
              setting: { type: Type.STRING }
            },
            required: ["title", "description", "persona", "setting"]
          }
        }
      }
    });
    try {
      return JSON.parse(res.text || "[]");
    } catch {
      return [];
    }
  });
};

/**
 * IMAGE GENERATION TASKS (Using Gemini 2.5 Flash Image)
 */
export const generateProductShoot = async (
  imageBase64: string,
  theme: ThemeSuggestion,
  aspectRatio: AspectRatio = "1:1",
  usage: string = "",
  refine?: string,
  productColor?: string
): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Professional e-commerce product shoot. Theme: ${theme.prompt}. Usage scene: ${usage}. ${productColor ? `Product color: ${productColor}.` : ''} ${refine ? `Refinement: ${refine}.` : ''} Photorealistic, 8k, high-end commercial lighting. Maintain product geometry. NO TEXT.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("Image generation failed");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const generateStudioShoot = async (
  productImages: string[],
  bgColor: string,
  angle: StudioAngle,
  aspectRatio: AspectRatio,
  productColor?: string
): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: productImages[0].split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Premium studio product photography. Angle: ${angle}. Background: solid ${bgColor}. ${productColor ? `Product finish: ${productColor}.` : ''} High-key studio lighting, soft shadows, 8k resolution. NO TEXT.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("Image generation failed");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const generateInfluencerShoot = async (
  productImages: string[],
  description: string,
  options: any
): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: productImages[0].split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Authentic Indian UGC photo. Influencer: ${options.gender}, ${options.age}, ${options.regionalLook}. Setting: ${options.setting}. Shot type: ${options.shotType}. Lighting: Natural daylight. High quality smartphone look. Maintain product accuracy. NO TEXT.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: options.aspectRatio }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("Image generation failed");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const generateAdBackground = async (
  productImage: string,
  referenceImage: string,
  data: any,
  productColor?: string
): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: productImage.split(',')[1], mimeType: 'image/jpeg' } },
          { inlineData: { data: referenceImage.split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Professional 1:1 ad creative background. Use the layout of the reference image (2nd image) but integrate the product from the 1st image. Ad Type: ${data.adType}. Brand Color: ${data.primaryColor}. Product Color: ${productColor || 'original'}. Commercial quality. NO TEXT.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("Ad background generation failed");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const generateFashionInfluencer = async (outfit: OutfitInput, options: any): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const inputImage = outfit.upper || outfit.bottom || outfit.watch || outfit.cap || outfit.chain || "";
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: inputImage.split(',')[1], mimeType: 'image/jpeg' } },
          { text: `Authentic Indian fashion UGC. Model: ${options.gender}, ${options.age}, ${options.regionalLook}, ${options.bodyType}, ${options.skinTone}. Environment: ${options.setting}. Shot type: ${options.shotType}. High-quality smartphone photo. Complete the outfit with compatible styles. NO TEXT.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: options.aspectRatio }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("Fashion UGC generation failed");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const recolorProductAndBackground = async (
  sourceImage: string,
  productColor: string,
  bgColor: string,
  aspectRatio: AspectRatio,
  customCommand: string,
  newProductImage: string | null
): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const parts: any[] = [
      { inlineData: { data: sourceImage.split(',')[1], mimeType: 'image/jpeg' } }
    ];
    if (newProductImage) {
      parts.push({ inlineData: { data: newProductImage.split(',')[1], mimeType: 'image/jpeg' } });
    }
    
    const text = `Precise product replication. Environment from first image. ${newProductImage ? 'Replace product with second image.' : ''} ${productColor ? `Product color: ${productColor}.` : ''} ${bgColor ? `Background/Scene color: ${bgColor}.` : ''} ${customCommand ? `Custom: ${customCommand}.` : ''} High fidelity, photorealistic. NO TEXT.`;
    parts.push({ text });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: { aspectRatio }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("Recolor/Replication failed");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};

export const generateCinematicVideo = async (
  productImages: string[],
  options: any,
  refinePrompt?: string,
  isUpscale?: boolean
): Promise<string> => {
  const ai = getAI();
  const prompt = `Cinematic commercial product video. Style: ${options.style}. Motion: ${options.motion}. Product: ${options.productColor}. Resolution: 720p. ${refinePrompt || ''} Professional lighting, high-end motion blur. NO TEXT.`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: {
      imageBytes: productImages[0].split(',')[1],
      mimeType: 'image/jpeg',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: options.aspectRatio || '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};

export const generateFashionStudio = async (outfit: OutfitInput, options: any): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAI();
    const inputImage = outfit.upper || outfit.bottom || "";
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: inputImage.split(',')[1], mimeType: 'image/jpeg' } },
          { text: `High-end fashion editorial. Model: Indian ${options.gender}, ${options.bodyType}, ${options.skinTone}. Studio background: ${options.color}. Angle: ${options.angle}. Photorealistic rendering of apparel textures. NO TEXT.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: options.aspectRatio }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData?.data) throw new Error("Image generation failed");
    return `data:image/png;base64,${part.inlineData.data}`;
  });
};
