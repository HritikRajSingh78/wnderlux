
const EMAILJS_SERVICE_ID          = 'service_wanderlux';
const EMAILJS_TEMPLATE_APPOINTMENT = 'template_5s71xa5';
const EMAILJS_TEMPLATE_CONTACT    = 'template_fz5ia9q';
const EMAILJS_PUBLIC_KEY          = 'sfS7T67bghsMJoxhn';

/* ── Validators ── */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s+\-().]{7,20}$/;

function isValidEmail(v) { return emailRegex.test(v.trim()); }
function isValidPhone(v) { return phoneRegex.test(v.trim()); }

/* ── Set field state (error / success / neutral) ── */
function setFieldState(input, state, message = '') {
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.remove('error', 'success');
  const errEl = group.querySelector('.error-msg');
  if (state === 'error') {
    group.classList.add('error');
    if (errEl) errEl.textContent = message;
  } else if (state === 'success') {
    group.classList.add('success');
  }
}

/* ── Validate a single input ── */
function validateInput(input) {
  const val = input.value.trim();

  if (input.required && !val) {
    setFieldState(input, 'error', 'This field is required.');
    return false;
  }
  if (input.type === 'email' && val && !isValidEmail(val)) {
    setFieldState(input, 'error', 'Enter a valid email address.');
    return false;
  }
  if (input.type === 'tel' && val && !isValidPhone(val)) {
    setFieldState(input, 'error', 'Enter a valid phone number.');
    return false;
  }
  if (input.type === 'date' && val && input.required) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [y, m, d] = val.split('-').map(Number);
    const chosen = new Date(y, m - 1, d);
    if (chosen < today) {
      setFieldState(input, 'error', 'Please choose a future date.');
      return false;
    }
  }

  if (val) setFieldState(input, 'success');
  return true;
}

/* ── Validate an entire form ── */
function validateForm(form) {
  let allValid = true;
  form.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
    if (!validateInput(input)) allValid = false;
  });
  return allValid;
}

/* ── Set minimum date on date inputs ── */
function setMinDates() {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => input.setAttribute('min', today));
}

/* ── Show success state (hide form, reveal panel) ── */
function showSuccess(formId, successId) {
  const form    = document.getElementById(formId);
  const success = document.getElementById(successId);
  if (form)    form.style.display = 'none';
  if (success) success.classList.add('visible');
}

/* ── Appointment form ── */
function initAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  /* Live validation on blur */
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group?.classList.contains('error')) validateInput(input);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const params = {
      from_name:      form.querySelector('[name="name"]').value.trim(),
      from_email:     form.querySelector('[name="email"]').value.trim(),
      phone:          form.querySelector('[name="phone"]').value.trim(),
      preferred_date: form.querySelector('[name="date"]').value,
      destination:    form.querySelector('[name="destination"]').value,
      message:        form.querySelector('[name="message"]').value.trim(),
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_APPOINTMENT,
        params,
        EMAILJS_PUBLIC_KEY
      );
      showSuccess('appointment-form', 'appointment-success');
    } catch (err) {
      console.error('EmailJS error:', err);
      btn.textContent = orig;
      btn.disabled = false;
      alert('Could not send your request. Please try again or contact us at hello@wanderlux.com.au');
    }
  });
}

/* ── Contact form ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group?.classList.contains('error')) validateInput(input);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const params = {
      from_name:  form.querySelector('[name="name"]').value.trim(),
      from_email: form.querySelector('[name="email"]').value.trim(),
      subject:    form.querySelector('[name="subject"]').value.trim(),
      message:    form.querySelector('[name="message"]').value.trim(),
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_CONTACT,
        params,
        EMAILJS_PUBLIC_KEY
      );
      showSuccess('contact-form', 'contact-success');
    } catch (err) {
      console.error('EmailJS error:', err);
      btn.textContent = orig;
      btn.disabled = false;
      alert('Could not send your message. Please email us at hello@wanderlux.com.au');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setMinDates();
  initAppointmentForm();
  initContactForm();
});
