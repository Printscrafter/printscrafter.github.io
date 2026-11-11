import React, { useState } from 'react';
import { MessageSquare, X, Send, UserCheck, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  hasWhatsAppLink?: boolean;
}

const FAQ_RESPONSES: Record<string, string> = {
  '1': "🖼️ Framing & Materials Specs:\n• Contemporary Paintings: Hand-finished archival linen with rich impasto & gold leaf.\n• Minimalist Line Art: Deep charcoal on heavyweight 320gsm cotton paper.\n• Curated Functional Wall Decor: Acoustic sound-absorbing felt slats & silent German quartz clock art.\n• Frame Options: Modern Black Aluminum, Natural Oak Wood, Brushed Gold Leaf, or Frameless Canvas Wrap.",
  '2': "🏠 3D Room & Dining Visualizer:\n• Switch between Living Room and Dining Room using the room experience toggle above the 3D canvas.\n• Click 'Upload Local Photo to 3D Wall' to render your own photo on the 3D wall mesh in real-time!",
  '3': "⚡ Smart LED Canvas Lights:\n• Integrated Wi-Fi & Bluetooth app connectivity.\n• RGB music synchronization & sound-reactive modes.\n• Low-voltage 12V whisper-quiet driver with ambient glow backlighting.",
  '4': "💳 Pricing, Sizes & Paystack Checkout:\n• Dimensions: Small, Medium, and Large scaling presets.\n• Currency: Toggle between NGN (₦) and USD ($) at the top navbar.\n• Payments secured worldwide via Paystack debit card or bank transfer.",
  '5': "🚚 Shipping & Worldwide Delivery:\n• Express shipping on all orders!\n• Local orders delivered within 3-5 business days across Nigeria.\n• International orders delivered within 7-10 business days with full tracking.",
  '6': "💬 Connect with a Lead Artist:\nOur lead curator in Lekki Phase 1, Lagos is available for custom wall commissions."
};

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "🎨 Welcome to Printscrafter Studio Lagos!\nI can answer questions regarding custom canvas printing, 3D visualizers, smart LED canvas, framing materials, and Paystack checkout."
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    const lower = userText.toLowerCase();

    setTimeout(() => {
      let botText = "Thank you for reaching out! For custom commissions or bespoke sizes, you can chat directly with our lead human artist on WhatsApp:";
      let isArtist = false;

      if (lower.includes('frame') || lower.includes('material') || lower.includes('oak') || lower.includes('gold')) {
        botText = FAQ_RESPONSES['1'];
      } else if (lower.includes('upload') || lower.includes('room') || lower.includes('dining') || lower.includes('3d') || lower.includes('visualizer')) {
        botText = FAQ_RESPONSES['2'];
      } else if (lower.includes('led') || lower.includes('light') || lower.includes('app') || lower.includes('smart')) {
        botText = FAQ_RESPONSES['3'];
      } else if (lower.includes('price') || lower.includes('paystack') || lower.includes('cost') || lower.includes('naira') || lower.includes('dollar')) {
        botText = FAQ_RESPONSES['4'];
      } else if (lower.includes('ship') || lower.includes('deliver') || lower.includes('track') || lower.includes('lagos')) {
        botText = FAQ_RESPONSES['5'];
      } else if (lower.includes('human') || lower.includes('artist') || lower.includes('phone') || lower.includes('call') || lower.includes('whatsapp')) {
        botText = "Connecting you directly to our lead Human Artist on WhatsApp (+2348154224416)...";
        isArtist = true;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: botText,
          hasWhatsAppLink: isArtist || lower.includes('artist') || lower.includes('human') || lower.includes('custom')
        }
      ]);
    }, 400);
  };

  const handleChipClick = (key: string) => {
    const labels: Record<string, string> = {
      '1': 'Framing & Materials Specs',
      '2': '3D Room Visualizer Help',
      '3': 'Smart LED Canvas & App Controls',
      '4': 'Pricing, Sizes & Paystack',
      '5': 'Shipping & Delivery Times',
      '6': 'Chat with Lead Artist (+2348154224416)'
    };

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: labels[key]
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: FAQ_RESPONSES[key],
          hasWhatsAppLink: key === '6'
        }
      ]);
    }, 350);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      
      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 animate-slideUp">
          
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold text-lg shadow-inner">
                  P
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-300 border-2 border-emerald-600 rounded-full" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm leading-tight">
                  Printscrafter Concierge
                </h4>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online • Lagos Studio
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href="https://wa.me/2348154224416?text=Hello%20Printscrafter%20Artist%2C%20I%20would%20like%20to%20consult%20about%20a%20custom%20wall%20art%20piece."
                target="_blank"
                rel="noreferrer"
                title="Direct WhatsApp"
                className="text-xs bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1.5 rounded-xl text-white font-medium flex items-center gap-1 transition-colors"
              >
                <UserCheck className="w-3 h-3" />
                <span className="text-[11px]">Human Artist</span>
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50 text-xs scrollbar-thin">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'items-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">
                    P
                  </div>
                )}
                
                <div
                  className={`p-3 rounded-2xl max-w-[85%] space-y-2 whitespace-pre-line text-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-200 shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.hasWhatsAppLink && (
                    <a
                      href="https://wa.me/2348154224416?text=Hello%20Printscrafter%20Lead%20Artist%2C%20I%20have%20an%20inquiry%20regarding%20custom%20wall%20art."
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] shadow-xs transition-colors mt-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp (+234 815 422 4416)</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto scrollbar-thin">
            {[
              { id: '1', label: '🖼️ Framing & Materials' },
              { id: '2', label: '🏠 3D Room Visualizer' },
              { id: '3', label: '⚡ Smart LED Art' },
              { id: '4', label: '💳 Pricing & Paystack' },
              { id: '5', label: '🚚 Shipping Times' },
              { id: '6', label: '💬 Lead Artist' }
            ].map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip.id)}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:border-emerald-500 rounded-full text-[10px] text-slate-700 font-medium whitespace-nowrap shadow-2xs transition-colors shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Printscrafter Assistant..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

      {/* Floating WhatsApp Bubble */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative group"
        aria-label="Open WhatsApp Support Assistant"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-300 rounded-full animate-ping opacity-75" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
      </button>

    </div>
  );
};
