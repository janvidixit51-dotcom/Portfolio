/* Portfolio script: theme, menu, active link, reveal, hiding empty content */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  /* ---- Theme: saved choice, else the system preference ---- */
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.getElementById('theme').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---- Hide empty content: optional links with no URL, groups with no items ---- */
  document.querySelectorAll('[data-optional]').forEach(function (el) {
    if (!(el.getAttribute('href') || '').trim()) {
      (el.closest('li') || el).hidden = true;
    }
  });
  document.querySelectorAll('.group').forEach(function (g) {
    if (!g.querySelector('li')) g.hidden = true;
  });
  document.querySelectorAll('main .section').forEach(function (s) {
    var hasContent = s.querySelector('li:not([hidden]), article, p, .group:not([hidden])');
    if (!hasContent) {
      s.hidden = true;
      var link = document.querySelector('.menu a[href="#' + s.id + '"]');
      if (link) link.hidden = true;
    }
  });

  /* ---- Mobile menu ---- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---- Active link on scroll + reveal on scroll ---- */
  var links = {};
  document.querySelectorAll('.menu a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          links[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { rev.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Back to top and footer year ---- */
  var top = document.getElementById('top');
  window.addEventListener('scroll', function () { top.hidden = window.scrollY < 500; }, { passive: true });
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.getElementById('year').textContent = new Date().getFullYear();
})();

/* ===== INTERACTIVE UPGRADE ===== */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Scroll progress bar */
  var bar = $('#progress');
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
  }, { passive: true });

  /* Typing line in the hero. EDIT HERE: change the words */
  var words = ['web basics', 'MySQL databases', 'MS Office and Excel', 'Python and Power BI'];
  var out = $('#type');
  if (out && !reduce) {
    var w = 0, c = 0, del = false;
    (function tick() {
      var word = words[w];
      c += del ? -1 : 1;
      out.textContent = word.slice(0, c);
      var t = del ? 40 : 90;
      if (!del && c === word.length) { del = true; t = 1400; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; t = 300; }
      setTimeout(tick, t);
    })();
  }

  /* Count-up numbers when visible */
  var nums = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.dataset.count, sfx = el.dataset.suffix || '', n = 0;
        var step = Math.max(1, Math.round(end / 40));
        var id = setInterval(function () {
          n = Math.min(end, n + step);
          el.textContent = n + sfx;
          if (n === end) clearInterval(id);
        }, 30);
        co.unobserve(el);
      });
    });
    nums.forEach(function (n) { co.observe(n); });
  }

  /* Hero glow follows the mouse; photo tilts */
  var hero = $('.hero'), photo = $('.photo');
  if (hero && !reduce && matchMedia('(hover:hover)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
      var pr = photo.getBoundingClientRect();
      var dx = (e.clientX - (pr.left + pr.width / 2)) / innerWidth;
      var dy = (e.clientY - (pr.top + pr.height / 2)) / innerHeight;
      photo.style.transform = 'perspective(700px) rotateY(' + dx * 14 + 'deg) rotateX(' + -dy * 14 + 'deg)';
    });
    hero.addEventListener('mouseleave', function () { photo.style.transform = ''; });
  }

  /* Skills filter */
  $$('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-filter]').forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.group').forEach(function (g) {
        g.classList.toggle('dim', b.dataset.filter !== 'all' && g.dataset.cat !== b.dataset.filter);
      });
    });
  });

  /* Project tabs */
  var tabs = $$('.tab');
  function openTab(t) {
    tabs.forEach(function (x) { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
    $$('.panel').forEach(function (p) { p.hidden = p.id !== t.dataset.tab; });
    var m = $('.mock'); if (m) m.classList.toggle('go', t.dataset.tab === 'p-out');
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { openTab(t); });
    t.addEventListener('keydown', function (e) {   /* arrow keys move between tabs */
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (n !== null && tabs[(n + tabs.length) % tabs.length]) { var nt = tabs[(n + tabs.length) % tabs.length]; nt.focus(); openTab(nt); }
    });
  });

  /* Role picker */
  $$('[data-role]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-role]').forEach(function (x) { x.classList.toggle('on', x === b); });
      $('#role-out').textContent = b.dataset.role;
    });
  });

  /* Workflow stepper */
  var steps = $$('.step');
  steps.forEach(function (s, i) {
    s.addEventListener('click', function () {
      steps.forEach(function (x, j) { x.classList.toggle('on', j === i); x.classList.toggle('done', j < i); });
      $('#step-out').textContent = (i + 1) + '. ' + s.dataset.desc;
    });
  });
})();
