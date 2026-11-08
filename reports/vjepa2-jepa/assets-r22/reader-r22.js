(() => {
  'use strict';
  const main = document.querySelector('main');
  const toc = document.querySelector('#toc');
  const headings = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  const links = [...toc.querySelectorAll('a')];
  const linkById = new Map(links.map(link => [link.getAttribute('href').slice(1), link]));
  let scrollPending = false;
  const toggles = [...toc.querySelectorAll('[data-toc-toggle]')];
  const setExpanded = (toggle, expanded) => {
    const target = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!target) return;
    toggle.setAttribute('aria-expanded', String(expanded));
    const label = toggle.closest('.toc-row').querySelector('a').textContent.trim();
    toggle.title = (expanded ? '折叠：' : '展开：') + label;
    toggle.setAttribute('aria-label', (expanded ? '折叠子目录：' : '展开子目录：') + label);
    target.hidden = !expanded;
  };
  const setAll = expanded => toggles.forEach(toggle => setExpanded(toggle, expanded));
  const expandAncestors = id => {
    const link = linkById.get(id);
    if (!link) return;
    let list = link.closest('ul[data-toc-children]');
    while (list) {
      const owner = list.parentElement.querySelector(':scope > .toc-row > [data-toc-toggle]');
      if (owner) setExpanded(owner, true);
      list = list.parentElement.closest('ul[data-toc-children]');
    }
  };
  toggles.forEach(toggle => toggle.addEventListener('click', event => {
    event.preventDefault(); event.stopPropagation();
    setExpanded(toggle, toggle.getAttribute('aria-expanded') !== 'true');
  }));
  document.querySelector('[data-toc-action="expand-all"]')?.addEventListener('click', () => setAll(true));
  document.querySelector('[data-toc-action="collapse-all"]')?.addEventListener('click', () => setAll(false));
  const mark = heading => {
    links.forEach(link => { link.classList.remove('active', 'active-parent'); link.removeAttribute('aria-current'); });
    const current = linkById.get(heading.id);
    if (!current) return;
    current.classList.add('active'); current.setAttribute('aria-current', 'location');
    let visible = current;
    let list = current.closest('ul[data-toc-children]');
    while (list) {
      const parent = list.parentElement.querySelector(':scope > .toc-row > a');
      parent?.classList.add('active-parent');
      if (list.hidden && parent) visible = parent;
      list = list.parentElement.closest('ul[data-toc-children]');
    }
    const nav = document.querySelector('aside');
    const box = visible.getBoundingClientRect(); const bounds = nav.getBoundingClientRect();
    if (box.top < bounds.top + 12 || box.bottom > bounds.bottom - 12) nav.scrollTop += box.top - bounds.top - nav.clientHeight / 2;
  };
  const jump = (id, updateHistory = true) => {
    const target = document.getElementById(id);
    if (!target) return;
    expandAncestors(id);
    if (updateHistory) {
      try { history.pushState(null, '', '#' + encodeURIComponent(id)); } catch { location.hash = id; }
    }
    target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true});
    target.scrollIntoView({behavior:'auto', block:'start'}); mark(target);
    setTimeout(() => {
      const top = target.getBoundingClientRect().top;
      if (Math.abs(top - 24) > 6) window.scrollTo({top:window.scrollY + top - 24, behavior:'instant'});
      mark(target);
    }, 450);
  };
  toc.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    event.preventDefault(); jump(link.getAttribute('href').slice(1));
  });
  toc.addEventListener('keydown', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && (event.key === ' ' || event.key === 'Spacebar')) { event.preventDefault(); jump(link.getAttribute('href').slice(1)); }
  });
  const fromHash = () => { if (location.hash) jump(decodeURIComponent(location.hash.slice(1)), false); };
  window.addEventListener('popstate', fromHash); window.addEventListener('hashchange', fromHash);
  window.addEventListener('scroll', () => {
    if (scrollPending) return;
    scrollPending = true; requestAnimationFrame(() => {
      scrollPending = false; let current = headings[0];
      for (const heading of headings) { if (heading.getBoundingClientRect().top <= 80) current = heading; else break; }
      if (current) mark(current);
    });
  }, {passive:true});
  if (location.hash) fromHash(); else if (headings[0]) mark(headings[0]);

  const dialog = document.getElementById('lightbox');
  const image = dialog.querySelector('img');
  const stage = dialog.querySelector('.viewer-stage');
  const scaleLabel = dialog.querySelector('.viewer-scale');
  const caption = dialog.querySelector('.viewer-caption');
  let opener = null, scale = 1, x = 0, y = 0, drag = null, draggedRecently = false;
  const render = () => { image.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`; scaleLabel.textContent = Math.round(scale * 100) + '%'; };
  const fit = () => { scale = Math.min((stage.clientWidth - 32) / image.naturalWidth, (stage.clientHeight - 32) / image.naturalHeight, 1); x = 0; y = 0; render(); };
  const zoom = factor => { scale = Math.max(.08, Math.min(8, scale * factor)); render(); };
  const open = link => {
    opener = link; image.src = link.getAttribute('href'); image.alt = link.querySelector('img').alt;
    caption.textContent = link.closest('figure').querySelector('figcaption').innerText;
    dialog.showModal(); dialog.querySelector('.viewer-close').focus();
    if (image.complete && image.naturalWidth) fit();
  };
  image.addEventListener('load', fit);
  main.addEventListener('click', event => { const link = event.target.closest('.figure-open'); if (link) { event.preventDefault(); open(link); } });
  main.addEventListener('keydown', event => { const link = event.target.closest('.figure-open'); if (link && event.key === ' ') { event.preventDefault(); open(link); } });
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog || (event.target === stage && !draggedRecently)) dialog.close(); });
  dialog.addEventListener('close', () => { image.removeAttribute('src'); scale = 1; x = 0; y = 0; drag = null; stage.classList.remove('dragging'); opener?.focus({preventScroll:true}); });
  dialog.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.2); }
    if (event.key === '-') { event.preventDefault(); zoom(1/1.2); }
    if (event.key === '0') { event.preventDefault(); fit(); }
  });
  dialog.querySelector('[data-viewer="zoom-in"]').addEventListener('click', () => zoom(1.2));
  dialog.querySelector('[data-viewer="zoom-out"]').addEventListener('click', () => zoom(1/1.2));
  dialog.querySelector('[data-viewer="actual"]').addEventListener('click', () => { scale = 1; x = 0; y = 0; render(); });
  dialog.querySelector('[data-viewer="fit"]').addEventListener('click', fit);
  stage.addEventListener('wheel', event => { event.preventDefault(); zoom(Math.exp(-event.deltaY * .0015)); }, {passive:false});
  stage.addEventListener('pointerdown', event => { drag = {id:event.pointerId, x:event.clientX - x, y:event.clientY - y}; stage.setPointerCapture(event.pointerId); stage.classList.add('dragging'); });
  stage.addEventListener('pointermove', event => { if (drag && drag.id === event.pointerId) { draggedRecently = true; x = event.clientX - drag.x; y = event.clientY - drag.y; render(); } });
  const finishDrag = () => { drag = null; stage.classList.remove('dragging'); if (draggedRecently) setTimeout(() => { draggedRecently = false; }, 80); };
  stage.addEventListener('pointerup', finishDrag); stage.addEventListener('pointercancel', finishDrag);
  window.addEventListener('resize', () => { if (dialog.open) fit(); });
})();
