/* Wiki VentiStudio — recherche live + auto-TOC + ancres de section */
(function () {
  'use strict';

  const articles = (typeof wikiArticles !== 'undefined') ? wikiArticles : [];

  /* ── Helpers ─────────────────────────────────────────── */
  function normalize(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function slugify(s) {
    return normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  }

  /* ── Recherche live ──────────────────────────────────── */
  function scoreArticle(article, q) {
    const nq = normalize(q);
    if (!nq) return 0;
    let score = 0;
    if (normalize(article.title).startsWith(nq)) score += 100;
    else if (normalize(article.title).includes(nq)) score += 50;
    if ((article.tags || []).some(t => normalize(t).includes(nq))) score += 30;
    if (normalize(article.summary).includes(nq)) score += 10;
    if (normalize(article.categoryLabel).includes(nq)) score += 5;
    return score;
  }
  function search(q, limit = 8) {
    if (!q || !q.trim()) return [];
    return articles
      .map(a => ({ a, s: scoreArticle(a, q) }))
      .filter(x => x.s > 0)
      .sort((x, y) => y.s - x.s)
      .slice(0, limit)
      .map(x => x.a);
  }
  function renderResults(box, results, q) {
    if (!q.trim()) { box.hidden = true; box.innerHTML = ''; return; }
    if (!results.length) {
      box.hidden = false;
      box.innerHTML = '<div class="wiki-search-empty">Aucun résultat pour « ' +
        escapeHtml(q) + ' »</div>';
      return;
    }
    box.hidden = false;
    box.innerHTML = results.map(r =>
      '<a href="' + r.url + '">' +
      '<span class="res-title">' + escapeHtml(r.title) + '</span>' +
      '<span class="res-cat">' + escapeHtml(r.categoryLabel) + '</span>' +
      '</a>'
    ).join('');
  }
  function initSearch() {
    const inputs = document.querySelectorAll('.wiki-search input, #wikiSearch');
    inputs.forEach(input => {
      let box = input.parentElement.querySelector('.wiki-search-results');
      if (!box) {
        box = document.createElement('div');
        box.className = 'wiki-search-results';
        box.hidden = true;
        if (input.parentElement.classList.contains('wiki-search')) {
          input.parentElement.appendChild(box);
        } else {
          const wrap = document.createElement('div');
          wrap.className = 'wiki-search';
          input.parentNode.insertBefore(wrap, input);
          wrap.appendChild(input);
          wrap.appendChild(box);
        }
      }
      let focusIdx = -1;
      const update = () => {
        const q = input.value;
        renderResults(box, search(q), q);
        focusIdx = -1;
      };
      input.addEventListener('input', update);
      input.addEventListener('focus', update);
      input.addEventListener('blur', () => setTimeout(() => { box.hidden = true; }, 180));
      input.addEventListener('keydown', (e) => {
        const items = box.querySelectorAll('a');
        if (!items.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); focusIdx = Math.min(focusIdx + 1, items.length - 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); focusIdx = Math.max(focusIdx - 1, 0); }
        else if (e.key === 'Enter') {
          if (focusIdx >= 0) { e.preventDefault(); window.location.href = items[focusIdx].getAttribute('href'); }
          return;
        } else if (e.key === 'Escape') { box.hidden = true; input.blur(); return; }
        else { return; }
        items.forEach(it => it.classList.remove('kbd-focus'));
        if (focusIdx >= 0) {
          items[focusIdx].classList.add('kbd-focus');
          items[focusIdx].scrollIntoView({ block: 'nearest' });
        }
      });
    });
  }

  /* ── Auto-TOC + ancres ────────────────────────────────── */
  function initArticle() {
    const content = document.querySelector('.wiki-content');
    if (!content) return;

    const headings = content.querySelectorAll('h2, h3');
    if (headings.length < 3) return;
    if (content.querySelector('.wiki-toc')) return;

    const used = {};
    headings.forEach(h => {
      if (!h.id) {
        let slug = slugify(h.textContent) || 'section';
        if (used[slug]) { slug += '-' + (++used[slug]); } else { used[slug] = 1; }
        h.id = slug;
      }
      if (!h.querySelector('.anchor')) {
        const a = document.createElement('a');
        a.className = 'anchor';
        a.href = '#' + h.id;
        a.textContent = '§';
        a.setAttribute('aria-label', 'Lien vers cette section');
        h.appendChild(a);
      }
    });

    const toc = document.createElement('nav');
    toc.className = 'wiki-toc';
    toc.setAttribute('aria-label', 'Sommaire');
    const titleBar = document.createElement('div');
    titleBar.className = 'wiki-toc-title';
    titleBar.innerHTML = '<span>Sommaire</span>';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'wiki-toc-toggle';
    toggle.textContent = '[masquer]';
    toggle.addEventListener('click', () => {
      const collapsed = toc.classList.toggle('collapsed');
      toggle.textContent = collapsed ? '[afficher]' : '[masquer]';
    });
    titleBar.appendChild(toggle);
    toc.appendChild(titleBar);

    const rootOl = document.createElement('ol');
    let currentSubOl = null;
    headings.forEach(h => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + h.id;
      const tmp = h.cloneNode(true);
      tmp.querySelectorAll('.anchor').forEach(n => n.remove());
      link.textContent = tmp.textContent.trim();
      li.appendChild(link);
      if (h.tagName === 'H2') {
        rootOl.appendChild(li);
        currentSubOl = null;
      } else {
        if (!currentSubOl) {
          const last = rootOl.lastElementChild;
          if (last) {
            currentSubOl = document.createElement('ol');
            last.appendChild(currentSubOl);
          } else { rootOl.appendChild(li); return; }
        }
        currentSubOl.appendChild(li);
      }
    });
    toc.appendChild(rootOl);

    const firstH2 = content.querySelector('h2');
    if (firstH2) firstH2.parentNode.insertBefore(toc, firstH2);
    else content.appendChild(toc);
  }

  function init() {
    initSearch();
    initArticle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
