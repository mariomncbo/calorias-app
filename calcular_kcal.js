(() => {
	const STORAGE_KEY = 'caloriasApp.goal';
	const CALORIES_PER_KILOGRAM = 7700;
	const ACTIVITY_FACTORS = {
		sedentario: 1.2,
		ligero: 1.375,
		moderado: 1.55,
		activo: 1.725,
		'muy-activo': 1.9
	};

	function calculateDailyCalories({ currentWeight, targetWeight, height, age, sex, activity, duration, durationUnit }) {
		const basalMetabolicRate = sex === 'hombre'
			? (10 * currentWeight) + (6.25 * height) - (5 * age) + 5
			: (10 * currentWeight) + (6.25 * height) - (5 * age) - 161;
		const maintenanceCalories = basalMetabolicRate * (ACTIVITY_FACTORS[activity] || ACTIVITY_FACTORS.moderado);
		const durationInDays = durationUnit === 'meses' ? duration * 30.4375 : duration * 7;
		const dailyWeightAdjustment = ((currentWeight - targetWeight) * CALORIES_PER_KILOGRAM) / durationInDays;

		return Math.max(1200, Math.round(maintenanceCalories - dailyWeightAdjustment));
	}

	function readGoalForm() {
		const selectedActivity = document.querySelector('.activity-card[data-selected="true"]');
		const selectedSex = document.querySelector('.sex-pill.bg-primary');
		const selectedDuration = document.querySelector('.duration-pill[aria-checked="true"]');

		return {
			currentWeight: Number(document.getElementById('current-weight').value),
			targetWeight: Number(document.getElementById('target-weight').value),
			height: Number(document.getElementById('height').value),
			age: Number(document.getElementById('age').value),
			sex: selectedSex?.dataset.value || 'hombre',
			activity: selectedActivity?.dataset.value || 'moderado',
			duration: Number(document.getElementById('goal-duration').value),
			durationUnit: selectedDuration?.dataset.value || 'semanas'
		};
	}

	function saveGoal(goal) {
		const dailyCalories = calculateDailyCalories(goal);
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...goal, dailyCalories }));
		return dailyCalories;
	}

	function loadGoal() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY));
		} catch {
			return null;
		}
	}

	function applySavedGoal(goal) {
		if (!goal) return;

		const fields = {
			'current-weight': goal.currentWeight,
			'target-weight': goal.targetWeight,
			height: goal.height,
			age: goal.age,
			'goal-duration': goal.duration
		};
		Object.entries(fields).forEach(([id, value]) => {
			const field = document.getElementById(id);
			if (field && value !== undefined) field.value = value;
		});

		document.querySelector(`.sex-pill[data-value="${goal.sex}"]`)?.click();
		document.querySelector(`.activity-card[data-value="${goal.activity}"]`)?.click();
		document.querySelector(`.duration-pill[data-value="${goal.durationUnit}"]`)?.click();
	}

	function updateToday(goal) {
		if (!goal?.dailyCalories) return;

		const dailyCalories = goal.dailyCalories;
		const remainingCount = document.getElementById('remaining-count');
		const dailyGoal = document.getElementById('daily-goal');
		const dailyGoalLabel = document.getElementById('daily-goal-label');
		const formattedCalories = dailyCalories.toLocaleString('es-ES');

		if (remainingCount) remainingCount.textContent = formattedCalories;
		if (dailyGoal) dailyGoal.textContent = formattedCalories;
		if (dailyGoalLabel) dailyGoalLabel.textContent = `Meta: ${formattedCalories} kcal`;
	}

	const goalForm = document.getElementById('goal-form');
	if (goalForm) {
		applySavedGoal(loadGoal());
		goalForm.addEventListener('submit', (event) => {
			event.preventDefault();
			const goal = readGoalForm();
			if (Object.values(goal).some(value => typeof value === 'number' && (!Number.isFinite(value) || value <= 0))) return;

			const dailyCalories = saveGoal(goal);
			updateToday({ ...goal, dailyCalories });
			window.dispatchEvent(new CustomEvent('caloriasApp:goalUpdated'));
			location.hash = 'hoy';
		});
	}
	updateToday(loadGoal());
})();