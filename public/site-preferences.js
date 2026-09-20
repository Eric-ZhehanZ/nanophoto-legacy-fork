/* Shared by zhehanz.com and photos.zhehanz.com. No account/session cookies. */
(() => {
  const themes = ['light', 'dark', 'system'];
  const languages = ['en', 'zh'];
  const family = ['zhehanz.com', 'www.zhehanz.com', 'photos.zhehanz.com', 'zheha.nz', 'www.zheha.nz', 'photos.zheha.nz'];
  const root = document.documentElement;
  const domain = ['zhehanz.com', 'zheha.nz'].find(d => location.hostname === d || location.hostname.endsWith('.' + d));
  const read = name => document.cookie.split('; ').find(c => c.startsWith(name + '='))?.split('=').slice(1).join('=');
  const write = (name, value, maxAge = 31536000) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${domain ? '; Domain=' + domain : ''}${location.protocol === 'https:' ? '; Secure' : ''}`;
  };
  const safeLocal = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  let incoming = new URL(location.href);
  const receivedTheme = incoming.searchParams.get('_theme');
  const receivedLanguage = incoming.searchParams.get('_lang');
  // Only validated, non-sensitive display preferences are passed across aliases.
  if (themes.includes(receivedTheme)) write('siteAppearance', receivedTheme);
  if (languages.includes(receivedLanguage)) write('siteLanguage', receivedLanguage);
  if (receivedTheme || receivedLanguage || incoming.searchParams.has('_transition')) {
    if (incoming.searchParams.get('_transition') === '1') root.dataset.siteEntering = 'true';
    ['_theme', '_lang', '_transition'].forEach(p => incoming.searchParams.delete(p));
    history.replaceState(history.state, '', incoming);
  }
  const getTheme = () => {
    const shared = read('siteAppearance');
    if (themes.includes(shared)) return shared;
    try { const old = localStorage.getItem('theme'); if (themes.includes(old)) return old; } catch (_) {}
    return 'system';
  };
  const getLanguage = () => {
    const shared = read('siteLanguage');
    if (languages.includes(shared)) return shared;
    return root.lang.startsWith('zh') ? 'zh' : 'en';
  };
  const apply = () => {
    const theme = getTheme();
    safeLocal('theme', theme);
    const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', dark);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.backgroundColor = dark ? '#1c1917' : '#f5f5f4';
    window.applySiteTheme?.(dark);
    const language = getLanguage();
    if (root.dataset.site === 'main' && root.lang.slice(0, 2) !== language) {
      const target = new URL(location.href);
      if (/^\/(en|zh)(\/|$)/.test(target.pathname)) {
        target.pathname = target.pathname.replace(/^\/(en|zh)(?=\/|$)/, '/' + language);
        location.replace(target);
        return;
      }
    }
    window.dispatchEvent(new CustomEvent('site-preferences', { detail: { theme, language: getLanguage() } }));
  };
  window.SitePreferences = {
    theme: getTheme, language: getLanguage,
    setTheme(value) { if (themes.includes(value)) { write('siteAppearance', value); safeLocal('theme', value); apply(); } },
    setLanguage(value) { if (languages.includes(value)) { write('siteLanguage', value); write('preferredLanguage', value); } },
  };
  apply();
  const arrived = Number(read('siteTransition'));
  if (arrived && Date.now() - arrived < 10000) { root.dataset.siteEntering = 'true'; write('siteTransition', '', 0); }
  document.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor) return;
    const language = anchor.getAttribute('data-lang');
    if (languages.includes(language)) window.SitePreferences.setLanguage(language);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (!family.includes(url.hostname) || url.hostname === location.hostname || url.protocol !== 'https:') return;
    // Links between the main site and its gallery act as one site. Modified
    // clicks retain the browser's normal new-tab behavior.
    event.preventDefault();
    window.SitePreferences.setTheme(getTheme());
    window.SitePreferences.setLanguage(getLanguage());
    write('siteTransition', String(Date.now()), 10);
    if (!domain || !(url.hostname === domain || url.hostname.endsWith('.' + domain))) {
      url.searchParams.set('_theme', getTheme());
      url.searchParams.set('_lang', getLanguage());
      url.searchParams.set('_transition', '1');
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { location.assign(url); return; }
    root.dataset.siteLeaving = 'true';
    setTimeout(() => location.assign(url), 170);
  });
  document.addEventListener('animationend', event => {
    if (event.animationName === 'site-arrival') delete root.dataset.siteEntering;
  });
  window.addEventListener('pageshow', () => { delete root.dataset.siteLeaving; apply(); });
  window.addEventListener('focus', apply);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply);
})();
