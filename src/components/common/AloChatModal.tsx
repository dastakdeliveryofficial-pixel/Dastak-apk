import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MessageCircle, Send, ShieldCheck, Bike, 
  User, CheckCheck, Sparkles, Clock, PhoneOff 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AloChatModal: React.FC = () => {
  const { 
    isAloChatOpen, 
    closeAloChat, 
    activeAloChatOrderId, 
    aloChatMessages, 
    sendAloChatMessage, 
    orders, 
    currentRole, 
    currentUser,
    language 
  } = useApp();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeOrder = orders.find(o => o.id === activeAloChatOrderId) || orders[0];
  const orderMessages = aloChatMessages.filter(m => m.orderId === (activeAloChatOrderId || activeOrder?.id));

  useEffect(() => {
    if (isAloChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aloChatMessages, isAloChatOpen]);

  if (!isAloChatOpen) return null;

  const handleSend = (text?: string) => {
    const content = (text || inputText).trim();
    if (!content) return;

    const orderId = activeAloChatOrderId || activeOrder?.id || 'ord-1001';
    const sender = currentRole === 'rider' ? 'rider' : currentRole === 'admin' ? 'admin' : 'customer';
    const senderName = currentRole === 'rider' 
      ? `${activeOrder?.riderName || 'Rider'} (Delivery Partner)` 
      : currentRole === 'admin' 
      ? 'Dastak Support Admin' 
      : (currentUser?.name || activeOrder?.customerName || 'Customer');

    sendAloChatMessage(orderId, sender, senderName, content);
    setInputText('');
  };

  // Preset quick chips based on role
  const quickChips = currentRole === 'rider' ? [
    '🛵 Main restaurant se nikal chuka hoon',
    '🚪 Bhai main aapke gate ke samnay khara hoon',
    '📍 Gali ka number confirm kardein please',
    '⏱️ 5 minutes mein delivery pohnch rahi hai'
  ] : [
    '🔔 Bhai gate ki bell baja dein',
    '🏡 House number 14, green gate hai',
    '👍 Shukriya, main bahar araha hoon',
    '💵 Exact change tayar hai'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-pink-200 w-full max-w-lg overflow-hidden flex flex-col h-[580px] max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-[#E11D74] to-[#C2185B] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-base leading-tight">
                    Alo Chat (آلو چیٹ)
                  </h3>
                  <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                    Order #{activeOrder?.orderNumber || '1001'}
                  </span>
                </div>
                <p className="text-[11px] text-pink-100 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Privacy Protected • Direct In-App Support</span>
                </p>
              </div>
            </div>

            <button
              onClick={closeAloChat}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Notice Banner */}
          <div className="bg-pink-50/80 px-4 py-2 border-b border-pink-100 flex items-center justify-between text-[11px] text-pink-900">
            <div className="flex items-center gap-1.5">
              <PhoneOff className="w-3.5 h-3.5 text-[#E11D74]" />
              <span>Contact numbers are safely hidden. Chat freely here.</span>
            </div>
            <span className="font-bold text-[10px] bg-white text-[#E11D74] px-2 py-0.5 rounded-full border border-pink-200">
              Role: {currentRole.toUpperCase()}
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF5F7] text-xs">
            {orderMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-pink-200" />
                <p className="font-bold text-gray-700">No chat messages yet for this order.</p>
                <p className="text-[11px]">Send a message to coordinate the delivery in Matli.</p>
              </div>
            ) : (
              orderMessages.map((msg) => {
                const isMe = (currentRole === 'rider' && msg.sender === 'rider') ||
                             (currentRole === 'customer' && msg.sender === 'customer') ||
                             (currentRole === 'admin' && msg.sender === 'admin');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-semibold">
                      {msg.senderName}
                    </span>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        isMe
                          ? 'bg-[#E11D74] text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-gray-900 border border-pink-100 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-pink-200' : 'text-gray-400'}`}>
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-pink-200" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="p-2.5 bg-white border-t border-pink-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickChips.map((chip, index) => (
              <button
                key={index}
                onClick={() => handleSend(chip)}
                className="text-[11px] font-semibold bg-pink-50 hover:bg-pink-100 text-[#E11D74] border border-pink-200 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-pink-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Type Alo message as ${currentRole}...`}
              className="flex-1 text-xs p-3 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E11D74]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-[#E11D74] hover:bg-[#C2185B] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
