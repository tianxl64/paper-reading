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
  document.getElementById('r22-toc-roots')?.addEventListener('click', () => nodes.forEach(node => setNodeOpen(node, false)));
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
  if (initial) navigate(initial, false);
  else if (headings[0]) markCurrent(headings[0].id);
})();
