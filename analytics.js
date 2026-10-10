window.dataLayer = window.dataLayer || [];
var ellisLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
if (ellisLocalPreview) window['ga-disable-G-QDLBD5EN3B'] = true;
function gtag(){if (!ellisLocalPreview) window.dataLayer.push(arguments);}
if (!ellisLocalPreview) {
  gtag('js', new Date());
  gtag('config', 'G-QDLBD5EN3B');
}
