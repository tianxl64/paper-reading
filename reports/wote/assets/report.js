(function () {
  if (window.__WOTE_BUILD_MATH_ONLY__) return;
  const article = document.getElementById('article');
  const toc = document.getElementById('toc');
  if (!article || !toc) return;
  const headings = [...document.querySelectorAll('.hero h1,#article h1,#article h2,#article h3,#article h4,#article h5,#article h6')].filter((h) => h.id);
  const roots = []; const stack = []; const links = [];
  headings.forEach((heading) => {
    const level = Number(heading.tagName.slice(1));
    const node = { heading, level, children: [], link: null, toggle: null };
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    if (stack.length) stack[stack.length - 1].node.children.push(node); else roots.push(node);
    stack.push({ level, node });
  });
  function reveal(link) {
    let item = link && link.closest('li');
    while (item) {
      const list = item.querySelector(':scope > ul.toc-tree');
      const toggle = item.querySelector(':scope > .toc-row > .toc-toggle');
      if (list && list.hidden) { list.hidden = false; item.classList.remove('toc-collapsed'); if (toggle) { toggle.setAttribute('aria-expanded', 'true'); toggle.textContent = '▾'; } }
      item = item.parentElement && item.parentElement.closest('li');
    }
  }
  function active(link) { links.forEach((x) => x.classList.toggle('active', x === link)); reveal(link); }
  function render(node, parent) {
    const li = document.createElement('li'); li.className = 'toc-node'; li.dataset.level = String(node.level);
    const row = document.createElement('div'); row.className = 'toc-row';
    if (node.children.length) {
      const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'toc-toggle'; toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', '折叠 ' + node.heading.textContent.trim()); toggle.textContent = '▾'; node.toggle = toggle; row.appendChild(toggle);
    } else { const spacer = document.createElement('span'); spacer.className = 'toc-toggle-spacer'; spacer.setAttribute('aria-hidden', 'true'); row.appendChild(spacer); }
    const link = document.createElement('a'); link.href = '#' + node.heading.id; link.dataset.level = String(node.level); link.textContent = node.heading.textContent.trim(); node.link = link; links.push(link);
    link.addEventListener('click', (event) => { event.preventDefault(); node.heading.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.pushState(null, '', '#' + node.heading.id); node.heading.focus({ preventScroll: true }); active(link); });
    row.appendChild(link); li.appendChild(row); parent.appendChild(li);
    if (node.children.length) {
      const list = document.createElement('ul'); list.className = 'toc-tree'; li.appendChild(list);
      node.toggle.addEventListener('click', () => { const open = node.toggle.getAttribute('aria-expanded') === 'true'; node.toggle.setAttribute('aria-expanded', String(!open)); node.toggle.setAttribute('aria-label', (open ? '展开 ' : '折叠 ') + node.heading.textContent.trim()); node.toggle.textContent = open ? '▸' : '▾'; list.hidden = open; li.classList.toggle('toc-collapsed', open); });
      node.toggle.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); node.toggle.click(); } });
      node.children.forEach((child) => render(child, list));
    }
  }
  const staticRoot = toc.querySelector('ul.toc-tree');
  if (staticRoot) {
    // The builder already serialized the canonical heading tree for offline
    // reading. Runtime JS only hydrates behavior; it never creates a second
    // set of links or changes the semantic parent/child structure.
    toc.querySelectorAll('.toc-node').forEach((li) => {
      const id = li.dataset.headingId;
      const heading = id && document.getElementById(id);
      const link = li.querySelector(':scope > .toc-row > a');
      const toggle = li.querySelector(':scope > .toc-row > .toc-toggle');
      if (heading && link) {
        links.push(link);
        link.addEventListener('click', (event) => { event.preventDefault(); heading.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.pushState(null, '', '#' + id); heading.focus({ preventScroll: true }); active(link); });
      }
      if (toggle) {
        const list = li.querySelector(':scope > ul.toc-tree');
        toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!open)); toggle.setAttribute('aria-label', (open ? '展开 ' : '折叠 ') + (heading ? heading.textContent.trim() : '目录')); toggle.textContent = open ? '▸' : '▾'; if (list) list.hidden = open; li.classList.toggle('toc-collapsed', open); });
        toggle.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle.click(); } });
      }
    });
  } else {
    // The static builder is the only canonical source. A missing tree is an
    // integrity failure; do not silently create a second navigation model.
    return;
  }
  function setAll(open) {
    toc.querySelectorAll('.toc-toggle').forEach((button) => {
      const list = button.closest('li').querySelector(':scope > ul');
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '▾' : '▸';
      if (list) list.hidden = !open;
    });
  }
  document.querySelector('[data-toc-action="expand"]')?.addEventListener('click', () => setAll(true));
  document.querySelector('[data-toc-action="collapse"]')?.addEventListener('click', () => setAll(false));
  const mobileToggle = document.querySelector('[data-toc-action="mobile"]');
  mobileToggle?.addEventListener('click', () => { const open = mobileToggle.getAttribute('aria-expanded') === 'true'; mobileToggle.setAttribute('aria-expanded', String(!open)); toc.hidden = open; });
  const observer = new IntersectionObserver((entries) => { const visible = entries.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (visible) active(links.find((x) => x.hash === '#' + visible.target.id)); }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
  headings.forEach((heading) => observer.observe(heading));
  function hashJump() { const id = decodeURIComponent(location.hash.slice(1)); if (!id) return; const heading = document.getElementById(id); const link = links.find((x) => x.hash === '#' + id); if (heading) { reveal(link); heading.scrollIntoView({ behavior: 'auto', block: 'start' }); heading.focus({ preventScroll: true }); active(link); } }
  window.addEventListener('popstate', hashJump); window.addEventListener('hashchange', hashJump); if (location.hash) setTimeout(hashJump, 0);
  const search = document.getElementById('searchInput'); if (search) search.addEventListener('input', () => { const query = search.value.trim().toLowerCase(); article.querySelectorAll('.searchable').forEach((node) => node.classList.toggle('hidden-by-search', Boolean(query) && !node.textContent.toLowerCase().includes(query))); });
  const viewer = document.getElementById('viewer'); const stage = viewer && viewer.querySelector('.viewer-stage'); const image = document.getElementById('viewer-image'); const caption = document.getElementById('viewer-caption'); const scale = document.getElementById('viewer-scale');
  if (!viewer || !stage || !image || !caption) return;
  const toolbar = viewer.querySelector('.viewer-toolbar'); const reset = viewer.querySelector('[data-zoom="reset"]'); const native = document.createElement('button'); native.type = 'button'; native.dataset.zoom = 'native'; native.textContent = '原始像素'; native.setAttribute('aria-label', '按原始像素查看图像'); toolbar.insertBefore(native, scale || caption);
  let lastFocus = null; let fitRatio = 1; let zoomLevel = 1; let mode = 'fit'; let drag = null;
  function size() { return { width: image.naturalWidth || 1, height: image.naturalHeight || 1 }; }
  function status() { const current = size(); if (scale) scale.textContent = mode === 'fit' ? '适应窗口' : mode === 'native' ? '原始像素 · 100%' : '缩放 · ' + Math.round(fitRatio * zoomLevel * 100) + '%'; image.setAttribute('aria-label', caption.textContent + '，' + current.width + '×' + current.height + '像素'); }
  function setWidth(width) { image.style.width = Math.max(1, Math.round(width * 100) / 100) + 'px'; image.style.height = 'auto'; image.style.marginLeft = width < stage.clientWidth ? 'auto' : '0'; image.style.marginRight = width < stage.clientWidth ? 'auto' : '0'; stage.scrollLeft = 0; stage.scrollTop = 0; status(); }
  function fit() { const current = size(); fitRatio = Math.min(1, stage.clientWidth / current.width, stage.clientHeight / current.height); mode = 'fit'; zoomLevel = 1; setWidth(current.width * fitRatio); }
  function original() { mode = 'native'; zoomLevel = 1 / fitRatio; setWidth(size().width); }
  function zoom() { mode = 'zoom'; setWidth(size().width * fitRatio * zoomLevel); }
  function close() { viewer.hidden = true; document.body.classList.remove('no-scroll'); drag = null; if (lastFocus && lastFocus.isConnected) lastFocus.focus(); }
  function open(button) { lastFocus = button; const source = button.querySelector('img'); image.src = source.currentSrc || source.src; image.alt = source.alt; caption.textContent = source.alt; viewer.hidden = false; document.body.classList.add('no-scroll'); const ready = () => { fit(); stage.focus({ preventScroll: true }); }; if (image.complete && image.naturalWidth) ready(); else image.addEventListener('load', ready, { once: true }); }
  document.querySelectorAll('.figure-button').forEach((button) => button.addEventListener('click', () => open(button))); viewer.querySelector('.viewer-close').addEventListener('click', close); viewer.addEventListener('click', (event) => { if (event.target === viewer) close(); }); document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !viewer.hidden) { event.preventDefault(); close(); } }); window.addEventListener('resize', () => { if (!viewer.hidden && mode === 'fit') fit(); }); reset.addEventListener('click', fit); native.addEventListener('click', original); viewer.querySelector('[data-zoom="out"]').addEventListener('click', () => { zoomLevel = Math.max(.5, zoomLevel - .25); zoom(); }); viewer.querySelector('[data-zoom="in"]').addEventListener('click', () => { zoomLevel = Math.min(Math.max(4, 4 / fitRatio), zoomLevel + .25); zoom(); });
  stage.tabIndex = 0; stage.addEventListener('pointerdown', (event) => { if (event.pointerType !== 'mouse' || event.button !== 0 || (stage.scrollWidth <= stage.clientWidth && stage.scrollHeight <= stage.clientHeight)) return; event.preventDefault(); drag = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop }; stage.setPointerCapture(event.pointerId); image.classList.add('dragging'); }); stage.addEventListener('pointermove', (event) => { if (drag) { stage.scrollLeft = drag.left - (event.clientX - drag.x); stage.scrollTop = drag.top - (event.clientY - drag.y); } }); function endDrag(event) { if (!drag) return; drag = null; image.classList.remove('dragging'); if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId); } stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
})();
