export type Karat = '18K' | '21K' | '22K' | '24K';

export type Category =
  | 'ring'
  | 'necklace'
  | 'bracelet'
  | 'earring'
  | 'pendant'
  | 'bangle'
  | 'set'
  | 'other';

export interface GoldPrice {
  _id: string;
  price18K: number;
  price21K: number;
  price22K: number;
  price24K: number;
  usdRate: number;
  goldUsdPerGram: number;
  market: string;
  isActive: boolean;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemImage {
  _id?: string;
  url: string;
  alt: string;
}

export interface Item {
  _id: string;
  name: string;
  nameAr?: string;
  description?: string;
  weight: number;
  weightInGrams?: number;
  karat: Karat;
  category: Category;
  images: ItemImage[];
  profitMargin: number;
  isAvailable: boolean;
  isFeatured: boolean;
  sku?: string;
  calculatedPrice: number;
  livePrice?: number;
  priceLastUpdated: string;
  createdAt: string;
  updatedAt: string;
  goldPrice?: Partial<Record<string, number | string>>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface DashboardStats {
  stats: {
    totalItems: number;
    availableItems: number;
    featuredItems: number;
    unavailableItems: number;
  };
  goldPrice: GoldPrice | null;
  itemsByKarat: Array<{ _id: string; count: number }>;
  itemsByCategory: Array<{ _id: string; count: number }>;
}
