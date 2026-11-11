import React from 'react';
import { Upload, Sparkles, ArrowRight, Box } from 'lucide-react';
import { Product } from '../types';

interface HeroProps {
  onScrollToVisualizer: () => void;
  onScrollToGallery: () => void;
  onPreviewHeroProduct: (p: Product) => void;
  heroProduct: Product;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToVisualizer,
  onScrollToGallery,
  onPreviewHeroProduct,
  heroProduct
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Animated Hero Title with Dynamic Shimmer Text Effects */}
            <h1 className="text-4xl sm:text-6xl md:text-6xl font-serif font-bold tracking-tight text-slate-900 leading-[1.12]">
              Bring Gallery-Grade{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-500 via-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-text-shimmer font-extrabold drop-shadow-xs">
                  Art &amp; Custom Photos
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 rounded-full opacity-80" />
              </span>{' '}
              To Your Walls.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover luxury abstract oils, custom photo canvas prints, HD metal wall panels, and smart illuminated LED canvas pieces crafted in Lagos, Nigeria and shipped worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                type="button"
                onClick={onScrollToVisualizer}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-center shadow-lg shadow-slate-900/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 text-sm cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-300" /> Upload Your Own Photo
              </button>
              
              <button
                type="button"
                onClick={onScrollToGallery}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-center hover:border-slate-300 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                Explore Pinterest Studio <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Quick stats / trust pill */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-xl font-bold text-slate-900 font-serif">100%</p>
                <p className="text-[11px] text-slate-500">Archival Cotton Canvas</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 font-serif">3D Real-time</p>
                <p className="text-[11px] text-slate-500">Room Orbit Studio</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 font-serif">Worldwide</p>
                <p className="text-[11px] text-slate-500">Fast Tracked Delivery</p>
              </div>
            </div>

          </div>

          {/* Hero Right Featured Spotlight Card with Image Effects */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md animate-float-hero">
              
              {/* Image Effect 1: Ambient Radiant Glow Aura behind the frame */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-rose-500/25 to-indigo-600/30 rounded-[2.5rem] blur-2xl animate-spotlight-aura -z-10" />

              {/* Masterpiece Gallery Outer Frame */}
              <div className="relative bg-gradient-to-b from-white via-slate-50 to-slate-100 p-4 sm:p-5 rounded-[2rem] border border-amber-300/40 shadow-2xl shadow-amber-950/20 group">
                
                {/* Spotlight Floating Pill Banner */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-lg flex items-center gap-1.5 whitespace-nowrap z-20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Spotlight Masterpiece</span>
                </div>

                {/* Artwork Canvas Box with Glass Reflection & Light Sweep Effects */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-[4/5] shadow-inner">
                  {/* Spotlight Image with subtle zoom on hover */}
                  <img
                    src={heroProduct.image}
                    alt={heroProduct.title}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Image Effect 2: Dynamic Light Sweep / Specular Sheen across the portrait */}
                  <div className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden">
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-25 animate-light-sweep" />
                  </div>

                  {/* Image Effect 3: Vignette & Lighting Contrast Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20 opacity-90 pointer-events-none" />

                  {/* Bottom Info Bar inside Card */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                    <div>
                      <h3 className="text-white font-serif font-bold text-lg drop-shadow-md">
                        {heroProduct.title}
                      </h3>
                      <p className="text-xs text-amber-300/90 font-medium drop-shadow-xs">
                        Featured Abstract Portrait • Lekki Studio
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPreviewHeroProduct(heroProduct)}
                      className="bg-gradient-to-r from-amber-500 to-brand-600 hover:from-amber-600 hover:to-brand-700 text-white text-xs px-3.5 py-2.5 rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer hover:scale-105"
                    >
                      <Box className="w-3.5 h-3.5" /> Preview 3D
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
