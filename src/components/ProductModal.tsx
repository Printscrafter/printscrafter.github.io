import React from 'react';
import { X, Box, Sparkles, CheckCircle2, Shield, Truck } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../data/products';

interface ProductModalProps {
  product: Product | null;
  currency: Currency;
  onClose: () => void;
  onSyncToVisualizer: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  currency,
  onClose,
  onSyncToVisualizer
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 text-xl rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Image */}
          <div className="relative bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden aspect-[4/5]">
            <img
              src={product.image}
              alt={product.title}
              className="max-h-full w-auto object-contain rounded-xl shadow-lg"
            />
            {product.isLed && (
              <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Smart LED Illumination
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                {product.title}
              </h2>
              <p className="text-xs text-brand-700 font-semibold uppercase tracking-wider mt-1">
                {product.category}
              </p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specs */}
            <div className="space-y-2.5 text-xs text-slate-600 border-t border-b border-slate-100 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Default Size: <strong className="text-slate-800">{product.dimensionsDefault || 'Custom Sizing'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Craftsmanship: <strong className="text-slate-800">{product.artistNote || 'Archival museum grade'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Delivery: <strong className="text-slate-800">3–5 Days Nigeria, Express Worldwide</strong></span>
              </div>
            </div>

            {/* Base Price & 3D Visualizer Trigger */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Starting Price</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(product.basePriceNGN, currency)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSyncToVisualizer(product);
                  onClose();
                }}
                className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Box className="w-4 h-4" /> Open in 3D Visualizer Studio
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
