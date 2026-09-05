import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Информация — Пирокот',
  description: 'Информация об использовании пиротехники, сертификатах и региональных уведомлениях.',
  openGraph: { title: 'Информация — Пирокот', description: 'Информация об использовании пиротехники, сертификатах и региональных уведомлениях.' },
  twitter: { title: 'Информация — Пирокот', description: 'Информация об использовании пиротехники, сертификатах и региональных уведомлениях.' },
};
import { ArrowRight, FileCheck2, FileWarning } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { InstructionViewer } from '@/components/instruction-viewer';

export default function InformationPage() {
  return (
    <>
      <SiteHeader />
      <main className="information-shell">
        <section className="information-intro">
          <p className="section-kicker">Перед покупкой и запуском</p>
          <h1>Полезная информация</h1>
          <p>Собрали главное о безопасном использовании изделий и публикации документов.</p>
        </section>

        <section className="information-grid" aria-label="Разделы информации">
          <article className="information-card information-card--instruction">
            <InstructionViewer />
            <p className="information-label">Инструкция</p>
            <h2>Используйте пиротехнику безопасно</h2>
            <ul>
              <li>Перед запуском прочитайте инструкцию на упаковке конкретного изделия.</li>
              <li>Не используйте повреждённые или отсыревшие изделия.</li>
              <li>Запускайте только на открытом пространстве, соблюдая указанную дистанцию.</li>
              <li>Не передавайте пиротехнику детям; покупатель и получатель заказа должны быть совершеннолетними.</li>
            </ul>
            <Link href="/products">Выбрать изделие в каталоге <ArrowRight aria-hidden="true" /></Link>
          </article>

          <article className="information-card">
            <FileCheck2 aria-hidden="true" />
            <p className="information-label">Сертификаты</p>
            <h2>Документы готовим к публикации</h2>
            <p>Здесь будут карточки документов с номером, сроком действия и ссылкой на просмотр.</p>
            <output className="information-empty">
              <span>Пока нет опубликованных документов</span>
              <small>Не отображаем непроверенные или устаревшие файлы.</small>
            </output>
            <Link href="/contacts">Уточнить документ в магазине <ArrowRight aria-hidden="true" /></Link>
          </article>

          <article className="information-card">
            <FileWarning aria-hidden="true" />
            <p className="information-label">Полезная информация</p>
            <h2>Региональные уведомления</h2>
            <p>Здесь будут появляться только проверенные сообщения о противопожарных режимах с датой, сроком действия и ссылкой на официальный источник.</p>
            <output className="information-empty">
              <span>Уведомления пока не опубликованы</span>
              <small>Отсутствие публикаций на сайте не означает отсутствие действующих ограничений. Перед запуском уточните их в официальных источниках.</small>
            </output>
          </article>
        </section>
      </main>
    </>
  );
}
