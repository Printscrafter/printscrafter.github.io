import React, { useState } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X, 
  Upload, 
  Package, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  ShieldCheck,
  Layers,
  Settings,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { Currency, UserProfile } from '../types';

interface NavbarProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenDashboard: () => void;
  onScrollToVisualizer: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onCurrencyChange,
  searchQuery,
  onSearchChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenDashboard,
  onScrollToVisualizer,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
              Printscrafter
            </span>
            <span className="text-[9px] tracking-widest text-slate-500 uppercase -mt-1 font-bold">
              Custom Fine Art & Printing • Lagos
            </span>
          </div>
        </a>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search abstract canvas, smart LED art, metal prints..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 transition-all"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          
          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="NGN">🇳🇬 NGN (₦)</option>
            <option value="USD">🇺🇸 USD ($)</option>
          </select>

          {/* Quick Upload CTA */}
          <button
            type="button"
            onClick={onScrollToVisualizer}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl hover:bg-brand-100 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-brand-600" /> Upload Art
          </button>

          {/* Collector Dashboard CTA Button */}
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
              title="Open Collector Dashboard"
            >
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              <span>Dashboard</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-2 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join Studio</span>
              </button>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={onOpenWishlist}
            className="relative p-2 text-slate-600 hover:text-pink-600 transition-colors"
            title="Saved Artworks"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 sm:px-3 sm:py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="bg-brand-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
              {cartCount}
            </span>
          </button>

          {/* User Account Capsule / Dropdown */}
          <div className="relative">
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 hover:border-brand-500 transition-colors"
                  aria-label="Account Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block pr-0.5" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.displayName || 'Collector'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold bg-brand-50 text-brand-800 px-2 py-0.5 rounded-md">
                          {currentUser.membershipTier || 'Collector'}
                        </span>
                        {currentUser.role === 'admin' && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDashboard();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Layers className="w-4 h-4 text-brand-600" />
                        <span>Collector Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDashboard();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>Orders & Live Tracking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDashboard();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Profile & Address Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="sm:hidden p-2 text-slate-700 hover:text-slate-900"
                title="Sign In"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 border-t border-slate-100 bg-white space-y-3">
          <div className="relative pt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search abstract canvas, smart LED art..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800"
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-4 text-slate-400" />
          </div>

          <div className="flex flex-col gap-2 pt-2 text-xs font-medium text-slate-700">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 text-left justify-center shadow-sm"
              >
                <Layers className="w-4 h-4 text-brand-300" />
                <span>Open Collector Dashboard</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-semibold flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4" /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Sign Up
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToVisualizer();
              }}
              className="py-2.5 px-3 rounded-xl bg-brand-50 text-brand-700 font-semibold flex items-center gap-2 text-left"
            >
              <Upload className="w-4 h-4 text-brand-600" /> 3D Room Visualizer & Custom Photo Upload
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="py-2.5 px-3 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left font-semibold"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
