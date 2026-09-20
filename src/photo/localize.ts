import { Photo } from '.';
export function localizePhoto(photo: Photo, language: 'en' | 'zh'): Photo {
  if (language !== 'zh') return photo;
  return { ...photo,
    title: photo.titleZh || photo.title,
    caption: photo.captionZh || photo.caption,
    semanticDescription: photo.semanticDescriptionZh || photo.semanticDescription,
  };
}
