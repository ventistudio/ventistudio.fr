(function (global) {
  'use strict';




  var defaults = {
    honeypotName: 'vs_hp_field',
    analyzeAfterMs: 3500,
    ipCheck: false,
    ipBlocklist: [],
    onScore: null,
    debug: false
  };

  var opts = {};
  var honeypotEl = null;




  var state = {
    startedAt: Date.now(),
    mouseEvents: [],
    keyEvents: [],
    touchEvents: 0,
    scrollEvents: 0,
    focusEvents: 0,
    clickEvents: 0,
    visibilityChanges: 0,
    honeypotFilled: false,
    fingerprint: null,
    ip: null,
    ipBlocked: false,
    initialCanvasHash: null,
    terminationFired: false
  };




  function log() {
    if (opts.debug && global.console) {
      console.log.apply(console, ['[AntiBot]'].concat([].slice.call(arguments)));
    }
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function safe(fn, fallback) {
    try { return fn(); } catch (_) { return fallback; }
  }




  function injectHoneypot() {
    if (!document.body) return;
    if (document.querySelector('input[name="' + opts.honeypotName + '"]')) return;

    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText =
      'position:absolute!important;left:-9999px!important;top:-9999px!important;' +
      'width:1px!important;height:1px!important;overflow:hidden!important;' +
      'opacity:0!important;pointer-events:none!important;';

    var input = document.createElement('input');
    input.type = 'text';
    input.name = opts.honeypotName;
    input.tabIndex = -1;
    input.autocomplete = 'off';
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');

    wrap.appendChild(input);
    document.body.appendChild(wrap);
    honeypotEl = input;
  }




  function buildFingerprint() {
    var fp = {};

    fp.userAgent     = safe(function () { return navigator.userAgent || ''; }, '');
    fp.platform      = safe(function () { return navigator.platform || ''; }, '');
    fp.languages     = safe(function () { return (navigator.languages || []).slice(); }, []);
    fp.language      = safe(function () { return navigator.language || ''; }, '');
    fp.hardwareConc  = safe(function () { return navigator.hardwareConcurrency || 0; }, 0);
    fp.deviceMemory  = safe(function () { return navigator.deviceMemory || 0; }, 0);
    fp.maxTouch      = safe(function () { return navigator.maxTouchPoints || 0; }, 0);
    fp.cookieEnabled = safe(function () { return !!navigator.cookieEnabled; }, false);
    fp.doNotTrack    = safe(function () { return navigator.doNotTrack || ''; }, '');
    fp.timezone      = safe(function () { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; }, '');
    fp.timezoneOffset= safe(function () { return new Date().getTimezoneOffset(); }, 0);
    fp.screen = safe(function () {
      return {
        w: screen.width, h: screen.height,
        aw: screen.availWidth, ah: screen.availHeight,
        depth: screen.colorDepth, pr: window.devicePixelRatio || 1
      };
    }, {});
    fp.plugins = safe(function () {
      var arr = [];
      for (var i = 0; i < (navigator.plugins || []).length; i++) {
        arr.push(navigator.plugins[i].name);
      }
      return arr;
    }, []);


    fp.webgl = safe(function () {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return null;
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        vendor:   dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   : gl.getParameter(gl.VENDOR),
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
      };
    }, null);


    fp.gpuRenderHash = safe(function () {
      if (!fp.webgl) return null;
      var c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return null;
      var vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}');
      gl.compileShader(vs);
      var fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, 'precision highp float;void main(){float x=gl_FragCoord.x/64.0;float y=gl_FragCoord.y/64.0;gl_FragColor=vec4(sin(x*12.9898+y*78.233)*0.5+0.5,cos(x*43758.5453)*0.5+0.5,fract(sin(x*127.1+y*311.7)*43758.5453),1.0);}');
      gl.compileShader(fs);
      var prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      var px = new Uint8Array(64 * 64 * 4);
      gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, px);
      var h = 0;
      for (var i = 0; i < px.length; i += 4) { h = (h << 5) - h + px[i]; h |= 0; }
      return h.toString(16);
    }, null);


    fp.canvasHash = safe(function () {
      var c = document.createElement('canvas');
      c.width = 200; c.height = 50;
      var ctx = c.getContext('2d');
      if (!ctx) return null;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 100, 30);
      ctx.fillStyle = '#069';
      ctx.fillText('Ventistudio·AntiBot·\u2764', 2, 2);
      var data = c.toDataURL();

      var h = 0;
      for (var i = 0; i < data.length; i++) {
        h = (h << 5) - h + data.charCodeAt(i);
        h |= 0;
      }
      return h.toString(16);
    }, null);


    fp.webdriver = safe(function () { return !!navigator.webdriver; }, false);
    fp.headlessHints = detectHeadlessHints();

    return fp;
  }

  function detectHeadlessHints() {
    var hints = [];
    var ua = (navigator.userAgent || '').toLowerCase();

    if (/headless|phantomjs|slimerjs|puppeteer|playwright|electron/i.test(ua)) {
      hints.push('ua-headless');
    }
    if (/bot|crawler|spider|crawling|curl|wget|python-requests|http-client/i.test(ua)) {
      hints.push('ua-bot');
    }
    if (navigator.webdriver) hints.push('navigator.webdriver');
    if (window.callPhantom || window._phantom) hints.push('phantom');
    if (window.__nightmare) hints.push('nightmare');
    if (window.domAutomation || window.domAutomationController) hints.push('chrome-automation');
    if (window.Cypress) hints.push('cypress');
    if (window.outerWidth === 0 || window.outerHeight === 0) hints.push('zero-outer-size');
    if (!navigator.languages || navigator.languages.length === 0) hints.push('no-languages');
    if (navigator.plugins && navigator.plugins.length === 0 && !/Mobi|Android/i.test(ua)) {
      hints.push('no-plugins-desktop');
    }


    return hints;
  }




  function attachBehaviorListeners() {
    var lastMouse = 0;
    document.addEventListener('mousemove', function (e) {
      var t = Date.now();
      if (t - lastMouse < 15) return;
      lastMouse = t;
      if (state.mouseEvents.length < 200) {
        state.mouseEvents.push({ x: e.clientX, y: e.clientY, t: t });
      }
    }, { passive: true });

    document.addEventListener('keydown', function () {
      if (state.keyEvents.length < 200) state.keyEvents.push({ t: Date.now() });
    }, { passive: true });

    document.addEventListener('touchstart', function () { state.touchEvents++; }, { passive: true });
    document.addEventListener('scroll',     function () { state.scrollEvents++; }, { passive: true });
    document.addEventListener('click',      function () { state.clickEvents++; }, { passive: true });
    window.addEventListener('focus',        function () { state.focusEvents++; });
    document.addEventListener('visibilitychange', function () { state.visibilityChanges++; });
  }





  function analyzeMouse() {
    var ev = state.mouseEvents;
    if (ev.length < 5) return null;

    var dxSum = 0, dySum = 0, dtSum = 0;
    var speeds = [];
    var angles = [];
    var straightLines = 0;

    for (var i = 1; i < ev.length; i++) {
      var dx = ev[i].x - ev[i - 1].x;
      var dy = ev[i].y - ev[i - 1].y;
      var dt = Math.max(1, ev[i].t - ev[i - 1].t);
      dxSum += Math.abs(dx); dySum += Math.abs(dy); dtSum += dt;
      var dist = Math.sqrt(dx * dx + dy * dy);
      speeds.push(dist / dt);
      if (dist > 0) angles.push(Math.atan2(dy, dx));
      if (dx === 0 || dy === 0) straightLines++;
    }


    var meanS = speeds.reduce(function (a, b) { return a + b; }, 0) / speeds.length;
    var varS  = speeds.reduce(function (a, b) { return a + (b - meanS) * (b - meanS); }, 0) / speeds.length;


    var meanA = angles.reduce(function (a, b) { return a + b; }, 0) / Math.max(1, angles.length);
    var varA  = angles.reduce(function (a, b) { return a + (b - meanA) * (b - meanA); }, 0) / Math.max(1, angles.length);

    var straightRatio = straightLines / (ev.length - 1);


    var score = 0;
    if (varS > 0.001) score += 0.4;
    if (varA > 0.05)  score += 0.4;
    if (straightRatio < 0.5) score += 0.2;

    return {
      score: clamp(score, 0, 1),
      samples: ev.length,
      speedVar: varS,
      angleVar: varA,
      straightRatio: straightRatio
    };
  }




  function analyzeKeystrokes() {
    var ev = state.keyEvents;
    if (ev.length < 3) return null;
    var deltas = [];
    for (var i = 1; i < ev.length; i++) deltas.push(ev[i].t - ev[i - 1].t);
    var mean = deltas.reduce(function (a, b) { return a + b; }, 0) / deltas.length;
    var variance = deltas.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / deltas.length;

    var humanLike = variance > 100 && mean > 30 && mean < 1500 ? 1 : 0.3;
    return { score: humanLike, samples: ev.length, mean: mean, variance: variance };
  }




  function ipLookup() {
    if (!opts.ipCheck) return Promise.resolve(null);
    if (typeof fetch !== 'function') return Promise.resolve(null);
    return fetch('https://api.ipify.org?format=json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.ip) return null;
        state.ip = j.ip;
        for (var i = 0; i < opts.ipBlocklist.length; i++) {
          if (j.ip.indexOf(opts.ipBlocklist[i]) === 0) {
            state.ipBlocked = true;
            break;
          }
        }
        return j.ip;
      })
      .catch(function () { return null; });
  }




  function computeScore() {
    var signals = {};
    var score = 100;


    state.honeypotFilled = !!(honeypotEl && honeypotEl.value && honeypotEl.value.length > 0);
    signals.honeypot = !state.honeypotFilled;
    if (state.honeypotFilled) score -= 80;


    var fp = state.fingerprint || {};
    signals.fingerprint = !!fp.canvasHash;
    if (!fp.canvasHash) score -= 10;
    if (!fp.webgl)      score -= 5;
    if (fp.webgl && !fp.gpuRenderHash) score -= 8;
    signals.gpuRenderHash = fp.gpuRenderHash || null;
    if (!fp.languages || fp.languages.length === 0) score -= 5;
    if (!fp.timezone)   score -= 3;


    signals.headlessHints = (fp.headlessHints || []).slice();
    if (fp.webdriver) score -= 35;
    score -= Math.min(40, (fp.headlessHints || []).length * 12);


    var mouse = analyzeMouse();
    signals.mouse = mouse;
    if (!mouse) {

      if (state.touchEvents === 0 && state.scrollEvents === 0) score -= 25;
      else score -= 5;
    } else {
      score -= Math.round((1 - mouse.score) * 25);
    }


    var keys = analyzeKeystrokes();
    signals.keys = keys;
    if (keys && keys.score < 0.5) score -= 10;


    var interactions = state.clickEvents + state.scrollEvents + state.touchEvents +
                       state.focusEvents + state.visibilityChanges;
    signals.interactions = interactions;
    if (interactions === 0 && (Date.now() - state.startedAt) > opts.analyzeAfterMs) {
      score -= 10;
    }


    if (fp.cookieEnabled === false) score -= 5;


    signals.ip = state.ip;
    if (state.ipBlocked) score -= 60;

    score = clamp(Math.round(score), 0, 100);

    var verdict = 'human';
    if (score < 40) verdict = 'bot';
    else if (score < 70) verdict = 'suspicious';

    return {
      score: score,
      verdict: verdict,
      signals: signals,
      details: {
        fingerprint: fp,
        durationMs: Date.now() - state.startedAt,
        honeypotFilled: state.honeypotFilled,
        ip: state.ip,
        ipBlocked: state.ipBlocked
      }
    };
  }




  var lastResult = null;

  function init(userOpts) {

    opts = {};
    for (var k in defaults) opts[k] = defaults[k];
    if (userOpts) for (var k2 in userOpts) opts[k2] = userOpts[k2];

    state.startedAt = Date.now();

    function ready() {
      injectHoneypot();
      attachBehaviorListeners();
      state.fingerprint = buildFingerprint();
      state.initialCanvasHash = state.fingerprint.canvasHash || null;
      log('Fingerprint', state.fingerprint);

      ipLookup().then(function () {
        setTimeout(finalize, opts.analyzeAfterMs);
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ready);
    } else {
      ready();
    }
  }

  function startPeriodicCheck() {
    var intervalId = setInterval(function () {
      if (state.terminationFired) { clearInterval(intervalId); return; }
      var r = computeScore();
      var fp = r.details && r.details.fingerprint;
      var curHash = fp ? (fp.canvasHash || null) : null;
      if (r.score < 40 && state.initialCanvasHash && curHash === state.initialCanvasHash) {
        state.terminationFired = true;
        clearInterval(intervalId);
        log('Termination triggered - persistent bot fingerprint confirmed');
        try {
          window.dispatchEvent(new CustomEvent('antibot:terminated', { detail: r }));
        } catch (_) {
          var ev = document.createEvent('CustomEvent');
          ev.initCustomEvent('antibot:terminated', false, false, r);
          window.dispatchEvent(ev);
        }
      }
    }, 30000);
  }


  function finalize() {
    lastResult = computeScore();
    log('Result', lastResult);

    try {
      window.dispatchEvent(new CustomEvent('antibot:ready', { detail: lastResult }));
    } catch (_) {

      var ev = document.createEvent('CustomEvent');
      ev.initCustomEvent('antibot:ready', false, false, lastResult);
      window.dispatchEvent(ev);
    }

    if (typeof opts.onScore === 'function') {
      try { opts.onScore(lastResult); } catch (_) {}
    }

    if (lastResult.score < 40) startPeriodicCheck();
  }




  var API = {
    init: init,
    getResult: function () { return lastResult; },
    recompute: function () { lastResult = computeScore(); return lastResult; },
    isHuman: function (threshold) {
      threshold = typeof threshold === 'number' ? threshold : 70;
      return !!(lastResult && lastResult.score >= threshold);
    },
    isDNT: function () {
      var dnt = navigator.doNotTrack || window.doNotTrack;
      return dnt === '1' || dnt === 'yes' || dnt === 'true';
    }
  };

  global.AntiBot = API;


  var current = document.currentScript;
  if (!current || !current.hasAttribute('data-no-autoinit')) {
    init();
  }

})(window);
