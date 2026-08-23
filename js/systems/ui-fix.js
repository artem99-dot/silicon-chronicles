'use strict';

(function () {

  /* =====================================================
     УТИЛИТЫ
     ===================================================== */

  function isMobile() {
    try {
      return window.matchMedia('(max-width: 760px)').matches;
    } catch (e) {
      return false;
    }
  }

  function appVisible() {
    var app = document.getElementById('app');
    return !!window.S && app && app.style.display !== 'none';
  }

  /* =====================================================
     ТАЙМЕРЫ ЗАКАЗОВ
     ===================================================== */

  function updateGuildTimers() {
    if (!window.S || !S.board || S.town !== 'guild') return;

    var orders = document.querySelectorAll('.order');

    if (!orders.length) return;

    orders.forEach(function (el, i) {
      var o = S.board.orders[i];
      if (!o) return;

      var tm = el.querySelector('.tm');
      if (!tm) return;

      if (o.prog >= o.n) {
        tm.textContent = 'готово';
        tm.classList.remove('low');
        el.classList.add('done');
        return;
      }

      var left = o.deadline - now();

      if (left <= 0) {
        tm.textContent = 'сгорел';
        tm.classList.add('low');
        el.classList.add('exp');
        return;
      }

      var mins = Math.max(0, Math.floor(left / 60000));
      var secs = Math.max(0, Math.floor((left % 60000) / 1000));

      tm.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
      tm.classList.toggle('low', left < 3 * 60000);
    });
  }

  setInterval(updateGuildTimers, 1000);

  /* =====================================================
     ОБНОВЛЕНИЕ КОЛИЧЕСТВА ЗЕЛИЙ В БОЮ
     ===================================================== */

  var oldRenderCombatLive = window.renderCombatLive;

  if (typeof oldRenderCombatLive === 'function') {
    window.renderCombatLive = function () {
      oldRenderCombatLive.apply(this, arguments);

      if (!window.COM || !window.S) return;

      var ph = document.getElementById('potH');
      var pm = document.getElementById('potM');

      if (ph) {
        ph.innerHTML = '🧪 ОЗ (' + S.hero.pots.hp + ')<small>зелье</small>';
        ph.disabled = !S.hero.pots.hp || COM.potCd > 0;
      }

      if (pm) {
        pm.innerHTML = '🧪 Мана (' + S.hero.pots.mp + ')<small>зелье</small>';
        pm.disabled = !S.hero.pots.mp || COM.potCd > 0;
      }

      ['rage', 'stone', 'swift'].forEach(function (k) {
        var b = document.getElementById('elx_' + k);
        if (!b) return;

        var s = b.querySelector('small');

        if (s) {
          s.textContent = '×' + S.hero.elix[k];
        }

        b.disabled = !(S.hero.elix[k] > 0) || COM.potCd > 0;
      });
    };
  }

  /* =====================================================
     НИЖНЯЯ НАВИГАЦИЯ
     ===================================================== */

  var primaryTabs = [
    { id: 'plaza', ic: '🏰', nm: 'Город' },
    { id: 'hero', ic: '👤', nm: 'Герой' },
    { id: 'inv', ic: '🎒', nm: 'Сумка' },
    { id: 'gate', ic: '🗺️', nm: 'Врата' },
    { id: 'more', ic: '☰', nm: 'Ещё' }
  ];

  var allTabs = [
    { id: 'plaza', ic: '🏰', nm: 'Площадь' },
    { id: 'guild', ic: '🏛️', nm: 'Гильдия' },
    { id: 'tavern', ic: '🍺', nm: 'Таверна' },
    { id: 'inn', ic: '🛏️', nm: 'Гостиница' },
    { id: 'forge', ic: '⚒️', nm: 'Кузница' },
    { id: 'alch', ic: '⚗️', nm: 'Алхимик' },
    { id: 'market', ic: '⚖️', nm: 'Рынок' },
    { id: 'gate', ic: '🗺️', nm: 'Врата' },
    { id: 'arena', ic: '🏟️', nm: 'Арена' },
    { id: 'hero', ic: '👤', nm: 'Герой' },
    { id: 'tree', ic: '🌳', nm: 'Умения' },
    { id: 'inv', ic: '🎒', nm: 'Инвентарь' }
  ];

  function townGroup(t) {
    var city = ['plaza', 'guild', 'tavern', 'inn', 'forge', 'alch', 'market'];

    if (city.indexOf(t) >= 0) {
      return 'plaza';
    }

    if (t === 'arena') {
      return 'gate';
    }

    return t;
  }

  function createMobileUI() {
    if (document.getElementById('mobile-bottom-nav')) return;

    var backdrop = document.createElement('div');
    backdrop.id = 'mobile-sheet-backdrop';
    backdrop.onclick = closeMobileMenu;

    var sheet = document.createElement('div');
    sheet.id = 'mobile-sheet';

    sheet.innerHTML =
      '<div class="sheet-title">РАЗДЕЛЫ</div>' +
      '<div class="sheet-grid">' +
      allTabs.map(function (t) {
        return (
          '<button class="btn" data-sheet-tab="' + t.id + '" onclick="setTown(\'' + t.id + '\')">' +
          t.ic + ' ' + t.nm +
          '</button>'
        );
      }).join('') +
      '</div>';

    var nav = document.createElement('div');
    nav.id = 'mobile-bottom-nav';

    nav.innerHTML = primaryTabs.map(function (t) {
      if (t.id === 'more') {
        return (
          '<button class="mnav-btn" data-nav-tab="more" onclick="openMobileMenu()">' +
          '<span class="ic">' + t.ic + '</span>' +
          '<span>' + t.nm + '</span>' +
          '</button>'
        );
      }

      return (
        '<button class="mnav-btn" data-nav-tab="' + t.id + '" onclick="setTown(\'' + t.id + '\')">' +
        '<span class="ic">' + t.ic + '</span>' +
        '<span>' + t.nm + '</span>' +
        '</button>'
      );
    }).join('');

    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);
    document.body.appendChild(nav);
  }

  function updateBottomNav() {
    var nav = document.getElementById('mobile-bottom-nav');
    if (!nav) return;

    var hide =
      !window.S ||
      !appVisible() ||
      window.COM ||
      window.RUN ||
      !isMobile();

    nav.classList.toggle('hidden', hide);

    if (hide) {
      closeMobileMenu();
      return;
    }

    var current = window.S ? S.town : 'plaza';
    var group = townGroup(current);

    nav.querySelectorAll('[data-nav-tab]').forEach(function (btn) {
      var id = btn.getAttribute('data-nav-tab');

      var active =
        id === group ||
        (id === 'more' && ['hero', 'inv', 'gate', 'plaza'].indexOf(group) < 0);

      btn.classList.toggle('active', active);
    });

    document.querySelectorAll('[data-sheet-tab]').forEach(function (btn) {
      btn.classList.toggle('gold', btn.getAttribute('data-sheet-tab') === current);
    });
  }

  window.openMobileMenu = function () {
    if (!isMobile()) return;

    document.body.classList.add('mobile-sheet-open');
    updateBottomNav();
  };

  window.closeMobileMenu = function () {
    document.body.classList.remove('mobile-sheet-open');
  };

  window.setTown = function (t) {
    if (!window.S) return;

    closeMobileMenu();

    S.town = t;

    if (typeof renderTown === 'function') {
      renderTown();
    }
  };

  /* =====================================================
     СОХРАНЕНИЕ СКРОЛЛА И ОБНОВЛЕНИЕ НАВИГАЦИИ
     ===================================================== */

  var lastTown = null;

  var baseRenderTown = window.renderTown;

  if (typeof baseRenderTown === 'function') {
    window.renderTown = function () {
      var same = window.S && lastTown === S.town;
      var y = same ? window.scrollY : 0;

      baseRenderTown.apply(this, arguments);

      if (same) {
        window.scrollTo(0, y);
      } else {
        window.scrollTo(0, 0);
      }

      if (window.S) {
        lastTown = S.town;
      }

      updateBottomNav();
      updateGuildTimers();
    };
  }

  ['renderCombat', 'renderDungeon'].forEach(function (name) {
    var old = window[name];

    if (typeof old === 'function') {
      window[name] = function () {
        old.apply(this, arguments);
        updateBottomNav();
      };
    }
  });

  /* =====================================================
     ИНИЦИАЛИЗАЦИЯ
     ===================================================== */

  function init() {
    createMobileUI();
    updateBottomNav();
    updateGuildTimers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();