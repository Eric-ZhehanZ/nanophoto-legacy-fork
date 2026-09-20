/** @jest-environment jsdom */
/** @jest-environment-options {"url":"https://photos.zhehanz.com/"} */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let deviceDark = false;
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', { writable: true, value: () => ({
    get matches() { return deviceDark; },
    addEventListener: jest.fn(),
  }) });
  document.documentElement.lang = 'en';
  window.eval(readFileSync(join(process.cwd(), 'public/site-preferences.js'), 'utf8'));
});
beforeEach(() => {
  for (const name of ['siteAppearance', 'siteLanguage', 'preferredLanguage']) {
    document.cookie = `${name}=; Domain=zhehanz.com; Path=/; Max-Age=0`;
  }
  localStorage.clear();
  deviceDark = false;
});

test('system remains a saved preference when the device changes appearance', () => {
  window.SitePreferences!.setTheme('system');
  expect(window.SitePreferences!.theme()).toBe('system');
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  deviceDark = true;
  window.dispatchEvent(new Event('focus'));
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(window.SitePreferences!.theme()).toBe('system');
  expect(localStorage.getItem('theme')).toBe('system');
});

test('shared cookie overrides an old per-site theme on return', () => {
  window.SitePreferences!.setTheme('dark');
  localStorage.setItem('theme', 'light');
  window.dispatchEvent(new Event('focus'));
  expect(localStorage.getItem('theme')).toBe('dark');
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});

test('language choices persist in the shared parent-domain preference', () => {
  window.SitePreferences!.setLanguage('zh');
  expect(window.SitePreferences!.language()).toBe('zh');
  expect(document.cookie).toContain('siteLanguage=zh');
  window.SitePreferences!.setLanguage('en');
  expect(window.SitePreferences!.language()).toBe('en');
});

test('invalid display preferences are ignored', () => {
  window.SitePreferences!.setTheme('dark');
  window.SitePreferences!.setTheme('invalid');
  expect(window.SitePreferences!.theme()).toBe('dark');
});
