import Link from 'next/link';
import { Flame, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/products"><Flame aria-hidden="true" />Пирокот</Link>
      <nav className="main-nav" aria-label="Основная навигация">
        <Link href="/products">Каталог</Link>
        <span aria-disabled="true">Доставка</span>
      </nav>
      <Button variant="outline" className="cart-button" render={<Link href="/cart" />}>
        <ShoppingBag /> Корзина
      </Button>
    </header>
  );
}
