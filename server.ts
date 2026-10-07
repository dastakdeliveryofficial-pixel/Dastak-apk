import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '30mb' }));

  // Universal Image Conversion Endpoint (handles HEIC, HEIF, PNG, JPG, JPEG, WebP, TIFF, AVIF, BMP, GIF)
  app.post('/api/convert-image', async (req, res) => {
    try {
      const { base64Data, maxWidth = 720, maxHeight = 720, quality = 80 } = req.body;
      if (!base64Data || typeof base64Data !== 'string') {
        return res.status(400).json({ error: 'base64Data is required' });
      }
      const rawBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const inputBuffer = Buffer.from(rawBase64, 'base64');

      const outputBuffer = await sharp(inputBuffer)
        .rotate() // auto-orient based on EXIF
        .resize({
          width: Number(maxWidth) || 720,
          height: Number(maxHeight) || 720,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: Number(quality) || 80, mozjpeg: true })
        .toBuffer();

      const dataUrl = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
      return res.json({ dataUrl, sizeBytes: outputBuffer.length });
    } catch (err: any) {
      console.error('Server image conversion error:', err?.message || err);
      return res.status(500).json({ error: err?.message || 'Image conversion failed' });
    }
  });

  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Brain Chat Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history, context } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const client = getGeminiClient();

      // Matli knowledge base context
      const restaurantsContext = (context?.restaurants || [])
        .slice(0, 15)
        .map((r: any) => `* ${r.name} (${r.cuisine || 'Pakistani / Fast Food'}): Rating ${r.rating || '4.5'}, Delivery ₨ ${r.deliveryFee || 50}, Popular: ${r.popularItems || r.description || 'Biryani, Karahi, Roll'}`)
        .join('\n');

      const activeOrderContext = context?.activeOrder 
        ? `Customer has an active order #${context.activeOrder.orderNumber} from ${context.activeOrder.restaurantName}, status: ${context.activeOrder.status}, total: ₨ ${context.activeOrder.total}.`
        : 'Customer currently has no active order.';

      const cartContext = (context?.cartItemsCount && context.cartItemsCount > 0)
        ? `Customer currently has ${context.cartItemsCount} items in cart with total ₨ ${context.cartTotal || 0}.`
        : 'Cart is empty.';

      const systemInstruction = `You are "Dastak AI Brain" (دستک AI برین), the friendly and intelligent culinary & delivery assistant for Dastak Delivery in Matli, Sindh, Pakistan.
Your goal is to help users in Matli discover delicious local dishes, find the best restaurants, track active orders, get deals, and enjoy fast home delivery with authentic Pakistani & Sindhi warmth.

KEY MATLI FACTS:
- City: Matli, District Badin, Sindh, Pakistan.
- Areas covered: Shahi Bazaar, Station Road, Memon Colony, Tando Ghulam Ali Road, Phalkara Chowk, Civil Hospital Road, Model Town, Grain Market, and surrounding areas.
- Delivery Fee: ₨ 50 standard base fee across Matli. Delivery is FREE for orders over ₨ 500 with promo code FREESHIP!
- Delivery Time: 25-35 minutes average via local motorbike fleet.
- Active Promo Coupons:
  * MATLI20 (20% OFF on all orders)
  * FREESHIP (Free Delivery on min ₨ 400)
  * WELCOME100 (Flat ₨ 100 OFF for new customers)
- Popular Matli Specialties: Matli Chicken Dum Biryani, Mutton Pulao, Quetta Karrak Chai with Malai Paratha, Charcoal Chicken Sajji, Zinger Burgers, Hot & Spicy Shawarmas, Loaded Fries, Nawabi Pizza, Rabri Falooda.

CURRENT APP STATE:
${activeOrderContext}
${cartContext}
AVAILABLE RESTAURANTS IN MATLI:
${restaurantsContext}

LANGUAGE BEHAVIOR:
- You are fluent in Roman Urdu, Urdu (اردو), Sindhi (سنڌي), and English.
- Always respond in the exact language or script the user addressed you in. If the user writes in Roman Urdu, reply in natural, welcoming Roman Urdu. If in Urdu script, respond in Urdu script. If in Sindhi, reply in Sindhi. If in English, reply in English.

OUTPUT FORMAT:
Respond with a strictly valid JSON object matching this schema:
{
  "reply": "Your clear, hospitable response. Use bold text for restaurant names, dish names, and amounts.",
  "suggestions": ["3 to 4 quick, relevant follow-up question chips the user can tap"],
  "actionType": "restaurant" | "track" | "deal" | "none",
  "actionTarget": "restaurant id or order id if applicable, otherwise empty string",
  "actionLabel": "short button label e.g. 'View Al-Madina Menu →' or 'Track Order #1002 →' if applicable"
}`;

      if (client) {
        try {
          const contents: any[] = [];
          
          // History
          if (Array.isArray(history)) {
            const recent = history.slice(-6);
            for (const h of recent) {
              contents.push({
                role: h.sender === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
              });
            }
          }

          contents.push({
            role: 'user',
            parts: [{ text: message }]
          });

          // Multi-model resilience pool to handle temporary 503 high demand spikes
          const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

          for (const modelName of candidateModels) {
            try {
              const response = await client.models.generateContent({
                model: modelName,
                contents,
                config: {
                  systemInstruction,
                  responseMimeType: 'application/json',
                  temperature: 0.7,
                },
              });

              const rawText = response.text || '';
              try {
                const parsed = JSON.parse(rawText.trim());
                return res.json({
                  reply: parsed.reply || rawText,
                  suggestions: parsed.suggestions || ['Best Biryani in Matli?', 'Delivery charges?', 'Track my order'],
                  actionType: parsed.actionType || 'none',
                  actionTarget: parsed.actionTarget || '',
                  actionLabel: parsed.actionLabel || ''
                });
              } catch {
                return res.json({
                  reply: rawText,
                  suggestions: ['Best Biryani in Matli?', 'Delivery charges?', 'Track my order'],
                  actionType: 'none',
                  actionTarget: '',
                  actionLabel: ''
                });
              }
            } catch (modelErr: any) {
              console.warn(`Gemini model ${modelName} transiently unavailable:`, modelErr?.status || modelErr?.message || 'error');
              // Continue to next model in pool
            }
          }
        } catch (outerErr: any) {
          console.warn('Gemini request generation caught fallback:', outerErr?.message || outerErr);
          // Fall through to smart rule engine
        }
      }

      // Smart Contextual Fallback
      const q = message.toLowerCase();
      let reply = '';
      let suggestions = ['Best Biryani in Matli?', 'Delivery charges & time?', 'Today discount coupons?', 'Track my current order'];
      let actionType = 'none';
      let actionTarget = '';
      let actionLabel = '';

      if (q.includes('biryani') || q.includes('بریانی') || q.includes('چاول') || q.includes('پلاؤ') || q.includes('pulao')) {
        const topRest = (context?.restaurants || []).find((r: any) => r.name.toLowerCase().includes('biryani')) || context?.restaurants?.[0];
        reply = `Matli ki sab se famous Biryani **${topRest ? topRest.name : 'Al-Madina Biryani'}** par dastiyab hai! Special Matli Chicken Dum Biryani (₨ 280) aur Beef Pulao serve hoti hai with fresh raita aur salad. Delivery time sirf 20-30 minutes hai.`;
        suggestions = ['Al-Madina Biryani Menu', 'Show Biryani Deals', 'Delivery Time?'];
        if (topRest) {
          actionType = 'restaurant';
          actionTarget = topRest.id;
          actionLabel = `Open ${topRest.name} Menu →`;
        }
      } else if (q.includes('pizza') || q.includes('burger') || q.includes('fast food') || q.includes('پیزا') || q.includes('برگر') || q.includes('shawarma') || q.includes('شاورما')) {
        reply = `Fast food ke liye Matli mein **Pizza Point & Burger Hub** aur **Student Fast Food** best hain! Super Crisp Zinger Burger (₨ 320), Loaded Fries, aur Chicken Tikka Pizza bohat famous hain.`;
        suggestions = ['View Pizza Deals', 'Show Burger Menu', 'Delivery charges'];
        actionType = 'deal';
        actionLabel = 'Browse Fast Food Deals';
      } else if (q.includes('delivery') || q.includes('charge') || q.includes('fee') || q.includes('time') || q.includes('ڈیلیوری') || q.includes('خرچ') || q.includes('وقت')) {
        reply = `Dastak Delivery Matli ki standard delivery fee **₨ 50** hai. Agar aapka order ₨ 500 se zyada ho to **FREESHIP** coupon use karke Free Delivery le sakte hain! Average delivery time **25-35 minutes** hai pooray Matli mein (Shahi Bazaar, Station Road, Memon Colony, Tando Ghulam Ali Road, waghera).`;
        suggestions = ['Apply FREESHIP Coupon', 'Order Food Now', 'Open Menu'];
      } else if (q.includes('track') || q.includes('order') || q.includes('کہاں ہے') || q.includes('آرڈر') || q.includes('کتنی دیر')) {
        if (context?.activeOrder) {
          reply = `Aapka active order **#${context.activeOrder.orderNumber}** (${context.activeOrder.restaurantName}) is waqt status: **${String(context.activeOrder.status).toUpperCase()}** par hai. Total amount: ₨ ${context.activeOrder.total}.`;
          suggestions = ['Live Map Tracker', 'Call Rider', 'Order History'];
          actionType = 'track';
          actionTarget = context.activeOrder.id;
          actionLabel = `Track Order #${context.activeOrder.orderNumber} Live →`;
        } else {
          reply = `Filhal aapka koi active order nahi chal raha. Aap Matli ke kisi bhi restaurant se abhi taaza food order kar sakte hain!`;
          suggestions = ['Browse Restaurants', 'Show Today Deals', 'Best Biryani'];
        }
      } else if (q.includes('discount') || q.includes('coupon') || q.includes('voucher') || q.includes('ڈسکاؤنٹ') || q.includes('کوپن')) {
        reply = `Aaj ke verified Dastak promo coupons:\n• **MATLI20** — 20% OFF on all orders\n• **FREESHIP** — Free Delivery on orders over ₨ 400\n• **WELCOME100** — Flat ₨ 100 OFF for new customers`;
        suggestions = ['Apply MATLI20', 'View Top Deals', 'Browse Restaurants'];
      } else if (q.includes('chai') || q.includes('tea') || q.includes('چائے') || q.includes('ناشتہ') || q.includes('breakfast')) {
        reply = `Matli ki mashhoor Karrak Chai **Quetta Royal Chai & Cafe** par garma garam dastiyab hai! Saath mein Maska Bun, Malai Paratha aur Omelette bhi order kar sakte hain.`;
        suggestions = ['Quetta Chai Menu', 'Breakfast Deals'];
      } else {
        reply = `Assalam o Alaikum! Main Dastak Delivery Matli ka **AI Brain Assistant** hoon. Main aapko Matli ke best restaurants, taaza menus, deals dhoondne, delivery charges aur live orders track karne me madad de sakta hoon. Aap mujh se Roman Urdu, Urdu, Sindhi ya English me pooch sakte hain!`;
        suggestions = ['🍛 Best Biryani in Matli?', '🛵 Delivery charges & time?', '🏷️ Today discount coupons?', '📦 Where is my current order?'];
      }

      return res.json({
        reply,
        suggestions,
        actionType,
        actionTarget,
        actionLabel,
      });
    } catch (err: any) {
      console.error('AI chat endpoint error:', err);
      return res.status(500).json({ error: 'Failed to process AI chat request' });
    }
  });

  // Vite middleware in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
