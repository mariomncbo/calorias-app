(() => {
  const STORAGE_KEY = 'caloriasApp.intakes';
  const addEntryButton = document.getElementById('add-entry-trigger');

  if (!addEntryButton) return;

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

    const entry = {
      id: Date.now(),
      name: trimmedName,
      kcal: calories,
      description: String(description || '').trim(),
      createdAt: new Date().toISOString()
    };
    const entries = saveEntry(entry);
    updateToday(entries);
    window.dispatchEvent(new CustomEvent('caloriasApp:intakesUpdated'));
    return true;
  }

  function createEntryCard(entry) {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative overflow-hidden rounded-xl bg-surface-container-lowest';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'absolute inset-y-0 right-0 z-0 flex w-16 items-center justify-center rounded-r-[16px] bg-error text-on-error';
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Eliminar ${entry.name}`);
    deleteButton.innerHTML = '<span class="material-symbols-outlined text-[22px]">delete</span>';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const entries = getEntries().filter(savedEntry => savedEntry.id !== entry.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      updateToday(entries);
      window.dispatchEvent(new CustomEvent('caloriasApp:intakesUpdated'));
    });

    const card = document.createElement('article');
    card.className = 'relative z-10 w-full touch-pan-y bg-surface-container-lowest rounded-xl px-4 py-4 shadow-sm cursor-pointer transition-transform transition-colors hover:bg-surface-container-low';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');

    const summary = document.createElement('div');
    summary.className = 'flex items-center justify-between gap-4';

    const name = document.createElement('span');
    name.className = 'font-body-md text-body-md text-on-surface font-medium';
    name.textContent = entry.name;

    const kcal = document.createElement('span');
    kcal.className = 'font-headline-sm text-headline-sm text-on-surface whitespace-nowrap';
    kcal.textContent = `${entry.kcal.toLocaleString('es-ES')} kcal`;
    summary.append(name, kcal);

    const details = document.createElement('div');
    details.className = 'hidden flex-col gap-2 mt-3 pt-3 border-t border-on-surface/10';

    const description = document.createElement('p');
    description.className = 'font-body-sm text-body-sm text-on-surface-variant leading-relaxed';
    description.textContent = `Descripción: ${entry.description || 'Sin descripción'}`;
    details.append(description);

    const toggleDetails = () => {
      const expanded = card.getAttribute('aria-expanded') === 'true';
      card.setAttribute('aria-expanded', String(!expanded));
      details.classList.toggle('hidden', expanded);
      details.classList.toggle('flex', !expanded);
    };

    const DELETE_OFFSET = 64;
    let startX = 0;
    let startY = 0;
    let startOffset = 0;
    let currentOffset = 0;
    let dragging = false;
    let ignoreClickUntil = 0;

    card.addEventListener('pointerdown', (event) => {
      startX = event.clientX;
      startY = event.clientY;
      startOffset = currentOffset;
      dragging = false;
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener('pointermove', (event) => {
      if (!card.hasPointerCapture(event.pointerId)) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (!dragging) {
        if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
        dragging = true;
        card.style.transition = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
      }
      const offset = Math.max(-DELETE_OFFSET, Math.min(0, startOffset + deltaX));
      currentOffset = offset;
      card.style.transform = `translateX(${offset}px)`;
    }, { passive: true });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      card.style.transition = '';
      const open = currentOffset <= -45;
      currentOffset = open ? -DELETE_OFFSET : 0;
      card.style.transform = `translateX(${currentOffset}px)`;
      if (event.type !== 'pointercancel') ignoreClickUntil = Date.now() + 300;
    };

    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
    card.addEventListener('click', (event) => {
      if (Date.now() < ignoreClickUntil) {
        event.preventDefault();
        return;
      }
      toggleDetails();
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDetails();
      }
    });

    card.append(summary, details);
    wrapper.append(deleteButton, card);
    return wrapper;
  }

  function renderEntries(entries) {
    const list = document.querySelector('[data-entries-list]');
    const emptyState = document.querySelector('[data-empty-state]');
    if (!list || !emptyState) return;

    list.replaceChildren(...entries.map(createEntryCard));
    emptyState.classList.toggle('hidden', entries.length > 0);
  }

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
    const consumed = todayEntries.reduce((total, entry) => total + entry.kcal, 0);
    const consumedLabel = document.querySelector('[data-consumed-kcal]');
    const consumedTile = document.querySelector('[data-consumed-tile]');
    const remainingCount = document.getElementById('remaining-count');
    const dailyGoal = Number.parseInt(document.getElementById('daily-goal')?.textContent.replace(/\D/g, ''), 10);
    const progressMeter = document.getElementById('progress-meter');
    const recordCount = document.querySelector('[data-record-count]');
    const remaining = Number.isFinite(dailyGoal) ? Math.max(0, dailyGoal - consumed) : null;

    if (consumedLabel) consumedLabel.textContent = `${consumed.toLocaleString('es-ES')} kcal consumidas`;
    if (consumedTile) consumedTile.textContent = consumed.toLocaleString('es-ES');
    if (remainingCount && remaining !== null) remainingCount.textContent = remaining.toLocaleString('es-ES');
    if (progressMeter && dailyGoal > 0) progressMeter.style.width = `${Math.min(100, (consumed / dailyGoal) * 100)}%`;
    if (recordCount) recordCount.textContent = `${todayEntries.length} ${todayEntries.length === 1 ? 'registro' : 'registros'}`;
    renderEntries(todayEntries);
  }

  function createButton(label, classes, type = 'button') {
    const button = document.createElement('button');
    button.type = type;
    button.className = classes;
    button.textContent = label;
    return button;
  }

  function closeModal(modal) {
    modal.remove();
    document.body.classList.remove('overflow-hidden');
  }

  function showManualForm(content, modal) {
    content.innerHTML = '';

    const heading = document.createElement('div');
    heading.className = 'flex items-start justify-between gap-4 mb-5';
    heading.innerHTML = '<div><p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Nueva ingesta</p><h2 class="font-headline-md text-headline-md text-on-surface">Añadir manualmente</h2></div>';

    const closeButton = createButton('×', 'w-10 h-10 shrink-0 rounded-full bg-surface-container-low text-on-surface text-2xl leading-none hover:bg-surface-container-high transition-colors', 'button');
    closeButton.setAttribute('aria-label', 'Cerrar');
    closeButton.addEventListener('click', () => closeModal(modal));
    heading.appendChild(closeButton);

    const form = document.createElement('form');
    form.className = 'flex flex-col gap-4';
    form.innerHTML = `
      <label class="flex flex-col gap-2">
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Nombre de la comida</span>
        <input class="w-full bg-surface-container-low rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:bg-surface-container" name="name" required type="text" placeholder="Ej. Ensalada de pollo">
      </label>
      <label class="flex flex-col gap-2">
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Kcal</span>
        <input class="w-full bg-surface-container-low rounded-xl px-4 py-3 font-numeral-metric text-numeral-metric text-primary outline-none focus:bg-surface-container" min="1" name="kcal" required type="number" placeholder="Ej. 450">
      </label>
      <label class="flex flex-col gap-2">
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Descripción <span class="normal-case tracking-normal font-normal">(Opcional)</span></span>
        <textarea class="w-full min-h-24 resize-y bg-surface-container-low rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:bg-surface-container" name="description" placeholder="Añade algún detalle"></textarea>
      </label>
    `;

    const actions = document.createElement('div');
    actions.className = 'flex gap-3 pt-2';
    const cancelButton = createButton('Cancelar', 'flex-1 h-12 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md hover:bg-surface-container transition-colors');
    cancelButton.addEventListener('click', () => closeModal(modal));
    const saveButton = createButton('Guardar ingesta', 'flex-1 h-12 rounded-xl bg-primary text-on-primary font-body-md text-body-md hover:bg-primary-container transition-colors', 'submit');
    actions.append(cancelButton, saveButton);
    form.appendChild(actions);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const saved = persistEntry({
        name: String(formData.get('name')).trim(),
        kcal: Number(formData.get('kcal')),
        description: String(formData.get('description')).trim()
      });
      if (saved) closeModal(modal);
    });

    content.append(heading, form);
    form.querySelector('input[name="name"]').focus();
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
        showAiModal(dataUrl);
      } catch {
        const dataUrl = await readFileAsDataUrl(file);
        showAiModal(dataUrl);
      }
    });
    input.click();
  }

  function openCamera() {
    triggerCamera();
  }

  function analyzeFood(dataUrl) {
    const mime = dataUrl.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
    const base64 = dataUrl.split(',')[1];
    return fetch('/.netlify/functions/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mime, base64 })
    })
      .then(async response => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error || `No se pudo analizar la foto (${response.status})`);
        }
        return payload;
      });
  }

  function fillAiForm(form, values) {
    const nameInput = form.querySelector('input[name="name"]');
    const kcalInput = form.querySelector('input[name="kcal"]');
    const descriptionInput = form.querySelector('textarea[name="description"]');
    if (nameInput) nameInput.value = values.name;
    if (kcalInput) kcalInput.value = values.kcal === '' || values.kcal === null ? '' : values.kcal;
    if (descriptionInput) descriptionInput.value = values.description;
    if (nameInput) nameInput.focus();
  }

  function showAiModal(dataUrl) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[60] flex items-end justify-center bg-on-surface/40 p-4 sm:items-center';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Registrar ingesta con IA');

    const panel = document.createElement('div');
    panel.className = 'w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl';

    const heading = document.createElement('div');
    heading.className = 'flex items-start justify-between gap-4 mb-5';
    heading.innerHTML = '<div><p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Nueva ingesta</p><h2 class="font-headline-md text-headline-md text-on-surface">Comida detectada</h2></div>';

    const closeButton = createButton('×', 'w-10 h-10 shrink-0 rounded-full bg-surface-container-low text-on-surface text-2xl leading-none hover:bg-surface-container-high transition-colors', 'button');
    closeButton.setAttribute('aria-label', 'Cerrar');
    closeButton.addEventListener('click', () => closeModal(modal));
    heading.appendChild(closeButton);

    const image = document.createElement('img');
    image.src = dataUrl;
    image.alt = 'Foto del plato';
    image.className = 'w-full aspect-square object-cover rounded-xl bg-surface-container shadow-sm';

    const status = document.createElement('div');
    status.className = 'flex items-center gap-2 py-4';
    status.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span><span class="font-body-md text-body-md text-on-surface-variant">Analizando tu comida…</span>';

    const form = document.createElement('form');
    form.className = 'hidden flex-col gap-4';
    form.innerHTML = `
      <label class="flex flex-col gap-2">
      <br>
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Nombre de la comida</span>
        <input class="w-full bg-surface-container-low rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:bg-surface-container" name="name" required type="text" placeholder="Ej. Ensalada de pollo">
      </label>
      <label class="flex flex-col gap-2">
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Kcal</span>
        <input class="w-full bg-surface-container-low rounded-xl px-4 py-3 font-numeral-metric text-numeral-metric text-primary outline-none focus:bg-surface-container" min="1" name="kcal" required type="number" placeholder="Ej. 450">
      </label>
      <label class="flex flex-col gap-2">
        <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Descripción <span class="normal-case tracking-normal font-normal">(Opcional)</span></span>
        <textarea class="w-full min-h-24 resize-y bg-surface-container-low rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:bg-surface-container" name="description" placeholder="Añade algún detalle"></textarea>
      </label>
    `;

    const actions = document.createElement('div');
    actions.className = 'flex gap-3 pt-2';
    const cancelButton = createButton('Cancelar', 'flex-1 h-12 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md hover:bg-surface-container transition-colors');
    cancelButton.addEventListener('click', () => closeModal(modal));
    const saveButton = createButton('Guardar ingesta', 'flex-1 h-12 rounded-xl bg-primary text-on-primary font-body-md text-body-md hover:bg-primary-container transition-colors', 'submit');
    actions.append(cancelButton, saveButton);
    form.appendChild(actions);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const saved = persistEntry({
        name: String(formData.get('name')).trim(),
        kcal: Number(formData.get('kcal')),
        description: String(formData.get('description')).trim()
      });
      if (saved) {
        closeModal(modal);
      }
    });

    panel.append(heading, image, status, form);
    modal.appendChild(panel);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
    document.body.appendChild(modal);
    document.body.classList.add('overflow-hidden');

    analyzeFood(dataUrl)
      .then(details => {
        const calories = Number(details.kcal);
        fillAiForm(form, {
          name: String(details.name || '').trim(),
          kcal: Number.isFinite(calories) && calories > 0 ? Math.round(calories) : '',
          description: String(details.description || '').trim()
        });
        status.classList.add('hidden');
        form.classList.toggle('hidden', false);
        form.classList.toggle('flex', true);
      })
      .catch(error => {
        const message = document.createElement('span');
        message.className = 'font-body-md text-body-md text-error';
        message.textContent = error.message || 'No se pudo analizar la foto. Complétalo a mano.';
        status.replaceChildren(message);
        form.classList.toggle('hidden', false);
        form.classList.toggle('flex', true);
      });
  }

  function openModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[60] flex items-end justify-center bg-on-surface/40 p-4 sm:items-center';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Añadir ingesta');

    const panel = document.createElement('div');
    panel.className = 'w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl';
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-6">
        <div><p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Diario de hoy</p><h2 class="font-headline-md text-headline-md text-on-surface">Añadir ingesta</h2></div>
        <button class="w-10 h-10 shrink-0 rounded-full bg-surface-container-low text-on-surface text-2xl leading-none hover:bg-surface-container-high transition-colors" type="button" aria-label="Cerrar">×</button>
      </div>
      <div class="flex flex-col gap-3">
        <button class="w-full h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all hover:bg-primary-container group" id="camera-trigger" type="button">
          <span class="material-symbols-outlined text-[20px] transition-transform group-hover:scale-105">photo_camera</span>
          <span>Usar cámara (IA)</span>
        </button>
        <button class="w-full h-12 rounded-xl bg-primary text-on-primary font-body-md text-body-md flex items-center justify-center gap-2 opacity-50 cursor-not-allowed" type="button">
          <span class="material-symbols-outlined text-[20px]">edit</span>
          <span>Añadir manualmente</span>
        </button>
      </div>
    `;

    const closeButton = content.querySelector('button[aria-label="Cerrar"]');
    closeButton.addEventListener('click', () => closeModal(modal));
    content.querySelector('#camera-trigger').addEventListener('click', () => {
      closeModal(modal);
      openCamera();
    });
    content.querySelectorAll('button')[2].addEventListener('click', () => showManualForm(content, modal));
    panel.appendChild(content);
    modal.appendChild(panel);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
    document.body.appendChild(modal);
    document.body.classList.add('overflow-hidden');
  }

  let lastRenderDate = toDateString(new Date());

  function refreshIfDayChanged() {
    const today = toDateString(new Date());
    if (today !== lastRenderDate) {
      lastRenderDate = today;
      updateToday(getEntries());
    }
  }

  addEntryButton.addEventListener('click', openModal);
  updateToday(getEntries());
  window.addEventListener('caloriasApp:goalUpdated', () => updateToday(getEntries()));
  document.addEventListener('visibilitychange', refreshIfDayChanged);
  window.addEventListener('focus', refreshIfDayChanged);
})();
