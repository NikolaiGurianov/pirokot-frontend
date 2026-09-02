import type { Metadata } from 'next';
import { CatalogView } from './catalog-view';

export const metadata: Metadata = {
  title: 'Каталог пиротехники — Пирокот',
  description: 'Салюты, фонтаны, ракеты и бенгальские огни с актуальными ценами и остатками.',
};

export default function ProductsPage() {
  return <CatalogView />;
}
