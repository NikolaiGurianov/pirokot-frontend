'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Sparkles, Video } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { apiUrl, demoProduct, type Media, type Product } from '@/lib/catalog';

const money = (minor: number, currency: string) => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(minor / 100);

function safeVideo(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (url.hostname === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (['youtube.com', 'www.youtube.com'].includes(url.hostname) && url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return ['player.vimeo.com', 'rutube.ru'].includes(url.hostname) ? url.href : null;
  } catch { return null; }
}

function MediaFrame({ media, name }: { media?: Media; name: string }) {
  if (!media) return <div className="media-placeholder"><Sparkles /><span>Фотография скоро появится</span></div>;
  // Backend media endpoint уже задаёт ETag/Cache-Control; URL может указывать на локальный origin.
  // oxlint-disable-next-line next/no-img-element
  if (media.kind === 'IMAGE') return <img src={`${apiUrl}${media.url}`} alt={media.altText || name} loading="lazy" />;
  const source = safeVideo(media.url);
  return source ? <iframe src={source} title={`Видео: ${name}`} allow="encrypted-media; picture-in-picture" allowFullScreen />
    : <div className="media-placeholder"><Video /><span>Видео временно недоступно</span></div>;
}

export function ProductView({ productId }: { productId: number }) {
  const validProductId = Number.isSafeInteger(productId) && productId > 0;
  const [product, setProduct] = useState<Product>(demoProduct);
  const [loading, setLoading] = useState(validProductId);
  const [notice, setNotice] = useState(validProductId ? '' : 'Некорректный идентификатор товара');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!validProductId) return;
    fetch(`${apiUrl}/api/catalog/products/${productId}`, { headers: { Accept: 'application/json' } })
      .then(response => response.ok ? response.json() as Promise<Product> : Promise.reject(new Error('Товар не найден')))
      .then(setProduct)
      .catch(() => setNotice('Backend недоступен — показана демонстрационная карточка'))
      .finally(() => setLoading(false));
  }, [productId, validProductId]);

  const gallery = useMemo(() => product.media.length ? product.media : [undefined], [product.media]);
  const maxQuantity = Math.max(product.stockQuantity, 1);
  const changeQuantity = (next: number) => setQuantity(Math.min(maxQuantity, Math.max(1, next)));

  async function addToCart() {
    const response = await fetch(`${apiUrl}/api/catalog/products/${product.id}/availability-check?quantity=${quantity}`);
    if (!response.ok) { setNotice('Не удалось проверить остаток. Попробуйте ещё раз.'); return; }
    const availability = await response.json() as { available: boolean };
    setNotice(availability.available ? `${quantity} шт. добавлено в корзину` : 'Такого количества сейчас нет в наличии');
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="page-shell">
        <nav className="breadcrumbs" aria-label="Хлебные крошки">
          {product.breadcrumbs.map((item, index) => <span key={`${item.label}-${index}`}>{item.url ? <a href={item.url}>{item.label}</a> : item.label}</span>)}
        </nav>
        {notice && <output className="notice">{notice}</output>}
        <section className="product-layout" aria-busy={loading}>
          <Carousel className="gallery" opts={{ loop: gallery.length > 1 }}>
            <CarouselContent>{gallery.map((media, index) => <CarouselItem key={media?.id ?? index}><div className="media-frame"><MediaFrame media={media} name={product.name} /></div></CarouselItem>)}</CarouselContent>
            {gallery.length > 1 && <><CarouselPrevious aria-label="Предыдущее медиа" /><CarouselNext aria-label="Следующее медиа" /></>}
          </Carousel>
          <div className="product-summary">
            <div className="badge-row">{product.badges.map(label => <Badge key={label} variant="outline">{label}</Badge>)}</div>
            <p className="eyebrow">{product.brand || 'Пирокот'} · {product.sku}</p>
            <h1>{product.name}</h1>
            <p className="lead">{product.description || 'Описание товара скоро появится.'}</p>
            <div className="price-line"><strong>{money(product.priceMinor, product.currency)}</strong>{product.oldPriceMinor && <del>{money(product.oldPriceMinor, product.currency)}</del>}</div>
            <p className={product.available ? 'stock in-stock' : 'stock out-stock'}>{product.available ? `В наличии · ${product.stockQuantity} шт.` : 'Нет в наличии'}</p>
            <div className="buy-panel">
              <div className="quantity" aria-label="Количество товара">
                <Button variant="ghost" size="icon" onClick={() => changeQuantity(quantity - 1)} aria-label="Уменьшить"><Minus /></Button>
                <Input value={quantity} onChange={event => changeQuantity(Number(event.target.value))} type="number" min={1} max={maxQuantity} aria-label="Количество" />
                <Button variant="ghost" size="icon" onClick={() => changeQuantity(quantity + 1)} aria-label="Увеличить"><Plus /></Button>
              </div>
              <Button size="lg" className="add-button" disabled={!product.available} onClick={addToCart}><ShoppingBag />Добавить в корзину</Button>
            </div>
          </div>
        </section>
        <section className="details-grid"><div><p className="section-kicker">В деталях</p><h2>Характеристики</h2></div><dl>{product.attributes.map(item => <div key={item.key}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>
        {!!product.relatedProducts.length && <section className="related"><p className="section-kicker">Ещё немного огня</p><h2>Похожие товары</h2><div className="related-grid">{product.relatedProducts.map(item => <Link href={`/products/${item.id}`} key={item.id}><small>{item.brand || 'Пирокот'}</small><h3>{item.name}</h3><strong>{money(item.priceMinor, item.currency)}</strong></Link>)}</div></section>}
      </div>
    </main>
  );
}
