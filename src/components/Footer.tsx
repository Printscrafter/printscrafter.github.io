import React from 'react';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';

interface FooterProps {
  onScrollToVisualizer: () => void;
  onScrollToSmartArt: () => void;
  onScrollToGallery: () => void;
  onScrollToLocation: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollToVisualizer,
  onScrollToSmartArt,
  onScrollToGallery,
  onScrollToLocation
}) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-slate-900 flex items-center justify-center font-serif font-bold text-base">
              P
            </div>
            <span className="font-serif text-lg font-bold text-white block">
              Printscrafter
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Contemporary SVG Paintings, Minimalist Line Art, Curated Functional Wall Decor &amp; Smart LED Art based in Lekki Phase 1, Lagos, Nigeria.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">
            Studio Links
          </h3>
          <ul className="space-y-2">
            <li>
              <button type="button" onClick={onScrollToVisualizer} className="hover:text-white transition-colors">
                3D Room Visualizer
              </button>
            </li>
            <li>
              <button type="button" onClick={onScrollToSmartArt} className="hover:text-white transition-colors">
                Smart LED Collection
              </button>
            </li>
            <li>
              <button type="button" onClick={onScrollToGallery} className="hover:text-white transition-colors">
                Pinterest Art Studio
              </button>
            </li>
            <li>
              <button type="button" onClick={onScrollToLocation} className="hover:text-white transition-colors">
                Lagos Studio Showroom
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">
            Studio & Atelier
          </h3>
          <p className="text-slate-300">Lekki Phase 1, Lagos, Nigeria</p>
          <p className="mt-1">WhatsApp / Phone: +234 815 422 4416</p>
          <p className="mt-1">Email: contact@printscrafter.com</p>
          <p className="mt-1 text-slate-500">Mon – Sat: 9:00 AM – 6:00 PM (WAT)</p>
        </div>

        {/* Payment & Security */}
        <div>
          <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">
            Payment & Cloud Security
          </h3>
          <p className="mb-3 text-slate-400">
            Powered by Paystack secure payment gateway with real-time Firebase Firestore order persistence.
          </p>
          <div className="flex items-center gap-3 text-slate-300 text-lg">
            <span className="px-2 py-1 bg-slate-800 rounded-md font-bold text-[10px] tracking-wider border border-slate-700">
              PAYSTACK
            </span>
            <span className="px-2 py-1 bg-slate-800 rounded-md font-bold text-[10px] tracking-wider border border-slate-700">
              VISA
            </span>
            <span className="px-2 py-1 bg-slate-800 rounded-md font-bold text-[10px] tracking-wider border border-slate-700">
              MASTERCARD
            </span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>&copy; 2026 Printscrafter Ltd. All rights reserved.</p>
        <p className="text-[11px] text-slate-600">
          Crafted with fine materials in Lagos • Global shipping available
        </p>
      </div>
    </footer>
  );
};
