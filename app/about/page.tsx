import Link from 'next/link';
import { ArrowRight, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';

const principles = [
  {
    icon: PackageCheck,
    title: 'Заказ без лишних шагов',
    text: 'Выберите товары в каталоге, добавьте их в корзину и укажите удобный способ получения.',
  },
  {
    icon: MapPin,
    title: 'Тюмень',
    text: 'Заказ можно забрать в магазине на ул. Мельникайте, 80 или оформить доставку по городу.',
  },
  {
    icon: ShieldCheck,
    title: 'Безопасность прежде всего',
    text: 'Перед использованием изучите инструкцию к изделию и соблюдайте указанные на упаковке требования.',
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="about-shell">
        <section className="about-intro">
          <p className="section-kicker">О магазине</p>
          <h1>Пирокот — магазин пиротехники в Тюмени.</h1>
          <p>
            Здесь можно подобрать товар для праздника, уточнить наличие и оформить получение в магазине
            или доставку по городу.
          </p>
          <div className="about-actions">
            <Button className="about-primary" render={<Link href="/products" />}>Перейти в каталог <ArrowRight /></Button>
            <Button variant="outline" render={<Link href="/contacts" />}>Контакты магазина</Button>
          </div>
        </section>

        <section className="about-principles" aria-label="Как работает магазин">
          {principles.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon aria-hidden="true" />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="about-note">
          <h2>Нужна помощь с выбором?</h2>
          <p>Позвоните нам перед визитом — подскажем, как найти магазин и уточним наличие интересующего товара.</p>
          <Link href="/contacts">Посмотреть адрес, график и телефон <ArrowRight aria-hidden="true" /></Link>
        </section>
      </main>
    </>
  );
}
