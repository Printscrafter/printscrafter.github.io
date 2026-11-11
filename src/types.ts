export type Currency = 'NGN' | 'USD';

export type Category = 
  | 'All' 
  | 'Abstract Portraits'
  | 'Contemporary Paintings' 
  | 'Minimalist Line Art' 
  | 'Shape & Abstract' 
  | 'Functional Wall Decor' 
  | 'LED & Smart Art';

export interface Product {
  id: number;
  title: string;
  category: Category;
  basePriceNGN: number;
  image: string;
  description: string;
  isLed: boolean;
  dimensionsDefault?: string;
  artistNote?: string;
}

export type FrameStyle = 'black' | 'oak' | 'gold' | 'canvas';
export type Orientation = 'portrait' | 'landscape';
export type SizeOption = 'small' | 'medium' | 'large';
export type RoomType = 'living' | 'dining';

export interface CartItem {
  cartId: string;
  productId?: number;
  pinId?: string;
  title: string;
  category?: string;
  size: string;
  orientation: Orientation;
  frame: string;
  wallColorHex?: string;
  priceNGN: number;
  image: string;
  quantity: number;
  isCustomUpload?: boolean;
  medium?: string;
}

export interface PinterestPin {
  id: string;
  title: string;
  board: string;
  boardSlug: string;
  pinnerUsername: string;
  pinnerAvatar?: string;
  savesCount: number;
  imageUrl: string;
  aspectRatio: '4:5' | '3:4' | '1:1' | '16:9';
  orientation: Orientation;
  palette: string[];
  description: string;
  basePriceNGN: number;
  isLedCompatible?: boolean;
  tags: string[];
  sourceUrl?: string;
  artistNote?: string;
  dimensionsDefault?: string;
}

export interface PinterestBoard {
  id: string;
  name: string;
  slug: string;
  description: string;
  pinCount: number;
  coverImage: string;
  themeAesthetic: string;
}

export interface PinterestMCPResponse {
  pins: PinterestPin[];
  total: number;
  boards: PinterestBoard[];
  serverStatus: 'connected' | 'simulated';
  query?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: CartItem[];
  totalAmountNGN: number;
  currency: Currency;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paystackReference: string;
  customNotes?: string;
  previewImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  defaultAddress?: string;
  membershipTier?: 'Collector' | 'Connoisseur' | 'Interior Designer';
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface SavedCustomArtwork {
  id: string;
  title: string;
  imageUrl: string;
  orientation: Orientation;
  createdAt: string;
}
