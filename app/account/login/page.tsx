'use client';

import { type SyntheticEvent, useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { toast } from '@/components/ui/toast';
import { accountRequest } from '@/lib/account';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [pending, setPending] = useState(false);
  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    const response = await accountRequest(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
      method: 'POST', body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
    });
    setPending(false);
    if (!response.ok) {
      toast.add({ title: mode === 'login' ? 'Не удалось войти' : 'Не удалось создать аккаунт', description: 'Проверьте email и пароль.', type: 'error', timeout: 5000 });
      return;
    }
    if (mode === 'register') {
      toast.add({ title: 'Аккаунт создан', description: 'Теперь войдите с указанным паролем.', type: 'success', timeout: 4000 });
      setMode('login');
      return;
    }
    window.location.assign('/account');
  }
  return <main className="min-h-screen"><SiteHeader /><section className="auth-shell">
    <div className="auth-intro"><p className="section-kicker">Личный кабинет</p><h1>Заказы всегда под рукой.</h1><p>Войдите, чтобы посмотреть историю заказов и их актуальные статусы.</p></div>
    <form className="auth-card" onSubmit={event => void submit(event)}>
      <div className="auth-tabs" aria-label="Доступ к аккаунту"><button type="button" data-active={mode === 'login'} onClick={() => setMode('login')}>Войти</button><button type="button" data-active={mode === 'register'} onClick={() => setMode('register')}>Регистрация</button></div>
      <h2>{mode === 'login' ? 'С возвращением' : 'Создайте аккаунт'}</h2>
      <label><span><Mail aria-hidden="true" />Email</span><input name="email" type="email" autoComplete="email" required placeholder="mail@example.ru" /></label>
      <label><span><KeyRound aria-hidden="true" />Пароль</span><input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={128} required placeholder="Не менее 8 символов" /></label>
      {mode === 'login' && <Link className="auth-link" href="/account/reset-password">Забыли пароль?</Link>}
      <Button size="lg" type="submit" disabled={pending}><UserRound />{pending ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</Button>
    </form>
  </section></main>;
}
