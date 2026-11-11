import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Lock } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currency: Currency;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout
}) => {
  if (!isOpen) return null;

  const subtotalNGN = cart.reduce((sum, item) => sum + item.priceNGN * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 p-6">
        
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Your Shopping Cart
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

          {/* Cart Items List */}
          <div className="my-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">Your cart is currently empty.</p>
                <p className="text-xs text-slate-400 mt-1">Explore the 3D room studio or catalogue to add wall art.</p>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.cartId}
                  className="flex items-start gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 group"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartId)}
                        className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {item.size} • {item.frame}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-700">
                        {formatPrice(item.priceNGN, currency)}
                      </span>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartId, -1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-slate-800 px-1">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartId, 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Checkout Actions */}
        <div className="border-t border-slate-200 pt-4 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Estimated Subtotal</span>
            <span className="font-bold text-slate-900 text-xl font-serif">
              {formatPrice(subtotalNGN, currency)}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 justify-center">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secured via Paystack inline debit cards, Apple Pay & transfers</span>
          </p>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => {
              onClose();
              onOpenCheckout();
            }}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
