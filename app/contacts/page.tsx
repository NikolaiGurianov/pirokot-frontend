import Link from 'next/link';
import { Clock3, ExternalLink, MapPinned, Phone } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';

const mapUrl = 'https://yandex.ru/maps/org/pirokot/163064880382/?ll=65.575794%2C57.142287&z=16';
const mapWidgetUrl = 'https://yandex.ru/map-widget/v1/?ll=65.575533%2C57.142056&z=16&pt=65.575533%2C57.142056,pm2rdm';

export default function ContactsPage() {
  return (
    <>
      <SiteHeader />
      <main className="contacts-shell">
        <p className="section-kicker">Пирокот в Тюмени</p>
        <div className="contacts-heading">
          <div>
            <h1>Контакты</h1>
            <p>Заезжайте за заказом или уточните наличие перед визитом.</p>
          </div>
          <Button className="contacts-route" render={<Link href={mapUrl} target="_blank" rel="noreferrer" />}>
            <MapPinned /> Построить маршрут <ExternalLink />
          </Button>
        </div>

        <section className="contacts-layout" aria-label="Контакты магазина">
          <div className="contacts-details">
            <article className="contact-detail">
              <MapPinned aria-hidden="true" />
              <div>
                <h2>Магазин</h2>
                <a href={mapUrl} target="_blank" rel="noreferrer">ул. Мельникайте, 80, Тюмень</a>
              </div>
            </article>
            <article className="contact-detail">
              <Phone aria-hidden="true" />
              <div>
                <h2>Телефон</h2>
                <a href="tel:+79044962956">+7 (904) 496-29-56</a>
              </div>
            </article>
            <article className="contact-detail">
              <Clock3 aria-hidden="true" />
              <div>
                <h2>График работы</h2>
                <p>Ежедневно, 10:00–20:00</p>
              </div>
            </article>
          </div>

          <div className="contacts-map">
            <iframe
              title="Пирокот на карте Тюмени"
              src={mapWidgetUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={mapUrl} target="_blank" rel="noreferrer">
              Открыть карту в Яндексе <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
