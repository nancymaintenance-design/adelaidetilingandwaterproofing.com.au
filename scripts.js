(() => {
  const serviceSectionIds = new Map([
    ['Bathroom and shower areas', 'bathroom-and-shower-areas'],
    ['Laundry and utility areas', 'laundry-and-utility-areas'],
    ['Balconies and external wet-exposed areas', 'balconies-and-external-wet-exposed-areas'],
    ['Bathroom tiling', 'bathroom-tiling'],
    ['Kitchen tiling and splashbacks', 'kitchen-tiling-and-splashbacks'],
    ['Wall, floor and outdoor tiling', 'wall-floor-and-outdoor-tiling']
  ]);
  document.querySelectorAll('h2').forEach((heading) => {
    const id = serviceSectionIds.get(heading.textContent.trim());
    if (id) heading.id = id;
  });
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();

  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const selectedLocation = document.createElement('p');
  selectedLocation.id = 'selected-location';
  selectedLocation.className = 'selected-location';
  selectedLocation.setAttribute('aria-live', 'polite');
  selectedLocation.hidden = true;
  form.before(selectedLocation);

  const areaInput = document.createElement('input');
  areaInput.type = 'hidden';
  areaInput.name = 'serviceArea';
  areaInput.id = 'service-area';
  const suburbInput = document.createElement('input');
  suburbInput.type = 'hidden';
  suburbInput.name = 'serviceSuburb';
  suburbInput.id = 'service-suburb';
  form.prepend(areaInput, suburbInput);

  const status = document.querySelector('[data-contact-status]');
  const submitButton = form.querySelector('button[type="submit"]');
  const defaultButtonText = submitButton?.textContent;
  const locationInput = form.querySelector('#location');

  function fragmentSelection() {
    const prefix = '#enquiry-form?';
    if (!window.location.hash.startsWith(prefix)) return null;
    const parameters = window.location.hash.slice(prefix.length);
    try {decodeURIComponent(parameters);} catch {return null;}
    const selection = new URLSearchParams(parameters);
    const keys = [...selection.keys()];
    if (keys.some(key => !['area', 'suburb'].includes(key)) || new Set(keys).size !== keys.length || !selection.get('area')?.trim()) return null;
    return selection;
  }

  function applySelection(selection) {
    const area = selection.get('area')?.trim().slice(0, 100) || '';
    const suburb = selection.get('suburb')?.trim().slice(0, 100) || '';
    if (!area || !locationInput) return;
    areaInput.value = area;
    suburbInput.value = suburb;
    if (suburb) locationInput.value = suburb;
    selectedLocation.hidden = false;
    selectedLocation.textContent = suburb
      ? `Selected area: ${area} · ${suburb}`
      : `Selected area: ${area}. Add your suburb or postcode below.`;
  }

  const fragment = fragmentSelection();
  applySelection(fragment || new URLSearchParams(window.location.search));
  if (fragment) form.scrollIntoView();
  window.addEventListener('hashchange', () => {
    const selection = fragmentSelection();
    if (!selection) return;
    applySelection(selection);
    form.scrollIntoView();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (status) {
      status.textContent = 'Sending your enquiry…';
      status.dataset.state = '';
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'SENDING ENQUIRY…';
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.error || 'Unable to send the enquiry. Please call or email Ellis directly.');

      form.reset();
      if (status) {
        status.textContent = result.message || 'Thank you — your enquiry has been sent.';
        status.dataset.state = 'success';
      }
    } catch (error) {
      if (status) {
        status.textContent = error.message || 'Unable to send the enquiry. Please call or email Ellis directly.';
        status.dataset.state = 'error';
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    }
  });
})();
