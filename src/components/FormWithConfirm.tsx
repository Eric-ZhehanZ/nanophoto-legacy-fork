'use client';
import { useUiText } from '@/i18n/UiText';

import { ReactNode } from 'react';

export default function FormWithConfirm({
  action,
  confirmText: confirmTextRaw,
  onSubmit,
  className,
  children,
}: {
  action: (formData: FormData) => void
  confirmText?: string
  onSubmit?: () => void
  className?: string
  children: ReactNode
}) {
  const t = useUiText();
  const confirmText = typeof confirmTextRaw === 'string' ? t(confirmTextRaw) : confirmTextRaw;
  return (
    <form
      action={action}
      onSubmit={e => {
        if (!confirmText || confirm(confirmText)) {
          e.currentTarget.requestSubmit();
          onSubmit?.();
        } else {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {children}
    </form>
  );
};
