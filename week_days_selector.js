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

	function statusMarkup(status, isToday) {
		if (status === 'done') return '<span class="material-symbols-outlined text-[14px] text-secondary">check_circle</span>';
		if (status === 'missed') return '<span class="material-symbols-outlined text-[14px] text-error">cancel</span>';
		if (isToday) return '<span class="block w-1 h-1 rounded-full bg-secondary-fixed"></span>';
		return '<span class="block w-1 h-1 rounded-full bg-transparent"></span>';
	}

	function setSelection(button, selected) {
		const base = 'py-2.5 rounded-lg flex flex-col items-center justify-center';
		const label = button.querySelector(':scope > span');
		const number = label?.nextElementSibling;
		if (selected) {
			button.className = `${base} bg-primary text-on-primary shadow-sm transition-transform active:scale-95`;
			if (label) label.className = 'font-label-caps text-label-caps mb-1 text-on-primary/80';
			if (number) number.className = 'font-body-sm text-body-sm font-semibold';
		} else {
			button.className = `${base} transition-all text-on-surface-variant hover:bg-surface-container-high/40`;
			if (label) label.className = 'font-label-caps text-label-caps mb-1 opacity-70';
			if (number) number.className = 'font-body-sm text-body-sm font-medium';
		}
	}

	function createDayButton(label, dayNumber, dateStr, status, isToday) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.date = dateStr;
		button.dataset.status = status;

		const labelSpan = document.createElement('span');
		labelSpan.textContent = label;

		const numberSpan = document.createElement('span');
		numberSpan.textContent = String(dayNumber);

		const statusSpan = document.createElement('span');
		statusSpan.className = 'status-slot h-4 mt-0.5 flex items-center justify-center';
		statusSpan.innerHTML = statusMarkup(status, isToday);

		button.append(labelSpan, numberSpan, statusSpan);
		setSelection(button, isToday);
		return button;
	}

	function buildDaySelector() {
		const container = document.getElementById('day-selector');
		if (!container) return;

		const monday = getMonday(new Date());
		const todayStr = toDateString(new Date());
		const goal = loadGoalCalories();
		const consumed = loadConsumedByDate();

		container.innerHTML = '';
		for (let index = 0; index < DAY_LABELS.length; index++) {
			const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
			const dateStr = toDateString(date);
			const status = getStatus(dateStr, todayStr, goal, consumed);
			container.appendChild(createDayButton(DAY_LABELS[index], date.getDate(), dateStr, status, dateStr === todayStr));
		}
	}

	buildDaySelector();
	window.addEventListener('caloriasApp:intakesUpdated', buildDaySelector);
	window.addEventListener('caloriasApp:viewChanged', (event) => {
		if (event.detail?.view === 'hoy') buildDaySelector();
	});
})();