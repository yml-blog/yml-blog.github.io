(function () {
  const NEWSLETTER_API_PATH = '/api/newsletter-subscribe';
  const NEWSLETTER_FORM_ACTION_URL = NEWSLETTER_API_PATH;
  const NEWSLETTER_NAME = "Yangming Li's Newsletter";
  const SUCCESS_MESSAGE = 'Thanks - please check your email to confirm your subscription.';
  const ERROR_MESSAGE = 'Subscription request failed. Please try again later.';
  const INVALID_EMAIL_MESSAGE = 'Please enter a valid email address.';
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function findSuccessMessage(form) {
    return form.querySelector('[data-newsletter-success]');
  }

  function findErrorMessage(form) {
    return form.querySelector('[data-newsletter-error]');
  }

  function clearMessages(form) {
    const success = findSuccessMessage(form);
    const error = findErrorMessage(form);

    if (success) {
      success.textContent = '';
      success.removeAttribute('data-state');
    }

    if (error && error !== success) {
      error.textContent = '';
      error.removeAttribute('data-state');
    }
  }

  function showSuccess(form, message) {
    clearMessages(form);
    const success = findSuccessMessage(form);
    if (success) {
      success.textContent = message;
      success.setAttribute('data-state', 'success');
    }
  }

  function showError(form, message) {
    clearMessages(form);
    const error = findErrorMessage(form);
    if (error) {
      error.textContent = message;
      error.setAttribute('data-state', 'error');
    }
  }

  function getConfiguredActionUrl(form) {
    const globalAction = String(window.NEWSLETTER_FORM_ACTION_URL || '').trim();
    const localAction = String(NEWSLETTER_FORM_ACTION_URL || '').trim();
    const formAction = String(form.getAttribute('action') || '').trim();
    const candidates = [globalAction, localAction, formAction];

    return candidates.find(function (candidate) {
      return candidate &&
        !/^\/api\/subscribe(?:$|[?#])/.test(candidate) &&
        !candidate.toLowerCase().startsWith('mailto:');
    }) || NEWSLETTER_API_PATH;
  }

  function ensureHiddenField(form, name, value) {
    let field = form.querySelector(`input[name="${name}"]`);

    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }

    field.value = value;
  }

  function prepareForm(form) {
    const actionUrl = getConfiguredActionUrl(form);

    if (actionUrl) {
      form.setAttribute('action', actionUrl);
    }

    if (!form.getAttribute('method')) {
      form.setAttribute('method', 'post');
    }

    if (!form.querySelector('input[name="source"]')) {
      ensureHiddenField(form, 'source', form.dataset.source || window.location.pathname);
    }
  }

  function setButtonState(button, isSubmitting) {
    if (!button) {
      return;
    }

    if (isSubmitting) {
      button.disabled = true;
      button.dataset.originalText = button.dataset.originalText || button.textContent;
      button.textContent = 'Subscribing...';
      return;
    }

    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Subscribe';
  }

  async function submitNewsletterForm(form) {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const email = input ? input.value.trim() : '';
    const actionUrl = getConfiguredActionUrl(form);

    if (!email || !EMAIL_PATTERN.test(email)) {
      showError(form, INVALID_EMAIL_MESSAGE);
      if (input) {
        input.focus();
      }
      return;
    }

    prepareForm(form);
    ensureHiddenField(form, 'page', window.location.href);
    ensureHiddenField(form, 'newsletter', NEWSLETTER_NAME);
    setButtonState(button, true);
    clearMessages(form);

    try {
      const honeypot = form.querySelector('input[name="website"]');
      const source = form.querySelector('input[name="source"]');
      const response = await fetch(actionUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          source: source ? source.value : (form.dataset.source || window.location.pathname),
          page: window.location.href,
          website: honeypot ? honeypot.value : ''
        })
      });
      const data = await response.json().catch(function () {
        return {};
      });

      if (!response.ok || !data.ok) {
        showError(form, data.message || ERROR_MESSAGE);
        return;
      }

      form.reset();
      window.localStorage.setItem('yangmingNewsletterSubscribedAt', new Date().toISOString());
      showSuccess(form, data.message || SUCCESS_MESSAGE);
    } catch (error) {
      showError(form, ERROR_MESSAGE);
    } finally {
      setButtonState(button, false);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-newsletter-form]').forEach(prepareForm);
  });

  document.addEventListener('submit', function (event) {
    const form = event.target.closest('[data-newsletter-form]');
    if (!form) {
      return;
    }

    event.preventDefault();
    submitNewsletterForm(form);
  });
})();
