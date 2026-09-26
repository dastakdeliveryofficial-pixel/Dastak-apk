import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, X, Send, Sparkles, Utensils, 
  ExternalLink, RotateCcw, Volume2, 
  VolumeX, HelpCircle, MessageSquare, Copy, Check,
  Flame, Clock, Bike, Tag, Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { openWhatsAppChat } from '../../utils/whatsapp';
import { AIAgentMessage, Restaurant } from '../../types';
import { sendGeminiChatMessage } from '../../services/geminiService';

interface FloatingSupportWidgetProps {
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  onTrackOrder?: (orderId: string) => void;
}

export const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({
  onSelectRestaurant,
  onTrackOrder
}) => {
  const { 
    restaurants, 
    orders, 
    currentUser, 
    cart,
    platformSettings,
    language,
    isAIBrainOpen,
    setIsAIBrainOpen,
    openAIBrain,
    closeAIBrain,
    setSelectedRestaurant,
    setTrackingOrderId,
    triggerToast
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Suggested prompt categories
  const quickPrompts = [
    { label: '🍛 Best Biryani in Matli?', query: 'Matli mein sab se achi Biryani kahan se milegi?' },
    { label: '🛵 Delivery charges & time?', query: 'Matli mein delivery fee aur time kitna hai?' },
    { label: '🏷️ Today discount coupons?', query: 'Aaj ke discount coupons aur promo codes kya hain?' },
    { label: '📦 Track my current order', query: 'Mera active order kahan hai aur kab tak pohnchega?' },
    { label: '🍕 Fast food & Pizza deals', query: 'Matli ke best fast food, pizza aur burger deals batayein' },
    { label: '☕ Quetta Chai & Nashta', query: 'Subah ke nashte aur garma garam chai ke liye best hotel kaunsa hai?' }
  ];

  // AI Chat conversation history
  const [messages, setMessages] = useState<AIAgentMessage[]>(() => {
    const welcomeText = language === 'ur'
      ? 'السلام علیکم! میں دستک ڈیلیوری ماتلی کا AI برین (ذہین معاون) ہوں۔ میں آپ کو ماتلی کے ہوٹلوں، بریانی، پیزا، ڈسکاؤنٹ اور آرڈر ٹریکنگ میں فوری مدد فراہم کر سکتا ہوں۔ آپ مجھ سے اردو، سندھی یا رومن اردو میں پوچھ سکتے ہیں!'
      : language === 'sd'
      ? 'اسلام عليڪم! مان دستڪ ڊليوري ماتلي جو AI برين آهيان. مان اوهان کي ماتلي جي هوٽلن، کاڌن جي آرڊر، آفرز ۽ ڊليوري بابت مڪمل ڄاڻ ڏئي سگهان ٿو. ڇا کائڻ چاهيو ٿا؟'
      : 'Assalam o Alaikum! I am the Dastak AI Brain for Matli. Ask me anything about local restaurants, Biryani, deals, delivery rates, or your live order!';

    return [
      {
        id: 'welcome-init',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          '🍛 Best Biryani in Matli?',
          '🛵 Delivery charges & time?',
          '🏷️ Today discount coupons?',
          '📦 Track my current order'
        ]
      }
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIBrainOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isAIBrainOpen]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg: AIAgentMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Active customer order if any
    const activeOrder = orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled') || orders[0] || null;

    // Build context object
    const contextData = {
      restaurants: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        rating: r.rating,
        deliveryFee: r.deliveryFee,
        deliveryTime: r.deliveryTime,
        description: r.description,
        popularItems: r.popularItems || ''
      })),
      activeOrder: activeOrder ? {
        id: activeOrder.id,
        orderNumber: activeOrder.orderNumber,
        restaurantName: activeOrder.restaurantName,
        status: activeOrder.status,
        total: activeOrder.total
      } : null,
      cartItemsCount: cart.items.length,
      cartTotal: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      userName: currentUser?.name || 'Customer',
      language
    };

    try {
      const historyItems = messages.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const geminiResult = await sendGeminiChatMessage(query, historyItems, contextData);

      const aiMsg: AIAgentMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: geminiResult.reply || 'Main aapki madad karne ke liye hazir hoon. Dobara poochiye!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: geminiResult.suggestions || ['Best Biryani in Matli?', 'Delivery charges?'],
        actionType: geminiResult.actionType && geminiResult.actionType !== 'none' ? geminiResult.actionType : undefined,
        actionTarget: geminiResult.actionTarget || undefined
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Chat error:', err);
      setMessages(prev => [...prev, {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: 'Assalam o Alaikum! Dastak AI Brain Matli is online. Matli ke mashhoor restaurants jese Al-Madina Biryani aur Pizza Point par taaza food tayar hai! Standard flat delivery ₨ 50 hai.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Best Biryani in Matli?', 'Delivery charges?', 'Track my order'],
        actionType: undefined,
        actionTarget: undefined
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (msg: AIAgentMessage) => {
    if (msg.actionType === 'restaurant' && msg.actionTarget) {
      const rest = restaurants.find(r => r.id === msg.actionTarget);
      if (rest) {
        if (onSelectRestaurant) onSelectRestaurant(rest);
        setSelectedRestaurant(rest);
        closeAIBrain();
      }
    } else if (msg.actionType === 'track' && msg.actionTarget) {
      if (onTrackOrder) onTrackOrder(msg.actionTarget);
      setTrackingOrderId(msg.actionTarget);
      closeAIBrain();
    }
  };

  const handleResetChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Chat history cleared! Dastak AI Brain is ready. What would you like to eat or discover in Matli today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          '🍛 Best Biryani in Matli?',
          '🛵 Delivery charges & time?',
          '🏷️ Today discount coupons?',
          '📦 Track my current order'
        ]
      }
    ]);
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      triggerToast('Speech not supported', 'Your browser does not support text-to-speech', 'info');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
    triggerToast('Copied to Clipboard', 'AI response text copied', 'success');
  };

  const handleOpenEmergencyWhatsApp = () => {
    const text = `Assalam o Alaikum Dastak Support! I am ${currentUser?.name || 'a customer'} in Matli. I need direct helpline assistance.`;
    openWhatsAppChat(platformSettings.supportWhatsApp || '923012345678', text);
  };

  return (
    <>
      {/* High-Visibility Floating AI Brain Launcher */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => {
            if (isAIBrainOpen) {
              closeAIBrain();
            } else {
              openAIBrain();
            }
          }}
          className="relative group flex items-center gap-2.5 bg-gradient-to-r from-[#E11D74] via-[#D81B60] to-[#AD1457] hover:brightness-110 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl shadow-pink-300/40 border-2 border-white transition-all transform hover:scale-105 active:scale-95"
          aria-label="Open Dastak AI Brain Assistant"
          title="Dastak AI Brain • 24/7 Smart Food & Delivery Guide"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#E11D74] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#E11D74] rounded-full" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide leading-none flex items-center gap-1">
              AI Brain
              <span className="text-[9px] bg-white/25 px-1.5 py-0.2 rounded-full font-bold">Matli</span>
            </span>
            <span className="text-[10px] text-pink-100 font-medium leading-tight">
              24/7 Smart Guide
            </span>
          </div>
        </button>
      </div>

      {/* AI Brain Interactive Dialog / Drawer */}
      <AnimatePresence>
        {isAIBrainOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[440px] bg-white rounded-3xl shadow-2xl border border-pink-200 overflow-hidden flex flex-col h-[600px] max-h-[85vh]"
          >
            {/* Top Bar with AI Status */}
            <div className="bg-gradient-to-r from-[#E11D74] via-[#D81B60] to-[#AD1457] p-4 text-white shrink-0 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-bold relative">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#E11D74] rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5">
                      Dastak AI Brain
                      <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                        Gemini 3.8 Flash
                      </span>
                    </h3>
                    <p className="text-[11px] text-pink-100 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online • Matli City Culinary Assistant</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title="Clear chat and restart"
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={closeAIBrain}
                    title="Close AI Brain"
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Feature Badges */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/15 text-[11px] font-medium text-pink-100">
                <span className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-emerald-300" />
                  ₨ 50 Flat Delivery
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  25-35 Min Fleet
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-pink-200" />
                  MATLI20 Active
                </span>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF5F7] text-xs">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl relative ${
                        isUser
                          ? 'bg-gradient-to-r from-[#E11D74] to-[#C2185B] text-white rounded-br-xs shadow-sm'
                          : 'bg-white text-gray-800 border border-pink-100 shadow-sm rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed text-xs">
                        {msg.text}
                      </p>

                      <div className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t ${isUser ? 'border-white/20 text-pink-200' : 'border-gray-100 text-gray-400'} text-[10px]`}>
                        <span>{msg.timestamp}</span>

                        {!isUser && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSpeakText(msg.id, msg.text)}
                              title={speakingMsgId === msg.id ? 'Stop listening' : 'Listen with Speech'}
                              className="hover:text-[#E11D74] transition-colors p-1"
                            >
                              {speakingMsgId === msg.id ? (
                                <VolumeX className="w-3.5 h-3.5 text-[#E11D74] animate-pulse" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              title="Copy response"
                              className="hover:text-[#E11D74] transition-colors p-1"
                            >
                              {copiedMsgId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Jump Card if AI suggests a menu or live order */}
                    {msg.actionType && (
                      <div className="mt-2 w-full max-w-[88%]">
                        <button
                          type="button"
                          onClick={() => handleActionClick(msg)}
                          className="w-full bg-white border-2 border-[#E11D74] text-[#E11D74] hover:bg-pink-50 text-xs font-black px-3.5 py-2.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
                        >
                          {msg.actionType === 'restaurant' ? (
                            <>
                              <Utensils className="w-4 h-4" />
                              <span>View Recommended Menu →</span>
                            </>
                          ) : msg.actionType === 'track' ? (
                            <>
                              <Compass className="w-4 h-4" />
                              <span>Open Live Order Tracker →</span>
                            </>
                          ) : (
                            <>
                              <Tag className="w-4 h-4" />
                              <span>View Discount Deals →</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Interactive Suggestion Chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(sug)}
                            className="text-[11px] font-bold bg-white hover:bg-pink-50 text-[#E11D74] border border-pink-200 px-2.5 py-1 rounded-xl shadow-2xs transition-all hover:border-[#E11D74]"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Animation */}
              {isTyping && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-pink-100 w-fit text-gray-400 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#E11D74] animate-spin" />
                  <span className="text-xs font-semibold text-gray-500">Matli AI Brain thinking...</span>
                  <div className="flex items-center gap-1 pl-1">
                    <span className="w-1.5 h-1.5 bg-[#E11D74] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#E11D74] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#E11D74] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Carousel if few messages */}
            {messages.length <= 2 && (
              <div className="p-2.5 bg-white border-t border-pink-100 shrink-0">
                <span className="text-[10px] font-bold text-gray-400 block px-1 mb-1.5 uppercase tracking-wider">
                  Popular in Matli right now:
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(p.query)}
                      className="whitespace-nowrap text-[11px] font-bold bg-pink-50 hover:bg-pink-100 text-[#E11D74] border border-pink-200 px-2.5 py-1 rounded-xl shrink-0 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form & Footer */}
            <div className="p-3 bg-white border-t border-pink-100 shrink-0 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask in Urdu, Sindhi, or English..."
                  className="flex-1 text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E11D74]/30 focus:border-[#E11D74] transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#E11D74] to-[#C2185B] hover:brightness-110 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Discreet Emergency WhatsApp Link */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 px-1">
                <span className="text-gray-400">Powered by Gemini AI</span>
                <button
                  type="button"
                  onClick={handleOpenEmergencyWhatsApp}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>Human WhatsApp Helpline</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
