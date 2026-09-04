import { apiUrl } from '@/lib/catalog';

export type Account = { id: number; email: string; role: 'CUSTOMER' | 'ADMIN' };
export type OrderItem = { sku: string; productName: string; quantity: number; unitPriceMinor: number; lineTotalMinor: number };
export type Order = { publicId: string; status: 'NEW' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'COMPLETED'; totalMinor: number; currency: string; items: OrderItem[] };
export type OrderPage = { content: Order[]; page: number; size: number; totalElements: number; totalPages: number };

export async function accountRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(`${apiUrl}${path}`, { ...init, credentials: 'include', headers });
}

export const formatMoney = (value: number, currency = 'RUB') => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(value / 100);
