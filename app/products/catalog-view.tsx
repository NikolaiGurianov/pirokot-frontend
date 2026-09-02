'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, PackageOpen, Sparkles } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { apiUrl, demoProducts, type Category, type ProductPage } from '@/lib/catalog';

const money = (minor: number, currency: string) => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(minor / 100);

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
      .then(data => { setCatalog(data as ProductPage); setOffline(false); })
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
              <Link className="product-card" href={`/products/${product.id}`} key={product.id}>
                <div className="product-card-art"><Sparkles aria-hidden="true" /><span>{product.category?.name ?? 'Пиротехника'}</span></div>
                <div className="product-card-copy">
                  <div className="product-card-meta"><span>{product.brand || 'Пирокот'}</span>{product.stockQuantity > 0 && <Badge variant="outline">В наличии</Badge>}</div>
                  <h2>{product.name}</h2>
                  <div className="product-card-price"><strong>{money(product.priceMinor, product.currency)}</strong>{product.oldPriceMinor && <del>{money(product.oldPriceMinor, product.currency)}</del>}</div>
                </div>
              </Link>
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
