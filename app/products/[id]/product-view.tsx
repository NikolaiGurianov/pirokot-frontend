'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Expand, Minus, Play, Plus, ShoppingBag, Sparkles, Video } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { apiUrl, demoProduct, type Media, type Product, withDevelopmentMedia } from '@/lib/catalog';

const money = (minor: number, currency: string) => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(minor / 100);

function safeVideo(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (['rutube.ru', 'www.rutube.ru'].includes(url.hostname)) {
      const match = url.pathname.match(/^\/(?:video|play\/embed)\/([a-zA-Z0-9]+)\/?$/);
      return match ? `https://rutube.ru/play/embed/${match[1]}` : null;
    }
    return null;
  } catch { return null; }
}

function safeExternalVideo(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

function mediaUrl(value: string) {
  return value.startsWith('/') && !value.startsWith('/api/') ? value : `${apiUrl}${value}`;
}

function MediaFrame({ media, name }: { media?: Media; name: string }) {
  if (!media) return <div className="media-placeholder"><Sparkles /><span>Фотография скоро появится</span></div>;
  // Backend media endpoint уже задаёт ETag/Cache-Control; URL может указывать на локальный origin.
  // oxlint-disable-next-line next/no-img-element
  if (media.kind === 'IMAGE') return <img src={mediaUrl(media.url)} alt={media.altText || name} loading="lazy" />;
  const source = safeVideo(media.url);
  const externalUrl = safeExternalVideo(media.url);
  return source ? <div className="video-frame">
    <iframe src={source} title={`Видео: ${name}`} allow="clipboard-write; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
    {externalUrl && <a href={externalUrl} target="_blank" rel="noreferrer">Открыть видео на сайте источника</a>}
  </div> : <div className="media-placeholder"><Video /><span>Видео временно недоступно</span>{externalUrl && <a href={externalUrl} target="_blank" rel="noreferrer">Открыть на сайте источника</a>}</div>;
}

function MediaPreview({ media, name }: { media: Media; name: string }) {
  if (media.kind === 'VIDEO') return <span className="video-preview"><Play aria-hidden="true" />Видео</span>;
  // oxlint-disable-next-line next/no-img-element
  return <img src={mediaUrl(media.url)} alt={media.altText || `Превью: ${name}`} loading="lazy" />;
}

export function ProductView({ productId }: { productId: number }) {
  const validProductId = Number.isSafeInteger(productId) && productId > 0;
  const [product, setProduct] = useState<Product>(demoProduct);
  const [loading, setLoading] = useState(validProductId);
  const [notice, setNotice] = useState(validProductId ? '' : 'Некорректный идентификатор товара');
  const [missing, setMissing] = useState(!validProductId);
  const [quantity, setQuantity] = useState(1);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [expandedImageId, setExpandedImageId] = useState<number | null>(null);
  const expandedGalleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!validProductId) return;
    fetch(`${apiUrl}/api/catalog/products/${productId}`, { headers: { Accept: 'application/json' } })
      .then(response => {
        if (response.status === 404) { setMissing(true); return null; }
        return response.ok ? response.json() as Promise<Product> : Promise.reject(new Error('Backend недоступен'));
      })
      .then(value => {
        if (!value) return;
        const productWithMedia = withDevelopmentMedia(value);
        setProduct(productWithMedia);
        if (productWithMedia !== value) setNotice('Для проверки галереи добавлены демонстрационные изображения');
      })
      .catch(() => setNotice('Backend недоступен — показана демонстрационная карточка'))
      .finally(() => setLoading(false));
  }, [productId, validProductId]);

  const gallery = useMemo(() => product.media.length ? product.media : [undefined], [product.media]);
  const images = useMemo(() => product.media.filter(media => media.kind === 'IMAGE'), [product.media]);
  const expandedImage = images.find(image => image.id === expandedImageId) ?? null;
  const maxQuantity = Math.max(product.stockQuantity, 1);
  const changeQuantity = (next: number) => setQuantity(Math.min(maxQuantity, Math.max(1, next)));

  useEffect(() => {
    if (!carouselApi) return;
    const updateSelection = () => setSelectedMedia(carouselApi.selectedScrollSnap());
    updateSelection();
    carouselApi.on('select', updateSelection);
    return () => { carouselApi.off('select', updateSelection); };
  }, [carouselApi]);

  function selectMedia(index: number) {
    setSelectedMedia(index);
    carouselApi?.scrollTo(index);
  }

  const navigateExpandedImage = useCallback((direction: -1 | 1) => {
    if (!expandedImage || images.length < 2) return;
    const currentIndex = images.findIndex(image => image.id === expandedImage.id);
    const nextIndex = (currentIndex + direction + images.length) % images.length;
    setExpandedImageId(images[nextIndex].id);
  }, [expandedImage, images]);

  useEffect(() => {
    if (expandedImageId === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); navigateExpandedImage(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); navigateExpandedImage(1); }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [expandedImageId, navigateExpandedImage]);

  async function addToCart() {
    const token = window.localStorage.getItem('pirokot-cart-token');
    const response = await fetch(`${apiUrl}/api/cart/items`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'X-Cart-Token': token } : {}),
      },
      body: JSON.stringify({ productId: product.id, quantity }),
    });
    if (!response.ok) { setNotice('Не удалось добавить товар в корзину. Попробуйте ещё раз.'); return; }
    const nextToken = response.headers.get('X-Cart-Token');
    if (nextToken) window.localStorage.setItem('pirokot-cart-token', nextToken);
    const item = await response.json() as { quantity: number };
    setNotice(`В корзине ${item.quantity} шт.`);
  }

  if (missing) return <main className="min-h-screen"><SiteHeader /><section className="product-missing"><p className="section-kicker">Ошибка 404</p><h1>Товар не найден</h1><p>Возможно, он снят с публикации или адрес указан неверно.</p><Button render={<Link href="/products" />}>Вернуться в каталог</Button></section></main>;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="page-shell">
        <nav className="breadcrumbs" aria-label="Хлебные крошки">
          {product.breadcrumbs.map((item, index) => <span key={`${item.label}-${index}`}>{item.url ? <a href={item.url}>{item.label}</a> : item.label}</span>)}
        </nav>
        {notice && <output className="notice">{notice}</output>}
        <section className="product-layout" aria-busy={loading}>
          <div className="gallery-stack">
          <Carousel className="gallery" opts={{ loop: gallery.length > 1 }} setApi={setCarouselApi} aria-label={`Медиа товара ${product.name}`}>
            <CarouselContent>{gallery.map((media, index) => <CarouselItem key={media?.id ?? index}><div className="media-frame">{media?.kind === 'IMAGE' ? <button className="expand-image" type="button" onClick={() => setExpandedImageId(media.id)} aria-label={`Увеличить изображение ${index + 1}`}><MediaFrame media={media} name={product.name} /><span><Expand aria-hidden="true" />Увеличить</span></button> : <MediaFrame media={media} name={product.name} />}</div></CarouselItem>)}</CarouselContent>
            {gallery.length > 1 && <><CarouselPrevious aria-label="Предыдущее медиа" /><CarouselNext aria-label="Следующее медиа" /></>}
          </Carousel>
          {product.media.length > 1 && <div className="media-previews" aria-label="Выбор изображения или видео">
            {product.media.map((media, index) => <button type="button" key={media.id} className={selectedMedia === index ? 'is-selected' : ''} onClick={() => selectMedia(index)} aria-label={media.kind === 'VIDEO' ? `Открыть видео ${index + 1}` : `Открыть изображение ${index + 1}`} aria-current={selectedMedia === index ? 'true' : undefined}><MediaPreview media={media} name={product.name} /></button>)}
          </div>}
          </div>
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
      <Dialog open={expandedImage !== null} onOpenChange={open => { if (!open) setExpandedImageId(null); }}>
        <DialogContent className="image-dialog" initialFocus={expandedGalleryRef}>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Увеличенное изображение товара</DialogDescription>
          {expandedImage && <div className="expanded-gallery" ref={expandedGalleryRef} tabIndex={-1}>
            <MediaFrame media={expandedImage} name={product.name} />
            {images.length > 1 && <>
              <Button className="expanded-previous" variant="outline" size="icon" onClick={() => navigateExpandedImage(-1)} aria-label="Предыдущее изображение"><ChevronLeft /></Button>
              <Button className="expanded-next" variant="outline" size="icon" onClick={() => navigateExpandedImage(1)} aria-label="Следующее изображение"><ChevronRight /></Button>
              <span className="expanded-counter" aria-live="polite">{images.findIndex(image => image.id === expandedImage.id) + 1} / {images.length}</span>
            </>}
          </div>}
        </DialogContent>
      </Dialog>
    </main>
  );
}
