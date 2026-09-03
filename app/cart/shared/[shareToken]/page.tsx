'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageOpen, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { apiUrl } from '@/lib/catalog';

type Item = { productId: number; productName: string; brand: string | null; imageUrl: string | null; quantity: number; currentPriceMinor: number; currency: string; available: boolean };
type Cart = { items: Item[]; totalMinor: number; currency: string };
const money = (value: number, currency: string) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value / 100);

export default function SharedCartPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState('');
  const [shareToken, setShareToken] = useState('');
  useEffect(() => { void params.then(({ shareToken: token }) => { setShareToken(token); return fetch(`${apiUrl}/api/cart/shared/${token}`); }).then(async response => { if (!response.ok) throw new Error(); setCart(await response.json() as Cart); }).catch(() => setError('Эта ссылка недействительна или больше не доступна.')); }, [params]);
  async function copy() {
    const token = window.localStorage.getItem('pirokot-cart-token');
    const response = await fetch(`${apiUrl}/api/cart/shared/${shareToken}/copy`, { method: 'POST', headers: token ? { 'X-Cart-Token': token } : {} });
    if (!response.ok) { setError('Не удалось скопировать товары.'); return; }
    const cartToken = response.headers.get('X-Cart-Token');
    if (cartToken) window.localStorage.setItem('pirokot-cart-token', cartToken);
    window.location.assign('/cart');
  }
  return <main className="min-h-screen"><SiteHeader /><section className="cart-shell"><p className="section-kicker">Поделились с вами</p><h1>Состав корзины</h1>{error && <p className="notice">{error}</p>}{cart && <div className="cart-layout"><section className="cart-items"><div className="cart-items-heading"><h2>Товары</h2><span>{cart.items.reduce((count, item) => count + item.quantity, 0)} шт.</span></div>{cart.items.map(item => <article className="cart-item" key={item.productId}><Link href={`/products/${item.productId}`} className="cart-item-art">{item.imageUrl ? <>{/* oxlint-disable-next-line next/no-img-element */}<img src={item.imageUrl.startsWith('/api/') ? `${apiUrl}${item.imageUrl}` : item.imageUrl} alt={item.productName} /></> : <PackageOpen aria-hidden="true" />}</Link><div className="cart-item-copy">{item.brand && <p className="cart-item-brand">{item.brand}</p>}<Link href={`/products/${item.productId}`}><h3>{item.productName}</h3></Link><p className="cart-item-stock" data-available={item.available}>{item.available ? `${item.quantity} шт. можно добавить в корзину` : 'Сейчас недоступен'}</p></div><div className="cart-item-price"><strong>{money(item.currentPriceMinor, item.currency)}</strong><small>за 1 шт.</small></div></article>)}</section><aside className="cart-summary"><h2>Хотите такой же набор?</h2><div className="cart-summary-total"><span>Итого</span><strong>{money(cart.totalMinor, cart.currency)}</strong></div><Button size="lg" onClick={() => void copy()}><ShoppingCart />Скопировать в корзину</Button><p>Ссылка показывает только товары и не даёт доступа к корзине отправителя.</p></aside></div>}</section></main>;
}
