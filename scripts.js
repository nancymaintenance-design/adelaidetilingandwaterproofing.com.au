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
  const serviceInput = form.querySelector('#service');
  const emailInput = form.querySelector('#email');
  const phoneInput = form.querySelector('#phone');
  const contactError = form.querySelector('#contact-method-error');

  // Query-only service context is independent of the strict legacy area fragment.
  function applyServiceSelection() {
    if (!serviceInput || serviceInput.value) return;
    try { decodeURIComponent(window.location.search); } catch { return; }
    const values = new URLSearchParams(window.location.search).getAll('service');
    if (values.length !== 1 || !values[0] || values[0].length > 180) return;
    if ([...serviceInput.options].some(option => !option.disabled && option.value === values[0])) {
      serviceInput.value = values[0];
    }
  }

  function validateContactMethods(showError = false) {
    if (!emailInput || !phoneInput) return;
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const digits = phone.replace(/\D/g, '').length;
    const emailError = email
      ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter a valid email address, such as name@example.com.')
      : (!phone ? 'Enter an email address or phone number so we can contact you.' : '');
    const phoneError = phone && (!/^\+?[\d\s().-]+$/.test(phone) || digits < 7 || digits > 15)
      ? 'Enter a phone number with 7–15 digits. Spaces, brackets, dots, hyphens and a leading + are accepted.' : '';
    emailInput.setCustomValidity(emailError);
    phoneInput.setCustomValidity(phoneError);
    emailInput.setAttribute('aria-invalid', String(showError && Boolean(emailError)));
    phoneInput.setAttribute('aria-invalid', String(showError && Boolean(phoneError)));
    if (contactError) contactError.textContent = showError ? (emailError || phoneError) : '';
  }

  if (emailInput && phoneInput) {
    for (const input of [emailInput, phoneInput]) {
      input.addEventListener('input', () => validateContactMethods());
      input.addEventListener('invalid', () => validateContactMethods(true));
    }
    validateContactMethods();
  }

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
  applyServiceSelection();
  if (fragment) form.scrollIntoView();
  window.addEventListener('hashchange', () => {
    const selection = fragmentSelection();
    if (!selection) return;
    applySelection(selection);
    form.scrollIntoView();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton?.disabled) return;
    validateContactMethods(true);
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
      validateContactMethods();
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
