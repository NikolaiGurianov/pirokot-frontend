import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductView } from './product-view';
import { apiUrl, demoProduct, type Product } from '@/lib/catalog';

async function loadProduct(id: string) {
	const productId = Number(id);
	if (!Number.isSafeInteger(productId) || productId < 1) return null;
  let product = demoProduct;
  try {
    const response = await fetch(`${apiUrl}/api/catalog/products/${productId}`, { cache: 'no-store' });
    if (response.status === 404) return null;
    if (response.ok) product = await response.json() as Product;
  } catch { /* Локальный backend может быть выключен во время сборки. */ }
  return product;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) return { title: 'Товар не найден — Пирокот' };
  const description = product.description || `${product.name}: характеристики, цена и наличие.`;
  const primaryImage = product.media.find(media => media.kind === 'IMAGE');
  const images = primaryImage ? [`${apiUrl}${primaryImage.url}`] : [];
  return {
    title: `${product.name} — Пирокот`, description,
    openGraph: { title: product.name, description, images },
    twitter: { card: 'summary_large_image', title: product.name, description, images },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) notFound();
  const images = product.media.filter(media => media.kind === 'IMAGE').map(media => `${apiUrl}${media.url}`);
  const videos = product.media.filter(media => media.kind === 'VIDEO').map(media => ({
    '@type': 'VideoObject',
    name: `Видео товара «${product.name}»`,
    description: product.description || `Видео товара ${product.name}`,
    contentUrl: media.url,
  }));
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    image: images,
    offers: {
      '@type': 'Offer',
      price: (product.priceMinor / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    subjectOf: videos,
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }} />
    <ProductView productId={Number(id)} />
  </>;
}
