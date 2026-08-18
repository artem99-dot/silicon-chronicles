'use strict';

/* =====================================================
   ДАНЖ: фикс комнаты-двери + атмосферные улучшения
   ===================================================== */

/*
  ВАЖНО:
  Этот файл перезаписывает resolveRoom() из dungeon.js.

  Он чинит баг:
  - клик по комнате start (иконка 🚪) раньше не перерисовывал данж;
  - из-за этого казалось, что переходы перестали работать.

  Теперь комната start обрабатывается нормально.
*/

window.resolveRoom = function (r) {
  if (!r) {
    renderDungeon();
    return;
  }

  if (r.done) {
    renderDungeon();
    return;
  }

  /* =========================================
     ФИКС: комната-дверь / вход в данж
     ========================================= */
  if (r.t === 'start') {
    r.done = true;

    log('🚪 Ты вернулся ко входу. Пока здесь тихо.', 'sys');

    renderDungeon();
    save();

    return;
  }

  /* Если вдруг игрок как-то попал в босс-комнату через resolveRoom */
  if (r.t === 'boss') {
    bossDoor();
    return;
  }

  /* Враги */
  if (r.t === 'mob' || r.t === 'elite') {
    S.cs = calcStats();

    startCombat(
      makeEnemy(RUN.zi, r.t === 'elite', Math.floor(RUN.di)),
      {
        type: 'run',
        zi: RUN.zi,
        dlvl: Math.floor(RUN.di),
        room: r
      }
    );

    return;
  }

  /* Сундук */
  if (r.t === 'chest') {
    openChest(r, false);
    renderDungeon();
    save();
    return;
  }

  /* Запертый сундук */
  if (r.t === 'locked') {
    if (S.hero.keys[RUN.zi] > 0) {
      S.hero.keys[RUN.zi]--;
      r.done = true;

      openChest(r, true);

      log('🗝️ ' + KITEMS[RUN.zi].nm + ' открывает дверь.', 'good');
    } else {
      log(
        '🔒 Нужен «' + KITEMS[RUN.zi].nm + '». Купи в Гильдии или сними с босса.',
        'sys'
      );
    }

    renderDungeon();
    save();

    return;
  }

  /* Ловушки */
  if (r.t === 'trap') {
    r.done = true;

    var t = P([
      {
        t: 'Отравленный дротик!',
        hp: 10
      },
      {
        t: 'Плита проваливается!',
        hp: 13
      },
      {
        t: 'Ледяной порыв!',
        mp: 20
      },
      {
        t: 'Рой ос!',
        hp: 8
      },
      {
        t: 'Ржавые шипы из пола!',
        hp: 11
      },
      {
        t: 'Пепельный капкан!',
        hp: 12
      }
    ]);

    log('⚠ ' + t.t, 'bad');

    if (t.hp) {
      S.hero.hp = Math.max(
        1,
        S.hero.hp - Math.round(S.cs.maxhp * t.hp / 100)
      );
    } else {
      S.hero.mp = Math.max(
        0,
        S.hero.mp - Math.round(S.cs.maxmp * t.mp / 100)
      );
    }

    renderDungeon();
    renderTop();
    save();

    return;
  }

  /* Костёр */
  if (r.t === 'rest') {
    if (Math.random() < 0.25) {
      var d = Math.round(S.cs.maxhp * 0.12);

      S.hero.hp = Math.max(1, S.hero.hp - d);

      log('🔥 Гнездо ос! −' + fmt(d) + ' ОЗ', 'bad');
    } else {
      var am = Math.round(S.cs.maxhp * 0.5);

      S.hero.hp = Math.min(S.cs.maxhp, S.hero.hp + am);
      S.hero.mp = S.cs.maxmp;

      log('🔥 Отдых: +' + fmt(am) + ' ОЗ', 'good');
    }

    r.done = true;

    renderDungeon();
    renderTop();
    save();

    return;
  }

  /* Алтарь, торговец, пустая комната */
  if (r.t === 'altar' || r.t === 'merch' || r.t === 'empty') {
    if (r.t === 'empty') {
      r.done = true;

      log(
        '📜 ' + P([
          'Тишина.',
          'Пепел кружится в воздухе.',
          'Где-то капает вода.',
          'Следы давно исчезли.',
          'Стены помнят старые шаги.',
          'Факелы почти догорели.',
          'Из темноты тянет холодом.',
          'Пол усыпан серой пылью.'
        ]),
        'story'
      );
    }

    renderDungeon();

    return;
  }

  /* Страховка от неизвестных типов комнат */
  r.done = true;
  renderDungeon();
};

/*
  Дополнительная защита для кнопки босс-двери.
  Если бой почему-то не стартовал, данж всё равно перерисуется.
*/
(function () {
  var oldBossDoor = window.bossDoor;

  if (typeof oldBossDoor === 'function') {
    window.bossDoor = function () {
      oldBossDoor.apply(this, arguments);

      if (!window.COM && typeof renderDungeon === 'function') {
        renderDungeon();
      }
    };
  }
})();

/*
  Украшаем данж:
  - добавляем data-атрибуты к комнатам;
  - включаем класс dungeon-active;
  - помечаем панель карты классом dungeon-map.
*/
function decorateDungeon() {
  var active = !!(window.RUN && window.MAP);

  document.body.classList.toggle('dungeon-active', active);

  if (!active) return;

  var svg = document.querySelector('#main svg');

  if (svg) {
    var panel = svg.closest('.panel');

    if (panel) {
      panel.classList.add('dungeon-map');
    }
  }

  var els = document.querySelectorAll('#main .droom');

  if (!els.length) return;

  var idx = 0;

  MAP.rooms.forEach(function (r) {
    if (!r.seen) return;

    var el = els[idx];
    idx++;

    if (!el) return;

    el.setAttribute('data-rt', r.t || 'empty');
    el.setAttribute('data-room', r.id);

    if (r.id === MAP.cur) {
      el.setAttribute('data-here', '1');
    } else {
      el.removeAttribute('data-here');
    }
  });
}

/* Оборачиваем renderDungeon, чтобы добавлять визуальные атрибуты */
(function () {
  var oldRenderDungeon = window.renderDungeon;

  if (typeof oldRenderDungeon === 'function') {
    window.renderDungeon = function () {
      oldRenderDungeon.apply(this, arguments);
      decorateDungeon();
    };
  }
})();

/* Оборачиваем renderTown, чтобы убирать dungeon-класс, когда данж закончился */
(function () {
  var oldRenderTown = window.renderTown;

  if (typeof oldRenderTown === 'function') {
    window.renderTown = function () {
      oldRenderTown.apply(this, arguments);

      document.body.classList.toggle(
        'dungeon-active',
        !!(window.RUN && window.MAP)
      );
    };
  }
})();

/* Если игрок уже находится в данже в момент подключения файла */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    if (window.RUN && window.MAP) {
      decorateDungeon();
    }
  });
} else {
  if (window.RUN && window.MAP) {
    decorateDungeon();
  }
}