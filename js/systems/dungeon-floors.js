'use strict';

(function () {

  if (!window.ROOMDEF || !window.ZONES) {
    return;
  }

  /* =====================================================
     НОВЫЕ ТИПЫ КОМНАТ
     ===================================================== */

  ROOMDEF.stairs = {
    ic: '🪜',
    nm: 'Лестница вниз',
    ds: 'Ведёт на следующий этаж.'
  };

  ROOMDEF.event = {
    ic: '❓',
    nm: 'Странная находка',
    ds: 'Здесь что-то произошло.'
  };

  /* =====================================================
     10 МОДИФИКАТОРОВ ЭТАЖЕЙ
     ===================================================== */

  window.DUNGEON_MODIFIERS = [
    {
      id: 'ash_heat',
      ic: '🔥',
      nm: 'Пепельный жар',
      ds: 'Враги крепче: +25% ОЗ и +10% урона.',
      effects: {
        hp: 1.25,
        dmg: 1.1
      }
    },

    {
      id: 'stone_skin',
      ic: '🪨',
      nm: 'Каменная кожа',
      ds: 'Броня врагов увеличена на 70%.',
      effects: {
        arm: 1.7
      }
    },

    {
      id: 'toxic_fog',
      ic: '☠',
      nm: 'Токсичный туман',
      ds: 'Все враги этажа несут яд.',
      effects: {
        elem: 'poison'
      }
    },

    {
      id: 'frozen_halls',
      ic: '❄',
      nm: 'Ледяные залы',
      ds: 'Атаки героя на 10% медленнее, враги несут лёд.',
      effects: {
        elem: 'ice',
        playerSlow: 1.1
      }
    },

    {
      id: 'shadow_veil',
      ic: '🌑',
      nm: 'Покров тьмы',
      ds: 'Враги несут тьму, крит героя −10%.',
      effects: {
        elem: 'shadow',
        critPenalty: 10
      }
    },

    {
      id: 'golden_vein',
      ic: '💰',
      nm: 'Золотая жила',
      ds: 'Враги дают +80% золота.',
      effects: {
        gold: 1.8
      }
    },

    {
      id: 'elite_hunt',
      ic: '💀',
      nm: 'Охотничьи угодья',
      ds: 'На этаже больше матёрых врагов.',
      effects: {
        elite: 2
      }
    },

    {
      id: 'trapped_halls',
      ic: '⚠️',
      nm: 'Залы ловушек',
      ds: 'На этаже больше ловушек.',
      effects: {
        traps: 3
      }
    },

    {
      id: 'treasure_vault',
      ic: '🧰',
      nm: 'Сокровищница',
      ds: 'Больше сундуков и запертых дверей.',
      effects: {
        chests: 2,
        locked: 1
      }
    },

    {
      id: 'cursed_ground',
      ic: '🟣',
      nm: 'Проклятая земля',
      ds: 'Урон героя снижен на 15%.',
      effects: {
        playerDmg: 0.85
      }
    }
  ];

  /* =====================================================
     ДАНЖ-СОБЫТИЯ
     ===================================================== */

  window.DUNGEON_EVENTS = [
    {
      id: 'shrine',
      ic: '🕯️',
      nm: 'Пепельный алтарь',
      ds: 'Алтарь тихо шепчет. Он принимает кровь, но отдаёт силу.',
      choices: [
        { id: 'sacrifice', label: '🩸 Пожертвовать 15% ОЗ' },
        { id: 'leave', label: 'Уйти' }
      ]
    },

    {
      id: 'soldier',
      ic: '🤕',
      nm: 'Раненый наёмник',
      ds: 'Он прислонился к стене и сжимает мешочек с чем-то ценным.',
      choices: [
        { id: 'give', label: '💰 Дать 30 🪙' },
        { id: 'leave', label: 'Уйти' }
      ]
    },

    {
      id: 'gamble',
      ic: '🎲',
      nm: 'Игральный стол',
      ds: 'Кто-то оставил кости и горстку золота. Рискнёшь?',
      choices: [
        { id: 'bet', label: '🎲 Поставить 50 🪙' },
        { id: 'leave', label: 'Уйти' }
      ]
    },

    {
      id: 'bones',
      ic: '🦴',
      nm: 'Куча костей',
      ds: 'Среди костей блестит что-то ценное. Но шевелится ли оно?',
      choices: [
        { id: 'search', label: '🔍 Обыскать' },
        { id: 'leave', label: 'Уйти' }
      ]
    },

    {
      id: 'mirror',
      ic: '🪞',
      nm: 'Пепельное зеркало',
      ds: 'В отражении ты двигаешься чуть быстрее, чем в жизни.',
      choices: [
        { id: 'touch', label: '✋ Коснуться' },
        { id: 'leave', label: 'Уйти' }
      ]
    }
  ];

  /* =====================================================
     ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
     ===================================================== */

  function floorCount(zi, di) {
    return Math.max(1, Math.min(4, di + 1));
  }

  function pickModifier(zi, di, floor) {
    var chance = 0.22 + di * 0.05 + (floor - 1) * 0.03;

    if (Math.random() < chance) {
      return P(DUNGEON_MODIFIERS);
    }

    return null;
  }

  function addRunBuff(k, pct) {
    if (!window.RUN) return;

    if (!RUN.buffs) {
      RUN.buffs = [];
    }

    RUN.buffs = RUN.buffs.filter(function (b) {
      return b.k !== k;
    });

    RUN.buffs.push({
      k: k,
      pct: pct,
      t: 9999,
      dg: true
    });
  }

  /* =====================================================
     ГЕНЕРАЦИЯ ЭТАЖА
     ===================================================== */

  function buildFloor(zi, di, floor, floors) {
    var dn = ZONES[zi].dungeons[di];

    var target = Math.max(
      6,
      Math.round((dn.rooms || 8) / floors) + (floor === floors ? 2 : 0)
    );

    var GW = 7;
    var GH = 7;
    var grid = {};
    var rooms = [];

    function K(x, y) {
      return x + '_' + y;
    }

    function add(x, y) {
      var r = {
        x: x,
        y: y,
        t: 'empty',
        adj: [],
        seen: false,
        done: false
      };

      r.id = rooms.length;
      rooms.push(r);
      grid[K(x, y)] = r;

      return r;
    }

    add(3, 3).t = 'start';

    var guard = 0;

    while (rooms.length < target && guard++ < 3000) {
      var r = P(rooms);
      var d = P([[1, 0], [-1, 0], [0, 1], [0, -1]]);

      var nx = r.x + d[0];
      var ny = r.y + d[1];

      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || grid[K(nx, ny)]) {
        continue;
      }

      add(nx, ny);
    }

    rooms.forEach(function (r) {
      [[1, 0], [0, 1]].forEach(function (d) {
        var n = grid[K(r.x + d[0], r.y + d[1])];

        if (n) {
          r.adj.push(n.id);
          n.adj.push(r.id);
        }
      });
    });

    var dist = [];

    for (var i = 0; i < rooms.length; i++) {
      dist.push(-1);
    }

    var q = [0];
    dist[0] = 0;

    while (q.length) {
      var c = q.shift();

      rooms[c].adj.forEach(function (n) {
        if (dist[n] < 0) {
          dist[n] = dist[c] + 1;
          q.push(n);
        }
      });
    }

    var bossRoom = rooms[1] || rooms[0];
    var best = dist[1] || 0;

    rooms.forEach(function (r) {
      if (r.t !== 'start' && dist[r.id] >= best) {
        best = dist[r.id];
        bossRoom = r;
      }
    });

    if (floor < floors) {
      bossRoom.t = 'stairs';
    } else {
      bossRoom.t = 'boss';
    }

    function ends() {
      return rooms.filter(function (r) {
        return r.t === 'empty' && r.adj.length === 1;
      });
    }

    var e1 = ends();
    if (e1.length) P(e1).t = 'chest';

    var e2 = ends();
    if (e2.length) P(e2).t = 'locked';

    var mod = pickModifier(zi, di, floor);

    var rest = rooms.filter(function (r) {
      return r.t === 'empty';
    });

    var bag = [];

    function push(t, n) {
      for (var j = 0; j < n; j++) {
        bag.push(t);
      }
    }

    push('mob', Math.max(2, Math.round(rest.length * 0.42)));

    push(
      'elite',
      (dn.rooms > 10 ? 2 : 1) + ((mod && mod.effects.elite) || 0)
    );

    push(
      'trap',
      Math.max(1, Math.round(rest.length * 0.08)) +
        ((mod && mod.effects.traps) || 0)
    );

    push('altar', 1);
    push('merch', 1);
    push('rest', 1);
    push('event', 1);

    if (mod && mod.effects.chests) {
      push('chest', mod.effects.chests);
    }

    if (mod && mod.effects.locked) {
      push('locked', mod.effects.locked);
    }

    while (bag.length < rest.length) {
      bag.push('empty');
    }

    while (bag.length > rest.length) {
      bag.pop();
    }

    for (var i2 = bag.length - 1; i2 > 0; i2--) {
      var j = RI(0, i2);
      var t = bag[i2];

      bag[i2] = bag[j];
      bag[j] = t;
    }

    rest.forEach(function (r, i3) {
      r.t = bag[i3] || 'empty';
    });

    MAP = {
      zi: zi,
      di: di,
      rooms: rooms,
      cur: 0,
      steps: 0
    };

    RUN.zi = zi;
    RUN.di = di;
    RUN.floor = floor;
    RUN.floors = floors;
    RUN.modifier = mod;

    if (!RUN.buffs) {
      RUN.buffs = [];
    }

    revealRoom(rooms[0]);
  }

  /* =====================================================
     ПЕРЕОПРЕДЕЛЕНИЕ ВХОДА В ДАНЖ
     ===================================================== */

  window.genDungeonMap = function (zi, di) {
    var floors = floorCount(zi, di);

    RUN = {
      zi: zi,
      di: di,
      buffs: [],
      floor: 1,
      floors: floors,
      modifier: null
    };

    buildFloor(zi, di, 1, floors);

    var dn = ZONES[zi].dungeons[di];

    log(
      '🕳️ Ты спускаешься: <b>' + dn.nm + '</b> (' + ZONES[zi].nm + '). Этажей: ' + floors + '.',
      'story'
    );

    if (RUN.modifier) {
      log(
        'Модификатор этажа: ' + RUN.modifier.ic + ' <b>' + RUN.modifier.nm + '</b> — ' + RUN.modifier.ds,
        'sys'
      );
    }
  };

  function nextFloor() {
    if (!RUN) return;
    if (RUN.floor >= RUN.floors) return;

    RUN.floor++;

    buildFloor(RUN.zi, RUN.di, RUN.floor, RUN.floors);

    toast('⬇ Этаж ' + RUN.floor + ' из ' + RUN.floors);

    log(
      '🪜 Ты спускаешься на этаж <b>' + RUN.floor + '</b>.',
      'story'
    );

    if (RUN.modifier) {
      log(
        'Модификатор этажа: ' + RUN.modifier.ic + ' <b>' + RUN.modifier.nm + '</b> — ' + RUN.modifier.ds,
        'sys'
      );
    }

    renderDungeon();
    save();
  }

  /* =====================================================
     ОБРАБОТКА ЛЕСТНИЦ И СОБЫТИЙ
     ===================================================== */

  var oldResolveRoom = window.resolveRoom;

  window.resolveRoom = function (r) {
    if (r && r.t === 'stairs') {
      nextFloor();
      return;
    }

    if (r && r.t === 'event') {
      if (!r.done) {
        if (!r.eventId) {
          r.eventId = P(DUNGEON_EVENTS).id;
        }

        renderDungeon();
      } else {
        renderDungeon();
      }

      return;
    }

    if (typeof oldResolveRoom === 'function') {
      oldResolveRoom.apply(this, arguments);
    }
  };

  /* =====================================================
     РЕНДЕР ЭТАЖА И СОБЫТИЙ
     ===================================================== */

  function eventHtml(r) {
    var ev = null;

    for (var i = 0; i < DUNGEON_EVENTS.length; i++) {
      if (DUNGEON_EVENTS[i].id === r.eventId) {
        ev = DUNGEON_EVENTS[i];
        break;
      }
    }

    if (!ev) return '';

    var buttons = ev.choices.map(function (ch) {
      return '<button class="btn" onclick="eventChoice(\'' + ch.id + '\')">' + ch.label + '</button>';
    }).join('');

    return (
      '<div class="panel event-panel">' +
      '<h3>' + ev.ic + ' ' + ev.nm + '</h3>' +
      '<p>' + ev.ds + '</p>' +
      '<div class="event-actions">' + buttons + '</div>' +
      '</div>'
    );
  }

  var oldRenderDungeon = window.renderDungeon;

  if (typeof oldRenderDungeon === 'function') {
    window.renderDungeon = function () {
      oldRenderDungeon.apply(this, arguments);

      if (!window.RUN || !window.MAP) return;

      var m = $('main');
      if (!m) return;

      var h2 = m.querySelector('h2');

      var mod = RUN.modifier;

      var banner =
        '<div class="panel floor-banner">' +
        '🧱 Этаж: <b>' + RUN.floor + ' / ' + RUN.floors + '</b>' +
        (
          mod
            ? '<br><span class="floor-mod">' + mod.ic + ' ' + mod.nm + '</span> — ' + mod.ds
            : ''
        ) +
        '</div>';

      if (h2) {
        h2.insertAdjacentHTML('afterend', banner);
      } else {
        m.insertAdjacentHTML('afterbegin', banner);
      }

      var cur = MAP.rooms[MAP.cur];

      if (cur && cur.t === 'event' && !cur.done) {
        m.insertAdjacentHTML('beforeend', eventHtml(cur));
      }
    };
  }

  /* =====================================================
     ЛОГИКА СОБЫТИЙ
     ===================================================== */

  window.eventChoice = function (choice) {
    if (!window.RUN || !window.MAP) return;

    var r = MAP.rooms[MAP.cur];

    if (!r || r.t !== 'event' || r.done) return;

    var id = r.eventId;
    var c = S.cs || calcStats();

    if (id === 'shrine') {
      if (choice === 'sacrifice') {
        var cost = Math.round(c.maxhp * 0.15);

        S.hero.hp = Math.max(1, S.hero.hp - cost);

        var buff = P([
          { k: 'dmg', pct: 10 },
          { k: 'armor', pct: 12 },
          { k: 'crit', pct: 6 }
        ]);

        addRunBuff(buff.k, buff.pct);

        log(
          '🕯️ Алтарь принимает кровь. Получен бафф: <b>+' + buff.pct + '% ' + buff.k + '</b>',
          'good'
        );
      } else {
        log('🕯️ Ты оставляешь алтарь в покое.', 'sys');
      }
    }

    if (id === 'soldier') {
      if (choice === 'give') {
        if (S.gold < 30) {
          toast('Не хватает золота');
          return;
        }

        S.gold -= 30;

        if (Math.random() < 0.5) {
          S.frag++;
          log('🤕 Наёмник отдаёт тебе ◆ осколок.', 'loot');
        } else {
          var zl = ZONES[RUN.zi].lv + (RUN.floor - 1);
          addItem(genItem(zl + 2, c.mf, 2), 'событие');
          log('🤕 Наёмник отдаёт тебе предмет.', 'loot');
        }
      } else {
        log('🤕 Ты проходишь мимо.', 'sys');
      }
    }

    if (id === 'gamble') {
      if (choice === 'bet') {
        if (S.gold < 50) {
          toast('Не хватает золота');
          return;
        }

        S.gold -= 50;

        if (Math.random() < 0.55) {
          if (Math.random() < 0.6) {
            var win = RI(100, 180);
            S.gold += win;
            log('🎲 Выигрыш! +' + fmt(win) + ' 🪙', 'good');
          } else {
            var zl2 = ZONES[RUN.zi].lv + (RUN.floor - 1);
            addItem(genItem(zl2 + 2, c.mf, RI(2, 3)), 'событие');
            log('🎲 Выигрыш! Ты получаешь предмет.', 'loot');
          }
        } else {
          log('🎲 Кости смеются над тобой. Ставка потеряна.', 'bad');
        }
      } else {
        log('🎲 Ты не рискуешь.', 'sys');
      }
    }

    if (id === 'bones') {
      if (choice === 'search') {
        if (Math.random() < 0.6) {
          var g = RI(20, 60);
          S.gold += g;
          log('🦴 Среди костей нашлось ' + g + ' 🪙.', 'loot');
        } else {
          var dmg = Math.round(c.maxhp * 0.10);
          S.hero.hp = Math.max(1, S.hero.hp - dmg);
          log('🦴 Кости оживают! −' + fmt(dmg) + ' ОЗ', 'bad');
        }
      } else {
        log('🦴 Ты решаешь не трогать кости.', 'sys');
      }
    }

    if (id === 'mirror') {
      if (choice === 'touch') {
        if (Math.random() < 0.5) {
          addRunBuff('dmg', 8);
          log('🪞 Отражение усиливает тебя: +8% урона.', 'good');
        } else {
          var hpLoss = Math.round(c.maxhp * 0.10);
          S.hero.hp = Math.max(1, S.hero.hp - hpLoss);
          S.frag++;
          log('🪞 Зеркало забирает кровь, но оставляет ◆ осколок.', 'loot');
        }
      } else {
        log('🪞 Ты отводишь взгляд.', 'sys');
      }
    }

    r.done = true;

    renderDungeon();
    renderTop();
    save();
  };

  /* =====================================================
     ВЛИЯНИЕ МОДИФИКАТОРОВ НА ВРАГОВ
     ===================================================== */

  function applyModifierToEnemy(e) {
    if (!window.RUN || !RUN.modifier || !e) return;

    var eff = RUN.modifier.effects || {};

    if (eff.hp) {
      e.maxhp = Math.round(e.maxhp * eff.hp);
      e.hp = e.maxhp;
    }

    if (eff.dmg) {
      e.dmg *= eff.dmg;
    }

    if (eff.arm) {
      e.arm = Math.round((e.arm || 0) * eff.arm);
    }

    if (eff.gold) {
      e.gold = Math.round(e.gold * eff.gold);
    }

    if (eff.elem && !e.elem) {
      e.elem = eff.elem;
    }
  }

  var oldMakeEnemy = window.makeEnemy;

  if (typeof oldMakeEnemy === 'function') {
    window.makeEnemy = function (zi, elite, dlvl) {
      var extraFloor = window.RUN && RUN.floor ? RUN.floor - 1 : 0;

      var e = oldMakeEnemy(zi, elite, (dlvl || 0) + extraFloor);

      applyModifierToEnemy(e);

      return e;
    };
  }

  var oldMakeBoss = window.makeBoss;

  if (typeof oldMakeBoss === 'function') {
    window.makeBoss = function (zi) {
      var b = oldMakeBoss(zi);

      applyModifierToEnemy(b);

      return b;
    };
  }

  /* =====================================================
     ВЛИЯНИЕ МОДИФИКАТОРОВ НА ГЕРОЯ
     ===================================================== */

  if (typeof window.playerDmgMul === 'function') {
    var oldPlayerDmgMul = window.playerDmgMul;

    window.playerDmgMul = function () {
      var m = oldPlayerDmgMul.apply(this, arguments);

      if (
        window.RUN &&
        RUN.modifier &&
        RUN.modifier.id === 'cursed_ground'
      ) {
        m *= 0.85;
      }

      return m;
    };
  }

  if (typeof window.critChance === 'function') {
    var oldCritChance = window.critChance;

    window.critChance = function () {
      var v = oldCritChance.apply(this, arguments);

      if (
        window.RUN &&
        RUN.modifier &&
        RUN.modifier.id === 'shadow_veil'
      ) {
        v -= 10;
      }

      return Math.max(0, v);
    };
  }

  if (typeof window.pInterval === 'function') {
    var oldPInterval = window.pInterval;

    window.pInterval = function () {
      var v = oldPInterval.apply(this, arguments);

      if (
        window.RUN &&
        RUN.modifier &&
        RUN.modifier.id === 'frozen_halls'
      ) {
        v = Math.round(v * 1.1);
      }

      return v;
    };
  }

})();