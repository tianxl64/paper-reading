"use strict";
(() => {
  document.body.classList.remove("no-js");
  const article = document.querySelector("article");
  const toc = document.querySelector("#toc");
  const headings = [...article.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  const links = [], nodes = [], stack = [];
  const root = toc.querySelector(":scope > .toc-tree");
  if (!root) return;
  const setExpanded = (item, expanded) => {
    item.li.classList.toggle("expanded", expanded);
    if (!item.toggle) return;
    item.toggle.textContent = expanded ? "▾" : "▸";
    item.toggle.setAttribute("aria-expanded", String(expanded));
    item.toggle.setAttribute("aria-label", (expanded ? "折叠章节：" : "展开章节：") + item.link.textContent);
  };
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `section-${String(index + 1).padStart(4, "0")}`;
    heading.tabIndex = -1;
    const level = Number(heading.tagName.slice(1));
    const link = [...root.querySelectorAll("a")].find((candidate) => candidate.getAttribute("href") === `#${heading.id}`);
    if (!link) return;
    const li = link.closest("li");
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    const parent = stack.at(-1) || null;
    const item = { heading, li, link, level, parent, children: [], index, list: li.querySelector(":scope > ul") };
    if (parent) parent.children.push(item);
    nodes.push(item); links.push(link); stack.push(item);
  });
  nodes.forEach((item) => {
    if (!item.children.length) return;
    const button = item.li.querySelector(":scope > button.toc-toggle");
    if (!button) return;
    item.toggle = button;
    setExpanded(item, false);
    button.addEventListener("click", (event) => {
      event.preventDefault(); event.stopPropagation();
      setExpanded(item, !item.li.classList.contains("expanded"));
    });
  });
  const parents = nodes.filter((item) => item.children.length);
  const expandAll = () => parents.forEach((item) => setExpanded(item, true));
  const collapseAll = () => parents.forEach((item) => setExpanded(item, false));
  const expandAncestors = (item) => { for (let parent = item.parent; parent; parent = parent.parent) setExpanded(parent, true); };
  const activate = (heading) => {
    const item = nodes.find((entry) => entry.heading === heading);
    if (!item) return;
    links.forEach((link) => { link.classList.remove("active", "parent-active"); link.removeAttribute("aria-current"); });
    item.link.classList.add("active"); item.link.setAttribute("aria-current", "location");
    expandAncestors(item);
    for (let parent = item.parent; parent; parent = parent.parent) parent.link.classList.add("parent-active");
  };
  let jumpTimer;
  const jump = (hash, update = true) => {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    const target = document.getElementById(id);
    if (!target) return;
    const heading = headings.includes(target) ? target : (document.getElementById(target.dataset.legacyTarget || "") || headings.find((entry) => target.compareDocumentPosition(entry) & Node.DOCUMENT_POSITION_FOLLOWING));
    if (!heading) return;
    activate(heading); heading.scrollIntoView({ behavior: "auto", block: "start" }); heading.focus({ preventScroll: true });
    if (update) history.pushState(null, "", `#${heading.id}`);
    clearTimeout(jumpTimer);
    jumpTimer = setTimeout(() => { window.scrollTo({ top: window.scrollY + heading.getBoundingClientRect().top - 24, behavior: "auto" }); activate(heading); }, 600);
  };
  toc.addEventListener("click", (event) => { const link = event.target.closest("a"); if (link && link.closest(".toc-tree")) { event.preventDefault(); jump(link.hash); } });
  toc.addEventListener("keydown", (event) => {
    if (!event.target.matches("a")) return;
    const item = nodes[Number(event.target.dataset.headingIndex)];
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); jump(event.target.hash); return; }
    if (!["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const visible = links.filter((link) => link.getClientRects().length);
    const position = visible.indexOf(item.link);
    if (event.key === "ArrowLeft") { if (item.children.length && item.li.classList.contains("expanded")) setExpanded(item, false); else item.parent?.link.focus(); }
    else if (event.key === "ArrowRight") { if (item.children.length) { setExpanded(item, true); item.children[0].link.focus(); } }
    else if (event.key === "ArrowDown") visible[Math.min(position + 1, visible.length - 1)]?.focus();
    else if (event.key === "ArrowUp") visible[Math.max(position - 1, 0)]?.focus();
    else if (event.key === "Home") visible[0]?.focus(); else visible.at(-1)?.focus();
  });
  document.querySelector("#toc-expand").addEventListener("click", expandAll);
  document.querySelector("#toc-collapse").addEventListener("click", collapseAll);
  const search = document.querySelector("#toc-search");
  const status = document.querySelector("#toc-search-status");
  let savedExpansion = null;
  search.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    if (query && !savedExpansion) savedExpansion = new Set(parents.filter((item) => item.li.classList.contains("expanded")).map((item) => item.index));
    let count = 0;
    [...nodes].reverse().forEach((item) => {
      const self = item.link.textContent.toLocaleLowerCase().includes(query);
      const descendant = item.children.some((child) => !child.li.classList.contains("is-hidden"));
      item.li.classList.toggle("is-hidden", Boolean(query && !self && !descendant));
      if (query && self) count += 1;
      if (query && descendant) setExpanded(item, true);
    });
    if (!query && savedExpansion) { parents.forEach((item) => setExpanded(item, savedExpansion.has(item.index))); savedExpansion = null; }
    status.textContent = query ? `匹配 ${count} 个章节` : "";
  });
  const font = (kind, delta) => {
    const key = kind === "toc" ? "toc-size" : "body-size";
    const current = parseFloat(getComputedStyle(kind === "toc" ? links[0] : document.body).fontSize);
    const next = Math.max(kind === "toc" ? 10 : 14, Math.min(kind === "toc" ? 20 : 24, current + delta));
    document.documentElement.style.setProperty(`--${key}`, `${next}px`);
    document.querySelector(`#${kind}-font-size`).value = String(next);
  };
  document.querySelectorAll("[data-font]").forEach((button) => button.addEventListener("click", () => { const [kind, direction] = button.dataset.font.split("-"); font(kind, direction === "up" ? 1 : -1); }));
  document.querySelector("#body-font-size").value = String(parseFloat(getComputedStyle(document.body).fontSize));
  document.querySelector("#toc-font-size").value = String(parseFloat(getComputedStyle(links[0]).fontSize));
  let ticking = false;
  const spy = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { let current = headings[0]; for (const heading of headings) { if (heading.getBoundingClientRect().top < 64) current = heading; else break; } activate(current); ticking = false; }); };
  window.addEventListener("scroll", spy, { passive: true });
  window.addEventListener("popstate", () => { if (location.hash) jump(location.hash, false); });
  window.addEventListener("hashchange", () => { if (location.hash) jump(location.hash, false); });
  if (location.hash) setTimeout(() => jump(location.hash, false), 100); else spy();
  const viewer = document.querySelector("#viewer"), image = document.querySelector("#viewer-image"), stage = viewer.querySelector(".viewer-stage"), caption = document.querySelector("#viewer-caption"), scaleLabel = document.querySelector("#viewer-scale");
  let scale = 1, x = 0, y = 0, origin = null, drag = null;
  const paint = () => { image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`; scaleLabel.value = `${Math.round(scale * 100)}%`; };
  const fit = () => { scale = Math.min((stage.clientWidth - 36) / image.naturalWidth, (stage.clientHeight - 36) / image.naturalHeight, 1); x = y = 0; paint(); };
  const zoom = (factor) => { scale = Math.max(0.05, Math.min(12, scale * factor)); paint(); };
  const originalLink = document.querySelector("#viewer-original");
  const close = () => { viewer.hidden = true; document.body.style.overflow = ""; image.removeAttribute("src"); originalLink.removeAttribute("href"); scale = 1; x = y = 0; drag = null; origin?.focus(); origin = null; };
  const open = (img) => { origin = img; viewer.hidden = false; document.body.style.overflow = "hidden"; caption.textContent = img.closest("figure")?.querySelector("figcaption")?.textContent || img.alt; image.alt = img.alt; image.onload = fit; image.src = img.currentSrc || img.src; originalLink.href = image.src; viewer.querySelector('[data-view="close"]').focus(); };
  article.querySelectorAll("figure img").forEach((img) => { img.tabIndex = 0; img.setAttribute("role", "button"); img.setAttribute("aria-label", `放大图片：${img.alt}`); const fallback = img.closest("a.image-open"); if (fallback) fallback.tabIndex = -1; });
  article.addEventListener("click", (event) => { if (event.target.matches("figure img")) { event.preventDefault(); open(event.target); } });
  article.addEventListener("keydown", (event) => { if (event.target.matches("figure img") && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); open(event.target); } });
  viewer.addEventListener("click", (event) => { const action = event.target.dataset.view; if (action === "close") close(); else if (action === "in") zoom(1.2); else if (action === "out") zoom(1 / 1.2); else if (action === "actual") { scale = 1; x = y = 0; paint(); } else if (action === "fit") fit(); else if (event.target === stage) close(); });
  viewer.addEventListener("wheel", (event) => { event.preventDefault(); zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  stage.addEventListener("pointerdown", (event) => { drag = { px: event.clientX, py: event.clientY, x, y, moved: false }; stage.setPointerCapture(event.pointerId); });
  stage.addEventListener("pointermove", (event) => { if (!drag) return; x = drag.x + event.clientX - drag.px; y = drag.y + event.clientY - drag.py; drag.moved = drag.moved || Math.abs(x - drag.x) + Math.abs(y - drag.y) > 4; paint(); });
  stage.addEventListener("pointerup", (event) => { if (drag?.moved) { event.preventDefault(); stage.addEventListener("click", (stop) => stop.stopImmediatePropagation(), { once: true, capture: true }); } drag = null; });
  stage.addEventListener("pointercancel", () => { drag = null; });
  document.addEventListener("keydown", (event) => {
    if (viewer.hidden) return;
    if (event.key === "Tab") {
      const controls = [...viewer.querySelectorAll("button,a[href]")];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    } else if (event.key === "Escape") close(); else if (event.key === "+" || event.key === "=") zoom(1.2); else if (event.key === "-") zoom(1 / 1.2); else if (event.key === "0") fit();
  });
})();
