'use client';
import UiText from '@/i18n/UiText';

import HttpStatusPage from '@/components/HttpStatusPage';

export default function Error() {
  return (
    <HttpStatusPage status={500}> <UiText text="Something went wrong" /> </HttpStatusPage>
  );
}
