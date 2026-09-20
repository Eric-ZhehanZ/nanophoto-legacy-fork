import { getTextForLocale } from '@/i18n';

test('Chinese requests do not change subsequent English translations', async () => {
  const englishBefore = await getTextForLocale('en-us');
  const chinese = await getTextForLocale('zh-cn');
  const englishAfter = await getTextForLocale('en-us');
  expect(chinese.photo.photo).not.toBe(englishBefore.photo.photo);
  expect(englishAfter).toEqual(englishBefore);
  expect(englishAfter.photo.photo).toBe('Photo');
});
