'use client';
import UiText from '@/i18n/UiText';

import HttpStatusPage from '@/components/HttpStatusPage';
import { TbRefresh } from 'react-icons/tb';

export default function GlobalError() {
  return (
    <HttpStatusPage status={<TbRefresh />}> <UiText text="Something went wrong" /> </HttpStatusPage>
  );
}
