import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Package, 
  Heart, 
  Image as ImageIcon, 
  Settings, 
  MessageSquare, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  Box, 
  Upload, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Award,
  Layers,
  Palette,
  ShoppingBag
} from 'lucide-react';
import { 
  UserProfile, 
  OrderRecord, 
  Currency, 
  Product, 
  CartItem, 
  SavedCustomArtwork 
} from '../types';
import { formatPrice, PRODUCTS } from '../data/products';
import { AICurationResult } from '../services/curatorService';
import { 
  subscribeUserOrders, 
  subscribeAllOrdersForAdmin, 
  updateOrderStatusInFirestore 
} from '../firebase/orders';
import { updateUserProfileData } from '../firebase/config';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  currency: Currency;
  wishlistIds: number[];
  allProducts: Product[];
  savedCustomArtworks: SavedCustomArtwork[];
  curation: AICurationResult | null;
  isCuratorLoading: boolean;
  onRefreshCuration: () => void;
  onUploadCustomArt: (file: File) => void;
  onPreviewIn3D: (product: Product | { image: string; title: string; isCustom: boolean }) => void;
  onAddToCart: (item: CartItem) => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onLogout: () => void;
}

type DashboardTab = 'overview' | 'curator' | 'orders' | 'profile' | 'vault' | 'wishlist' | 'concierge';

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currency,
  wishlistIds,
  allProducts,
  savedCustomArtworks,
  curation,
  isCuratorLoading,
  onRefreshCuration,
  onUploadCustomArt,
  onPreviewIn3D,
  onAddToCart,
  onProfileUpdated,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile form state
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [defaultAddress, setDefaultAddress] = useState(currentUser.defaultAddress || '');
  const [membershipTier, setMembershipTier] = useState<UserProfile['membershipTier']>(
    currentUser.membershipTier || 'Collector'
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState<string | null>(null);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);

  // Order filter
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Subscribe to real-time orders
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setOrdersLoading(true);

    if (currentUser.role === 'admin' && isAdminView) {
      const unsub = subscribeAllOrdersForAdmin(
        (allOrders) => {
          setOrders(allOrders);
          setOrdersLoading(false);
        },
        (err) => {
          console.error('Error fetching admin orders:', err);
          setOrdersLoading(false);
        }
      );
      return () => unsub();
    } else {
      const unsub = subscribeUserOrders(
        currentUser.id,
        (userOrders) => {
          setOrders(userOrders);
          setOrdersLoading(false);
        },
        (err) => {
          console.error('Error fetching user orders:', err);
          setOrdersLoading(false);
        }
      );
      return () => unsub();
    }
  }, [isOpen, currentUser, isAdminView]);

  if (!isOpen) return null;

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'active') return ['paid', 'processing', 'shipped'].includes(o.status);
    if (orderFilter === 'delivered') return o.status === 'delivered';
    return true;
  });

  const totalSpentNGN = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmountNGN : 0), 0);
  const activeOrdersCount = orders.filter(o => ['paid', 'processing', 'shipped'].includes(o.status)).length;
  const wishlistedProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  // Curated products mapping
  const recommendedCuratorProducts = (curation?.recommendedProductIds || [])
    .map(id => {
      const product = allProducts.find(p => p.id === id);
      const reason = curation?.reasons?.find(r => r.productId === id);
      return product ? { product, reason } : null;
    })
    .filter((item): item is { product: Product; reason: { productId: number; matchScore: number; stylingAdvice: string } | undefined } => item !== null);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMessage(null);
    setProfileErrorMessage(null);

    try {
      const updates = {
        displayName: displayName.trim(),
        phone: phone.trim(),
        defaultAddress: defaultAddress.trim(),
        membershipTier
      };

      await updateUserProfileData(currentUser.id, updates);

      const updatedUser: UserProfile = {
        ...currentUser,
        ...updates
      };

      onProfileUpdated(updatedUser);
      setProfileSuccessMessage('Profile and delivery destination successfully updated.');
      setTimeout(() => setProfileSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setProfileErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Admin Status Transition
  const handleAdminStatusChange = async (orderId: string, status: OrderRecord['status']) => {
    try {
      setStatusUpdatingId(orderId);
      await updateOrderStatusInFirestore(orderId, status);
    } catch (err) {
      console.error('Admin status update failed:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Multi-step order tracking progress bar
  const renderTrackingStepper = (status: OrderRecord['status']) => {
    const steps = [
      { key: 'paid', label: 'Payment Confirmed', desc: 'Paystack verified' },
      { key: 'processing', label: 'Artisan Framing', desc: 'Archival canvas stretch' },
      { key: 'shipped', label: 'Dispatched', desc: 'Courier in transit' },
      { key: 'delivered', label: 'Delivered', desc: 'Received & inspected' }
    ];

    const getStepIndex = (st: OrderRecord['status']) => {
      if (st === 'pending') return 0;
      if (st === 'paid') return 1;
      if (st === 'processing') return 2;
      if (st === 'shipped') return 3;
      if (st === 'delivered') return 4;
      return 1;
    };

    const currentStep = getStepIndex(status);

    if (status === 'cancelled') {
      return (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-semibold">
          Order Cancelled. Contact studio support if you need assistance.
        </div>
      );
    }

    return (
      <div className="py-2">
        <div className="grid grid-cols-4 gap-2 relative">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx + 1;

            return (
              <div key={s.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1.5 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-bold ${isCurrent ? 'text-brand-700' : 'text-slate-800'}`}>
                  {s.label}
                </span>
                <span className="text-[9px] text-slate-400 hidden sm:inline">
                  {s.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col md:flex-row overflow-hidden relative my-4">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 md:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dashboard Left Sidebar */}
        <aside className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* User Info Capsule */}
            <div className="flex items-center gap-3 pb-5 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-serif font-bold text-lg flex items-center justify-center shadow-md">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm text-slate-900 truncate">
                  {currentUser.displayName || 'Collector'}
                </h4>
                <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded-md mt-1">
                  <Award className="w-3 h-3" />
                  {currentUser.membershipTier || 'Collector'}
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="mt-5 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Studio Overview</span>
              </button>

              {/* AI Art Curator Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('curator')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'curator'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                  <span>AI Art Curator</span>
                </div>
                <span className="text-[9px] font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-1.5 py-0.5 rounded-md border border-purple-200">
                  AI
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>Order Tracking</span>
                </div>
                {activeOrdersCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vault')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'vault'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-4 h-4" />
                  <span>Custom Art Vault</span>
                </div>
                {savedCustomArtworks.length > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {savedCustomArtworks.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'wishlist'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  <span>Saved Wishlist</span>
                </div>
                {wishlistIds.length > 0 && (
                  <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Profile & Destination</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('concierge')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'concierge'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Studio Concierge</span>
              </button>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Dashboard Main Content Area */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col justify-between scrollbar-thin">
          
          <div>
            {/* Top Bar on Desktop */}
            <div className="hidden md:flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  {activeTab === 'overview' && 'Collector Dashboard'}
                  {activeTab === 'curator' && 'AI Art Curator • Personalized Recommendations'}
                  {activeTab === 'orders' && (isAdminView ? 'Studio Operations: All Orders' : 'Order Tracking & Deliveries')}
                  {activeTab === 'vault' && 'My Custom Art Vault'}
                  {activeTab === 'wishlist' && 'Saved Artworks & Wishlist'}
                  {activeTab === 'profile' && 'Collector Profile & Shipping Destination'}
                  {activeTab === 'concierge' && 'Lekki Phase 1 Studio Concierge'}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {currentUser.role === 'admin' && activeTab === 'orders' && (
                  <button
                    type="button"
                    onClick={() => setIsAdminView(!isAdminView)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      isAdminView
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isAdminView ? 'Admin View Active' : 'Switch to Admin View'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-500 font-medium block">Total Pieces Acquired</span>
                    <span className="text-2xl font-bold font-serif text-slate-900 mt-1 block">
                      {orders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0)}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-500 font-medium block">Total Investment</span>
                    <span className="text-2xl font-bold font-serif text-brand-700 mt-1 block">
                      {formatPrice(totalSpentNGN, currency)}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-500 font-medium block">Active Shipments</span>
                    <span className="text-2xl font-bold font-serif text-emerald-600 mt-1 block">
                      {activeOrdersCount}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[11px] text-slate-500 font-medium block">Saved in Wishlist</span>
                    <span className="text-2xl font-bold font-serif text-pink-600 mt-1 block">
                      {wishlistIds.length}
                    </span>
                  </div>
                </div>

                {/* AI Art Curator Callout Banner */}
                {curation && (
                  <div className="bg-gradient-to-r from-purple-50 via-pink-50/50 to-amber-50/40 border border-purple-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        "{curation.collectionTitle}"
                      </h4>
                      <p className="text-xs text-slate-600 max-w-xl line-clamp-2">
                        {curation.curatorCritique}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('curator')}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0"
                    >
                      <span>Explore Curation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Latest Active Order Tracking Widget */}
                {orders.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-brand-600" />
                        <span className="font-serif font-bold text-sm text-slate-900">
                          Latest Order: {orders[0].orderNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <span>View All Orders</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {renderTrackingStepper(orders[0].status)}

                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-slate-500">
                        {orders[0].items.length} artwork piece{orders[0].items.length === 1 ? '' : 's'} • Destination: {orders[0].shippingAddress}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatPrice(orders[0].totalAmountNGN, currency)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-serif font-bold text-slate-800 text-sm">No artwork orders yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Use our 3D room visualizer to preview wall art in contemporary dining or living room settings.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        const el = document.getElementById('visualizer');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                    >
                      <Box className="w-3.5 h-3.5" /> Launch 3D Visualizer
                    </button>
                  </div>
                )}

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-brand-50/50 border border-brand-200 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-brand-900">Upload Family / Custom Photo</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Render in 3D & order archival canvas.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        const el = document.getElementById('visualizer');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" /> 3D Upload
                    </button>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-emerald-900">Direct Studio Support</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Speak directly to human curator on WhatsApp.</p>
                    </div>
                    <a
                      href="https://wa.me/2348154224416"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: AI ART CURATOR */}
            {activeTab === 'curator' && (
              <div className="space-y-6">
                
                {/* Curator Header Box */}
                <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl relative overflow-hidden shadow-lg">
                  <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/20 rounded-full blur-[80px] pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-bold text-white">
                        {curation?.collectionTitle || 'Bespoke Curated Wall Art Collection'}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        {curation?.curatorCritique || 'Analyzing your aesthetic inclinations across tactile canvas textures, precious metal reflections, and smart ambient illumination.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isCuratorLoading}
                      onClick={onRefreshCuration}
                      className="px-4 py-2.5 bg-white text-slate-900 hover:bg-purple-50 text-xs font-bold rounded-2xl transition-all shadow-md flex items-center gap-2 shrink-0 self-start md:self-center"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-brand-600 ${isCuratorLoading ? 'animate-spin' : ''}`} />
                      <span>{isCuratorLoading ? 'Synthesizing...' : 'Re-Curate Collection'}</span>
                    </button>
                  </div>

                  {/* Harmony palette & style pill */}
                  {curation?.paletteHexCodes && (
                    <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-300" />
                        <span className="text-purple-200 text-[11px] font-semibold">Suggested Room Harmony:</span>
                        <div className="flex items-center gap-1.5">
                          {curation.paletteHexCodes.map((hex, i) => (
                            <span
                              key={i}
                              className="w-5 h-5 rounded-full border border-white/30 shadow-xs"
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>

                      <span className="text-xs text-purple-200 font-medium">
                        Style Vibe: <strong className="text-white">{curation.styleVibe}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommended Curated Art Pieces */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recommendedCuratorProducts.map(({ product, reason }) => (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                    >
                      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => { onPreviewIn3D(product); onClose(); }}>
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {reason?.matchScore && (
                          <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>{reason.matchScore}% Match</span>
                          </div>
                        )}
                        {product.isLed && (
                          <span className="absolute top-3 right-3 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            Smart LED
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-[10px] text-brand-700 font-bold uppercase">{product.category}</span>
                          <h4 className="font-serif font-bold text-sm text-slate-900">{product.title}</h4>
                          <span className="text-xs font-bold text-slate-900 mt-1 block">
                            {formatPrice(product.basePriceNGN, currency)}
                          </span>

                          {reason?.stylingAdvice && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2">
                              {reason.stylingAdvice}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              onPreviewIn3D(product);
                              onClose();
                            }}
                            className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Box className="w-3.5 h-3.5" /> 3D Room Test
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onAddToCart({
                                cartId: `dash-curated-${product.id}-${Date.now()}`,
                                productId: product.id,
                                title: product.title,
                                category: product.category,
                                size: 'Medium (24x36") • PORTRAIT',
                                orientation: 'portrait',
                                frame: 'Modern Black Aluminum',
                                priceNGN: product.basePriceNGN,
                                image: product.image,
                                quantity: 1
                              });
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 2: ORDER TRACKING */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Filter buttons */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'All Orders' },
                      { key: 'active', label: 'In Production & Transit' },
                      { key: 'delivered', label: 'Delivered' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setOrderFilter(tab.key as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          orderFilter === tab.key
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {filteredOrders.length} Order{filteredOrders.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Orders list */}
                {ordersLoading ? (
                  <div className="text-center py-16">
                    <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Syncing orders with Firestore database...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <Package className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600">No orders in this category.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <div
                        key={order.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {order.orderNumber}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {currentUser.role === 'admin' && isAdminView ? (
                              <select
                                value={order.status}
                                disabled={statusUpdatingId === order.id}
                                onChange={(e) => handleAdminStatusChange(order.id, e.target.value as OrderRecord['status'])}
                                className="bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-lg px-2.5 py-1"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid & Confirmed</option>
                                <option value="processing">In Studio Framing</option>
                                <option value="shipped">Dispatched / In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            ) : (
                              <span className="capitalize px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                                {order.status === 'processing' ? 'In Framing Studio' : order.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Visual multi-stage stepper */}
                        {renderTrackingStepper(order.status)}

                        {/* Items */}
                        <div className="space-y-2 pt-1">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs"
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate">{item.title}</p>
                                <p className="text-[10px] text-slate-500">
                                  {item.size} • {item.frame} (Qty: {item.quantity})
                                </p>
                              </div>
                              <span className="font-bold text-slate-900">
                                {formatPrice(item.priceNGN * item.quantity, currency)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Footer details & WhatsApp link */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                          <div>
                            <span className="block font-medium">Destination: {order.shippingAddress}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Ref: {order.paystackReference}</span>
                          </div>

                          <div className="flex items-center gap-3 justify-end">
                            <span className="text-base font-bold text-slate-900">
                              {formatPrice(order.totalAmountNGN, currency)}
                            </span>
                            <a
                              href={`https://wa.me/2348154224416?text=${encodeURIComponent(
                                `Hello Printscrafter Studio, I am tracking Order ${order.orderNumber}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Live Courier Tracking</span>
                            </a>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: CUSTOM ART VAULT */}
            {activeTab === 'vault' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <p className="text-xs text-slate-600">
                    Your personal uploaded photo canvases saved for fast re-prints or 3D visualizer re-renders.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      const el = document.getElementById('visualizer');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload New Photo
                  </button>
                </div>

                {savedCustomArtworks.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-3">
                    <ImageIcon className="w-12 h-12 stroke-1 text-slate-300 mx-auto" />
                    <h4 className="font-serif font-bold text-slate-800 text-sm">No custom uploads saved yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Whenever you upload a local photo into our 3D room visualizer, you can save it into your vault to test with different frame finishes.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedCustomArtworks.map(art => (
                      <div
                        key={art.id}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/5] bg-slate-100">
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 truncate">{art.title}</h4>
                            <span className="text-[10px] text-slate-400 capitalize">{art.orientation} Orientation</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onPreviewIn3D({
                                image: art.imageUrl,
                                title: art.title,
                                isCustom: true
                              });
                              onClose();
                            }}
                            className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Box className="w-3.5 h-3.5" /> Render in 3D Studio
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SAVED WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                {wishlistedProducts.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-3">
                    <Heart className="w-12 h-12 stroke-1 text-slate-300 mx-auto" />
                    <h4 className="font-serif font-bold text-slate-800 text-sm">Your wishlist is empty</h4>
                    <p className="text-xs text-slate-500">
                      Browse our curated fine art catalogue and tap the heart icon on any artwork to save it here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {wishlistedProducts.map(p => (
                      <div
                        key={p.id}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/5] bg-slate-100">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {p.category}
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                            <p className="text-xs font-bold text-brand-700 mt-1">
                              {formatPrice(p.basePriceNGN, currency)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onPreviewIn3D(p);
                                onClose();
                              }}
                              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                            >
                              <Box className="w-3.5 h-3.5" /> 3D Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onAddToCart({
                                  cartId: `wish-${p.id}-${Date.now()}`,
                                  productId: p.id,
                                  title: p.title,
                                  category: p.category,
                                  size: 'Medium (24x36") • PORTRAIT',
                                  orientation: 'portrait',
                                  frame: 'Modern Black Aluminum',
                                  priceNGN: p.basePriceNGN,
                                  image: p.image,
                                  quantity: 1
                                });
                              }}
                              className="px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold transition-colors"
                              title="Add to Cart"
                            >
                              + Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PROFILE & SHIPPING DESTINATION */}
            {activeTab === 'profile' && (
              <div className="max-w-xl space-y-5">
                {profileSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{profileSuccessMessage}</span>
                  </div>
                )}

                {profileErrorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <span>{profileErrorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Legal / Collector Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Email Address (Read-only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Phone & WhatsApp for Courier
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 815 422 4416"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Default Delivery Destination
                    </label>
                    <textarea
                      rows={3}
                      value={defaultAddress}
                      onChange={(e) => setDefaultAddress(e.target.value)}
                      placeholder="e.g. Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Account Tier / Classification
                    </label>
                    <select
                      value={membershipTier}
                      onChange={(e) => setMembershipTier(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                    >
                      <option value="Collector">Private Collector (Standard)</option>
                      <option value="Connoisseur">Art Connoisseur VIP (Free Delivery & Framing Consult)</option>
                      <option value="Interior Designer">Interior Designer / Trade Account (B2B Invoicing)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="py-3 px-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
                    >
                      {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 6: STUDIO CONCIERGE */}
            {activeTab === 'concierge' && (
              <div className="space-y-6 max-w-xl">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-slate-900">
                        Dedicated Art Concierge
                      </h4>
                      <p className="text-xs text-slate-500">
                        Lekki Phase 1, Lagos Master Framer & Curator
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Have questions regarding custom wall dimensions, gallery wall layouts, LED electrical wiring, or specialized museum float framing? We provide complimentary concierge support for our collectors.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://wa.me/2348154224416?text=Hello%20Printscrafter%2C%20I%20am%20logged%20in%20as%20a%20collector%20and%20need%20framing%20advice."
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Master Framer</span>
                    </a>
                    <a
                      href="tel:+2348154224416"
                      className="py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-slate-600" />
                      <span>Direct Line (+234 815 422 4416)</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Lekki Phase 1, Lagos State, Nigeria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Visiting Hours: Monday – Saturday (9:00 AM – 6:00 PM WAT)</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer note inside dashboard */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Printscrafter Collector Portal</span>
            <span>Powered by Gemini AI Curator & Firebase</span>
          </div>

        </main>

      </div>
    </div>
  );
};
