import { GoogleGenAI } from '@google/genai';
import { Restaurant, Order } from '../types';

export interface ChatContext {
  restaurants: Restaurant[];
  activeOrder?: Order | { id: string; orderNumber: string; restaurantName: string; status: any; total: number } | null;
  cartItemsCount?: number;
  cartTotal?: number;
  userName?: string;
  language?: string;
}

export interface GeminiResponse {
  reply: string;
  suggestions: string[];
  actionType?: 'restaurant' | 'track' | 'deal' | 'none';
  actionTarget?: string;
  actionLabel?: string;
}

/**
 * Intelligent client-side fallback engine for Matli when deployed on GitHub Pages
 * or static hosting without backend server.
 */
function generateLocalMatliResponse(
  message: string,
  context?: ChatContext
): GeminiResponse {
  const q = message.toLowerCase().trim();
  const restaurants = context?.restaurants || [];
  const activeOrder = context?.activeOrder;

  // 1. Order tracking query
  if (q.includes('track') || q.includes('order') || q.includes('کہاں ہے') || q.includes('آرڈر') || q.includes('status')) {
    if (activeOrder) {
      const statusLabels: Record<string, string> = {
        placed: 'آرڈر موصول ہو چکا ہے (Placed)',
        confirmed: 'ہوٹل نے آرڈر قبول کر لیا ہے (Confirmed & Preparing)',
        preparing: 'کھانا پکایا جا رہا ہے (Cooking)',
        out_for_delivery: 'رائیڈر ڈلیوری کے لیے نکل چکا ہے (Out for Delivery)',
        delivered: 'کامیابی سے ڈلیور ہو چکا ہے (Delivered)',
        cancelled: 'منسوخ (Cancelled)'
      };

      return {
        reply: `Aapka active order **#${activeOrder.orderNumber}** (${activeOrder.restaurantName}) is waqt: **${statusLabels[activeOrder.status] || activeOrder.status}** par hai. Total amount: **₨ ${activeOrder.total}** (${activeOrder.paymentMethod.toUpperCase()}). Hamara rider jald aap tak pohanch raha hai!`,
        suggestions: ['Track Live on Map', 'WhatsApp Support', 'Order Details'],
        actionType: 'track',
        actionTarget: activeOrder.id,
        actionLabel: `Track Order #${activeOrder.orderNumber}`
      };
    } else {
      return {
        reply: `Filhal aapka koi active order nahi mila. Matli ke kisi bhi restaurant se order place karein, aur aap yahan live track kar saktay hain!`,
        suggestions: ['Browse Matli Restaurants', 'Biryani Deals', 'Fast Food'],
        actionType: 'none'
      };
    }
  }

  // 2. Biryani & Rice queries
  if (q.includes('biryani') || q.includes('بریانی') || q.includes('pulao') || q.includes('پلاؤ') || q.includes('rice')) {
    const biryaniRest = restaurants.find(r => 
      r.name.toLowerCase().includes('biryani') || 
      r.name.toLowerCase().includes('madina') ||
      r.categories?.includes('biryani') ||
      (r as any).cuisine?.toLowerCase().includes('biryani')
    ) || restaurants[0];

    const restName = biryaniRest?.name || 'Al-Madina Biryani';
    return {
      reply: `Matli ki sab se mashhoor biryani **${restName}** par dastiyab hai! Taaza Chicken Dum Biryani (₨ 280), Beef Nalli Biryani aur Sindhi Pulao rozana dophar aur raat ko taaza tayar hoti hain. Delivery time sirf **20-30 mins** hai!`,
      suggestions: [`Open ${restName}`, 'Free Delivery Code', 'View Deals'],
      actionType: 'restaurant',
      actionTarget: biryaniRest?.id,
      actionLabel: `View ${restName} Menu →`
    };
  }

  // 3. Fast Food, Burgers, Pizza
  if (q.includes('burger') || q.includes('برگر') || q.includes('pizza') || q.includes('پیزا') || q.includes('shawarma') || q.includes('fast food')) {
    const fastFoodRest = restaurants.find(r => 
      r.name.toLowerCase().includes('pizza') || 
      r.name.toLowerCase().includes('fast') ||
      (r as any).cuisine?.toLowerCase().includes('fast') ||
      r.categories?.includes('fastfood')
    ) || restaurants[1] || restaurants[0];

    const name = fastFoodRest?.name || 'Pizza Point & Cafe';
    return {
      reply: `Crispy Zinger Burgers, Hot Wings, Loaded Fries aur Cheesy Pizza ke liye **${name}** Matli mein number one hai! Sub combo deals aur discounts app par mojood hain. 0% platform commission ke sath taaza food order karein!`,
      suggestions: [`Open ${name}`, 'View Burger Deals', 'Free Delivery'],
      actionType: 'restaurant',
      actionTarget: fastFoodRest?.id,
      actionLabel: `Open ${name} →`
    };
  }

  // 4. Delivery Charges & Policies
  if (q.includes('delivery') || q.includes('fee') || q.includes('charges') || q.includes('خرچ') || q.includes('فیس')) {
    return {
      reply: `Dastak Delivery Matli ke charges nihayat munasib hain:\n• Standard Flat Delivery: **₨ 50** poore Matli shehar mein.\n• **0% Commission System**: Dastak vendors se 0% commission leta hai taake rates hamesha saste rahein!\n• **FREE DELIVERY**: ₨ 400 se zayed ke order par promo code **FREESHIP** lagayein aur delivery bilkul muft hasil karein!`,
      suggestions: ['Use Code FREESHIP', 'Order Food Now', 'Matli Areas Covered'],
      actionType: 'deal'
    };
  }

  // 5. Promo Codes & Discounts
  if (q.includes('promo') || q.includes('coupon') || q.includes('code') || q.includes('discount') || q.includes('ڈسکاؤنٹ') || q.includes('کوڈ')) {
    return {
      reply: `Matli ke liye active promo codes:\n1. **MATLI20** — 20% OFF flat discount on all food orders!\n2. **FREESHIP** — Free Home Delivery across Matli on orders above ₨ 400.\n3. **WELCOME100** — Flat ₨ 100 OFF for new customers on orders over ₨ 500.\nCart checkout par code enter karke apply karein!`,
      suggestions: ['Use MATLI20', 'Use FREESHIP', 'Browse Menu'],
      actionType: 'deal'
    };
  }

  // 6. Matli Areas & Coverage
  if (q.includes('area') || q.includes('kahan') || q.includes('shahi bazaar') || q.includes('station road') || q.includes('matli') || q.includes('علاقہ')) {
    return {
      reply: `Dastak Delivery poore Matli shehar aur gird-o-nawwah mein active hai:\n• Shahi Bazaar & Grain Market\n• Station Road & Railway Chowk\n• Phuleli Canal Bridge\n• Memon Colony & Model Town\n• Civil Hospital Road & Tando Ghulam Ali Road\nAverage delivery time **25-35 minutes** hai.`,
      suggestions: ['Order to Shahi Bazaar', 'Order to Station Road', 'Select Food'],
      actionType: 'none'
    };
  }

  // 7. General greeting & default response
  const restList = restaurants.slice(0, 3).map(r => r.name).join(', ') || 'Al-Madina Biryani, Pizza Point, Quetta Royal';
  return {
    reply: `Assalam o Alaikum! Dastak AI Brain Matli mein aapki khidmat ke liye hazir hai. Matli ke behtareen hotels jese **${restList}** se taaza biryani, karahi, zinger, chai aur groceries foran mangwayein. Flat ₨ 50 delivery aur 0% commission! Aap kya khana pasand kareingay?`,
    suggestions: ['Best Biryani in Matli?', 'Crispy Zinger & Pizza?', 'Delivery charges?', 'Active Coupons?'],
    actionType: 'none'
  };
}

