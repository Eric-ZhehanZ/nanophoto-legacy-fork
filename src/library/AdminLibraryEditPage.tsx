'use client';
import { useUiText } from '@/i18n/UiText';
import UiText from '@/i18n/UiText';

import { PATH_LIBRARY } from '@/app/path';
import LinkWithStatus from '@/components/LinkWithStatus';
import { useState } from 'react';
import { Library, LibraryInsert, getLibraryMeta } from '.';
import FieldsetWithStatus from '@/components/FieldsetWithStatus';
import AdminChildPage from '@/components/AdminChildPage';
import { updateLibraryAction } from './actions';
import SubmitButtonWithStatus from '@/components/SubmitButtonWithStatus';
import { Photo } from '@/photo';
import { useAppText } from '@/i18n/state/client';
import FieldsetPhotoChooser from '@/photo/form/FieldsetPhotoChooser';
import { LIBRARY_DESCRIPTION_DEFAULT } from '@/app/config';

export default function AdminLibraryEditPage({
  library,
  photoAvatar,
  photos,
  photosCount,
  photosFavs,
}: {
  library?: Library
  photoAvatar?: Photo
  photos: Photo[]
  photosCount: number
  photosFavs: Photo[]
  shouldResizeImages?: boolean
}) {
  const uiText = useUiText();
  const appText = useAppText();

  const [libraryForm, setLibraryForm] =
    useState<Partial<LibraryInsert>>(library ?? {});

  const {
    title: placeholderTitle,
    subhead: placeholderSubhead,
  } = getLibraryMeta(appText);

  return (
    <AdminChildPage
      backPath={PATH_LIBRARY}
      backLabel={uiText('Library')}
      breadcrumb="Edit Library Page"
    >
      <form
        className="space-y-12 mt-12"
        action={updateLibraryAction}
      >
        <div className="space-y-4">
          <FieldsetPhotoChooser
            id="photoIdAvatar"
            label={uiText('Avatar')}
            value={libraryForm?.photoIdAvatar ?? photoAvatar?.id ?? ''}
            onChange={photoIdAvatar => setLibraryForm(form =>
              ({ ...form, photoIdAvatar }))}
            photo={photoAvatar}
            photos={photos}
            photosCount={photosCount}
            photosFavs={photosFavs}
          />
          <FieldsetWithStatus
            label={uiText('Title')}
            value={libraryForm?.title ?? ''}
            placeholder={placeholderTitle}
            onChange={title => setLibraryForm(form =>
              ({ ...form, title }))}
          />
          <FieldsetWithStatus
            label={uiText('Subhead')}
            value={libraryForm?.subhead ?? ''}
            placeholder={placeholderSubhead}
            onChange={subhead => setLibraryForm(form =>
              ({ ...form, subhead }))}
          />
          <FieldsetWithStatus
            label={uiText('Description')}
            type="textarea"
            value={libraryForm?.description ?? ''}
            placeholder={LIBRARY_DESCRIPTION_DEFAULT}
            onChange={description => setLibraryForm(form =>
              ({ ...form, description }))}
          />
        </div>
        <div className="flex gap-2">
          <LinkWithStatus
            href={PATH_LIBRARY}
            className="button"
          > <UiText text="Cancel" /> </LinkWithStatus>
          <SubmitButtonWithStatus
            hideText="never"
            primary
          > <UiText text="Update" /> </SubmitButtonWithStatus>
        </div>
      </form>
    </AdminChildPage>
  );
}
