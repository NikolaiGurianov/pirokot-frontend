'use client';

import { BookOpen, ImageIcon } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

/** imageUrl подключается после предоставления изображения инструкции. */
export function InstructionViewer({ imageUrl }: { imageUrl?: string }) {
  return (
    <Dialog>
      <DialogTrigger className="instruction-trigger" aria-label="Открыть инструкцию">
        <BookOpen aria-hidden="true" />
        <span>Открыть инструкцию</span>
      </DialogTrigger>
      <DialogContent className="instruction-dialog">
        <DialogTitle>Инструкция по использованию</DialogTitle>
        <DialogDescription>Перед запуском изучите инструкцию на упаковке вашего изделия.</DialogDescription>
        {imageUrl ? (
          <a href={imageUrl} target="_blank" rel="noreferrer" aria-label="Открыть изображение инструкции в новой вкладке">
            <img src={imageUrl} width={1000} height={1400} alt="Инструкция по использованию пиротехники" className="instruction-image" />
          </a>
        ) : (
          <div className="instruction-preview">
            <ImageIcon aria-hidden="true" />
            <p>Иллюстрированная инструкция скоро появится здесь</p>
          </div>
        )}
        <p>Соблюдайте дистанцию и другие требования производителя, указанные для конкретного изделия.</p>
      </DialogContent>
    </Dialog>
  );
}
