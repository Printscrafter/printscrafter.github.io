import React from 'react';
import { X, Heart, Box, Trash2 } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../data/products';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: number[];
  allProducts: Product[];
  currency: Currency;
  onRemoveWishlist: (id: number) => void;
  onPreviewIn3D: (p: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  allProducts,
  currency,
  onRemoveWishlist,
  onPreviewIn3D
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 p-6">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-pink-600" />
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Saved Wall Art Wishlist
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="my-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
            {wishlistedProducts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Heart className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">Your wishlist is empty.</p>
                <p className="text-xs text-slate-400 mt-1">Tap the heart on any artwork to save it for later.</p>
              </div>
            ) : (
              wishlistedProducts.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-3.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-16 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {p.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemoveWishlist(p.id)}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-brand-700 font-semibold">{p.category}</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      {formatPrice(p.basePriceNGN, currency)}
                    </p>

                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onPreviewIn3D(p);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <Box className="w-3 h-3" /> Preview 3D Studio
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500 text-center">
            {wishlistedProducts.length} artwork{wishlistedProducts.length === 1 ? '' : 's'} saved
          </p>
        </div>

      </div>
    </div>
  );
};
