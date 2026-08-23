import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Bot, UserCheck, X, Send, Sparkles, 
  Store, Bike, Tag, HelpCircle, PhoneCall, ChevronRight, 
  CornerDownLeft, ExternalLink, RefreshCw 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { openWhatsAppChat } from '../../utils/whatsapp';
import { AIAgentMessage } from '../../types';

export const FloatingSupportWidget: React.FC = () => {
  const { 
    restaurants, 
    orders, 
    currentUser, 
    setSelectedRestaurant, 
    setTrackingOrderId, 
    setCurrentRole,
    platformSettings,
    language 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'agent' | 'human'>('agent');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Human support form
  const [humanTopic, setHumanTopic] = useState('General Food Order Inquiry');

  // AI Chat conversation messages
  const [messages, setMessages] = useState<AIAgentMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: language === 'ur'
        ? 'السلام علیکم! میں دستک ڈیلیوری ماتلی کا AI اسسٹنٹ ہوں۔ میں آپ کو بہترین ہوٹل، بریانی، فاسٹ فوڈ اور آرڈر ٹریکنگ میں مدد دے سکتا ہوں۔'
        : language === 'sd'
        ? 'اسلام عليڪم! مان دستڪ ڊليوري ماتلي جو AI اسسٽنٽ آهيان. مان اوهان جي کاڌي جي آرڊر ۽ هوٽلن بابت مدد ڪري سگهان ٿو.'
        : 'Assalam o Alaikum! I am your Dastak AI Food Assistant for Matli. How can I help you enjoy delicious food today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '🍛 Best Biryani in Matli?',
        '🛵 Delivery charges & time?',
        '🏷️ Today discount coupons?',
        '📦 Track my current order'
      ]
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, chatMode]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: AIAgentMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // AI Brain processing
    setTimeout(() => {
      const q = query.toLowerCase();
      let reply = '';
      let suggestions: string[] = [];
      let actionType: AIAgentMessage['actionType'] = undefined;
      let actionTarget: string | undefined = undefined;

      if (q.includes('biryani') || q.includes('بریانی') || q.includes('چاول')) {
        const biryaniRest = restaurants.find(r => r.name.toLowerCase().includes('biryani') || r.description.toLowerCase().includes('biryani')) || restaurants[0];
        reply = `Matli ki famous Biryani **${biryaniRest.name}** par available hai! Special Matli Chicken Dum Biryani & Beef Pulao serve hoti hai with raita and salad. Delivery time 20-30 mins hai.`;
        suggestions = ['Open Al-Madina Biryani Menu', 'Show Biryani Deals', 'Delivery Time?'];
        actionType = 'restaurant';
        actionTarget = biryaniRest.id;
      } else if (q.includes('delivery') || q.includes('charge') || q.includes('time') || q.includes('ڈیلیوری') || q.includes('خرچ')) {
        reply = `Matli city mein hamari standard delivery fee **₨ ${platformSettings.baseDeliveryFee}** hai. Average delivery time 25-35 minutes hai across Shahi Bazaar, Station Road, Memon Colony & Tando Ghulam Ali Road!`;
        suggestions = ['Order Food Now', 'Which restaurants are open?'];
      } else if (q.includes('discount') || q.includes('coupon') || q.includes('voucher') || q.includes('ڈسکاؤنٹ') || q.includes('کوپن')) {
        reply = `Aaj ke hot promo coupons: \n• **MATLI20** (20% OFF on all orders)\n• **FREESHIP** (Free Delivery on min ₨ 400)\n• **WELCOME100** (Flat ₨ 100 OFF for new customers)`;
        suggestions = ['Apply MATLI20', 'View Top Deals'];
      } else if (q.includes('track') || q.includes('order') || q.includes('کہاں ہے') || q.includes('آرڈر')) {
        const lastOrder = orders[0];
        if (lastOrder) {
          reply = `Aapka active order **#${lastOrder.orderNumber}** (${lastOrder.restaurantName}) is waqt status: **${lastOrder.status.toUpperCase()}** par hai.`;
          suggestions = ['Live Map Track', 'Call Rider / Alo Chat'];
          actionType = 'track';
          actionTarget = lastOrder.id;
        } else {
          reply = `Filhal aapka koi active order nahi mila. Aap Matli ke behtareen restaurants se abhi order place kar sakte hain!`;
          suggestions = ['Browse Restaurants'];
        }
      } else if (q.includes('tea') || q.includes('chai') || q.includes('چائے') || q.includes('ہوٹل')) {
        reply = `Matli ki mashhoor Karrak Chai **Quetta Royal Chai & Cafe** aur **Rajput Shahi Dhabba** par available hai! Saath mein Maska Bun aur Paratha bhi order kar sakte hain.`;
        suggestions = ['View Chai Menu', 'Order Breakfast'];
      } else {
        reply = `Aapka shukriya! Main Matli Dastak Delivery ka AI system hoon. Main aapko restaurants browse karne, deals dhoondne ya order track karne me madad de sakta hoon. Ya aap direct human helpline se bhi rabta kar sakte hain!`;
        suggestions = ['Best Biryani in Matli?', 'Delivery charges?', 'Talk to Human Agent'];
      }

      const aiMsg: AIAgentMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
        actionType,
        actionTarget
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleActionClick = (msg: AIAgentMessage) => {
    if (msg.actionType === 'restaurant' && msg.actionTarget) {
      const rest = restaurants.find(r => r.id === msg.actionTarget);
      if (rest) {
        setSelectedRestaurant(rest);
        setIsOpen(false);
      }
    } else if (msg.actionType === 'track' && msg.actionTarget) {
      setTrackingOrderId(msg.actionTarget);
      setIsOpen(false);
    }
  };

  const handleOpenHumanWhatsApp = () => {
    const text = `Assalam o Alaikum Dastak Support! I am ${currentUser?.name || 'a customer'} from Matli.\nTopic: *${humanTopic}*\nPlease assist me with my inquiry.`;
    openWhatsAppChat(platformSettings.supportWhatsApp || '923012345678', text);
  };

  return (
    <>
      {/* Floating Action Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group flex items-center gap-2.5 bg-[#E11D74] hover:bg-[#C2185B] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl border-2 border-white transition-all transform hover:scale-105 active:scale-95"
          aria-label="Open Support & AI Chat"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#E11D74] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#E11D74] rounded-full" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-black tracking-wide leading-none">Matli Support & AI</span>
            <span className="text-[10px] text-pink-100 font-medium leading-tight">AI Brain & WhatsApp</span>
          </div>
        </button>
      </div>

      {/* Support Chat Popup Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-pink-200 overflow-hidden flex flex-col h-[560px] max-h-[82vh]"
          >
            {/* Top Bar with Mode Switcher */}
            <div className="bg-linear-to-r from-[#E11D74] to-[#C2185B] p-4 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                    {chatMode === 'agent' ? <Bot className="w-5 h-5 text-white" /> : <UserCheck className="w-5 h-5 text-emerald-300" />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight leading-tight">
                      Dastak Matli Live Help
                    </h3>
                    <p className="text-[11px] text-pink-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {chatMode === 'agent' ? 'AI Brain Active • 24/7' : 'Human WhatsApp Helpline'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 2-Option Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 mt-3 p-1 bg-black/20 rounded-2xl">
                <button
                  onClick={() => setChatMode('agent')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    chatMode === 'agent'
                      ? 'bg-white text-[#E11D74] shadow-xs'
                      : 'text-pink-100 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Agent Mode (AI Brain)</span>
                </button>

                <button
                  onClick={() => setChatMode('human')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    chatMode === 'human'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-pink-100 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Human Mode (WhatsApp)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: AI AGENT MODE */}
            {chatMode === 'agent' && (
              <div className="flex flex-col flex-1 overflow-hidden bg-[#FAF5F7]">
                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-[#E11D74] text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-gray-800 border border-pink-100 shadow-xs rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        <span className={`block text-[9px] mt-1 ${msg.sender === 'user' ? 'text-pink-200 text-right' : 'text-gray-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Action Jump Button if available */}
                      {msg.actionType && (
                        <button
                          onClick={() => handleActionClick(msg)}
                          className="mt-1.5 bg-white border border-[#E11D74] text-[#E11D74] hover:bg-pink-50 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{msg.actionType === 'restaurant' ? 'View Restaurant Menu →' : 'Open Live Tracker →'}</span>
                        </button>
                      )}

                      {/* Suggestions Chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (sug.includes('Talk to Human Agent')) {
                                  setChatMode('human');
                                } else {
                                  handleSendMessage(sug);
                                }
                              }}
                              className="text-[10px] font-bold bg-pink-50 hover:bg-pink-100 text-[#E11D74] border border-pink-200 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-1.5 p-3 bg-white rounded-2xl border border-pink-100 w-24 text-gray-400">
                      <span className="w-1.5 h-1.5 bg-[#E11D74] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#E11D74] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#E11D74] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Agent Chat Input */}
                <div className="p-3 bg-white border-t border-pink-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    placeholder="Ask AI for food, menus, rates in Matli..."
                    className="flex-1 text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="w-9 h-9 rounded-xl bg-[#E11D74] hover:bg-[#C2185B] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: HUMAN WHATSAPP TALKING MODE */}
            {chatMode === 'human' && (
              <div className="flex flex-col flex-1 overflow-y-auto p-5 space-y-4 bg-white">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-black">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Dastak Live Human Operations Helpline</span>
                  </div>
                  <p className="text-emerald-900/80 leading-relaxed">
                    Directly chat with our human Matli operations coordinator on WhatsApp for immediate support, order corrections, or restaurant inquiries.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      What do you need help with?
                    </label>
                    <select
                      value={humanTopic}
                      onChange={(e) => setHumanTopic(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
                    >
                      <option value="General Food Order Inquiry">General Food Order Inquiry</option>
                      <option value="Order Status & Delivery Time">Order Status & Delivery Time</option>
                      <option value="JazzCash / EasyPaisa Payment Help">JazzCash / EasyPaisa Payment Help</option>
                      <option value="Register my Hotel/Restaurant in Matli">Register my Hotel/Restaurant in Matli</option>
                      <option value="Apply for Rider Job in Matli">Apply for Rider Job in Matli</option>
                    </select>
                  </div>

                  <div className="p-3 bg-pink-50/40 rounded-xl border border-pink-100 text-xs space-y-1 text-gray-600">
                    <span className="font-bold text-gray-800 block">Helpline Details:</span>
                    <p>• Dedicated Matli Phone: <strong>0301-2345678</strong></p>
                    <p>• Response Time: <strong>Instant on WhatsApp</strong></p>
                  </div>

                  <button
                    onClick={handleOpenHumanWhatsApp}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open WhatsApp Chat with Human Agent →</span>
                  </button>

                  <button
                    onClick={() => setChatMode('agent')}
                    className="w-full py-2 text-center text-xs font-bold text-gray-400 hover:text-gray-700"
                  >
                    ← Switch back to AI Brain System
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
