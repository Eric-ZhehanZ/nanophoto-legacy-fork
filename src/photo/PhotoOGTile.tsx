'use client';
import usePhotoLocalization from './usePhotoLocalization';

import {
  Photo,
  descriptionForPhoto,
  titleForPhoto,
} from '@/photo';
import { PhotoSetCategory } from '../category';
import { pathForPhoto, pathForPhotoImage } from '@/app/path';
import OGTile, { OGTilePropsCore } from '@/components/og/OGTile';

export default function PhotoOGTile({
  photo,
  riseOnHover,
  retryTime,
  onVisible,
  ...categories
}: {
  photo: Photo
} & PhotoSetCategory & OGTilePropsCore) {
  const localize = usePhotoLocalization();
  return (
    <OGTile {...{
      title: titleForPhoto(localize(photo)),
      description: descriptionForPhoto(localize(photo)),
      path: pathForPhoto({ photo, ...categories }),
      pathImage: pathForPhotoImage(photo),
      riseOnHover,
      retryTime,
      onVisible,
    }} />
  );
};
