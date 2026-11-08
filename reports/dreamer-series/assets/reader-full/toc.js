(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js-enabled');
  const toc = document.getElementById('r22-toc-list');
  const nav = document.getElementById('r22-toc');
  const article = document.getElementById('r22-article');
  if (!toc || !article) return;
  const links = [...toc.querySelectorAll('a[data-target]')];
  const nodes = [...toc.querySelectorAll('.r22-toc-node')];
  const headings = [...article.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  const byId = new Map(headings.map(h => [h.id, h]));
  let scrollTimer = 0;
  let navigationLock = null;
  let lockTimer = 0;

  const decodeId = value => {
    try { return decodeURIComponent(String(value || '').replace(/^#/, '')); }
    catch (_) { return String(value || '').replace(/^#/, ''); }
  };
  const ancestorNodes = node => {
    const result = [];
    let current = node;
    while (current) {
      if (current.classList?.contains('r22-toc-node')) result.push(current);
      current = current.parentElement?.closest('.r22-toc-node');
    }
    return result;
  };
  const setNodeOpen = (node, open) => {
    if (!node || !node.querySelector(':scope > ul')) return;
    node.classList.toggle('r22-open', open);
    const button = node.querySelector(':scope > .r22-toc-row > .r22-toc-toggle');
    if (button) {
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '▾' : '▸';
    }
  };
  const clearCurrent = () => links.forEach(link => {
    link.removeAttribute('aria-current');
    link.classList.remove('r22-current');
  });
  const markCurrent = id => {
    clearCurrent();
    const link = links.find(item => item.dataset.target === id);
    if (!link) return;
    link.setAttribute('aria-current', 'location');
    link.classList.add('r22-current');
    const node = link.closest('.r22-toc-node');
    ancestorNodes(node).forEach(parent => setNodeOpen(parent, true));
    const navBox = nav.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    if (linkBox.top < navBox.top + 50) nav.scrollTop += linkBox.top - navBox.top - 50;
    else if (linkBox.bottom > navBox.bottom - 30) nav.scrollTop += linkBox.bottom - navBox.bottom + 30;
  };
  const nodeLevel = node => ancestorNodes(node).length;
  const setAllOpenThrough = depth => {
    nodes.forEach(node => setNodeOpen(node, nodeLevel(node) < depth));
  };
  const setTocScale = value => {
    const scale = Math.max(.85, Math.min(1.35, Number(value) || 1));
    root.style.setProperty('--r22-toc-scale', String(scale));
    root.dataset.tocScale = String(scale);
    const stored = document.getElementById('r22-toc-scale');
    if (stored) stored.textContent = `${Math.round(scale * 100)}%`;
    try { localStorage.setItem('r22-toc-scale', String(scale)); } catch (_) {}
  };
  const setDrawerOpen = open => {
    open = Boolean(open) && matchMedia('(max-width: 900px)').matches;
    document.body.classList.toggle('r22-toc-drawer-open', Boolean(open));
    const drawer = document.getElementById('r22-toc-drawer');
    if (drawer) {
      drawer.setAttribute('aria-expanded', String(Boolean(open)));
      drawer.textContent = open ? '关闭目录' : '打开目录';
    }
    const mobile = document.getElementById('r22-toc-mobile-open');
    if (mobile) {
      mobile.setAttribute('aria-expanded', String(Boolean(open)));
      mobile.textContent = open ? '关闭目录' : '打开目录';
    }
    nav.inert = !open && matchMedia('(max-width: 900px)').matches;
    document.querySelector('.r22-main')?.toggleAttribute('inert', open);
    if (open) drawer?.focus();
    else if (matchMedia('(max-width: 900px)').matches && nav.contains(document.activeElement)) mobile?.focus();
  };
  const boundedScrollFallback = heading => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const box = heading.getBoundingClientRect();
      if (box.top < 0 || box.top > window.innerHeight * .72) {
        const saved = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo({ top: Math.max(0, box.top + window.scrollY - 18), behavior: 'auto' });
        root.style.scrollBehavior = saved;
      }
      markCurrent(heading.id);
    }, 480);
  };
  const navigate = (id, push) => {
    const heading = byId.get(id);
    if (!heading) return false;
    navigationLock = id;
    window.clearTimeout(lockTimer);
    lockTimer = window.setTimeout(() => { navigationLock = null; }, 900);
    const link = links.find(item => item.dataset.target === id);
    ancestorNodes(link?.closest('.r22-toc-node')).forEach(parent => setNodeOpen(parent, true));
    if (push) {
      try { history.pushState({ r22Anchor: id }, '', `#${encodeURIComponent(id)}`); }
      catch (_) { window.location.hash = id; }
    }
    heading.tabIndex = -1;
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const targetTop = () => Math.max(0, heading.getBoundingClientRect().top + window.scrollY - 18);
    // A long academic page can have browser smooth-scroll animations that outlive the
    // regular focus step. This single bounded fallback is deterministic in file://.
    window.setTimeout(() => {
      const saved = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo({ top: targetTop(), behavior: 'auto' });
      root.style.scrollBehavior = saved;
    }, 260);
    window.setTimeout(() => { try { heading.focus({ preventScroll: true }); } catch (_) { heading.focus(); } }, 60);
    boundedScrollFallback(heading);
    markCurrent(id);
    return true;
  };
  toc.addEventListener('click', event => {
    const toggle = event.target.closest('.r22-toc-toggle');
    if (toggle && toggle.dataset.empty !== 'true') {
      const node = toggle.closest('.r22-toc-node');
      setNodeOpen(node, toggle.getAttribute('aria-expanded') !== 'true');
      return;
    }
    const link = event.target.closest('a[data-target]');
    if (link) {
      event.preventDefault();
      navigate(link.dataset.target, true);
    }
  });
  document.getElementById('r22-toc-expand')?.addEventListener('click', () => nodes.forEach(node => setNodeOpen(node, true)));
  document.getElementById('r22-toc-collapse')?.addEventListener('click', () => nodes.forEach(node => setNodeOpen(node, false)));
  document.getElementById('r22-toc-roots')?.addEventListener('click', () => setAllOpenThrough(1));
  document.getElementById('r22-toc-expand-2')?.addEventListener('click', () => setAllOpenThrough(2));
  document.getElementById('r22-toc-expand-3')?.addEventListener('click', () => setAllOpenThrough(3));
  document.getElementById('r22-toc-font-minus')?.addEventListener('click', () => {
    setTocScale(Number(root.dataset.tocScale || 1) - .1);
  });
  document.getElementById('r22-toc-font-plus')?.addEventListener('click', () => {
    setTocScale(Number(root.dataset.tocScale || 1) + .1);
  });
  document.getElementById('r22-toc-drawer')?.addEventListener('click', event => {
    setDrawerOpen(event.currentTarget.getAttribute('aria-expanded') !== 'true');
  });
  document.getElementById('r22-toc-mobile-open')?.addEventListener('click', event => {
    setDrawerOpen(event.currentTarget.getAttribute('aria-expanded') !== 'true');
  });
  document.getElementById('r22-toc-width')?.addEventListener('input', event => {
    const width = Math.max(260, Math.min(460, Number(event.target.value) || 330));
    root.style.setProperty('--r22-toc-width', `${width}px`);
    const output = document.getElementById('r22-toc-width-value');
    if (output) output.value = `${width}px`;
    try { localStorage.setItem('r22-toc-width', String(width)); } catch (_) {}
  });
  links.forEach(link => link.addEventListener('click', () => setDrawerOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('r22-toc-drawer-open')) setDrawerOpen(false);
    if (event.key === 'Tab' && document.body.classList.contains('r22-toc-drawer-open')) {
      const focusable = [...nav.querySelectorAll('button,input,a[href]')].filter(item => item.offsetParent && !item.disabled);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  document.addEventListener('click', event => {
    if (document.body.classList.contains('r22-toc-drawer-open') && !nav.contains(event.target) && !event.target.closest('#r22-toc-mobile-open')) setDrawerOpen(false);
  });
  const mobileQuery = matchMedia('(max-width: 900px)');
  mobileQuery.addEventListener('change', () => setDrawerOpen(false));
  setDrawerOpen(false);
  const openAncestorsFor = id => {
    const link = links.find(item => item.dataset.target === id);
    ancestorNodes(link?.closest('.r22-toc-node')).forEach(parent => setNodeOpen(parent, true));
  };
  window.addEventListener('hashchange', () => { const id = decodeId(location.hash); if (id) { openAncestorsFor(id); navigate(id, false); } });
  window.addEventListener('popstate', () => { const id = decodeId(location.hash); if (id) { openAncestorsFor(id); navigate(id, false); } });
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0] && !navigationLock) markCurrent(visible[0].target.id);
  }, { rootMargin: '-14% 0px -70% 0px', threshold: [0, .01] });
  headings.forEach(heading => observer.observe(heading));
  const initial = decodeId(location.hash);
  let storedScale = 1;
  let storedWidth = 330;
  try { storedScale = Number(localStorage.getItem('r22-toc-scale')) || 1; storedWidth = Number(localStorage.getItem('r22-toc-width')) || 330; } catch (_) {}
  setTocScale(storedScale);
  const widthInput = document.getElementById('r22-toc-width');
  if (widthInput) {
    widthInput.value = String(Math.max(260, Math.min(460, storedWidth)));
    widthInput.dispatchEvent(new Event('input'));
  }
  if (initial) navigate(initial, false);
  else if (headings[0]) markCurrent(headings[0].id);
})();
