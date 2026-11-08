(() => {
  const article = document.querySelector('#article');
  const toc = document.querySelector('#toc-list');
  const headings = [...article.querySelectorAll('h2,h3,h4')];
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `heading-${index + 1}`;
    heading.tabIndex = -1;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.className = heading.tagName.toLowerCase();
    link.dataset.target = heading.id;
    link.addEventListener('click', event => {
      event.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try { history.pushState(null, '', `#${heading.id}`); } catch (_) { location.hash = heading.id; }
      heading.focus({ preventScroll: true });
    });
    toc.appendChild(link);
  });
  const links = [...toc.querySelectorAll('a')];
  const activate = id => links.forEach(link => link.classList.toggle('active', link.dataset.target === id));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.filter(entry => entry.isIntersecting).forEach(entry => {
      activate(entry.target.id);
      links.find(link => link.dataset.target === entry.target.id)?.scrollIntoView({ block: 'nearest' });
    }), { rootMargin: '-15% 0px -70% 0px' });
    headings.forEach(heading => observer.observe(heading));
  }
  const goToHash = () => { const id = location.hash.slice(1); if (id && document.getElementById(id)) setTimeout(() => document.getElementById(id).scrollIntoView({ block: 'start' }), 30); };
  window.addEventListener('hashchange', goToHash); window.addEventListener('popstate', goToHash); window.addEventListener('load', goToHash);

  const overlay = document.querySelector('#overlay');
  const viewerImage = document.querySelector('#overlay-img');
  const stage = document.querySelector('#viewer-stage');
  const readout = document.querySelector('#zoom-readout');
  const state = { scale: 1, x: 0, y: 0, dragging: false, sx: 0, sy: 0, opener: null };
  const render = () => { viewerImage.style.transform = `translate(calc(-50% + ${state.x}px), calc(-50% + ${state.y}px)) scale(${state.scale})`; readout.textContent = `${Math.round(state.scale * 100)}%`; };
  const fit = () => { state.scale = Math.min(1, (stage.clientWidth * .92) / (viewerImage.naturalWidth || stage.clientWidth), (stage.clientHeight * .88) / (viewerImage.naturalHeight || stage.clientHeight)); state.x = 0; state.y = 0; render(); };
  const open = image => { state.opener = image; viewerImage.src = image.dataset.full || image.src; overlay.classList.add('open'); document.body.style.overflow = 'hidden'; viewerImage.onload = fit; viewerImage.focus(); };
  const close = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; viewerImage.removeAttribute('src'); state.x = state.y = 0; state.scale = 1; if (state.opener) state.opener.focus(); state.opener = null; };
  document.querySelectorAll('.figure-card img').forEach(image => { image.tabIndex = 0; image.setAttribute('role', 'button'); image.setAttribute('aria-label', `${image.alt || '图片'}，打开图片查看器`); image.addEventListener('click', () => { if (image.complete && image.naturalWidth) open(image); }); image.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(image); } }); });
  document.querySelector('#zoom-in').addEventListener('click', () => { state.scale = Math.min(8, state.scale * 1.25); render(); });
  document.querySelector('#zoom-out').addEventListener('click', () => { state.scale = Math.max(.1, state.scale / 1.25); render(); });
  document.querySelector('#zoom-one').addEventListener('click', () => { state.scale = 1; state.x = state.y = 0; render(); });
  document.querySelector('#zoom-fit').addEventListener('click', fit);
  document.querySelector('#viewer-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay || event.target === stage) close(); });
  document.addEventListener('keydown', event => { if (!overlay.classList.contains('open')) return; if (event.key === 'Escape') close(); if (event.key === '+' || event.key === '=') { state.scale = Math.min(8, state.scale * 1.25); render(); } if (event.key === '-') { state.scale = Math.max(.1, state.scale / 1.25); render(); } if (event.key === '0') fit(); if (event.key === '1') { state.scale = 1; state.x = state.y = 0; render(); } });
  viewerImage.addEventListener('wheel', event => { event.preventDefault(); state.scale = Math.max(.1, Math.min(8, state.scale * (event.deltaY < 0 ? 1.12 : .89))); render(); }, { passive: false });
  viewerImage.addEventListener('pointerdown', event => { state.dragging = true; state.sx = event.clientX - state.x; state.sy = event.clientY - state.y; viewerImage.setPointerCapture(event.pointerId); viewerImage.classList.add('dragging'); });
  viewerImage.addEventListener('pointermove', event => { if (state.dragging) { state.x = event.clientX - state.sx; state.y = event.clientY - state.sy; render(); } });
  viewerImage.addEventListener('pointerup', () => { state.dragging = false; viewerImage.classList.remove('dragging'); });
  window.addEventListener('resize', () => { if (overlay.classList.contains('open')) fit(); });
})();
