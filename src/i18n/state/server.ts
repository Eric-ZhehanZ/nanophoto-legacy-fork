import { getRequestLocale } from '../request';
import { getTextForLocale } from '..';
import { generateAppTextState } from '.';

export const getAppText = () =>
  getRequestLocale().then(getTextForLocale).then(generateAppTextState);
