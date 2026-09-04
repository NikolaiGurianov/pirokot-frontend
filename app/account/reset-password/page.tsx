'use client';

import { type SyntheticEvent, useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { toast } from '@/components/ui/toast';
import { accountRequest } from '@/lib/account';

export default function ResetPasswordPage() {
  const [token] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('token') ?? '');
  const [pending, setPending] = useState(false);
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setPending(true);
    const response = token
      ? await accountRequest('/api/auth/password-reset', { method: 'POST', body: JSON.stringify({ token, newPassword: data.get('password') }) })
      : await accountRequest('/api/auth/password-reset-requests', { method: 'POST', body: JSON.stringify({ email: data.get('email') }) });
    setPending(false);
    if (!response.ok) { toast.add({ title: 'Не удалось выполнить запрос', description: 'Проверьте данные и попробуйте ещё раз.', type: 'error', timeout: 5000 }); return; }
    if (token) { toast.add({ title: 'Пароль изменён', type: 'success', timeout: 4000 }); window.location.assign('/account/login'); return; }
    toast.add({ title: 'Если аккаунт существует, ссылка уже отправлена', description: 'Проверьте входящие и папку «Спам».', type: 'info', timeout: 6000 });
  }
  return <main className="min-h-screen"><SiteHeader /><section className="auth-shell"><div className="auth-intro"><p className="section-kicker">Восстановление доступа</p><h1>{token ? 'Придумайте новый пароль.' : 'Вернём доступ к аккаунту.'}</h1><p>{token ? 'Ссылка одноразовая. После сохранения войдите с новым паролем.' : 'Укажите email — если он зарегистрирован, отправим ссылку для смены пароля.'}</p></div><form className="auth-card" onSubmit={event => void submit(event)}><h2>{token ? 'Новый пароль' : 'Получить ссылку'}</h2>{token ? <label><span><KeyRound aria-hidden="true" />Новый пароль</span><input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required placeholder="Не менее 8 символов" /></label> : <label><span><Mail aria-hidden="true" />Email</span><input name="email" type="email" autoComplete="email" required placeholder="mail@example.ru" /></label>}<Button size="lg" type="submit" disabled={pending}>{pending ? 'Подождите…' : token ? 'Сохранить пароль' : 'Отправить ссылку'}</Button><Link className="auth-link" href="/account/login">Вернуться ко входу</Link></form></section></main>;
}
