(() => {
  const VIEWS = ['hoy', 'objetivo', 'historial'];

  function currentView() {
    const view = location.hash.replace(/^#/, '');
    return VIEWS.includes(view) ? view : 'hoy';
  }

  function navigate() {
    const view = currentView();

    document.querySelectorAll('[data-view]').forEach(section => {
      section.classList.toggle('hidden', section.dataset.view !== view);
    });

    document.querySelectorAll('nav [data-path]').forEach(link => {
      const active = link.dataset.path === view;
      link.classList.toggle('text-primary', active);
      link.classList.toggle('font-medium', active);
      link.classList.toggle('text-on-surface-variant', !active);
      link.classList.toggle('hover:text-on-surface', !active);
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    document.querySelector('main')?.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent('caloriasApp:viewChanged', { detail: { view } }));
  }

  window.addEventListener('hashchange', navigate);
  navigate();
})();