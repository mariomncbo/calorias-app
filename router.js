/* Navegación entre vistas y subrayado deslizante de las pestañas. */
(() => {
  const VIEWS = ['hoy', 'objetivo', 'historial'];
  const tabs = [...document.querySelectorAll('nav [data-path]')];
  const indicator = document.querySelector('.tabs__indicator');
  const main = document.querySelector('main');
  let firstRun = true;

  function currentView() {
    const view = location.hash.replace(/^#/, '');
    return VIEWS.includes(view) ? view : 'hoy';
  }

  const INDICATOR_WIDTH = 18;

  function moveIndicator(active) {
    if (!indicator || !active) return;
    indicator.style.transform = `translateX(${active.offsetLeft + (active.offsetWidth - INDICATOR_WIDTH) / 2}px)`;
  }

  function navigate() {
    const view = currentView();
    let activeTab = null;

    document.querySelectorAll('[data-view]').forEach(section => {
      section.classList.toggle('is-active', section.dataset.view === view);
    });

    tabs.forEach(tab => {
      const isActive = tab.dataset.path === view;
      tab.classList.toggle('is-active', isActive);
      if (isActive) {
        tab.setAttribute('aria-current', 'page');
        activeTab = tab;
      } else {
        tab.removeAttribute('aria-current');
      }
    });

    if (firstRun && indicator) {
      indicator.style.transition = 'none';
      moveIndicator(activeTab);
      requestAnimationFrame(() => {
        indicator.style.transition = '';
      });
      firstRun = false;
    } else {
      moveIndicator(activeTab);
    }

    main?.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent('caloriasApp:viewChanged', { detail: { view } }));
  }

  window.addEventListener('hashchange', navigate);
  window.addEventListener('resize', () => moveIndicator(tabs.find(tab => tab.classList.contains('is-active'))));

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => moveIndicator(tabs.find(tab => tab.classList.contains('is-active'))));
  }

  navigate();
})();
