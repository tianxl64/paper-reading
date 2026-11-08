(() => {
  'use strict';
  const viewer = document.getElementById('r22-viewer');
  const stage = document.querySelector('.r22-viewer-stage');
  const image = document.getElementById('r22-viewer-img');
  const caption = document.querySelector('.r22-viewer-caption');
  const scaleLabel = document.querySelector('.r22-viewer-scale');
  const closeButton = document.getElementById('r22-viewer-close');
  if (!viewer || !stage || !image) return;
  let lastFocus = null;
  let naturalWidth = 0;
  let naturalHeight = 0;
  let scale = 1;
  let fitScale = 1;
  let tx = 0;
  let ty = 0;
  let drag = null;
  let previousScroll = 0;
  let fitMode = false;
  let clickedAfterDrag = false;
  let previousBodyOverflow = '';
  const background = document.querySelector('.r22-shell');

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const stageSize = () => ({ width: stage.clientWidth, height: stage.clientHeight });
  const fitValue = () => {
    const size = stageSize();
    if (!naturalWidth || !naturalHeight) return 1;
    return Math.min((size.width - 36) / naturalWidth, (size.height - 36) / naturalHeight, 1);
  };
  const center = () => {
    const size = stageSize();
    tx = (size.width - naturalWidth * scale) / 2;
    ty = (size.height - naturalHeight * scale) / 2;
  };
  const limitPan = () => {
    const size = stageSize();
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    const margin = 40;
    if (width <= size.width) tx = (size.width - width) / 2;
    else tx = clamp(tx, size.width - width - margin, margin);
    if (height <= size.height) ty = (size.height - height) / 2;
    else ty = clamp(ty, size.height - height - margin, margin);
  };
  const render = () => {
    limitPan();
    image.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    if (scaleLabel) scaleLabel.textContent = `${Math.round(scale * 100)}%`;
  };
  const fit = () => { fitMode = true; fitScale = fitValue(); scale = fitScale; center(); render(); };
  const oneToOne = () => { fitMode = false; scale = 1; center(); render(); };
  const setScale = (next, anchorX = stage.clientWidth / 2, anchorY = stage.clientHeight / 2) => {
    const old = scale;
    scale = clamp(next, .08, 8);
    fitMode = false;
    const imageX = (anchorX - tx) / old;
    const imageY = (anchorY - ty) / old;
    tx = anchorX - imageX * scale;
    ty = anchorY - imageY * scale;
    render();
  };
  const reset = () => { scale = 1; fitScale = 1; tx = 0; ty = 0; naturalWidth = 0; naturalHeight = 0; fitMode = false; drag = null; image.removeAttribute('src'); image.removeAttribute('alt'); image.style.transform = ''; caption.textContent = ''; stage.classList.remove('r22-dragging'); };
  const close = () => {
    viewer.hidden = true;
    document.body.classList.remove('r22-viewer-open');
    document.body.style.overflow = previousBodyOverflow;
    if (background) background.inert = false;
    window.scrollTo(0, previousScroll);
    reset();
    lastFocus?.focus?.();
  };
  const open = source => {
    lastFocus = source;
    previousScroll = window.scrollY;
    previousBodyOverflow = document.body.style.overflow;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt || '';
    caption.textContent = source.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || source.alt || '';
    viewer.hidden = false;
    document.body.classList.add('r22-viewer-open');
    document.body.style.overflow = 'hidden';
    if (background) background.inert = true;
    const ready = () => { naturalWidth = image.naturalWidth; naturalHeight = image.naturalHeight; fit(); };
    if (image.complete && image.naturalWidth) ready(); else image.addEventListener('load', ready, { once: true });
    closeButton?.focus();
  };
  document.getElementById('r22-article')?.addEventListener('click', event => {
    const source = event.target.closest('img[data-viewer-image]');
    if (source) { event.preventDefault(); open(source); }
  });
  document.getElementById('r22-article')?.addEventListener('keydown', event => {
    const source = event.target.closest('img[data-viewer-image]');
    if (source && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); open(source); }
  });
  closeButton?.addEventListener('click', close);
  viewer.addEventListener('click', event => { if (event.target === viewer) close(); });
  stage.addEventListener('click', event => {
    if (clickedAfterDrag) { clickedAfterDrag = false; return; }
    if (event.target === stage) close();
  });
  stage.addEventListener('wheel', event => { if (!viewer.hidden) { event.preventDefault(); const box = stage.getBoundingClientRect(); setScale(scale + (event.deltaY < 0 ? .15 : -.15), event.clientX - box.left, event.clientY - box.top); } }, { passive: false });
  stage.addEventListener('pointerdown', event => { if (viewer.hidden) return; clickedAfterDrag = false; drag = { id: event.pointerId, x: event.clientX, y: event.clientY, tx, ty }; stage.setPointerCapture?.(event.pointerId); stage.classList.add('r22-dragging'); });
  stage.addEventListener('pointermove', event => { if (!drag || drag.id !== event.pointerId) return; if(Math.abs(event.clientX-drag.x)+Math.abs(event.clientY-drag.y)>4)clickedAfterDrag=true; tx = drag.tx + event.clientX - drag.x; ty = drag.ty + event.clientY - drag.y; render(); });
  const endDrag = event => { if (drag && drag.id === event.pointerId) { try { stage.releasePointerCapture?.(event.pointerId); } catch (_) {} drag = null; stage.classList.remove('r22-dragging'); } };
  stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag); stage.addEventListener('pointerleave', endDrag);
  document.getElementById('r22-viewer-fit')?.addEventListener('click', fit);
  document.getElementById('r22-viewer-one')?.addEventListener('click', oneToOne);
  document.getElementById('r22-viewer-minus')?.addEventListener('click', () => setScale(scale - .2));
  document.getElementById('r22-viewer-plus')?.addEventListener('click', () => setScale(scale + .2));
  window.addEventListener('resize', () => { if (!viewer.hidden && fitMode) fit(); else if (!viewer.hidden) render(); });
  window.addEventListener('keydown', event => {
    if (viewer.hidden) return;
    if (event.key === 'Tab') {
      const focusable = [...viewer.querySelectorAll('button')].filter(item=>!item.disabled);
      const first=focusable[0], last=focusable[focusable.length-1];
      if (event.shiftKey && document.activeElement===first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement===last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'Escape') close();
    else if (event.key === '0') fit();
    else if (event.key === '1') oneToOne();
    else if (event.key === '+' || event.key === '=') setScale(scale + .2);
    else if (event.key === '-') setScale(scale - .2);
  });
})();
