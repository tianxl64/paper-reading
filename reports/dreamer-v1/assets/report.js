(() => {
  const article = document.querySelector('.article');
  const tocPanel = document.querySelector('.toc-panel');
  const toc = document.querySelector('#toc-list');
  const overlay = document.querySelector('.overlay');
  if (!article || !tocPanel || !toc || !overlay) return;
  const links = [...toc.querySelectorAll('a.toc-link')];
  const headings = [...article.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  const sourceHeadings = headings.filter(heading => !heading.closest('.figure-wrap'));
  const nodes = [...toc.querySelectorAll('.toc-node')];
  let navigationUntil = 0;
  const setExpanded = (node, expanded) => {
    const button = node.querySelector(':scope > .toc-toggle');
    const children = node.querySelector(':scope > .toc-children');
    if (!button || !children) return;
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', `${expanded ? '折叠' : '展开'}“${node.querySelector(':scope > .toc-link')?.textContent || ''}”子目录`);
    const glyph = button.querySelector('span'); if (glyph) glyph.textContent = expanded ? '−' : '＋';
    node.classList.toggle('expanded', expanded);
  };
  const expandAncestors = id => {
    const link = links.find(a => a.getAttribute('href') === `#${id}`);
    if (!link) return;
    let node = link.closest('.toc-node');
    while (node) { setExpanded(node, true); node = node.parentElement?.closest('.toc-node'); }
  };
  const active = id => {
    links.forEach(a => a.classList.remove('ancestor-active'));
    links.forEach(a => {
    const selected = a.getAttribute('href') === `#${id}`;
    a.classList.toggle('active', selected);
    if (selected) {
      a.setAttribute('aria-current', 'location');
      let parent = a.closest('.toc-node')?.parentElement?.closest('.toc-node');
      while (parent) { parent.querySelector(':scope > .toc-link')?.classList.add('ancestor-active'); parent = parent.parentElement?.closest('.toc-node'); }
    } else a.removeAttribute('aria-current');
    });
  };
  const hashId = () => { try { return decodeURIComponent(location.hash.slice(1)); } catch (_) { return location.hash.slice(1); } };
  const resolveHeading = (target, seen = new Set()) => {
    if (!target || seen.has(target)) return null;
    seen.add(target);
    if (headings.includes(target)) return target;
    const destination = target.dataset.topicId || target.dataset.target;
    if (destination) {
      const resolved = resolveHeading(document.getElementById(destination.replace(/^#/, '')), seen);
      if (resolved) return resolved;
    }
    const containing = target.closest('h1,h2,h3,h4,h5,h6');
    if (containing) return containing;
    return sourceHeadings.find(heading => target.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING) || sourceHeadings.at(-1);
  };
  const jump = (id, push = false) => {
    const target = document.getElementById(id); if (!target) return;
    const heading = resolveHeading(target) || target;
    navigationUntil = Date.now() + 900; expandAncestors(heading.id); active(heading.id);
    if (push) { try { history.pushState(null, '', `#${encodeURIComponent(id)}`); } catch (_) { location.hash = id; } }
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.scrollIntoView({behavior: 'instant', block: 'start'}); heading.focus({preventScroll: true});
    setTimeout(() => { const r = heading.getBoundingClientRect(); if (Math.abs(r.top) > 40) window.scrollTo({top: window.scrollY + r.top - 20, behavior: 'instant'}); active(heading.id); }, 90);
  };
  toc.addEventListener('click', event => {
    const toggle = event.target.closest('.toc-toggle');
    if (toggle) { tocPanel.classList.remove('toc-expanded','toc-top-level'); const node = toggle.closest('.toc-node'); setExpanded(node, toggle.getAttribute('aria-expanded') !== 'true'); return; }
    const a = event.target.closest('a[href^="#"]'); if (!a) return; event.preventDefault(); jump(a.getAttribute('href').slice(1), true);
  });
  toc.addEventListener('keydown', event => { if ((event.key === ' ' || event.key === 'Enter') && event.target.matches('.toc-toggle')) { event.preventDefault(); event.target.click(); } });
  document.querySelectorAll('[data-toc-action]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.tocAction;
    if (action === 'expand-all') { tocPanel.classList.remove('toc-expanded','toc-top-level'); nodes.forEach(node => setExpanded(node, true)); }
    else if (action === 'top-level-only') { tocPanel.classList.remove('toc-expanded','toc-top-level'); nodes.forEach(node => setExpanded(node, false)); }
    else if (action === 'decrease' || action === 'increase' || action === 'reset') {
      const current = parseFloat(getComputedStyle(toc).fontSize) || 13;
      const value = action === 'decrease' ? Math.max(10, current - 1) : action === 'increase' ? Math.min(22, current + 1) : 13;
      toc.style.fontSize = `${value}px`;
    }
  }));
  const restore = () => { if (hashId()) jump(hashId()); };
  addEventListener('popstate', restore); addEventListener('hashchange', restore);
  let scrollQueued = false;
  const spy = () => { scrollQueued = false; if (Date.now() < navigationUntil || overlay.classList.contains('open')) return; let current = headings[0]; for (const heading of headings) { if (heading.getBoundingClientRect().top <= 140) current = heading; else break; } if (current) active(current.id); };
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(spy); } }, {passive: true});
  // Progressive enhancement: no-JS pages keep the entire static tree open.
  document.documentElement.classList.add('toc-js');
  nodes.forEach(node => setExpanded(node, false));
  if (hashId()) restore(); else if (headings[0]) active(headings[0].id);
  const image = overlay.querySelector('img'); const close = overlay.querySelector('.close-viewer'); const caption = overlay.querySelector('.viewer-caption'); const scaleLabel = overlay.querySelector('[data-scale]');
  let scale = 1, x = 0, y = 0, returnEl = null, drag = null;
  const transform = () => { image.style.transform = `translate(${x}px,${y}px) scale(${scale})`; scaleLabel.textContent = `${Math.round(scale * 100)}%`; };
  const fit = () => { overlay.dataset.mode = 'fit'; image.style.width = ''; image.style.height = ''; scale = 1; x = y = 0; drag = null; transform(); };
  const one = () => { overlay.dataset.mode = 'one'; image.style.width = `${image.naturalWidth}px`; image.style.height = `${image.naturalHeight}px`; scale = 1; x = y = 0; transform(); };
  const closeViewer = () => { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); image.removeAttribute('src'); article.inert = false; toc.inert = false; fit(); if (returnEl) returnEl.focus(); };
  const open = el => { returnEl = el; image.src = el.currentSrc || el.src; image.alt = el.alt; caption.textContent = el.closest('figure')?.querySelector('figcaption')?.innerText || el.alt; overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); article.inert = true; toc.inert = true; fit(); close.focus(); };
  article.addEventListener('click', event => { const el = event.target.closest('.figure-wrap img'); if (el) { event.preventDefault(); open(el); } });
  article.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.figure-wrap img')) { event.preventDefault(); open(event.target); } });
  article.querySelectorAll('.figure-wrap img').forEach(el => { el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `放大图片：${el.alt}`); });
  close.addEventListener('click', closeViewer); overlay.addEventListener('click', e => { if (e.target === overlay) closeViewer(); });
  overlay.querySelector('[data-fit]').addEventListener('click', fit); overlay.querySelector('[data-one]').addEventListener('click', one);
  const zoom = delta => { scale = Math.max(.2, Math.min(5, scale + delta)); transform(); };
  overlay.querySelector('[data-plus]').addEventListener('click', () => zoom(.2)); overlay.querySelector('[data-minus]').addEventListener('click', () => zoom(-.2));
  overlay.addEventListener('wheel', e => { if (overlay.classList.contains('open')) { e.preventDefault(); zoom(e.deltaY < 0 ? .1 : -.1); } }, {passive: false});
  image.addEventListener('pointerdown', e => { if (e.button !== 0) return; drag = {x: e.clientX - x, y: e.clientY - y}; image.setPointerCapture(e.pointerId); e.preventDefault(); }); image.addEventListener('pointermove', e => { if (drag) { x = e.clientX - drag.x; y = e.clientY - drag.y; transform(); } }); image.addEventListener('pointerup', () => { drag = null; }); image.addEventListener('pointercancel', () => { drag = null; });
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); closeViewer(); } else if (e.key === '1') one(); else if (e.key === '0') fit(); else if (e.key === '+' || e.key === '=') zoom(.2); else if (e.key === '-') zoom(-.2); else if (e.key === 'Tab') { const f = [...overlay.querySelectorAll('button')], first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } });
})();
