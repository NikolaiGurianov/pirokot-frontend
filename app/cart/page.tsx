'use client';

import { type SyntheticEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, PackageOpen, Plus, ShieldCheck, Trash2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SiteHeader } from '@/components/site-header';
import { toast } from '@/components/ui/toast';
import { apiUrl, demoMedia } from '@/lib/catalog';

type Item = { productId: number; productName: string; brand: string | null; imageUrl: string | null; quantity: number; unitPriceMinor: number; currentPriceMinor: number; currency: string; stockQuantity: number; available: boolean };
type Cart = { items: Item[]; subtotalMinor: number; discountMinor: number; totalMinor: number; currency: string; promoCode: string | null; promoDiscountPercent: number | null };
type CheckoutOrder = { publicId: string };
type FulfillmentMethod = 'DELIVERY' | 'PICKUP';
const money = (value: number, currency: string) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value / 100);
const cartImageUrl = (item: Item) => item.imageUrl ? (item.imageUrl.startsWith('/api/') ? `${apiUrl}${item.imageUrl}` : item.imageUrl) : process.env.NODE_ENV === 'production' ? '' : (demoMedia[(item.productId - 1) % demoMedia.length]?.url ?? '');

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], subtotalMinor: 0, discountMinor: 0, totalMinor: 0, currency: 'RUB', promoCode: null, promoDiscountPercent: null });
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('DELIVERY');

  async function load() {
    const token = window.localStorage.getItem('pirokot-cart-token');
    const response = await fetch(`${apiUrl}/api/cart`, { headers: token ? { 'X-Cart-Token': token } : {} });
    if (response.ok) setCart(await response.json() as Cart);
  }
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }); return () => window.clearTimeout(timer); }, []);
  async function change(productId: number, quantity: number) {
    const token = window.localStorage.getItem('pirokot-cart-token');
    if (!token || quantity < 1) return;
    setUpdatingId(productId);
    const response = await fetch(`${apiUrl}/api/cart/items/${productId}?quantity=${quantity}`, { method: 'PATCH', headers: { 'X-Cart-Token': token } });
    if (!response.ok) toast.add({ title: 'Не удалось изменить количество', description: 'Попробуйте ещё раз.', type: 'error', timeout: 5000 }); else await load();
    setUpdatingId(null);
  }
  async function remove(productId: number) {
    const token = window.localStorage.getItem('pirokot-cart-token');
    if (!token) return;
    setUpdatingId(productId);
    const response = await fetch(`${apiUrl}/api/cart/items/${productId}`, { method: 'DELETE', headers: { 'X-Cart-Token': token } });
    if (!response.ok) toast.add({ title: 'Не удалось удалить товар', description: 'Попробуйте ещё раз.', type: 'error', timeout: 5000 }); else await load();
    setUpdatingId(null);
  }
  async function share() {
    const token = window.localStorage.getItem('pirokot-cart-token');
    if (!token) return;
    const response = await fetch(`${apiUrl}/api/cart/share`, { method: 'POST', headers: { 'X-Cart-Token': token } });
    if (!response.ok) { toast.add({ title: 'Не удалось создать ссылку', type: 'error', timeout: 5000 }); return; }
    const { shareToken } = await response.json() as { shareToken: string };
    const link = `${window.location.origin}/cart/shared/${shareToken}`;
    if (navigator.clipboard) await navigator.clipboard.writeText(link);
    toast.add({ title: 'Ссылка скопирована', description: 'Её можно отправить другому человеку.', type: 'success', timeout: 4000 });
  }
  async function applyPromo(event: { preventDefault(): void }) {
    event.preventDefault();
    const token = window.localStorage.getItem('pirokot-cart-token');
    if (!token || !promoCode.trim()) return;
    const response = await fetch(`${apiUrl}/api/cart/promo-code`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Cart-Token': token }, body: JSON.stringify({ code: promoCode }) });
    if (!response.ok) { toast.add({ title: 'Промокод не применён', description: 'Проверьте код или срок его действия.', type: 'error', timeout: 5000 }); return; }
    setCart(await response.json() as Cart); setPromoCode(''); toast.add({ title: 'Промокод применён', type: 'success', timeout: 4000 });
  }
  async function removePromo() {
    const token = window.localStorage.getItem('pirokot-cart-token');
    if (!token) return;
    const response = await fetch(`${apiUrl}/api/cart/promo-code`, { method: 'DELETE', headers: { 'X-Cart-Token': token } });
    if (response.ok) { setCart(await response.json() as Cart); toast.add({ title: 'Промокод удалён', type: 'info', timeout: 4000 }); }
  }
  async function checkout(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const token = window.localStorage.getItem('pirokot-cart-token');
    if (!token || !cart.items.length) return;
    const data = new FormData(form);
    setIsCheckingOut(true);
    const response = await fetch(`${apiUrl}/api/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Cart-Token': token },
      body: JSON.stringify({
        customerEmail: data.get('email'),
        customerPhone: data.get('phone'),
        recipientName: data.get('recipientName'),
        fulfillmentMethod,
        city: data.get('city'),
        streetAddress: data.get('streetAddress'),
      }),
    });
    if (!response.ok) {
      setIsCheckingOut(false);
      toast.add({ title: 'Не удалось оформить заказ', description: 'Проверьте наличие товаров и попробуйте ещё раз.', type: 'error', timeout: 5000 });
      await load();
      return;
    }
    const order = await response.json() as CheckoutOrder;
    window.localStorage.removeItem('pirokot-cart-token');
    window.location.assign(`/orders/${order.publicId}/success`);
  }
  const units = cart.items.reduce((total, item) => total + item.quantity, 0);

  return <main className="min-h-screen"><SiteHeader /><section className="cart-shell"><p className="section-kicker">Ваш заказ</p><h1>Корзина</h1>
    {!cart.items.length ? <div className="cart-empty"><PackageOpen aria-hidden="true" /><h2>Корзина пока пуста</h2><p>Добавьте товары из каталога — они появятся здесь.</p><Link href="/products">Перейти в каталог</Link></div> : <div className="cart-layout"><div>
      <section className="cart-items" aria-label="Товары в корзине"><div className="cart-items-heading"><h2>Товары</h2><span>{units} шт.</span></div>{cart.items.map(item => <article className="cart-item" key={item.productId}>
        <Link href={`/products/${item.productId}`} className="cart-item-art" aria-label={`Открыть товар ${item.productName}`}>{cartImageUrl(item) ? <>{/* oxlint-disable-next-line next/no-img-element */}<img src={cartImageUrl(item)} alt={item.productName} /></> : <><PackageOpen aria-hidden="true" /><span>Пиротехника</span></>}</Link>
        <div className="cart-item-copy">{item.brand && <p className="cart-item-brand">{item.brand}</p>}<Link href={`/products/${item.productId}`}><h3>{item.productName}</h3></Link><p className="cart-item-stock" data-available={item.available}>{item.available ? `В наличии: ${item.stockQuantity} шт.` : 'Недостаточно товара на складе'}</p><div className="cart-item-bottom"><div className="quantity-stepper" aria-label={`Количество товара ${item.productName}`}><Button variant="outline" size="icon-sm" aria-label="Уменьшить количество" disabled={item.quantity === 1 || updatingId === item.productId} onClick={() => void change(item.productId, item.quantity - 1)}><Minus /></Button><output aria-label="Количество">{item.quantity}</output><Button variant="outline" size="icon-sm" aria-label="Увеличить количество" disabled={updatingId === item.productId || item.quantity >= item.stockQuantity} onClick={() => void change(item.productId, item.quantity + 1)}><Plus /></Button></div><Button variant="ghost" size="sm" disabled={updatingId === item.productId} onClick={() => void remove(item.productId)}><Trash2 />Удалить</Button></div></div>
        <div className="cart-item-price"><strong>{money(item.currentPriceMinor, item.currency)}</strong>{item.currentPriceMinor !== item.unitPriceMinor && <span>Цена изменилась</span>}<small>за 1 шт.</small></div>
      </article>)}</section>
      <form id="checkout-form" className="delivery-form" aria-labelledby="delivery-heading" onSubmit={event => void checkout(event)}><div><p className="section-kicker">Для оформления</p><h2 id="delivery-heading">Получатель и способ получения</h2><p>Выберите удобный вариант. Менеджер подтвердит заказ и согласует детали.</p></div><div className="delivery-method"><span>Как получить заказ</span><RadioGroup value={fulfillmentMethod} onValueChange={value => setFulfillmentMethod(value as FulfillmentMethod)} className="delivery-method-options"><label className="delivery-method-option" htmlFor="delivery-method"><RadioGroupItem id="delivery-method" value="DELIVERY" /><span><strong>Доставка</strong><small>Укажите адрес, менеджер рассчитает стоимость.</small></span></label><label className="delivery-method-option" htmlFor="pickup-method"><RadioGroupItem id="pickup-method" value="PICKUP" /><span><strong>Самовывоз</strong><small>Менеджер подтвердит готовность заказа к выдаче.</small></span></label></RadioGroup></div><div className="delivery-grid"><label>Имя получателя<input name="recipientName" autoComplete="name" placeholder="Иван Петров" required /></label><label>Телефон<input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7 900 000-00-00" required /></label><label>Email для чека<input name="email" type="email" autoComplete="email" placeholder="mail@example.ru" required /></label>{fulfillmentMethod === 'DELIVERY' && <><label>Город<input name="city" autoComplete="address-level2" placeholder="Екатеринбург" required /></label><label className="delivery-address">Адрес доставки<input name="streetAddress" autoComplete="street-address" placeholder="Улица, дом, квартира" required /></label></>}</div><p className="delivery-note"><Truck aria-hidden="true" /> {fulfillmentMethod === 'DELIVERY' ? 'Способ и стоимость доставки согласует менеджер.' : 'Менеджер сообщит, когда заказ можно будет забрать.'}</p><p className="delivery-payment"><ShieldCheck aria-hidden="true" /> Оплата при получении. Подготовьте паспорт для подтверждения возраста.</p></form>
    </div><aside className="cart-summary" aria-label="Сводка заказа"><h2>Ваш заказ</h2><div className="cart-summary-lines">{cart.items.map(item => <div key={item.productId}><span>{item.productName} × {item.quantity}</span><strong>{money(item.currentPriceMinor * item.quantity, item.currency)}</strong></div>)}</div>{!cart.promoCode && <form className="promo-form" onSubmit={event => void applyPromo(event)}><label htmlFor="promo-code">Промокод</label><div><input id="promo-code" value={promoCode} onChange={event => setPromoCode(event.target.value)} placeholder="Например, TEST20" /><Button type="submit" variant="outline">Применить</Button></div></form>}<div className="cart-summary-total"><span>Итого</span><strong>{money(cart.totalMinor, cart.currency)}</strong></div>{cart.promoCode && <div className="cart-discount-details"><span>Промокод {cart.promoCode} −{cart.promoDiscountPercent}%</span><del>{money(cart.subtotalMinor, cart.currency)}</del><strong>Выгода −{money(cart.discountMinor, cart.currency)}</strong><Button variant="ghost" size="sm" onClick={() => void removePromo()}>Удалить промокод</Button></div>}<Button size="lg" type="submit" form="checkout-form" disabled={isCheckingOut}>{isCheckingOut ? 'Оформляем…' : 'Оформить заказ'}</Button><Button variant="outline" onClick={() => void share()} disabled={isCheckingOut}>Поделиться корзиной</Button><p><ShieldCheck aria-hidden="true" /> Цена и наличие будут повторно проверены перед оформлением.</p></aside>
    </div>}</section></main>;
}
