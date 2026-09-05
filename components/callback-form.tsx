'use client';

import { useRef, useState, type SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { apiUrl } from '@/lib/catalog';

export function CallbackForm() {
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = data.get('phone');
    const name = data.get('name');
    if (typeof phone !== 'string' || typeof name !== 'string') return;
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!/^7[0-9]{10}$/.test(digits)) {
      toast.add({ title: 'Проверьте телефон', description: 'Укажите российский номер целиком, начиная с +7 или 8.', type: 'error' });
      return;
    }
    sending.current = true;
    setPending(true);
    try {
      const response = await fetch(apiUrl + '/api/callback-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: '+' + digits }),
        signal: AbortSignal.timeout(15000),
      });
      if (response.status !== 202) throw new Error('Request failed');
      form.reset();
      toast.add({ title: 'Заявка принята', description: 'Менеджер свяжется с вами в рабочее время.', type: 'success', timeout: 5000 });
    } catch {
      toast.add({ title: 'Не удалось подтвердить отправку', description: 'Попробуйте позже или позвоните: +7 (904) 496-29-56.', type: 'error', timeout: 7000 });
    } finally {
      sending.current = false;
      setPending(false);
    }
  }
  return (
    <form className="delivery-form" onSubmit={submit} aria-busy={pending}>
      <h2>Перезвонить вам?</h2>
      <p>Оставьте контакты — менеджер перезвонит в рабочее время.</p>
      <div className="delivery-grid">
        <label>Ваше имя<input name="name" autoComplete="name" required maxLength={100} disabled={pending} /></label>
        <label>Телефон<input name="phone" type="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" required maxLength={25} disabled={pending} /></label>
      </div>
      <p>Контакты будут использованы для ответа на вашу заявку.</p>
      <Button type="submit" disabled={pending}>{pending ? 'Отправляем…' : 'Заказать звонок'}</Button>
    </form>
  );
}
