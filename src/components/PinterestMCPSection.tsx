import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Box, 
  Heart, 
  ExternalLink, 
  SlidersHorizontal, 
  Check, 
  Link as LinkIcon, 
  Plus, 
  X, 
  Printer, 
  Layers, 
  CheckCircle2, 
  Flame,
  ArrowRight,
  Maximize2,
  Palette
} from 'lucide-react';
import { PinterestPin, PinterestBoard, Currency, CartItem, Product, Orientation, FrameStyle, SizeOption } from '../types';
import { formatPrice } from '../data/products';
import { PINTEREST_BOARDS, PINTEREST_PINS } from '../data/pinterestData';
import { fetchPinterestPins, importCustomPinterestPin } from '../services/pinterestMCPService';

interface PinterestMCPSectionProps {
  currency: Currency;
  wishlistIds: number[];
  onToggleWishlist: (id: number) => void;
  onPreviewPinIn3D: (pin: PinterestPin) => void;
  onAddToCart: (item: CartItem) => void;
  globalSearchQuery?: string;
}

export const PinterestMCPSection: React.FC<PinterestMCPSectionProps> = ({
  currency,
  wishlistIds,
  onToggleWishlist,
  onPreviewPinIn3D,
  onAddToCart,
  globalSearchQuery
}) => {
  // Filter & Search states
  const [activeBoardSlug, setActiveBoardSlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(globalSearchQuery || '');
  const [orientationFilter, setOrientationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'saves' | 'price-low' | 'price-high'>('trending');

  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);
  
  // Data states
  const [pins, setPins] = useState<PinterestPin[]>(PINTEREST_PINS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedPinIds, setSavedPinIds] = useState<string[]>([]);
  
  // Modal states
  const [selectedPinForPrint, setSelectedPinForPrint] = useState<PinterestPin | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  
  // Import form state
  const [importUrl, setImportUrl] = useState<string>('');
  const [importTitle, setImportTitle] = useState<string>('');
  const [importImageUrl, setImportImageUrl] = useState<string>('');
  const [importNotes, setImportNotes] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Print Configuration Modal state
  const [selectedMedium, setSelectedMedium] = useState<'canvas' | 'acrylic' | 'rag' | 'led'>('canvas');
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>('oak');
  const [selectedSize, setSelectedSize] = useState<SizeOption>('medium');
  const [showAddedToast, setShowAddedToast] = useState<boolean>(false);

  // Load pins on board or search change
  useEffect(() => {
    let isCancelled = false;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchPinterestPins(activeBoardSlug, searchQuery, orientationFilter, sortBy);
        if (!isCancelled) {
          setPins(response.pins);
        }
      } catch (err) {
        console.warn('Error loading Pinterest MCP pins:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [activeBoardSlug, searchQuery, orientationFilter, sortBy]);

  // Handle saving pin to local favorites
  const toggleSavePin = (pin: PinterestPin) => {
    setSavedPinIds(prev => 
      prev.includes(pin.id) ? prev.filter(id => id !== pin.id) : [...prev, pin.id]
    );
    // Also toggle numeric wishlist if feasible
    const numericId = parseInt(pin.id.replace(/\D/g, ''), 10) || 100 + pins.indexOf(pin);
    onToggleWishlist(numericId);
  };

  // Calculate customized price based on medium and size
  const calculatedPrintPriceNGN = useMemo(() => {
    if (!selectedPinForPrint) return 35000;
    let base = selectedPinForPrint.basePriceNGN;

    // Medium adjustment
    if (selectedMedium === 'acrylic') base += 8500;
    if (selectedMedium === 'rag') base -= 3000;
    if (selectedMedium === 'led') base += 18000;

    // Size adjustment
    if (selectedSize === 'small') base = Math.round(base * 0.85);
    if (selectedSize === 'large') base = Math.round(base * 1.45);

    return base;
  }, [selectedPinForPrint, selectedMedium, selectedSize]);

  // Add customized print to cart
  const handleConfirmAddToCart = () => {
    if (!selectedPinForPrint) return;

    const sizeLabels: Record<SizeOption, string> = {
      small: 'Small (40 x 50 cm)',
      medium: 'Medium (60 x 80 cm)',
      large: 'Grand Statement (80 x 120 cm)'
    };

    const mediumLabels: Record<string, string> = {
      canvas: 'Archival Museum Canvas',
      acrylic: 'Ultra-HD Framed Acrylic',
      rag: 'Textured Fine Art Rag Paper',
      led: 'Smart Backlit LED Canvas'
    };

    const cartItem: CartItem = {
      cartId: `pin-${selectedPinForPrint.id}-${Date.now()}`,
      pinId: selectedPinForPrint.id,
      title: `${selectedPinForPrint.title} (${mediumLabels[selectedMedium]})`,
      category: 'Pinterest Art Print',
      size: sizeLabels[selectedSize],
      orientation: selectedPinForPrint.orientation,
      frame: selectedFrame === 'canvas' ? 'Gallery Stretched Wrap' : `${selectedFrame.toUpperCase()} Museum Frame`,
      priceNGN: calculatedPrintPriceNGN,
      image: selectedPinForPrint.imageUrl,
      quantity: 1,
      medium: selectedMedium
    };

    onAddToCart(cartItem);
    setShowAddedToast(true);
    setTimeout(() => {
      setShowAddedToast(false);
      setSelectedPinForPrint(null);
    }, 1500);
  };

  // Handle URL Import through Pinterest MCP
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl && !importImageUrl) return;

    setIsImporting(true);
    try {
      const newPin = await importCustomPinterestPin({
        pinterestUrl: importUrl,
        title: importTitle || 'Custom Pinterest Selection',
        customImageUrl: importImageUrl,
        styleNotes: importNotes
      });

      setPins(prev => [newPin, ...prev]);
      setIsImportModalOpen(false);
      setImportUrl('');
      setImportTitle('');
      setImportImageUrl('');
      setImportNotes('');

      // Open print modal immediately for the newly imported pin
      setSelectedPinForPrint(newPin);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <section id="categories" className="py-20 bg-slate-50 border-t border-b border-slate-200/80">
      <div id="pinterest-gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Zero-Pill Discipline: No tag above title) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              Dynamic Art Discovery
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Powered by the <strong className="text-slate-800">Pinterest MCP Engine</strong>. Dynamically browse trending interior art boards, explore high-resolution aesthetics, or paste your own Pinterest pin link. Select any artwork to preview live on your wall in our 3D Visualizer and order gallery-grade museum prints in Lagos.
            </p>
          </div>

          {/* MCP Active Status & Import Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pinterest MCP Active</span>
            </div>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Import Pinterest Pin</span>
            </button>
          </div>
        </div>

        {/* Pinterest Control & Search Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Pinterest pins: 'Afro Minimalist', 'Bauhaus', 'Terracotta Arches', 'Lagos Sunset'..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Controls: Orientation & Sort */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Orientation Filter */}
              <select
                value={orientationFilter}
                onChange={e => setOrientationFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="all">All Orientations</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="trending">Trending on Pinterest</option>
                <option value="saves">Most Saved (Popular)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Pinterest Board Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Boards:
            </span>
            {PINTEREST_BOARDS.map(board => {
              const isActive = activeBoardSlug === board.slug;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => setActiveBoardSlug(board.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{board.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {board.pinCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Active Board Critique */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
          <p>
            Showing <strong className="text-slate-800">{pins.length}</strong> dynamic Pinterest art pins in{' '}
            <strong className="text-slate-800 font-serif">
              {PINTEREST_BOARDS.find(b => b.slug === activeBoardSlug)?.name || 'Gallery'}
            </strong>
          </p>
          <span className="text-[11px] text-slate-400">Click artwork to preview in 3D or configure print</span>
        </div>

        {/* Dynamic Pinterest Masonry Waterfall Grid */}
        {isLoading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Streaming Pinterest MCP Artworks...</p>
          </div>
        ) : pins.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <p className="text-slate-600 font-serif text-lg font-bold">No Pinterest artworks found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try searching a different style like "Afro", "Bauhaus", "Terracotta", or paste a Pinterest link.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveBoardSlug('all');
                setOrientationFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {pins.map(pin => {
              const isSaved = savedPinIds.includes(pin.id);
              const priceDisplay = formatPrice(pin.basePriceNGN, currency);

              return (
                <div
                  key={pin.id}
                  className="break-inside-avoid bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  {/* Pin Image Container */}
                  <div className="relative overflow-hidden bg-slate-100 cursor-pointer">
                    <img
                      src={pin.imageUrl}
                      alt={pin.title}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />

                    {/* Pinterest Save Count Badge (Top-Left) */}
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                      <span className="text-red-500 font-bold">📌</span>
                      <span>{(pin.savesCount / 1000).toFixed(1)}k</span>
                    </div>

                    {/* Save to Wishlist Button (Top-Right) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSavePin(pin);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-pink-600 flex items-center justify-center shadow-md transition-colors"
                      title="Save Pin"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-600 text-pink-600' : ''}`} />
                    </button>

                    {/* Hover Overlay with Action Buttons */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                      
                      {/* Action 1: Preview in 3D Visualizer */}
                      <button
                        type="button"
                        onClick={() => onPreviewPinIn3D(pin)}
                        className="w-full mb-2 px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Box className="w-3.5 h-3.5 text-brand-600" />
                        <span>Preview in 3D Room</span>
                      </button>

                      {/* Action 2: Select to Print & Configure */}
                      <button
                        type="button"
                        onClick={() => setSelectedPinForPrint(pin)}
                        className="w-full px-3 py-2.5 bg-gradient-to-r from-amber-500 to-brand-600 hover:from-amber-600 hover:to-brand-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-200" />
                        <span>Select to Print • {priceDisplay}</span>
                      </button>
                    </div>
                  </div>

                  {/* Pin Info & Attributions */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3
                        onClick={() => setSelectedPinForPrint(pin)}
                        className="font-serif font-bold text-slate-900 text-base leading-snug hover:text-brand-600 cursor-pointer transition-colors"
                      >
                        {pin.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {pin.description}
                      </p>
                    </div>

                    {/* Color Palette Dots */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Palette className="w-3 h-3 text-slate-400 mr-0.5" />
                        {pin.palette.map((hex, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-slate-200 shadow-2xs inline-block"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>

                      <span className="font-bold text-slate-900 font-serif">
                        {priceDisplay}
                      </span>
                    </div>

                    {/* Pinner & Board info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="truncate max-w-[140px] text-slate-500 font-medium">
                        {pin.pinnerUsername}
                      </span>
                      <span className="truncate max-w-[120px] text-slate-400">
                        {pin.board}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* PINTEREST PRINT & FRAMING CONFIGURATION MODAL */}
      {/* ========================================================= */}
      {selectedPinForPrint && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedPinForPrint(null)}
        >
          <div 
            className="bg-white rounded-[2rem] max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Left: Artwork Preview in Studio Frame */}
            <div className="md:w-1/2 bg-slate-950 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-white">
              {/* Subtle ambient light glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between z-10">
                <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  Pinterest Selected Artwork
                </span>
                <span className="text-xs text-slate-400">
                  {selectedPinForPrint.dimensionsDefault || '60 x 80 cm'}
                </span>
              </div>

              {/* Artwork Mock Frame */}
              <div className="my-6 relative mx-auto w-full max-w-xs aspect-[4/5] rounded-xl overflow-hidden shadow-2xl transition-all">
                {/* Frame border simulation */}
                <div className={`w-full h-full p-2 transition-all ${
                  selectedFrame === 'oak' ? 'bg-[#854d0e]' :
                  selectedFrame === 'gold' ? 'bg-[#d4af37]' :
                  selectedFrame === 'black' ? 'bg-[#0f172a]' :
                  'bg-white'
                }`}>
                  <img
                    src={selectedPinForPrint.imageUrl}
                    alt={selectedPinForPrint.title}
                    className="w-full h-full object-cover rounded-lg shadow-inner"
                  />
                </div>
              </div>

              {/* Direct 3D Visualizer Trigger */}
              <button
                type="button"
                onClick={() => {
                  onPreviewPinIn3D(selectedPinForPrint);
                  setSelectedPinForPrint(null);
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 z-10 cursor-pointer"
              >
                <Box className="w-4 h-4 text-amber-300" />
                <span>Orbit in 3D Room Visualizer</span>
              </button>
            </div>

            {/* Right: Print Specifications & Add to Cart */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900">
                      {selectedPinForPrint.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      From board: <strong className="text-slate-700">{selectedPinForPrint.board}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPinForPrint(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Print Medium Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    1. Select Print Medium:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'canvas', label: 'Museum Canvas', note: '380gsm archival cotton' },
                      { id: 'acrylic', label: 'Ultra-HD Acrylic', note: 'Diamond polished glass' },
                      { id: 'rag', label: 'Fine Art Rag', note: 'Cold-press German paper' },
                      { id: 'led', label: 'Smart Backlit LED', note: 'App-controlled rim glow' },
                    ].map(med => (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => setSelectedMedium(med.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedMedium === med.id
                            ? 'border-brand-600 bg-brand-50/50 text-slate-900 font-bold ring-1 ring-brand-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="block font-semibold">{med.label}</span>
                        <span className="text-[10px] text-slate-400 block">{med.note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Style Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    2. Museum Frame Finish:
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'oak', label: 'Natural Oak', color: '#854d0e' },
                      { id: 'gold', label: 'Brushed Gold', color: '#d4af37' },
                      { id: 'black', label: 'Matte Black', color: '#000000' },
                      { id: 'canvas', label: 'Gallery Wrap', color: '#e2e8f0' }
                    ].map(fr => (
                      <button
                        key={fr.id}
                        type="button"
                        onClick={() => setSelectedFrame(fr.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedFrame === fr.id
                            ? 'border-brand-600 bg-brand-50/50 font-bold text-slate-900 ring-1 ring-brand-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full mx-auto block mb-1 border border-slate-300"
                          style={{ backgroundColor: fr.color }}
                        />
                        <span className="text-[11px] block">{fr.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    3. Dimensions:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'small', label: 'Small', dim: '40 x 50 cm' },
                      { id: 'medium', label: 'Medium', dim: '60 x 80 cm' },
                      { id: 'large', label: 'Grand Statement', dim: '80 x 120 cm' },
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setSelectedSize(sz.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSize === sz.id
                            ? 'border-brand-600 bg-brand-50/50 font-bold text-slate-900 ring-1 ring-brand-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="font-semibold block">{sz.label}</span>
                        <span className="text-[10px] text-slate-400 block">{sz.dim}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Add to Cart Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Print Price
                  </span>
                  <span className="text-2xl font-serif font-bold text-slate-900">
                    {formatPrice(calculatedPrintPriceNGN, currency)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAddToCart}
                  disabled={showAddedToast}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-brand-600 hover:from-amber-600 hover:to-brand-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  {showAddedToast ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Added to Studio Cart!</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 text-amber-200" />
                      <span>Add to Cart &amp; Print</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PINTEREST URL / IMAGE IMPORT MODAL */}
      {/* ========================================================= */}
      {isImportModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setIsImportModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Import Pinterest Artwork via MCP
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Paste any Pinterest Pin URL, board link, or image URL to dynamically import for custom printing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pinterest Pin or Board Link:
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    placeholder="https://pinterest.com/pin/..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Artwork Title (Optional):
                </label>
                <input
                  type="text"
                  value={importTitle}
                  onChange={e => setImportTitle(e.target.value)}
                  placeholder="e.g. Terracotta Sun &amp; Palm Leaf"
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or Direct Image URL (PNG/SVG/JPG):
                </label>
                <input
                  type="url"
                  value={importImageUrl}
                  onChange={e => setImportImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /art/..."
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Curator / Interior Notes:
                </label>
                <textarea
                  rows={2}
                  value={importNotes}
                  onChange={e => setImportNotes(e.target.value)}
                  placeholder="e.g. Master bedroom accent wall art with natural oak frame"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isImporting || (!importUrl && !importImageUrl)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isImporting ? (
                    <span>Importing...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Import &amp; Print via MCP</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
