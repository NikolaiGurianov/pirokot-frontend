import Link from 'next/link';
import { Flame, ShoppingBag, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/products"><Flame aria-hidden="true" />Пирокот</Link>
      <nav className="main-nav" aria-label="Основная навигация">
        <Link href="/products">Каталог</Link>
        <Link href="/about">О нас</Link>
        <Link href="/contacts">Контакты</Link>
      </nav>
      <div className="header-actions">
        <Button variant="ghost" className="account-button" render={<Link href="/account" />}>
          <UserRound /> <span>Кабинет</span>
        </Button>
        <Button variant="outline" className="cart-button" render={<Link href="/cart" />}>
          <ShoppingBag /> Корзина
        </Button>
      </div>
    </header>
  );
}
