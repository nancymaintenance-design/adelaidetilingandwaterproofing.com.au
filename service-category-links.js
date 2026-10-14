// A URL fragment is not sent to the server: retain native fallback links and
// enhance only known legacy waterproofing fragments on the former catalogue.
(() => {
  function followLegacyService() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const entry = document.getElementById(id);
    if (!entry?.classList.contains('legacy-service-link')) return;
    const link = entry.querySelector('a[href]');
    if (!link) return;
    const target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin || !target.pathname.endsWith('.html')) return;
    window.location.replace(target.href);
  }
  followLegacyService();
  window.addEventListener('hashchange', followLegacyService);
})();