/**
 * Universal Gemini AI caller that works both with Express backend (/api/gemini/chat)
 * AND on GitHub Pages / Static deployments with direct client calls & intelligent fallback!
 */
export async function sendGeminiChatMessage(
  message: string,
  history: { sender: string; text: string }[],
  context: ChatContext
): Promise<GeminiResponse> {
  // 1. Try backend endpoint first (if full-stack server is running)
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-6),
        context
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        reply: data.reply || 'Main aapki madad ke liye tayar hoon.',
        suggestions: Array.isArray(data.suggestions) && data.suggestions.length > 0 
          ? data.suggestions 
          : ['Best Biryani in Matli?', 'Delivery charges?', 'Track active order'],
        actionType: data.actionType && data.actionType !== 'none' ? data.actionType : undefined,
        actionTarget: data.actionTarget || undefined,
        actionLabel: data.actionLabel || undefined
      };
    }
  } catch {
    // Backend fetch failed (expected on GitHub Pages / client-side hosting)
  }

  // 2. Check if client-side Gemini API Key is available
  const clientKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any)?.GEMINI_API_KEY;
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const prompt = `You are Dastak AI Brain for Matli, Sindh, Pakistan. User asked: "${message}". Context: ${JSON.stringify(context)}. Reply hospitably in Urdu, Roman Urdu or English depending on language. Return JSON with reply, suggestions (string[]), actionType ("restaurant"|"track"|"deal"|"none").`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        return {
          reply: parsed.reply || text,
          suggestions: parsed.suggestions || ['Best Biryani in Matli?', 'Delivery charges?'],
          actionType: parsed.actionType || 'none',
          actionTarget: parsed.actionTarget || undefined,
          actionLabel: parsed.actionLabel || undefined
        };
      } catch {
        if (text) {
          return {
            reply: text,
            suggestions: ['Best Biryani in Matli?', 'Track Order'],
            actionType: 'none'
          };
        }
      }
    } catch (e) {
      console.warn('Client-side Gemini API call failed:', e);
    }
  }

  // 3. Fallback to our specialized, zero-failure Matli culinary & delivery intelligence engine
  return generateLocalMatliResponse(message, context);
}
