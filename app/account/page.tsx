'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, LogOut, PackageOpen, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { toast } from '@/components/ui/toast';
import { accountRequest, formatMoney, type Account, type OrderPage } from '@/lib/account';

const statusNames: Record<string, string> = { NEW: 'Новый', CONFIRMED: 'Подтверждён', PAID: 'Оплачен', COMPLETED: 'Завершён', CANCELLED: 'Отменён' };

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<OrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const [accountResponse, ordersResponse] = await Promise.all([accountRequest('/api/auth/me'), accountRequest('/api/account/orders')]);
    if (!accountResponse.ok) { window.location.replace('/account/login'); return; }
    setAccount(await accountResponse.json() as Account);
    if (ordersResponse.ok) setOrders(await ordersResponse.json() as OrderPage);
    else toast.add({ title: 'Не удалось загрузить заказы', description: 'Обновите страницу позже.', type: 'error', timeout: 5000 });
    setLoading(false);
  };
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); });
    return () => window.clearTimeout(timer);
  }, []);
  async function logout() {
    const csrfResponse = await accountRequest('/api/auth/csrf');
    if (!csrfResponse.ok) return;
    const csrf = await csrfResponse.json() as { headerName: string; token: string };
    const response = await accountRequest('/api/auth/logout', { method: 'POST', headers: { [csrf.headerName]: csrf.token } });
    if (response.ok) window.location.assign('/products');
  }
  return <main className="min-h-screen"><SiteHeader /><section className="account-shell">
    <div className="account-heading"><div><p className="section-kicker">Личный кабинет</p><h1>Мои заказы</h1><p>{account ? account.email : 'Загружаем данные аккаунта…'}</p></div><Button variant="outline" onClick={() => void logout()}><LogOut />Выйти</Button></div>
    <div className="account-layout"><aside className="account-profile"><div className="account-avatar"><UserRound aria-hidden="true" /></div><strong>{account?.email ?? '—'}</strong><span>Покупатель</span><p><ShieldCheck aria-hidden="true" />Ваши данные и история заказов доступны только в этой учётной записи.</p></aside>
      <section className="account-orders" aria-live="polite"><div className="account-orders-heading"><div><h2>История заказов</h2><p>{orders ? `${orders.totalElements} ${orders.totalElements === 1 ? 'заказ' : 'заказов'}` : 'Загружаем…'}</p></div></div>
      {loading ? <div className="account-empty"><PackageOpen aria-hidden="true" /><p>Загружаем историю заказов…</p></div> : !orders?.content.length ? <div className="account-empty"><PackageOpen aria-hidden="true" /><h2>Заказов пока нет</h2><p>Когда оформите заказ, он появится здесь.</p><Link href="/products">Перейти в каталог</Link></div> : <div className="order-list">{orders.content.map(order => <article className="account-order" key={order.publicId}><div className="account-order-title"><div><span className={`order-status status-${order.status.toLowerCase()}`}>{statusNames[order.status]}</span><h3>Заказ №{order.publicId.slice(0, 8).toUpperCase()}</h3></div><strong>{formatMoney(order.totalMinor, order.currency)}</strong></div><ul>{order.items.map(item => <li key={`${order.publicId}-${item.sku}`}><span>{item.productName} × {item.quantity}</span><strong>{formatMoney(item.lineTotalMinor, order.currency)}</strong></li>)}</ul><div className="account-order-footer"><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} шт.</span><Link href={`/orders/${order.publicId}/success`}>Детали заказа <ChevronRight aria-hidden="true" /></Link></div></article>)}</div>}</section>
    </div>
  </section></main>;
}
