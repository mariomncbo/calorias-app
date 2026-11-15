/* Historial: cada día como una línea del libro mayor. */
(() => {
  const GOAL_KEY = 'caloriasApp.goal';
  const INTAKES_KEY = 'caloriasApp.intakes';
  const DEFAULT_GOAL = 2220;

  function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function loadGoalCalories() {
    try {
      const goal = JSON.parse(localStorage.getItem(GOAL_KEY));
      if (Number.isFinite(goal?.dailyCalories) && goal.dailyCalories > 0) return goal.dailyCalories;
    } catch {}
    return DEFAULT_GOAL;
  }

  function loadIntakes() {
    try {
      const stored = JSON.parse(localStorage.getItem(INTAKES_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function groupByDate(intakes) {
    const grouped = new Map();
    intakes.forEach(entry => {
      if (!entry?.createdAt) return;
      const key = toDateString(new Date(entry.createdAt));
      const record = grouped.get(key) || { date: key, consumed: 0 };
      record.consumed += Number(entry.kcal) || 0;
      grouped.set(key, record);
    });
    return [...grouped.values()].sort((a, b) => b.date.localeCompare(a.date));
  }

  function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const label = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      .format(new Date(year, month - 1, day));
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function createRow(record, goal) {
    const over = record.consumed > goal;
    const row = document.createElement('div');
    row.className = `hist-row${over ? ' is-over' : ''}`;

    const top = document.createElement('div');
    top.className = 'hist-row__top';

    const date = document.createElement('span');
    date.className = 'hist-row__date';
    date.textContent = formatDate(record.date);

    const kcal = document.createElement('span');
    kcal.className = 'hist-row__kcal';
    kcal.textContent = record.consumed.toLocaleString('es-ES');

    top.append(date, kcal);

    const bar = document.createElement('div');
    bar.className = 'hist-row__bar';
    const fill = document.createElement('i');
    fill.style.width = `${Math.min(100, (record.consumed / goal) * 100)}%`;
    bar.append(fill);

    const delta = document.createElement('p');
    delta.className = 'hist-row__delta';
    if (record.consumed === goal) {
      delta.textContent = 'justo en la meta';
    } else if (over) {
      delta.textContent = `${(record.consumed - goal).toLocaleString('es-ES')} por encima`;
    } else {
      delta.textContent = `${(goal - record.consumed).toLocaleString('es-ES')} de margen`;
    }

    row.append(top, bar, delta);
    return row;
  }

  function render() {
    const list = document.querySelector('[data-history-list]');
    const emptyState = document.querySelector('[data-view="historial"] [data-empty-state]');
    if (!list || !emptyState) return;

    const goal = loadGoalCalories();
    const records = groupByDate(loadIntakes());

    list.replaceChildren(...records.map(record => createRow(record, goal)));
    emptyState.classList.toggle('hidden', records.length > 0);
  }

  render();
  window.addEventListener('caloriasApp:intakesUpdated', render);
  window.addEventListener('pageshow', render);
  window.addEventListener('caloriasApp:viewChanged', event => {
    if (event.detail?.view === 'historial') render();
  });
  window.addEventListener('storage', event => {
    if (event.key === null || event.key === INTAKES_KEY || event.key === GOAL_KEY) render();
  });

  const clearButton = document.getElementById('clear-all-data');
  if (clearButton) {
    clearButton.addEventListener('click', async () => {
      const confirmed = await window.AppUI.confirm({
        title: '¿Borrar todos los datos?',
        message: 'Se eliminarán tus ingestas y tu objetivo. No se puede deshacer.',
        confirmText: 'Borrar'
      });

      if (!confirmed) return;

      localStorage.removeItem(INTAKES_KEY);
      localStorage.removeItem(GOAL_KEY);

      const goalNode = document.getElementById('daily-goal');
      if (goalNode) goalNode.textContent = DEFAULT_GOAL.toLocaleString('es-ES');

      window.dispatchEvent(new CustomEvent('caloriasApp:intakesUpdated'));
      window.dispatchEvent(new CustomEvent('caloriasApp:goalUpdated'));
      render();

      const live = document.getElementById('log-status');
      if (live) live.textContent = 'Datos borrados.';
    });
  }
})();
