import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "Where is Printscrafter located and do you deliver across Nigeria and internationally?",
      answer: "Printscrafter is located in Lekki Phase 1, Lagos, Nigeria. We offer nationwide delivery within 3–5 business days across all states in Nigeria (Lagos, Abuja, Port Harcourt, etc.) and express global shipping within 7–10 business days with full courier tracking."
    },
    {
      question: "Can I upload my own custom photo or personal image to render in the 3D Room Visualizer?",
      answer: "Yes! Click the 'Upload Local Photo to 3D Wall' button inside our 3D Visualizer Studio to instantly preview your personal family portraits, wedding photography, or digital artwork on virtual walls in Living Room or Dining Room setups before checkout."
    },
    {
      question: "How do Illuminated Smart LED Canvases work?",
      answer: "Our Smart LED Canvas collection features low-voltage ambient backlighting with integrated Wi-Fi and Bluetooth app controls. They support dynamic music synchronization, voice controls, and customizable color modes right out of the box."
    },
    {
      question: "What framing options and archival materials do you offer?",
      answer: "We craft gallery-wrapped archival cotton canvas prints, ChromaLuxe HD aluminum metal panels, and 3D plaster reliefs. Frame finishes are available in Modern Black Aluminum, Natural Oak Wood, Brushed Gold Metal, or Frameless Canvas Wraps."
    },
    {
      question: "How are payments handled on Printscrafter?",
      answer: "All transactions are secured via Paystack inline checkout supporting debit cards (Visa, Mastercard, Verve), bank transfers, and Apple Pay. Every order is immediately logged to our cloud database with a unique order reference."
    }
  ];

  return (
    <section id="faq" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Everything You Need to Know About Printscrafter
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-sm">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
