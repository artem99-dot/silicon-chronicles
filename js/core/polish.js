'use strict';

(function () {
  var polishStarted = false;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function ensureLowHpOverlay() {
    if (document.getElementById('low-hp-overlay')) return;

    var el = document.createElement('div');
    el.id = 'low-hp-overlay';

    document.body.appendChild(el);
  }

  function updateLowHp() {
    if (!window.S || !S.hero || !S.cs) {
      document.body.classList.remove('low-hp');
      return;
    }

    var maxHp = S.cs.maxhp || 1;
    var hp = Math.max(0, S.hero.hp);
    var ratio = hp / maxHp;

    document.body.classList.toggle('low-hp', ratio <= 0.3);
  }

  function critFlash() {
    document.body.classList.remove('crit-flash');
    void document.body.offsetWidth;
    document.body.classList.add('crit-flash');

    setTimeout(function () {
      document.body.classList.remove('crit-flash');
    }, 220);
  }

  function hitStop() {
    document.body.classList.remove('hit-stop');
    void document.body.offsetWidth;
    document.body.classList.add('hit-stop');

    setTimeout(function () {
      document.body.classList.remove('hit-stop');
    }, 110);
  }

  function wrapFeed() {
    if (typeof window.feed !== 'function') return;
    if (window.__polishFeedWrapped) return;

    var oldFeed = window.feed;

    window.feed = function (html, cls) {
      oldFeed.apply(this, arguments);

      if (typeof html === 'string' && html.indexOf('КРИТ') !== -1) {
        critFlash();
        hitStop();
      }
    };

    window.__polishFeedWrapped = true;
  }

  function wrapRenderTown() {
    if (typeof window.renderTown !== 'function') return;
    if (window.__polishRenderTownWrapped) return;

    var oldRenderTown = window.renderTown;

    window.renderTown = function () {
      oldRenderTown.apply(this, arguments);

      var active = document.querySelector('.subnav .btn.gold');

      if (active && active.scrollIntoView) {
        active.scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    };

    window.__polishRenderTownWrapped = true;
  }

  function combatHotkeys(e) {
    if (!window.S || !window.COM || COM.over) return;

    var active = document.activeElement;
    var tag = active ? active.tagName : '';

    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    var k = (e.key || '').toLowerCase();

    if (!window.CLASSES || !S.hero || !S.hero.cls) return;

    var skills = CLASSES[S.hero.cls].skills;

    if (k >= '1' && k <= '6') {
      var idx = Number(k) - 1;

      if (skills && skills[idx]) {
        e.preventDefault();
        useSkill(skills[idx]);
      }

      return;
    }

    if (k === 'h') {
      e.preventDefault();
      drinkPot('hp');
      return;
    }

    if (k === 'm') {
      e.preventDefault();
      drinkPot('mp');
      return;
    }

    if (k === 'f') {
      e.preventDefault();
      tryFlee();
    }
  }

  function polishLoop() {
    try {
      updateLowHp();
    } catch (e) {
      // Не роняем игру из-за декоративного модуля.
    }

    requestAnimationFrame(polishLoop);
  }

  function initPolish() {
    if (polishStarted) return;

    polishStarted = true;

    ensureLowHpOverlay();
    wrapFeed();
    wrapRenderTown();

    document.addEventListener('keydown', combatHotkeys);

    requestAnimationFrame(polishLoop);

    // Если игра уже загружена и сейчас не бой/данж, мягко перерисуем UI.
    if (window.S && !window.COM && !window.RUN && typeof renderAll === 'function') {
      try {
        renderAll();
      } catch (e) {
        console.error('Polish renderAll error', e);
      }
    }
  }

  ready(initPolish);
})();