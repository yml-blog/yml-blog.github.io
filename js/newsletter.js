(function () {
  const newsletterName = 'Yangming AI Systems Notes';
  const fallbackEmail = 'liym1@hotmail.com';

  function findStatus(form) {
    return form.querySelector('[data-newsletter-status]');
  }

  function setStatus(form, message, state) {
    const status = findStatus(form);
    if (!status) {
      return;
    }

    status.textContent = message;
    if (state) {
      status.setAttribute('data-state', state);
    } else {
      status.removeAttribute('data-state');
    }
  }

  function buildMailto(email, source) {
    const subject = `Subscribe to ${newsletterName}`;
    const body = [
      `Please add ${email} to ${newsletterName}.`,
      '',
      `Source: ${source || window.location.pathname}`,
      `Page: ${window.location.href}`
    ].join('\n');

    return `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function submitNewsletterForm(form) {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const email = input ? input.value.trim() : '';
    const sourceInput = form.querySelector('input[name="source"]');
    const source = sourceInput ? sourceInput.value : (form.dataset.source || window.location.pathname);

    if (!email) {
      setStatus(form, 'Enter an email address to subscribe.', 'error');
      return;
    }

    const payload = {
      email,
      source,
      page: window.location.href,
      newsletter: newsletterName
    };

    if (button) {
      button.disabled = true;
      button.dataset.originalText = button.dataset.originalText || button.textContent;
      button.textContent = 'Subscribing...';
    }

    setStatus(form, 'Subscribing...');

    try {
      const response = await fetch(form.action || '/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result && result.fallback === 'mailto') {
          window.location.href = result.mailto || buildMailto(email, source);
          setStatus(form, 'Opening your email client to finish the subscription request.');
          return;
        }

        throw new Error(result.error || 'Subscription failed.');
      }

      form.reset();
      window.localStorage.setItem('yangmingNewsletterSubscribedAt', new Date().toISOString());
      setStatus(form, result.message || 'You are subscribed. Thank you.');
    } catch (error) {
      window.location.href = buildMailto(email, source);
      setStatus(form, 'Opening your email client to finish the subscription request.', 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Subscribe';
      }
    }
  }

  document.addEventListener('submit', function (event) {
    const form = event.target.closest('[data-newsletter-form]');
    if (!form) {
      return;
    }

    event.preventDefault();
    submitNewsletterForm(form);
  });
})();
