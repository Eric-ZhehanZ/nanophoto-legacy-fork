'use client';
import { useAppLanguage } from '@/i18n/state/client';
import { useCallback } from 'react';
import { localizePhoto } from './localize';
import { Photo } from '.';
export default function usePhotoLocalization() {
  const language = useAppLanguage();
  return useCallback((photo: Photo) => localizePhoto(photo, language), [language]);
}
