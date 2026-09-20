'use client';
import usePhotoLocalization from './usePhotoLocalization';
import PhotoOGTile from '@/photo/PhotoOGTile';
import { absolutePathForPhoto } from '@/app/path';
import { Photo, titleForPhoto } from '.';
import { PhotoSetCategory } from '../category';
import ShareModal from '@/share/ShareModal';

export default function PhotoShareModal(
  props: { photo: Photo } & PhotoSetCategory,
) {
  const localize = usePhotoLocalization();
  return (
    <ShareModal
      pathShare={absolutePathForPhoto(props, true)}
      navigatorTitle={titleForPhoto(localize(props.photo))}
      socialText="Check out this photo"
    >
      <PhotoOGTile {...props} />
    </ShareModal>
  );
}
