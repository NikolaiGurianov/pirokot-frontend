'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, ShoppingBag, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const links = [['/products', 'Каталог'], ['/information', 'Информация'], ['/about', 'О нас'], ['/contacts', 'Контакты']];

export function SiteHeader() {
  const pathname = usePathname();
  const navigation = links.map(([href, title]) => (
    <Link key={href} href={href}
      aria-current={pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined}>{title}</Link>
  ));
  return (
    <header className="site-header">
      <Link className="brand" href="/products"><Flame aria-hidden="true" />Пирокот</Link>
      <nav className="main-nav" aria-label="Основная навигация">
        {navigation}
      </nav>
      <div className="header-actions">
        <Button variant="outline" className="account-button" render={<Link href="/account" />}>
          <UserRound /> <span>Кабинет</span>
        </Button>
        <Button variant="outline" className="cart-button" render={<Link href="/cart" />}>
          <ShoppingBag /> Корзина
        </Button>
      </div>
    </header>
  );
}
