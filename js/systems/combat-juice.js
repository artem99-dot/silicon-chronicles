'use strict';

/* =====================================================
   БОЕВОЙ СОК
   Без звука и без тряски.
   ===================================================== */

(function () {
  var reducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*
    Полностью отключаем тряску.
    В оригинальном коде есть функция shake(), которая вызывается
    при ударах. Теперь она ничего не делает.
  */
  window.shake = function () {};

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function addAnim(el, cls, dur) {
    if (!el || reducedMotion) return;

    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);

    setTimeout(function () {
      el.classList.remove(cls);
    }, dur || 400);
  }

  function detectType(cls, txt) {
    cls = String(cls || '');
    txt = String(txt || '').trim();

    if (txt.charAt(0) === '+') {
      return 'heal';
    }

    if (cls.indexOf('crit') >= 0) {
      return 'crit';
    }

    if (cls.indexOf('f-fire') >= 0) {
      return 'fire';
    }

    if (cls.indexOf('f-poison') >= 0) {
      return 'poison';
    }

    if (cls.indexOf('f-ice') >= 0) {
      return 'ice';
    }

    if (cls.indexOf('f-light') >= 0) {
      return 'light';
    }

    if (cls.indexOf('f-shadow') >= 0) {
      return 'shadow';
    }

    return 'phys';
  }

  function spawnParticles(container, type) {
    if (!container || reducedMotion) return;

    if (container.querySelectorAll('.cj-particle').length > 70) {
      return;
    }

    var count = 9;

    if (type === 'crit') count = 14;
    if (type === 'death') count = 20;
    if (type === 'heal') count = 8;
    if (type === 'fire') count = 12;
    if (type === 'poison') count = 12;
    if (type === 'ice') count = 12;
    if (type === 'light') count = 12;
    if (type === 'shadow') count = 12;

    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'cj-particle cj-' + type;

      var dx;
      var dy;

      if (type === 'death') {
        dx = Math.random() * 120 - 60;
        dy = Math.random() * 70 - 10;
      } else {
        dx = Math.random() * 90 - 45;
        dy = -20 - Math.random() * 60;
      }

      p.style.left = (35 + Math.random() * 30) + '%';
      p.style.top = (25 + Math.random() * 35) + '%';

      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.setProperty('--dur', (0.45 + Math.random() * 0.35) + 's');
      p.style.setProperty('--s', (3 + Math.random() * 5) + 'px');

      container.appendChild(p);

      (function (node) {
        setTimeout(function () {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }, 950);
      })(p);
    }
  }

  /*
    Оборачиваем floatDmg().

    Он вызывается при уроне, лечении, критах и стихийных эффектах.
    Мы добавляем:
    - рывок атакующего;
    - отдачу цели;
    - вспышку попадания;
    - частицы.
  */
  function wrapFloatDmg() {
    if (typeof window.floatDmg !== 'function') return;
    if (window.__combatJuiceFloatWrapped) return;

    var oldFloatDmg = window.floatDmg;

    window.floatDmg = function (elId, txt, cls) {
      oldFloatDmg.apply(this, arguments);

      var isHeal = String(txt).trim().indexOf('+') === 0;

      if (elId === 'eface') {
        var enemyCard = document.getElementById('ecard');
        var playerCard = document.getElementById('pcard');

        if (!enemyCard) return;

        if (isHeal) {
          addAnim(enemyCard, 'cj-heal-glow', 550);
          spawnParticles(enemyCard, 'heal');
        } else {
          if (playerCard) {
            addAnim(playerCard, 'cj-lunge-right', 260);
          }

          addAnim(enemyCard, 'cj-recoil', 240);
          addAnim(enemyCard, 'cj-hit', 220);
          spawnParticles(enemyCard, detectType(cls, txt));
        }
      }

      if (elId === 'pface') {
        var playerCard2 = document.getElementById('pcard');
        var enemyCard2 = document.getElementById('ecard');

        if (!playerCard2) return;

        if (isHeal) {
          addAnim(playerCard2, 'cj-heal-glow', 550);
          spawnParticles(playerCard2, 'heal');
        } else {
          if (enemyCard2) {
            addAnim(enemyCard2, 'cj-lunge-left', 260);
          }

          addAnim(playerCard2, 'cj-recoil', 240);
          addAnim(playerCard2, 'cj-hit', 220);
          spawnParticles(playerCard2, detectType(cls, txt));
        }
      }
    };

    window.__combatJuiceFloatWrapped = true;
  }

  /*
    Оборачиваем onWin().

    Добавляем короткую анимацию смерти врага:
    - полоса HP падает в 0;
    - враг растворяется;
    - летит пепел;
    - потом уже срабатывает оригинальная победа.
  */
  function wrapOnWin() {
    if (typeof window.onWin !== 'function') return;
    if (window.__combatJuiceOnWinWrapped) return;

    var oldOnWin = window.onWin;

    window.onWin = function () {
      if (!window.COM) {
        return oldOnWin.apply(this, arguments);
      }

      if (COM.__cjDying) {
        return;
      }

      COM.__cjDying = true;
      COM.over = true;

      if (typeof stopCombat === 'function') {
        stopCombat();
      }

      var enemyCard = document.getElementById('ecard');
      var ehp = document.getElementById('ehp');
      var ehpt = document.getElementById('ehpt');

      if (ehp) {
        ehp.style.width = '0%';
      }

      if (ehpt && COM.e) {
        ehpt.textContent = '0 / ' + fmt(COM.e.maxhp);
      }

      if (enemyCard) {
        enemyCard.classList.add('cj-dying');
        spawnParticles(enemyCard, 'death');
      }

      if (typeof renderCombatLive === 'function') {
        try {
          renderCombatLive();
        } catch (e) {
          // декоративный модуль не должен ломать бой
        }
      }

      var args = arguments;

      setTimeout(function () {
        if (window.COM) {
          oldOnWin.apply(window, args);
        }
      }, 520);
    };

    window.__combatJuiceOnWinWrapped = true;
  }

  /*
    Оборачиваем feed(), чтобы реагировать на события боя:
    - криты;
    - ярость босса.
  */
  function wrapFeed() {
    if (typeof window.feed !== 'function') return;
    if (window.__combatJuiceFeedWrapped) return;

    var oldFeed = window.feed;

    window.feed = function (html, cls) {
      oldFeed.apply(this, arguments);

      if (typeof html !== 'string') return;

      var enemyCard = document.getElementById('ecard');

      if (html.indexOf('в ярости') !== -1 && enemyCard) {
        addAnim(enemyCard, 'cj-enrage', 900);
      }

      if (html.indexOf('КРИТ') !== -1 && enemyCard) {
        addAnim(enemyCard, 'cj-crit-flash', 320);
      }
    };

    window.__combatJuiceFeedWrapped = true;
  }

  ready(function () {
    wrapFloatDmg();
    wrapOnWin();
    wrapFeed();
  });
})();