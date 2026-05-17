/* ── Destination preset rates (USD per day) ── */
const DESTINATIONS = {
  bali:     { label: 'Bali, Indonesia',    daily: 80,  accommodation: 60  },
  paris:    { label: 'Paris, France',      daily: 150, accommodation: 120 },
  maldives: { label: 'Maldives',           daily: 200, accommodation: 180 },
  tokyo:    { label: 'Tokyo, Japan',       daily: 130, accommodation: 100 },
  sydney:   { label: 'Sydney, Australia',  daily: 120, accommodation: 90  },
  newyork:  { label: 'New York, USA',      daily: 160, accommodation: 140 },
  rome:     { label: 'Rome, Italy',        daily: 135, accommodation: 105 },
  dubai:    { label: 'Dubai, UAE',         daily: 175, accommodation: 150 },
};

/* ── Travel style multipliers ── */
const STYLES = {
  budget:   { label: 'Budget',   multiplier: 0.8  },
  standard: { label: 'Standard', multiplier: 1.0  },
  luxury:   { label: 'Luxury',   multiplier: 1.6  },
};

/* ── Field validation helpers ── */
function setError(id, message) {
  const el    = document.getElementById(id);
  const group = el?.closest('.form-group') || document.getElementById(id + '-group');
  if (!group) return;
  group.classList.add('error');
  const msg = group.querySelector('.error-msg');
  if (msg) msg.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('#calc-form .form-group').forEach(g => g.classList.remove('error'));
  const styleGroup = document.getElementById('style-group');
  if (styleGroup) styleGroup.classList.remove('error');
}

function validateInputs(dest, travellers, days, style) {
  const errors = {};
  if (!dest)                              errors.destination = 'Please select a destination.';
  if (!travellers || travellers < 1 || travellers > 20) errors.travellers = 'Enter a number between 1 and 20.';
  if (!days      || days < 1      || days > 30)         errors.days       = 'Enter a number between 1 and 30.';
  if (!style)                             errors.style = 'Please choose a travel style.';
  return errors;
}

/* ── Core calculation formula ── */
function calculate(destKey, travellers, days, styleKey) {
  const dest  = DESTINATIONS[destKey];
  const style = STYLES[styleKey];
  const dailySubtotal = dest.daily * travellers * days;
  const accomSubtotal = dest.accommodation * days;
  const raw           = (dailySubtotal + accomSubtotal) * style.multiplier;
  return {
    total:         Math.round(raw),
    dailySubtotal,
    accomSubtotal,
    subtotal:      dailySubtotal + accomSubtotal,
    destLabel:     dest.label,
    styleLabel:    style.label,
    multiplier:    style.multiplier,
  };
}

/* ── Render result panel ── */
function renderResult(result, travellers, days) {
  const panel = document.getElementById('result-panel');
  if (!panel) return;

  const plural = n => n > 1 ? 's' : '';

  document.getElementById('result-cost').textContent =
    `$${result.total.toLocaleString()}`;

  document.getElementById('result-message').textContent =
    `Estimated cost for ${travellers} traveller${plural(travellers)} to ${result.destLabel} `
    + `for ${days} day${plural(days)}: $${result.total.toLocaleString()} – ${result.styleLabel} Travel Package.`;

  document.getElementById('bd-daily').textContent    = `$${result.dailySubtotal.toLocaleString()}`;
  document.getElementById('bd-accom').textContent    = `$${result.accomSubtotal.toLocaleString()}`;
  document.getElementById('bd-subtotal').textContent = `$${result.subtotal.toLocaleString()}`;
  document.getElementById('bd-style').textContent    = `× ${result.multiplier} (${result.styleLabel})`;
  document.getElementById('bd-total').textContent    = `$${result.total.toLocaleString()}`;

  panel.classList.add('visible');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Wire up form ── */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const dest      = form.destination.value;
    const travellers = parseInt(form.travellers.value, 10);
    const days       = parseInt(form.days.value, 10);
    const styleEl    = form.querySelector('input[name="style"]:checked');
    const style      = styleEl ? styleEl.value : '';

    const errors = validateInputs(dest, travellers, days, style);

    if (Object.keys(errors).length) {
      if (errors.destination) setError('destination', errors.destination);
      if (errors.travellers)  setError('travellers',  errors.travellers);
      if (errors.days)        setError('days',        errors.days);
      if (errors.style) {
        const sg = document.getElementById('style-group');
        if (sg) {
          sg.classList.add('error');
          const msg = sg.querySelector('.error-msg');
          if (msg) msg.textContent = errors.style;
        }
      }
      return;
    }

    const result = calculate(dest, travellers, days, style);
    renderResult(result, travellers, days);
  });

  /* Reset result when inputs change */
  form.addEventListener('change', () => {
    const panel = document.getElementById('result-panel');
    if (panel) panel.classList.remove('visible');
    clearErrors();
  });
});
