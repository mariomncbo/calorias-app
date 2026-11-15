/* Franja semanal: siete columnas con el estado de cada día. */
(() => {
  const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const GOAL_KEY = 'caloriasApp.goal';
  const INTAKES_KEY = 'caloriasApp.intakes';

  function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getMonday(date) {
    const weekday = date.getDay();
    const offset = weekday === 0 ? -6 : 1 - weekday;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
  }

  function loadGoalCalories() {
    try {
      const goal = JSON.parse(localStorage.getItem(GOAL_KEY));
      if (Number.isFinite(goal?.dailyCalories) && goal.dailyCalories > 0) return goal.dailyCalories;
    } catch {}
    const goalElement = document.getElementById('daily-goal');
    const parsed = goalElement ? Number.parseInt(goalElement.textContent.replace(/\D/g, ''), 10) : 0;
    return parsed > 0 ? parsed : 2220;
  }

  function loadConsumedByDate() {
    let intakes = [];
    try {
      const stored = JSON.parse(localStorage.getItem(INTAKES_KEY));
      if (Array.isArray(stored)) intakes = stored;
    } catch {}
    const consumed = {};
    intakes.forEach(entry => {
      if (!entry?.createdAt) return;
      const key = toDateString(new Date(entry.createdAt));
      consumed[key] = (consumed[key] || 0) + (Number(entry.kcal) || 0);
    });
    return consumed;
  }

  function getStatus(dateStr, todayStr, goal, consumed) {
    const total = consumed[dateStr] || 0;
    if (total >= goal) return 'done';
    if (dateStr < todayStr) return 'missed';
    return 'pending';
  }

  const STATUS_TEXT = {
    done: 'objetivo alcanzado',
    missed: 'sin alcanzar el objetivo',
    pending: 'sin registros'
  };

  function formatDay(date) {
    const label = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function createDay(date, status, isToday) {
    const item = document.createElement('li');
    item.className = 'day';
    if (status === 'done') item.classList.add('is-done');
    if (status === 'missed') item.classList.add('is-missed');
    if (isToday) item.classList.add('is-today');
    item.setAttribute('aria-label', `${formatDay(date)}, ${STATUS_TEXT[status]}`);

    const label = document.createElement('span');
    label.className = 'day__label';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = DAY_LABELS[(date.getDay() + 6) % 7];

    const number = document.createElement('span');
    number.className = 'day__num';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(date.getDate());

    const dot = document.createElement('span');
    dot.className = 'day__dot';
    dot.setAttribute('aria-hidden', 'true');

    item.append(label, number, dot);
    return item;
  }

  function buildDaySelector() {
    const container = document.getElementById('day-selector');
    if (!container) return;

    const monday = getMonday(new Date());
    const todayStr = toDateString(new Date());
    const goal = loadGoalCalories();
    const consumed = loadConsumedByDate();
    const items = [];

    for (let index = 0; index < DAY_LABELS.length; index++) {
      const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
      const dateStr = toDateString(date);
      const status = getStatus(dateStr, todayStr, goal, consumed);
      items.push(createDay(date, status, dateStr === todayStr));
    }

    container.replaceChildren(...items);
  }

  buildDaySelector();
  window.addEventListener('caloriasApp:intakesUpdated', buildDaySelector);
  window.addEventListener('caloriasApp:viewChanged', event => {
    if (event.detail?.view === 'hoy') buildDaySelector();
  });
})();
