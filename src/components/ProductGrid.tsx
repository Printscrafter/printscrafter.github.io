import React from 'react';
import { Heart, Box, Sparkles, ExternalLink } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../data/products';

interface ProductGridProps {
  products: Product[];
  currency: Currency;
  wishlistIds: number[];
  onToggleWishlist: (id: number) => void;
  onPreview3D: (p: Product) => void;
  onOpenProductModal: (p: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currency,
  wishlistIds,
  onToggleWishlist,
  onPreview3D,
  onOpenProductModal
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <p className="text-slate-500 text-sm">No artwork found matching your criteria.</p>
      </div>
    );
  }

  return (
    <section id="gallery" className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
        {products.map(product => {
          const isWishlisted = wishlistIds.includes(product.id);
          const priceStr = formatPrice(product.basePriceNGN, currency);

          return (
            <article
              key={product.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Product Image Box */}
              <div 
                className="relative overflow-hidden cursor-pointer bg-slate-50 aspect-[4/5]"
                onClick={() => onOpenProductModal(product)}
              >
                <img
                  src={product.image}
                  alt={`${product.title} - Custom Wall Art`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Badges */}
                {product.isLed ? (
                  <span className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-xs text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Smart LED
                  </span>
                ) : product.category === 'Functional Wall Decor' ? (
                  <span className="absolute top-3 left-3 bg-amber-700/90 backdrop-blur-xs text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    🛋️ Functional Decor
                  </span>
                ) : null}

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-slate-600 hover:text-pink-600 flex items-center justify-center backdrop-blur-sm shadow-md transition-colors"
                  aria-label="Save to Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlisted ? 'fill-pink-600 text-pink-600' : ''}`}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => onOpenProductModal(product)}
                    className="text-lg font-serif font-bold text-slate-900 hover:text-brand-600 cursor-pointer transition-colors"
                  >
                    {product.title}
                  </h3>
                  <p className="text-[11px] text-brand-700 font-semibold uppercase tracking-wider mt-0.5">
                    {product.category}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Pricing & 3D CTA */}
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">From</span>
                    <span className="text-base font-bold text-slate-900">{priceStr}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPreview3D(product)}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                    title="Preview in 3D Visualizer"
                  >
                    <Box className="w-3.5 h-3.5" /> Preview 3D
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
