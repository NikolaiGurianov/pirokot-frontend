'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, PackageOpen, Sparkles } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { apiUrl, demoProducts, type Category, type Media, type ProductPage, withDevelopmentPreviews } from '@/lib/catalog';

const money = (minor: number, currency: string) => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(minor / 100);

const imageUrl = (media: Media) => media.url.startsWith('/api/') ? `${apiUrl}${media.url}` : media.url;

function ProductPreview({ productId, media, name }: { productId: number; media?: Media[]; name: string }) {
  const images = media?.filter(item => item.kind === 'IMAGE') ?? [];
  if (!images.length) return <div className="product-card-art"><Sparkles aria-hidden="true" /><span>Пиротехника</span></div>;
  return <Carousel className="product-card-gallery" opts={{ loop: images.length > 1 }} aria-label={`Фотографии товара ${name}`}>
    <CarouselContent>{images.map(image => <CarouselItem key={image.id}><Link href={`/products/${productId}`} className="product-card-art" aria-label={`Открыть товар ${name}`}>
      {/* Backend already supplies cache headers for its image endpoint. */}
      {/* oxlint-disable-next-line next/no-img-element */}
      <img src={imageUrl(image)} alt={image.altText || name} loading="lazy" />
    </Link></CarouselItem>)}</CarouselContent>
    {images.length > 1 && <><CarouselPrevious aria-label="Предыдущее фото" /><CarouselNext aria-label="Следующее фото" /></>}
  </Carousel>;
}

export function CatalogView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalog, setCatalog] = useState<ProductPage>(demoProducts);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/catalog/categories?size=100&sort=name`)
      .then(response => response.ok ? response.json() as Promise<{ content: Category[] }> : Promise.reject())
      .then(data => setCategories(data.content))
      .catch(() => setOffline(true));
  }, []);

  useEffect(() => {
    const parameters = new URLSearchParams({ page: String(page), size: '12', sort: 'name' });
    if (categoryId !== null) parameters.set('categoryId', String(categoryId));
    if (inStock) parameters.set('inStock', 'true');
    fetch(`${apiUrl}/api/catalog/products?${parameters}`)
      .then(response => response.ok ? response.json() as Promise<ProductPage> : Promise.reject())
      .then(data => { setCatalog(withDevelopmentPreviews(data)); setOffline(false); })
      .catch(() => { setCatalog(demoProducts); setOffline(true); })
      .finally(() => setLoading(false));
  }, [categoryId, inStock, page]);

  const selectedCategory = useMemo(
    () => categories.find(category => category.id === categoryId), [categories, categoryId],
  );

  function selectCategory(id: number | null) { setLoading(true); setCategoryId(id); setPage(0); }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="catalog-shell">
        <section className="catalog-intro">
          <div><p className="section-kicker">Каталог</p><h1>{selectedCategory?.name ?? 'Выберите свой огонь'}</h1></div>
          <p>Пиротехника для вечеров, которые хочется помнить. Актуальная цена и остаток приходят прямо со склада.</p>
        </section>

        <div className="catalog-toolbar">
          <div className="category-pills" aria-label="Категории">
            <Button variant={categoryId === null ? 'default' : 'outline'} onClick={() => selectCategory(null)}>Все</Button>
            {categories.map(category => <Button key={category.id} variant={categoryId === category.id ? 'default' : 'outline'} onClick={() => selectCategory(category.id)}>{category.name}</Button>)}
          </div>
          <label className="stock-filter" htmlFor="in-stock"><Checkbox id="in-stock" checked={inStock} onCheckedChange={value => { setLoading(true); setInStock(value === true); setPage(0); }} />Только в наличии</label>
        </div>

        {offline && <output className="notice">Backend выключен — показаны демонстрационные товары</output>}
        {catalog.content.length ? (
          <section className="product-grid" aria-busy={loading} aria-label="Товары">
            {catalog.content.map(product => (
              <article className="product-card" key={product.id}>
                <ProductPreview productId={product.id} media={product.media} name={product.name} />
                <Link className="product-card-copy" href={`/products/${product.id}`}>
                  <div className="product-card-meta"><span>{product.brand || 'Пирокот'}</span>{product.stockQuantity > 0 && <Badge variant="outline">В наличии</Badge>}</div>
                  <h2>{product.name}</h2>
                  <div className="product-card-price"><strong>{money(product.priceMinor, product.currency)}</strong>{product.oldPriceMinor && <del>{money(product.oldPriceMinor, product.currency)}</del>}</div>
                </Link>
              </article>
            ))}
          </section>
        ) : <div className="catalog-empty"><PackageOpen /><h2>В этой категории пока пусто</h2><p>Попробуйте снять фильтр наличия или выбрать другой раздел.</p></div>}

        {catalog.totalPages > 1 && <nav className="catalog-pagination" aria-label="Страницы каталога">
          <Button variant="outline" disabled={page === 0 || loading} onClick={() => { setLoading(true); setPage(value => value - 1); }}><ArrowLeft />Назад</Button>
          <span>{catalog.page + 1} из {catalog.totalPages}</span>
          <Button variant="outline" disabled={page + 1 >= catalog.totalPages || loading} onClick={() => { setLoading(true); setPage(value => value + 1); }}>Вперёд<ArrowRight /></Button>
        </nav>}
      </div>
    </main>
  );
}
