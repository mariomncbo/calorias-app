/* Registro de ingestas: filas del diario, hojas de alta y análisis con IA. */
(() => {
  const STORAGE_KEY = 'caloriasApp.intakes';
  const addEntryButton = document.getElementById('add-entry-trigger');
  const { openSheet } = window.AppUI;

  if (!addEntryButton) return;

  const SVG_TRASH = '<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5.5h13M8 3.5h4M5 5.5l.7 9.4a1.4 1.4 0 0 0 1.4 1.3h5.8a1.4 1.4 0 0 0 1.4-1.3l.7-9.4"/><path d="M8.2 8.6v4.8M11.8 8.6v4.8"/></svg>';

  function getEntries() {
    try {
      const entries = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(entries) ? entries : [];
    } catch {
      return [];
    }
  }

  function saveEntry(entry) {
    const entries = getEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return entries;
  }

  function persistEntry({ name, kcal, description }) {
    const trimmedName = String(name || '').trim();
    const calories = Number(kcal);
    if (!trimmedName || !Number.isFinite(calories) || calories <= 0) return false;

    const entries = saveEntry({
      id: Date.now(),
      name: trimmedName,
      kcal: calories,
      description: String(description || '').trim(),
      createdAt: new Date().toISOString()
    });

    updateToday(entries);
    window.dispatchEvent(new CustomEvent('caloriasApp:intakesUpdated'));
    return true;
  }

  function announce(text) {
    const live = document.getElementById('log-status');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => {
      live.textContent = text;
    });
  }

  /* ---------------------------------------------------------------------
     Filas del diario
     --------------------------------------------------------------------- */
  function removeEntry(id, label) {
    const entries = getEntries().filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    updateToday(entries);
    window.dispatchEvent(new CustomEvent('caloriasApp:intakesUpdated'));
    announce(`${label} eliminada.`);
  }

  function createEntryCard(entry) {
    const wrapper = document.createElement('div');
    wrapper.className = 'entry-wrap';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'entry__delete';
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Eliminar ${entry.name}`);
    deleteButton.setAttribute('aria-hidden', 'true');
    deleteButton.tabIndex = -1;
    deleteButton.innerHTML = SVG_TRASH;
    deleteButton.addEventListener('click', () => removeEntry(entry.id, entry.name));

    const card = document.createElement('article');
    card.className = 'entry';
    card.setAttribute('aria-expanded', 'false');

    const summary = document.createElement('button');
    summary.className = 'entry__summary';
    summary.type = 'button';

    const name = document.createElement('span');
    name.className = 'entry__name';
    name.textContent = entry.name;

    const kcal = document.createElement('span');
    kcal.className = 'entry__kcal';
    const value = document.createElement('b');
    value.textContent = Number(entry.kcal).toLocaleString('es-ES');
    const unit = document.createElement('span');
    unit.textContent = 'kcal';
    kcal.append(value, unit);

    summary.append(name, kcal);

    const details = document.createElement('div');
    details.className = 'entry__details';
    const inner = document.createElement('div');

    const description = document.createElement('p');
    description.className = 'entry__desc';
    description.textContent = entry.description || 'Sin descripción.';

    const remove = document.createElement('button');
    remove.className = 'entry__remove';
    remove.type = 'button';
    remove.textContent = 'Eliminar ingesta';
    remove.addEventListener('click', () => removeEntry(entry.id, entry.name));

    inner.append(description, remove);
    details.append(inner);

    const DELETE_WIDTH = 74;
    let startX = 0;
    let startY = 0;
    let baseOffset = 0;
    let offset = 0;
    let dragging = false;
    let ignoreClickUntil = 0;

    summary.addEventListener('click', () => {
      if (Date.now() < ignoreClickUntil) return;
      if (offset !== 0) {
        offset = 0;
        card.style.transform = 'translateX(0px)';
        return;
      }
      const expanded = card.getAttribute('aria-expanded') === 'true';
      card.setAttribute('aria-expanded', String(!expanded));
    });

    card.addEventListener('pointerdown', event => {
      if (event.target.closest('.entry__remove')) return;
      startX = event.clientX;
      startY = event.clientY;
      baseOffset = offset;
      dragging = false;
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener('pointermove', event => {
      if (!card.hasPointerCapture(event.pointerId)) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!dragging) {
        if (Math.abs(deltaX) < 8 || Math.abs(deltaX) < Math.abs(deltaY)) return;
        dragging = true;
        card.style.transition = 'none';
      }

      offset = Math.max(-DELETE_WIDTH, Math.min(0, baseOffset + deltaX));
      card.style.transform = `translateX(${offset}px)`;
    }, { passive: true });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      card.style.transition = '';
      offset = offset <= -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0;
      card.style.transform = `translateX(${offset}px)`;
      ignoreClickUntil = Date.now() + 260;
    }

    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);

    card.append(summary, details);
    wrapper.append(deleteButton, card);
    return wrapper;
  }

  function renderEntries(entries) {
    const list = document.querySelector('[data-entries-list]');
    const empty = document.querySelector('[data-view="hoy"] [data-empty-state]');
    if (!list) return;

    list.replaceChildren(...entries.map(createEntryCard));
    if (empty) empty.classList.toggle('hidden', entries.length > 0);
  }

  /* ---------------------------------------------------------------------
     Balance del día
     --------------------------------------------------------------------- */
  function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayEntries(entries) {
    const today = toDateString(new Date());
    return entries.filter(entry => entry?.createdAt && toDateString(new Date(entry.createdAt)) === today);
  }

  function updateToday(entries) {
    const todayEntries = getTodayEntries(entries);
    const consumed = todayEntries.reduce((total, entry) => total + (Number(entry.kcal) || 0), 0);

    const goalNode = document.getElementById('daily-goal');
    const goal = Number.parseInt((goalNode?.textContent || '').replace(/\D/g, ''), 10) || 2220;
    const remaining = goal - consumed;
    const isOver = remaining < 0;

    document.querySelectorAll('[data-consumed-tile]').forEach(node => {
      node.textContent = consumed.toLocaleString('es-ES');
    });

    const remainingNode = document.getElementById('remaining-count');
    if (remainingNode) remainingNode.textContent = Math.abs(remaining).toLocaleString('es-ES');

    const remainingLabel = document.getElementById('remaining-label');
    if (remainingLabel) remainingLabel.textContent = isOver ? 'por encima' : 'restantes';

    document.querySelector('.balance')?.classList.toggle('is-over', isOver);

    const meter = document.getElementById('progress-meter');
    if (meter) meter.style.setProperty('--fill', `${Math.min(100, (consumed / goal) * 100)}%`);

    const goalLabel = document.getElementById('daily-goal-label');
    if (goalLabel) goalLabel.textContent = `meta ${goal.toLocaleString('es-ES')} kcal`;

    const track = document.getElementById('progress-track');
    if (track) {
      track.setAttribute('aria-valuemax', String(goal));
      track.setAttribute('aria-valuenow', String(Math.min(consumed, goal)));
      track.setAttribute('aria-valuetext', `${consumed} de ${goal} kcal consumidas`);
    }

    const recordCount = document.querySelector('[data-record-count]');
    if (recordCount) {
      recordCount.textContent = `${todayEntries.length} ${todayEntries.length === 1 ? 'registro' : 'registros'}`;
    }

    renderEntries(todayEntries);
  }

  /* ---------------------------------------------------------------------
     Formularios
     --------------------------------------------------------------------- */
  function buildForm({ submitLabel = 'Guardar', values = {}, onSave }) {
    const form = document.createElement('form');
    form.noValidate = true;
    form.className = 'entry-form';
    form.innerHTML = `
      <div class="field">
        <label class="label" for="entry-name">Nombre</label>
        <input class="input" id="entry-name" name="name" placeholder="Ej. Ensalada de pollo" required type="text">
      </div>
      <div class="field">
        <label class="label" for="entry-kcal">Kcal</label>
        <input class="input" id="entry-kcal" inputmode="numeric" min="1" name="kcal" placeholder="Ej. 450" required type="number">
      </div>
      <div class="field">
        <label class="label" for="entry-desc">Descripción <span class="hint">opcional</span></label>
        <textarea class="input" id="entry-desc" name="description" placeholder="Añade algún detalle"></textarea>
      </div>
      <p class="form-status" role="status"></p>
      <div class="sheet__actions">
        <button class="btn btn--ghost" data-cancel type="button">Cancelar</button>
        <button class="btn btn--primary" type="submit">${submitLabel}</button>
      </div>
    `;

    const nameInput = form.querySelector('[name="name"]');
    const kcalInput = form.querySelector('[name="kcal"]');
    const descriptionInput = form.querySelector('[name="description"]');
    const status = form.querySelector('.form-status');

    nameInput.value = values.name || '';
    kcalInput.value = values.kcal ? String(values.kcal) : '';
    descriptionInput.value = values.description || '';

    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const kcal = Number(data.get('kcal'));

      if (!name) {
        status.textContent = 'Ponle un nombre a la comida.';
        nameInput.focus();
        return;
      }

      if (!Number.isFinite(kcal) || kcal <= 0) {
        status.textContent = 'Indica las kcal, un número mayor que cero.';
        kcalInput.focus();
        return;
      }

      status.textContent = '';
      onSave({ name, kcal: Math.round(kcal), description: String(data.get('description') || '').trim() });
    });

    return form;
  }

  /* ---------------------------------------------------------------------
     Hojas de alta
     --------------------------------------------------------------------- */
  function openManualSheet() {
    const body = document.createElement('div');
    const sheet = openSheet({ title: 'Anotar a mano', body });

    const form = buildForm({
      submitLabel: 'Guardar',
      onSave: values => {
        if (!persistEntry(values)) return;
        announce('Ingesta guardada.');
        sheet.close();
      }
    });

    form.querySelector('[data-cancel]').addEventListener('click', () => sheet.close());
    body.append(form);
    form.querySelector('[name="name"]').focus({ preventScroll: true });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.addEventListener('error', () => reject(reader.error));
      reader.readAsDataURL(file);
    });
  }

  function compressImage(file, maxSize = 1280, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.addEventListener('load', () => {
        try {
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(objectUrl);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      });
      image.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('No se pudo decodificar la imagen'));
      });
      image.src = objectUrl;
    });
  }

  function triggerCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.remove();
      if (!file) return;

      try {
        const dataUrl = await compressImage(file);
        openAnalysisSheet(dataUrl);
      } catch {
        const dataUrl = await readFileAsDataUrl(file);
        openAnalysisSheet(dataUrl);
      }
    });

    input.click();
  }

  function analyzeFood(dataUrl) {
    const mime = dataUrl.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
    const base64 = dataUrl.split(',')[1];
    return fetch('/.netlify/functions/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mime, base64 })
    }).then(async response => {
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || `No se pudo analizar la foto (${response.status})`);
      }
      return payload;
    });
  }

  function openAnalysisSheet(dataUrl) {
    const sheet = openSheet({ title: 'Comida detectada', body: document.createElement('div') });
    const { body } = sheet;

    const photo = document.createElement('div');
    photo.className = 'photo';
    const image = new Image();
    image.src = dataUrl;
    image.alt = 'Foto del plato';
    const scan = document.createElement('div');
    scan.className = 'photo__scan';
    photo.append(image, scan);

    const analyzing = document.createElement('div');
    analyzing.className = 'analyzing';
    analyzing.innerHTML = '<p>Analizando la foto…</p><div class="skel skel--lg"></div><div class="skel skel--sm"></div>';
    body.append(photo, analyzing);

    function mountForm(values, note) {
      scan.remove();
      const form = buildForm({
        submitLabel: 'Guardar ingesta',
        values,
        onSave: entry => {
          if (!persistEntry(entry)) return;
          announce('Ingesta guardada.');
          sheet.close();
        }
      });
      form.querySelector('[data-cancel]').addEventListener('click', () => sheet.close());

      const parts = [photo];
      if (note === 'error') {
        const warning = document.createElement('p');
        warning.className = 'form-status';
        warning.style.paddingTop = '14px';
        warning.textContent = 'No se pudo leer la foto. Puedes anotarlo a mano.';
        parts.push(warning);
      }
      parts.push(form);

      body.replaceChildren(...parts);
      form.querySelector('[name="name"]').focus({ preventScroll: true });
    }

    analyzeFood(dataUrl)
      .then(details => {
        const calories = Number(details.kcal);
        mountForm({
          name: String(details.name || '').trim(),
          kcal: Number.isFinite(calories) && calories > 0 ? Math.round(calories) : '',
          description: String(details.description || '').trim()
        });
      })
      .catch(() => mountForm({}, 'error'));
  }

  function openAddSheet() {
    const body = document.createElement('div');

    const primary = document.createElement('button');
    primary.className = 'btn btn--primary btn--block';
    primary.type = 'button';
    primary.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.5h2.2l1.1-1.8h6.4l1.1 1.8h2.2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"/><circle cx="10" cy="10.7" r="2.8"/></svg><span>Hacer una foto</span>';

    const secondary = document.createElement('button');
    secondary.className = 'btn btn--ghost btn--block';
    secondary.type = 'button';
    secondary.innerHTML = '<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13.2 3.3a1.6 1.6 0 0 1 2.3 2.3L6.3 15H3.5v-2.8l9.7-8.9Z"/></svg><span>Escribir a mano</span>';

    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.style.paddingTop = '14px';
    hint.textContent = 'Con una foto, la IA estima el nombre y las kcal. Siempre puedes corregirlos antes de guardar.';

    const actions = document.createElement('div');
    actions.className = 'sheet__actions sheet__actions--stack';
    actions.append(primary, secondary);

    body.append(actions, hint);

    const sheet = openSheet({ title: 'Anotar comida', body });
    primary.addEventListener('click', () => {
      sheet.close();
      triggerCamera();
    });
    secondary.addEventListener('click', () => {
      sheet.close();
      openManualSheet();
    });
  }

  /* ---------------------------------------------------------------------
     Arranque
     --------------------------------------------------------------------- */
  let lastRenderDate = toDateString(new Date());

  function refreshIfDayChanged() {
    const today = toDateString(new Date());
    if (today !== lastRenderDate) {
      lastRenderDate = today;
      updateToday(getEntries());
    }
  }

  addEntryButton.addEventListener('click', openAddSheet);
  updateToday(getEntries());
  window.addEventListener('caloriasApp:goalUpdated', () => updateToday(getEntries()));
  document.addEventListener('visibilitychange', refreshIfDayChanged);
  window.addEventListener('focus', refreshIfDayChanged);
})();
