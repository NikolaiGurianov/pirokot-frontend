import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

export default async function OrderSuccessPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  return <main className="min-h-screen"><SiteHeader /><section className="order-success">
    <CheckCircle2 aria-hidden="true" />
    <p className="section-kicker">Заказ принят</p>
    <h1>Спасибо за заказ</h1>
    <p>Мы получили заказ № {publicId}. Менеджер свяжется с вами, чтобы подтвердить наличие, доставку и оплату.</p>
    <Link href="/products">Продолжить покупки</Link>
  </section></main>;
}
