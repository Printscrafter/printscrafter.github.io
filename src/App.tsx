/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  testConnection, 
  logoutUser, 
  syncUserProfile 
} from './firebase/config';
import { PRODUCTS } from './data/products';
import { 
  Currency, 
  Category, 
  Product, 
  CartItem, 
  OrderRecord, 
  UserProfile,
  SavedCustomArtwork 
} from './types';
import { fetchAICuration, AICurationResult } from './services/curatorService';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SmartLedSection } from './components/SmartLedSection';
import { ThreeVisualizer } from './components/ThreeVisualizer';
import { PinterestMCPSection } from './components/PinterestMCPSection';
import { PinterestPin } from './types';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrdersModal } from './components/OrdersModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { LocalShowroom } from './components/LocalShowroom';
import { ReviewsSection } from './components/ReviewsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { WhatsAppWidget } from './components/WhatsAppWidget';

export default function App() {
  // App state
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('printscrafter_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('printscrafter_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom uploaded artworks vault
  const [savedCustomArtworks, setSavedCustomArtworks] = useState<SavedCustomArtwork[]>(() => {
    try {
      const saved = localStorage.getItem('printscrafter_vault');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Art Curator recommendations state
  const [curation, setCuration] = useState<AICurationResult | null>(null);
  const [isCuratorLoading, setIsCuratorLoading] = useState<boolean>(false);

  // Selected product synced to 3D visualizer
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [customArtworkToPreview, setCustomArtworkToPreview] = useState<{
    image: string;
    title: string;
    isCustom: boolean;
  } | null>(null);

  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Initial connection test & Auth listener
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setCurrentUser(profile);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Collector',
            role: firebaseUser.email === 'printscrafter@gmail.com' ? 'admin' : 'customer',
            membershipTier: 'Collector',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // AI Art Curator fetch handler
  const handleRefreshCuration = async () => {
    setIsCuratorLoading(true);
    try {
      const likedProds = PRODUCTS.filter(p => wishlistIds.includes(p.id));
      const result = await fetchAICuration(likedProds, currentUser?.membershipTier, currency);
      setCuration(result);
    } catch (err) {
      console.warn('AI curation fetch notice:', err);
    } finally {
      setIsCuratorLoading(false);
    }
  };

  // Trigger curation whenever wishlist items or tier change
  useEffect(() => {
    handleRefreshCuration();
  }, [wishlistIds.length, currentUser?.membershipTier]);

  // Save Cart, Wishlist, Vault to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('printscrafter_cart', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('printscrafter_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      // ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem('printscrafter_vault', JSON.stringify(savedCustomArtworks));
    } catch (e) {
      // ignore
    }
  }, [savedCustomArtworks]);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(
        i => i.title === item.title && i.size === item.size && i.frame === item.frame
      );
      if (existing) {
        return prev.map(i =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.cartId === cartId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter((i): i is CartItem => i !== null)
    );
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  };

  // Wishlist toggle
  const handleToggleWishlist = (id: number) => {
    setWishlistIds(prev =>
      prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
    );
  };

  // 3D visualizer sync
  const handlePreview3D = (p: Product) => {
    setCustomArtworkToPreview(null);
    setSelectedProduct(p);
    scrollToSection('visualizer');
  };

  const handlePreviewCustomIn3D = (art: { image: string; title: string; isCustom: boolean }) => {
    setCustomArtworkToPreview(art);
    scrollToSection('visualizer');
  };

  const handlePreviewPinIn3D = (pin: PinterestPin) => {
    const pinAsProduct: Product = {
      id: 5000 + Math.abs(pin.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
      title: pin.title,
      category: 'Abstract Portraits' as any,
      basePriceNGN: pin.basePriceNGN,
      image: pin.imageUrl,
      description: pin.description,
      isLed: Boolean(pin.isLedCompatible),
      artistNote: pin.artistNote || 'Archival museum grade print',
      dimensionsDefault: pin.dimensionsDefault || '60 x 80 cm'
    };
    setCustomArtworkToPreview(null);
    setSelectedProduct(pinAsProduct);
    scrollToSection('visualizer');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auth actions
  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenDashboard = () => {
    if (currentUser) {
      setIsDashboardOpen(true);
    } else {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setIsDashboardOpen(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsDashboardOpen(false);
  };

  const handleSaveCustomArtwork = (art: SavedCustomArtwork) => {
    setSavedCustomArtworks(prev => {
      const exists = prev.some(item => item.imageUrl === art.imageUrl);
      if (exists) return prev;
      return [art, ...prev];
    });
  };

  const ledProducts = useMemo(() => PRODUCTS.filter(p => p.isLed), []);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between selection:bg-brand-600 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenDashboard={handleOpenDashboard}
        onScrollToVisualizer={() => scrollToSection('visualizer')}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero
          heroProduct={PRODUCTS.find(p => p.id === 17) || PRODUCTS[0]}
          onScrollToVisualizer={() => scrollToSection('visualizer')}
          onScrollToGallery={() => scrollToSection('categories')}
          onPreviewHeroProduct={handlePreview3D}
        />

        {/* Smart LED Collection Section */}
        <SmartLedSection
          ledProducts={ledProducts}
          onPreviewLedProduct={handlePreview3D}
        />

        {/* 3D Visualizer Studio Section */}
        <ThreeVisualizer
          currency={currency}
          selectedProduct={selectedProduct}
          onAddToCart={handleAddToCart}
          onSelectProduct={setSelectedProduct}
          onSaveCustomArtwork={handleSaveCustomArtwork}
          customArtworkToPreview={customArtworkToPreview}
        />

        {/* Pinterest MCP Dynamic Artwork Discovery & Print Studio */}
        <PinterestMCPSection
          currency={currency}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onPreviewPinIn3D={handlePreviewPinIn3D}
          onAddToCart={handleAddToCart}
          globalSearchQuery={searchQuery}
        />

        {/* Physical Showroom & Google Map in Lekki Phase 1, Lagos */}
        <LocalShowroom />

        {/* Collector Testimonials */}
        <ReviewsSection />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer
        onScrollToVisualizer={() => scrollToSection('visualizer')}
        onScrollToSmartArt={() => scrollToSection('smartArt')}
        onScrollToGallery={() => scrollToSection('categories')}
        onScrollToLocation={() => scrollToSection('location')}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={activeModalProduct}
        currency={currency}
        onClose={() => setActiveModalProduct(null)}
        onSyncToVisualizer={handlePreview3D}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        allProducts={PRODUCTS}
        currency={currency}
        onRemoveWishlist={handleToggleWishlist}
        onPreviewIn3D={handlePreview3D}
      />

      {/* Checkout Modal with Paystack & Firestore Order Logging */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currency={currency}
        currentUser={currentUser}
        onLogin={async () => {
          handleOpenAuth('signin');
          return null;
        }}
        onOrderCompleted={(order) => {
          setCart([]);
        }}
        onViewOrders={handleOpenDashboard}
      />

      {/* Real-time Orders History & Admin Status Modal (accessible standalone) */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        currentUser={currentUser}
        currency={currency}
        onLogin={() => handleOpenAuth('signin')}
      />

      {/* User Auth Modal (Sign Up, Sign In, Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Full-Featured Collector User Dashboard Modal */}
      {currentUser && (
        <UserDashboardModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          currentUser={currentUser}
          currency={currency}
          wishlistIds={wishlistIds}
          allProducts={PRODUCTS}
          savedCustomArtworks={savedCustomArtworks}
          curation={curation}
          isCuratorLoading={isCuratorLoading}
          onRefreshCuration={handleRefreshCuration}
          onUploadCustomArt={() => scrollToSection('visualizer')}
          onPreviewIn3D={(art) => {
            if ('category' in art) {
              handlePreview3D(art as Product);
            } else {
              handlePreviewCustomIn3D(art);
            }
          }}
          onAddToCart={handleAddToCart}
          onProfileUpdated={(updated) => setCurrentUser(updated)}
          onLogout={handleLogout}
        />
      )}

      {/* Floating WhatsApp Concierge Widget */}
      <WhatsAppWidget />
    </div>
  );
}
