/* Interfaz compartida: saludo, controles de formulario, hojas modales. */
(() => {
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  function el(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function svgClose() {
    return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  }

  /* ---------------------------------------------------------------------
     Saludo y fecha
     --------------------------------------------------------------------- */
  function updateGreetingAndDate() {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour >= 5 && hour < 13 ? 'Buenos días' : hour >= 13 && hour < 20 ? 'Buenas tardes' : 'Buenas noches';

    const greetingNode = document.getElementById('greeting');
    const dateNode = document.getElementById('current-date');
    if (greetingNode) greetingNode.textContent = greeting;
    if (dateNode) {
      const label = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).format(now);
      dateNode.textContent = label.charAt(0).toUpperCase() + label.slice(1);
    }
  }

  updateGreetingAndDate();
  const midnight = new Date();
  midnight.setHours(24, 0, 1, 0);
  setTimeout(() => {
    updateGreetingAndDate();
    setInterval(updateGreetingAndDate, 60000);
  }, midnight - Date.now());

  requestAnimationFrame(() => document.body.classList.add('is-ready'));

  /* ---------------------------------------------------------------------
     Grupos de elección (segmentados y listas de radio)
     --------------------------------------------------------------------- */
  function syncTabIndex(group) {
    const choices = [...group.querySelectorAll('[data-choice]')];
    const checked = choices.find(choice => choice.getAttribute('aria-checked') === 'true') || choices[0];
    choices.forEach(choice => {
      choice.tabIndex = choice === checked ? 0 : -1;
    });
  }

  function check(group, choice) {
    group.querySelectorAll('[data-choice]').forEach(option => {
      option.setAttribute('aria-checked', String(option === choice));
    });
    syncTabIndex(group);
  }

  document.querySelectorAll('[data-choice-group]').forEach(group => {
    group.addEventListener('click', event => {
      const choice = event.target.closest('[data-choice]');
      if (!choice || !group.contains(choice)) return;
      check(group, choice);
    });

    group.addEventListener('keydown', event => {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const choices = [...group.querySelectorAll('[data-choice]')];
      const focused = document.activeElement.closest('[data-choice]');
      const index = Math.max(0, choices.indexOf(focused));
      let next = index;

      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = choices.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % choices.length;
      else next = (index - 1 + choices.length) % choices.length;

      check(group, choices[next]);
      choices[next].focus();
    });

    syncTabIndex(group);
  });

  /* ---------------------------------------------------------------------
     Steppers numéricos
     --------------------------------------------------------------------- */
  function clamp(value, input) {
    const min = input.min === '' ? -Infinity : Number(input.min);
    const max = input.max === '' ? Infinity : Number(input.max);
    return Math.min(max, Math.max(min, value));
  }

  document.querySelectorAll('[data-stepper]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.stepper);
      if (!input) return;

      const step = Number(button.dataset.step) || 1;
      const base = Number.parseFloat(input.value);
      const current = Number.isFinite(base) ? base : Number(input.min) || 0;
      const next = clamp(current + step, input);

      input.value = String(Math.round(next * 100) / 100);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  /* ---------------------------------------------------------------------
     Hojas modales
     --------------------------------------------------------------------- */
  function translateY(element) {
    const transform = window.getComputedStyle(element).transform;
    if (!transform || transform === 'none') return 0;
    try {
      return new DOMMatrixReadOnly(transform).m42;
    } catch {
      return 0;
    }
  }

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openSheet({ title, body = el('div'), onClose }) {
    const previouslyFocused = document.activeElement;
    const scrim = el('div', 'scrim');
    const sheet = el('div', 'sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', title);
    sheet.tabIndex = -1;

    const zone = el('div', 'sheet__zone');
    zone.innerHTML = '<div class="sheet__grip" aria-hidden="true"></div>';

    const head = el('div', 'sheet__head');
    const heading = el('h2');
    heading.textContent = title;

    const closeButton = el('button', 'icon-btn');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Cerrar');
    closeButton.innerHTML = svgClose();

    head.append(heading, closeButton);
    zone.append(head);

    body.classList.add('sheet__body');
    sheet.append(zone, body);
    scrim.append(sheet);

    let closed = false;

    function close() {
      if (closed) return;
      closed = true;

      const finish = () => {
        scrim.remove();
        document.body.classList.remove('is-locked');
        if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true });
        if (typeof onClose === 'function') onClose();
      };

      if (REDUCED_MOTION.matches) {
        finish();
        return;
      }

      sheet.style.transition = 'transform 0.24s var(--ease)';
      sheet.style.transform = 'translateY(100%)';
      scrim.style.transition = 'opacity 0.24s ease';
      scrim.style.opacity = '0';
      setTimeout(finish, 240);
    }

    closeButton.addEventListener('click', close);
    scrim.addEventListener('click', event => {
      if (event.target === scrim) close();
    });

    scrim.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = [...sheet.querySelectorAll(FOCUSABLE)].filter(node => node.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    /* Arrastre desde la cabecera para cerrar, con traspaso de velocidad. */
    let drag = null;

    zone.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      drag = {
        startY: event.clientY,
        origin: translateY(sheet),
        lastY: event.clientY,
        lastTime: performance.now(),
        velocity: 0
      };
      sheet.style.animation = 'none';
      sheet.style.transition = 'none';
      zone.setPointerCapture(event.pointerId);
    });

    zone.addEventListener('pointermove', event => {
      if (!drag) return;
      let offset = drag.origin + (event.clientY - drag.startY);
      if (offset < 0) offset /= 3;

      sheet.style.transform = `translateY(${offset}px)`;

      const now = performance.now();
      const elapsed = now - drag.lastTime;
      if (elapsed > 0) drag.velocity = (event.clientY - drag.lastY) / elapsed;
      drag.lastY = event.clientY;
      drag.lastTime = now;
    });

    function endDrag(event) {
      if (!drag) return;
      const finished = drag;
      drag = null;

      const offset = translateY(sheet);
      const thrown = event.type !== 'pointercancel' && (offset > 96 || finished.velocity > 0.55);

      if (thrown) {
        close();
        return;
      }

      sheet.style.transition = 'transform 0.34s var(--ease)';
      sheet.style.transform = 'translateY(0px)';
    }

    zone.addEventListener('pointerup', endDrag);
    zone.addEventListener('pointercancel', endDrag);

    document.body.append(scrim);
    document.body.classList.add('is-locked');

    sheet.focus({ preventScroll: true });

    return { sheet, body, close, setTitle: value => { heading.textContent = value; sheet.setAttribute('aria-label', value); } };
  }

  function confirmSheet({ title, message, confirmText = 'Borrar', cancelText = 'Cancelar', tone = 'danger' }) {
    return new Promise(resolve => {
      let settled = false;
      const body = el('div');
      const copy = el('p', 'empty');
      copy.style.padding = '0 0 8px';
      copy.textContent = message;

      const actions = el('div', 'sheet__actions');
      const cancel = el('button', 'btn btn--ghost');
      cancel.type = 'button';
      cancel.textContent = cancelText;

      const accept = el('button', `btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`);
      accept.type = 'button';
      accept.textContent = confirmText;

      actions.append(cancel, accept);
      body.append(copy, actions);

      const sheet = openSheet({
        title,
        body,
        onClose: () => {
          if (settled) return;
          settled = true;
          resolve(false);
        }
      });

      cancel.addEventListener('click', () => {
        sheet.close();
      });

      accept.addEventListener('click', () => {
        settled = true;
        resolve(true);
        sheet.close();
      });
    });
  }

  window.AppUI = { openSheet, confirm: confirmSheet, el };
})();
