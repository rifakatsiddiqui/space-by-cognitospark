
import express from 'express';
import admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

// 2. Encryption Vault (AES-256-GCM)
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.SERVER_ENCRYPTION_KEY;

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(hash) {
  const [iv, authTag, content] = hash.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 3. Secure Identity Middleware
async function authMiddleware(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).json({ error: 'UNAUTHORIZED' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(403).json({ error: 'INVALID_TOKEN' });
  }
}

// 4. Hybrid Key Resolver - Adjusted to respect system-injected API_KEY
async function resolveApiKey(uid, isHeavy = false) {
  // Fix: Per instructions, we must prioritize process.env.API_KEY if available.
  if (process.env.API_KEY) return process.env.API_KEY;

  if (!isHeavy) return process.env.PLATFORM_GEMINI_KEY;

  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists || !userDoc.data().encryptedGeminiKey) {
    throw new Error('BYO_KEY_REQUIRED');
  }
  return decrypt(userDoc.data().encryptedGeminiKey);
}

// 5. Advanced Prompt Engineering Engine
const PROMPT_ENGINE = {
  listing: (data) => `Professional Marketplace Listing. 
    Theme: ${data.theme?.prompt || 'Clean Studio'}. 
    Background Color: ${data.bgColor || 'Solid White (#ffffff)'}. 
    Lighting: High-key commercial lighting, soft shadows. 
    Realism: Maintain exact product geometry and texture. No color drift. 
    Output: 8k resolution, crisp details. NO TEXT.`,

  studio: (data) => `Enterprise-grade Studio Product Shot. 
    Angle: ${data.angle}. 
    Product Finish: ${data.productColor || 'original'}. 
    Background: Solid ${data.bgColor || 'matte studio gray'} cyclorama wall. 
    Lighting Discipline: Three-point studio lighting (Key, Fill, Rim) with professional soft-box diffusion. 
    Shadow Realism: Physically accurate contact shadows and soft grounding. 
    Constraints: Zero distortion, maintain photorealistic micro-textures, no 'plastic' over-smoothing. NO TEXT.`,

  influencer: (data) => `Authentic Indian UGC Lifestyle Photo. 
    Influencer: ${data.gender}, ${data.age || 'Gen Z'}, ${data.regionalLook || 'Urban Indian'}. 
    Persona: ${data.persona || 'Everyday User'}.
    Setting: ${data.setting}. 
    Lighting: Natural daylight with realistic environmental bounce. 
    Aesthetic: High-quality smartphone camera look, non-staged, authentic interaction. 
    Realism: Maintain product integrity, no over-beautification of the subject. NO TEXT.`,

  fashion: (data) => `High-End Fashion Editorial. 
    Model: ${data.gender}, ${data.bodyType}, ${data.skinTone}. 
    Angle: ${data.angle}. 
    Lighting: Dramatic fashion studio lighting, high contrast. 
    Environment: ${data.color} studio backdrop. 
    Constraints: Maintain apparel fabric texture and fit accuracy. Photorealistic rendering. NO TEXT.`,

  video: (data) => {
    const isStudio = data.style?.toLowerCase().includes('studio') || data.style?.toLowerCase().includes('clean');
    const lightingMode = isStudio 
      ? "Studio Lighting: Professional three-point setup, high-end commercial soft-box diffusion, controlled highlights." 
      : "Lifestyle Lighting: Natural ambient illumination, realistic environmental light bounce, atmospheric depth.";
    
    return `Enterprise Cinematic Product Video. 
      Style: ${data.style || 'Auto'}. 
      Product Finish: ${data.productColor || 'original'}. 
      Movement: ${data.motion || 'Auto'} camera motion.
      Lens: ${data.lens || 'Standard'}.
      Perspectives: ${Array.isArray(data.angles) ? data.angles.join(', ') : data.angles}.
      
      Lighting Discipline: ${lightingMode}
      Shadow Integrity: Physically accurate contact shadows and soft grounding shadows. Sharp grounding, no floating.
      Product Realism: Maintain exact geometric proportions. Preserving original textures, materials, and fine details. 
      Anti-Beautification: Avoid over-smoothing, artificial 'plastic' looks, or unnatural glowing edges. Maintain photorealistic grit and material honesty.
      Final Output: 8k commercial quality, realistic motion blur, zero color drift. NO TEXT.`;
  }
};

// 6. Production Endpoints

// Save Encrypted API Key
app.post('/api/user/api-key', authMiddleware, async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).send('API Key Required');
  try {
    const encrypted = encrypt(apiKey);
    await db.collection('users').doc(req.uid).set({
      encryptedGeminiKey: encrypted,
      keyUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'VAULT_WRITE_ERROR' });
  }
});

// Unified Generation Proxy
app.post('/api/generate/:type', authMiddleware, async (req, res) => {
  const { type } = req.params;
  const { payload, imageBase64, model = 'gemini-3-flash-preview' } = req.body;
  
  const isHeavy = model.includes('image') || model.includes('veo');

  try {
    const apiKeyToUse = await resolveApiKey(req.uid, isHeavy);
    // Fix: Per instructions, initialization must use named parameter.
    const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
    
    const enhancedPrompt = PROMPT_ENGINE[type] ? PROMPT_ENGINE[type](payload) : (payload.customPrompt || payload);

    if (model.includes('veo')) {
      let operation = await ai.models.generateVideos({
        model: model,
        prompt: enhancedPrompt,
        image: imageBase64 ? {
          imageBytes: imageBase64.split(',')[1],
          mimeType: 'image/jpeg',
        } : undefined,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: payload.aspectRatio || '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      // Ensure API key is appended for fetching.
      return res.json({ videoUrl: `${downloadLink}&key=${apiKeyToUse}` });
    }

    const parts = [{ text: enhancedPrompt }];
    if (imageBase64) {
      parts.unshift({ inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } });
    }
    if (payload && payload.referenceImage) {
      parts.unshift({ inlineData: { data: payload.referenceImage.split(',')[1], mimeType: 'image/jpeg' } });
    }

    // Fix: Per instructions, use ai.models.generateContent directly with model and contents.
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: payload.config || {}
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      const resultPart = response.candidates[0].content.parts.find(p => p.inlineData);
      if (resultPart) {
        return res.json({ imageUrl: `data:image/png;base64,${resultPart.inlineData.data}` });
      }
    }
    
    // Fix: Access .text property directly (it's a getter, not a method).
    res.json({ text: response.text });

  } catch (error) {
    console.error('Production Error:', error.message);
    if (error.message === 'BYO_KEY_REQUIRED') {
      return res.status(404).json({ error: 'KEY_MISSING', message: 'User API Key Required for Heavy Production' });
    }
    res.status(500).json({ error: 'GENERATION_FAILED', message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Vision Secure Core running on ${PORT}`));
