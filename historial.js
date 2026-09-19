(() => {
	const GOAL_KEY = 'caloriasApp.goal';
	const INTAKES_KEY = 'caloriasApp.intakes';

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
		return 2220;
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
		const label = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(year, month - 1, day));
		return label.charAt(0).toUpperCase() + label.slice(1);
	}

	function createStatusChip(completed) {
		const chip = document.createElement('span');
		chip.className = 'font-label-caps text-label-caps uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap';
		if (completed) {
			chip.textContent = 'Completado';
			chip.style.backgroundColor = '#4A5D4E';
			chip.style.color = '#FFFFFF';
		} else {
			chip.textContent = 'No completado';
			chip.style.backgroundColor = '#AAABAA';
			chip.style.color = '#1A1C1B';
		}
		return chip;
	}

	function createDayCard(record, goal) {
		const card = document.createElement('div');
		card.className = 'w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md';

		const header = document.createElement('div');
		header.className = 'flex items-center justify-between gap-2';

		const date = document.createElement('span');
		date.className = 'font-body-md text-body-md text-on-surface font-medium capitalize';
		date.textContent = formatDate(record.date);

		header.append(date, createStatusChip(record.consumed >= goal));

		const metrics = document.createElement('div');
		metrics.className = 'flex items-baseline gap-1';

		const consumed = document.createElement('span');
		consumed.className = 'font-numeral-metric text-numeral-metric text-on-surface tracking-tight';
		consumed.textContent = record.consumed.toLocaleString('es-ES');

		const target = document.createElement('span');
		target.className = 'font-body-md text-body-md text-on-surface-variant';
		target.textContent = `/ ${goal.toLocaleString('es-ES')} kcal`;

		metrics.append(consumed, target);
		card.append(header, metrics);
		return card;
	}

	function render() {
		const list = document.querySelector('[data-history-list]');
		const emptyState = document.querySelector('[data-view="historial"] [data-empty-state]');
		if (!list || !emptyState) return;

		const goal = loadGoalCalories();
		const records = groupByDate(loadIntakes());

		list.replaceChildren(...records.map(record => createDayCard(record, goal)));
		emptyState.classList.toggle('hidden', records.length > 0);
	}

	render();
	window.addEventListener('caloriasApp:intakesUpdated', render);
	window.addEventListener('pageshow', render);
	window.addEventListener('caloriasApp:viewChanged', (event) => {
		if (event.detail?.view === 'historial') render();
	});
	window.addEventListener('storage', (event) => {
		if (event.key === null || event.key === 'caloriasApp.intakes' || event.key === 'caloriasApp.goal') render();
	});

	const clearButton = document.getElementById('clear-all-data');
	if (clearButton) {
		clearButton.addEventListener('click', () => {
			const modal = document.createElement('div');
			modal.className = 'fixed inset-0 z-[60] flex items-end justify-center bg-on-surface/40 p-4 sm:items-center';
			modal.setAttribute('role', 'dialog');
			modal.setAttribute('aria-modal', 'true');
			modal.setAttribute('aria-label', 'Borrar todos los datos');

			const panel = document.createElement('div');
			panel.className = 'w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl flex flex-col gap-4';

			const icon = document.createElement('div');
			icon.className = 'w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error';
			icon.innerHTML = '<span class="material-symbols-outlined text-[24px]">delete</span>';

			const heading = document.createElement('h2');
			heading.className = 'font-headline-md text-headline-md text-on-surface';
			heading.textContent = '¿Borrar todos los datos?';

			const copy = document.createElement('p');
			copy.className = 'font-body-md text-body-md text-on-surface-variant leading-relaxed';
			copy.textContent = 'Se eliminarán tus ingestas y tu objetivo. Esta acción no se puede deshacer.';

			const actions = document.createElement('div');
			actions.className = 'flex gap-3 pt-2';

			const cancelButton = document.createElement('button');
			cancelButton.type = 'button';
			cancelButton.className = 'flex-1 h-12 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md hover:bg-surface-container transition-colors';
			cancelButton.textContent = 'Cancelar';

			const confirmButton = document.createElement('button');
			confirmButton.type = 'button';
			confirmButton.className = 'flex-1 h-12 rounded-xl bg-error text-on-error font-body-md text-body-md hover:opacity-95 transition-colors';
			confirmButton.textContent = 'Borrar';

			actions.append(cancelButton, confirmButton);
			panel.append(icon, heading, copy, actions);
			modal.appendChild(panel);

			const close = () => {
				modal.remove();
				document.body.classList.remove('overflow-hidden');
			};

			cancelButton.addEventListener('click', close);
			confirmButton.addEventListener('click', () => {
				localStorage.removeItem('caloriasApp.intakes');
				localStorage.removeItem('caloriasApp.goal');
				window.dispatchEvent(new CustomEvent('caloriasApp:intakesUpdated'));
				render();
				close();
			});
			modal.addEventListener('click', (event) => {
				if (event.target === modal) close();
			});

			document.body.appendChild(modal);
			document.body.classList.add('overflow-hidden');
		});
	}
})();