export type Media = { id: number; kind: 'IMAGE' | 'VIDEO'; url: string; altText?: string | null };
export type Attribute = { key: string; label: string; value: string };
export type Breadcrumb = { label: string; url?: string | null };
export type Category = { id: number; slug: string; name: string; description?: string | null };
export type ProductSummary = {
  id: number; name: string; brand?: string | null; priceMinor: number; oldPriceMinor?: number | null;
  currency: string; stockQuantity: number; category?: Category; media?: Media[];
};
export type ProductPage = { content: ProductSummary[]; page: number; size: number; totalElements: number; totalPages: number };
export type Product = ProductSummary & {
  slug: string;
  sku: string;
  description?: string | null;
  oldPriceMinor?: number | null;
  stockQuantity: number;
  available: boolean;
  badges: string[];
  attributes: Attribute[];
  media: Media[];
  breadcrumbs: Breadcrumb[];
  relatedProducts: ProductSummary[];
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const demoMedia: Media[] = [
  { id: -1, kind: 'IMAGE', url: '/demo/severnoe-siyanie-box.png', altText: 'Демонстрационная упаковка салюта «Северное сияние»' },
  { id: -2, kind: 'IMAGE', url: '/demo/severnoe-siyanie-gold.png', altText: 'Демонстрационный золотой эффект салюта' },
  { id: -3, kind: 'IMAGE', url: '/demo/severnoe-siyanie-color.png', altText: 'Демонстрационный цветной эффект салюта' },
];

export function withDevelopmentMedia(product: Product): Product {
  if (process.env.NODE_ENV === 'production' || product.media.some(item => item.kind === 'IMAGE')) return product;
  return { ...product, media: [...demoMedia, ...product.media] };
}

export function withDevelopmentPreviews(page: ProductPage): ProductPage {
  if (process.env.NODE_ENV === 'production') return page;
  return {
    ...page,
    content: page.content.map((product, index) => ({
      ...product,
      media: product.media?.filter(item => item.kind === 'IMAGE').length
        ? product.media.filter(item => item.kind === 'IMAGE')
        : [...demoMedia.slice(index), ...demoMedia.slice(0, index)],
    })),
  };
}

export const demoProduct: Product = {
  id: 1,
  slug: 'severnoe-siyanie',
  sku: 'DEMO-FW-001',
  name: 'Северное сияние',
  brand: 'Пирокот',
  description: 'Тридцать шесть ярких залпов с золотыми хвостами, цветными пионами и мерцающим финалом.',
  priceMinor: 549900,
  oldPriceMinor: 629900,
  currency: 'RUB',
  stockQuantity: 12,
  available: true,
  badges: ['HIT', 'SALE'],
  breadcrumbs: [{ label: 'Каталог', url: '/' }, { label: 'Салюты', url: '/' }, { label: 'Северное сияние' }],
  attributes: [
    { key: 'shots', label: 'Количество залпов', value: '36' },
    { key: 'caliber', label: 'Калибр', value: '1 дюйм' },
    { key: 'duration', label: 'Продолжительность', value: '45 секунд' },
  ],
  media: demoMedia,
  relatedProducts: [
    { id: 2, name: 'Звёздный дождь', brand: 'Пирокот', priceMinor: 329900, currency: 'RUB', stockQuantity: 8 },
    { id: 3, name: 'Огненная комета', brand: 'Небо', priceMinor: 249900, currency: 'RUB', stockQuantity: 15 },
  ],
};

export const demoProducts: ProductPage = {
  content: [demoProduct, ...demoProduct.relatedProducts.map(product => ({
    ...product, category: { id: 1, slug: 'fireworks', name: 'Салюты' },
  }))].map((product, index) => ({
    ...product,
    media: [...demoMedia.slice(index), ...demoMedia.slice(0, index)],
  })),
  page: 0, size: 12, totalElements: 3, totalPages: 1,
};
