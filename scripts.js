(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const toggle = document.querySelector('[data-pause]');
  let index = 0;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(nextIndex) {
    slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === nextIndex));
  }

  if (slides.length) {
    showSlide(0);
    setInterval(() => {
      if (!paused) {
        index = (index + 1) % slides.length;
        showSlide(index);
      }
    }, 5500);
    document.querySelector('[data-prev]')?.addEventListener('click', () => {
      index = (index + slides.length - 1) % slides.length;
      showSlide(index);
    });
    document.querySelector('[data-next]')?.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      showSlide(index);
    });
    toggle?.addEventListener('click', () => {
      paused = !paused;
      toggle.textContent = paused ? 'Play carousel' : 'Pause carousel';
    });
  }

  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const status = document.querySelector('[data-contact-status]');
  const submitButton = form.querySelector('button[type="submit"]');
  const defaultButtonText = submitButton?.textContent;

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
