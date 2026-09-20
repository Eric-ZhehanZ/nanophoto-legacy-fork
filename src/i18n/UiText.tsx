'use client';
import { ReactNode } from 'react';
import { useAppLanguage } from './state/client';
import { translateUi } from './ui';
export const useUiText = () => {
  const language = useAppLanguage();
  return (text: string) => translateUi(text, language);
};
export default function UiText({ text, children }: {
  text?: string; children?: ReactNode
}) {
  const t = useUiText();
  const value = text ?? children;
  return typeof value === 'string' ? t(value) : value;
}
