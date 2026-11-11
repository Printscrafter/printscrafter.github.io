import React from 'react';
import { Sparkles, Box, Zap, Radio } from 'lucide-react';
import { Product } from '../types';

interface SmartLedSectionProps {
  onPreviewLedProduct: (product: Product) => void;
  ledProducts: Product[];
}

export const SmartLedSection: React.FC<SmartLedSectionProps> = ({
  onPreviewLedProduct,
  ledProducts
}) => {
  const cyberPulseProduct = ledProducts.find(p => p.id === 13) || ledProducts[0];
  const neonSkylineProduct = ledProducts.find(p => p.id === 14) || ledProducts[1];

  return (
    <section id="smartArt" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background radial glow blurs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-600/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-600/25 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Illuminated Smart LED Canvas Collection
            </h2>

            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
              Every smart LED piece in this collection connects directly to the 3D Visualizer Studio with live glowing LED rim illumination, music sync reactivity presets, and full app-control simulations.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              {cyberPulseProduct && (
                <button
                  type="button"
                  onClick={() => onPreviewLedProduct(cyberPulseProduct)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 text-xs"
                >
                  <Box className="w-4 h-4" /> Preview Cyber-Pulse in 3D Studio
                </button>
              )}
              {neonSkylineProduct && (
                <button
                  type="button"
                  onClick={() => onPreviewLedProduct(neonSkylineProduct)}
                  className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition-all flex items-center gap-2 text-xs"
                >
                  <Box className="w-4 h-4" /> Preview Neon Skyline in 3D Studio
                </button>
              )}
            </div>
          </div>

          {/* Right Glowing Card Preview */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-slate-800/90 border border-purple-500/40 p-4 rounded-3xl shadow-[0_0_50px_rgba(124,58,237,0.35)] transition-all hover:shadow-[0_0_70px_rgba(236,72,153,0.45)]">
                <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-[4/5]">
                  <img
                    src={cyberPulseProduct ? cyberPulseProduct.image : "/art/third-mainland-cyber.svg"}
                    alt={cyberPulseProduct ? cyberPulseProduct.title : "Smart LED Wall Art Print"}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  
                  {/* Live Music Sync Indicator Badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-pink-500/50 text-[11px] font-semibold text-pink-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                    <Radio className="w-3.5 h-3.5 text-pink-400" />
                    <span>Smart Music Sync Active</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-white">
                  <div>
                    <h3 className="font-serif font-bold text-lg">{cyberPulseProduct ? cyberPulseProduct.title : 'Third Mainland Cyber-Pulse'}</h3>
                    <p className="text-xs text-slate-400">Illuminated Smart LED Series</p>
                  </div>
                  {cyberPulseProduct && (
                    <button
                      type="button"
                      onClick={() => onPreviewLedProduct(cyberPulseProduct)}
                      className="px-4 py-2 bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Box className="w-3.5 h-3.5" /> 3D Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
