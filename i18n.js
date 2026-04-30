/*!
 * VentiStudio i18n v1.0 — Moteur de traduction client-side
 * ─────────────────────────────────────────────────────────
 * Usage HTML :
 *   data-i18n="key"               → remplace textContent (ou 1er nœud texte si SVG présent)
 *   data-i18n-html="key"          → remplace innerHTML (contenu mixte avec balises)
 *   data-i18n-attr="attr:key"     → remplace un attribut (aria-label, placeholder, title…)
 *   data-i18n-attr="a:k1,b:k2"   → plusieurs attributs séparés par virgule
 *
 * Fichiers de langue : /locales/{lang}.json (JSON plat, clés pointées)
 * Source (fallback) : /locales/fr.json (ou HTML statique = déjà en français)
 *
 * API publique :
 *   window.VS_I18N.getLang()      → code langue actif
 *   window.VS_I18N.setLang('en')  → changer la langue
 */
(function () {
  'use strict';

  var FALLBACK = 'fr';
  var STORAGE_KEY = 'vs-lang';
  var _cache = {};

  /* ─── Détection ──────────────────────────────────────────── */
  function detect() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return ((navigator.language || navigator.userLanguage || FALLBACK) + '').slice(0, 2).toLowerCase();
  }

  var _lang = detect();

  /* ─── Application ────────────────────────────────────────── */
  function apply(data) {
    _cache[_lang] = data;

    // data-i18n : texte simple
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var v = data[el.getAttribute('data-i18n')];
      if (v == null) continue;

      // Si l'élément a des enfants HTML (SVG, spans…) → mise à jour du 1er nœud texte uniquement
      var hasChild = false;
      for (var c = 0; c < el.childNodes.length; c++) {
        if (el.childNodes[c].nodeType === 1) { hasChild = true; break; }
      }
      if (hasChild) {
        for (var c = 0; c < el.childNodes.length; c++) {
          var n = el.childNodes[c];
          if (n.nodeType === 3 && n.nodeValue.trim()) { n.nodeValue = v + ' '; break; }
        }
      } else {
        el.textContent = v;
      }
    }

    // data-i18n-html : innerHTML (liens, <em>, etc. dans le texte)
    var hels = document.querySelectorAll('[data-i18n-html]');
    for (var i = 0; i < hels.length; i++) {
      var v = data[hels[i].getAttribute('data-i18n-html')];
      if (v != null) hels[i].innerHTML = v;
    }

    // data-i18n-attr : attributs
    var aels = document.querySelectorAll('[data-i18n-attr]');
    for (var i = 0; i < aels.length; i++) {
      var pairs = aels[i].getAttribute('data-i18n-attr').split(',');
      for (var j = 0; j < pairs.length; j++) {
        var idx = pairs[j].indexOf(':');
        if (idx < 0) continue;
        var attr = pairs[j].slice(0, idx).trim();
        var v = data[pairs[j].slice(idx + 1).trim()];
        if (v != null) aels[i].setAttribute(attr, v);
      }
    }

    // Méta HTML
    document.documentElement.lang = _lang;
    if (data['page.title']) document.title = data['page.title'];
    var md = document.querySelector('meta[name=description]');
    if (md && data['meta.description']) md.content = data['meta.description'];

    document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: _lang, data: data } }));
  }

  /* ─── Chargement JSON ────────────────────────────────────── */
  function load(l, fallback) {
    if (_cache[l]) { apply(_cache[l]); return; }
    fetch('/locales/' + l + '.json')
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(apply)
      .catch(function () { if (!fallback && l !== FALLBACK) load(FALLBACK, true); });
  }

  /* ─── Sélecteur de langue ────────────────────────────────── */
  var LANGS = [
    ['fr', '🇫🇷 FR', 'Français'],
    ['en', '🇬🇧 EN', 'English'],
    ['de', '🇩🇪 DE', 'Deutsch'],
    ['es', '🇪🇸 ES', 'Español'],
    ['pt', '🇵🇹 PT', 'Português'],
    ['it', '🇮🇹 IT', 'Italiano'],
    ['nl', '🇳🇱 NL', 'Nederlands'],
    ['pl', '🇵🇱 PL', 'Polski'],
    ['ru', '🇷🇺 RU', 'Русский'],
    ['uk', '🇺🇦 UK', 'Українська'],
    ['cs', '🇨🇿 CS', 'Čeština'],
    ['sv', '🇸🇪 SV', 'Svenska'],
    ['da', '🇩🇰 DA', 'Dansk'],
    ['fi', '🇫🇮 FI', 'Suomi'],
    ['nb', '🇳🇴 NO', 'Norsk'],
    ['ja', '🇯🇵 JA', '日本語'],
    ['ko', '🇰🇷 KO', '한국어'],
    ['zh', '🇨🇳 ZH', '中文'],
    ['ar', '🇸🇦 AR', 'العربية'],
    ['he', '🇮🇱 HE', 'עברית'],
    ['hi', '🇮🇳 HI', 'हिन्दी'],
    ['tr', '🇹🇷 TR', 'Türkçe'],
    ['id', '🇮🇩 ID', 'Bahasa Indonesia'],
    ['vi', '🇻🇳 VI', 'Tiếng Việt'],
    ['th', '🇹🇭 TH', 'ภาษาไทย'],
  ];

  function buildSwitcher() {
    var wrap = document.getElementById('lang-switcher');
    if (!wrap) return;

    var btn = document.createElement('button');
    btn.className = 'lang-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('title', 'Language / Langue');
    btn.setAttribute('aria-label', 'Language / Langue');

    var current = LANGS.filter(function (l) { return l[0] === _lang; })[0] || LANGS[0];
    btn.textContent = current[1];

    var dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', 'Sélectionner une langue');
    dropdown.hidden = true;

    LANGS.forEach(function (l) {
      var opt = document.createElement('button');
      opt.className = 'lang-opt' + (l[0] === _lang ? ' lang-opt-active' : '');
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', l[0] === _lang ? 'true' : 'false');
      opt.textContent = l[1] + ' ' + l[2];
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        _lang = l[0];
        localStorage.setItem(STORAGE_KEY, _lang);
        dropdown.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = l[1];
        if (_lang === FALLBACK) location.reload();
        else load(_lang);
      });
      dropdown.appendChild(opt);
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dropdown.hidden;
      dropdown.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function () {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dropdown.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(dropdown);
  }

  /* ─── Init ───────────────────────────────────────────────── */
  function init() {
    buildSwitcher();
    if (_lang !== FALLBACK) load(_lang);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  /* ─── API publique ───────────────────────────────────────── */
  window.VS_I18N = {
    getLang: function () { return _lang; },
    setLang: function (l) {
      _lang = l;
      localStorage.setItem(STORAGE_KEY, l);
      if (l === FALLBACK) location.reload();
      else load(l);
    },
    t: function (key) {
      return (_cache[_lang] && _cache[_lang][key]) || (_cache[FALLBACK] && _cache[FALLBACK][key]) || key;
    }
  };
})();
