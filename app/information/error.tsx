'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';

export default function InformationError({ reset }: { reset: () => void }) {
  return (
    <>
      <SiteHeader />
      <main className="information-error">
        <AlertCircle aria-hidden="true" />
        <h1>Не удалось загрузить информацию</h1>
        <p>Попробуйте обновить страницу немного позже.</p>
        <Button onClick={reset}><RefreshCw /> Повторить</Button>
      </main>
    </>
  );
}
