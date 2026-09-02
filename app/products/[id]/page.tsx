import type { Metadata } from 'next';
import { ProductView } from './product-view';
import { apiUrl, demoProduct, type Product } from '@/lib/catalog';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let product = demoProduct;
  try {
    const response = await fetch(`${apiUrl}/api/catalog/products/${Number(id)}`, { cache: 'no-store' });
    if (response.ok) product = await response.json() as Product;
  } catch { /* Локальный backend может быть выключен во время сборки. */ }
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
  return <ProductView productId={Number(id)} />;
}
