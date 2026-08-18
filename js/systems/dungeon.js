'use strict';

var ROOMDEF = {
  start: {
    ic: '🚪',
    nm: 'Вход',
    ds: 'Ступени уходят вниз.'
  },

  mob: {
    ic: '⚔️',
    nm: 'Враги',
    ds: 'Здесь пахнет кровью.'
  },

  elite: {
    ic: '💀',
    nm: 'Матёрый враг',
    ds: 'Кто-то крупный.'
  },

  chest: {
    ic: '🧰',
    nm: 'Сокровищница',
    ds: 'Сундук ждёт.'
  },

  locked: {
    ic: '🔒',
    nm: 'Запертая сокровищница',
    ds: 'Нужен ключ зоны.'
  },

  altar: {
    ic: '🕯️',
    nm: 'Алтарь',
    ds: 'Древний алтарь.'
  },

  trap: {
    ic: '⚠️',
    nm: 'Ловушки',
    ds: 'Пол подозрительно чист.'
  },

  merch: {
    ic: '🧳',
    nm: 'Торговец',
    ds: 'Контрабандист.'
  },

  rest: {
    ic: '🔥',
    nm: 'Костёр',
    ds: 'Можно передохнуть.'
  },

  empty: {
    ic: '·',
    nm: 'Пустой зал',
    ds: 'Тишина.'
  },

  boss: {
    ic: '👹',
    nm: 'Логово хранителя',
    ds: 'Босс ждёт. Сигил не нужен.'
  }
};

function genDungeonMap(zi, di) {
  var dn = ZONES[zi].dungeons[di];
  var target = Math.max(8, dn.rooms);

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

  rooms.forEach(function(r) {
    [[1, 0], [0, 1]].forEach(function(d) {
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

    rooms[c].adj.forEach(function(n) {
      if (dist[n] < 0) {
        dist[n] = dist[c] + 1;
        q.push(n);
      }
    });
  }

  var bossRoom = rooms[1];
  var best = dist[1] || 0;

  rooms.forEach(function(r) {
    if (r.t !== 'start' && dist[r.id] >= best) {
      best = dist[r.id];
      bossRoom = r;
    }
  });

  bossRoom.t = 'boss';

  function ends() {
    return rooms.filter(function(r) {
      return r.t === 'empty' && r.adj.length === 1;
    });
  }

  var e1 = ends();

  if (e1.length) {
    P(e1).t = 'chest';
  }

  var e2 = ends();

  if (e2.length) {
    P(e2).t = 'locked';
  }

  var rest = rooms.filter(function(r) {
    return r.t === 'empty';
  });

  var bag = [];

  function push(t, n) {
    for (var j = 0; j < n; j++) {
      bag.push(t);
    }
  }

  push('mob', Math.max(2, Math.round(rest.length * 0.42)));
  push('elite', dn.rooms > 10 ? 2 : 1);
  push('trap', Math.max(1, Math.round(rest.length * 0.08)));
  push('altar', 1);
  push('merch', 1);
  push('rest', 1);

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

  rest.forEach(function(r, i3) {
    r.t = bag[i3] || 'empty';
  });

  MAP = {
    zi: zi,
    di: di,
    rooms: rooms,
    cur: 0,
    steps: 0
  };

  RUN = {
    zi: zi,
    di: di,
    buffs: []
  };

  revealRoom(rooms[0]);

  log(
    '🕳️ Ты спускаешься: <b>' + dn.nm + '</b> (' + ZONES[zi].nm +
    '). Босс в самой дальней комнате.',
    'story'
  );
}

function revealRoom(r) {
  r.seen = true;

  r.adj.forEach(function(i) {
    MAP.rooms[i].seen = true;
  });
}

function moveTo(id) {
  if (!MAP || !RUN) return;

  var cur = MAP.rooms[MAP.cur];
  var r = MAP.rooms[id];

  if (!r || cur.adj.indexOf(id) < 0) return;

  if (r.t === 'boss') {
    bossDoor();
    return;
  }

  MAP.cur = id;
  MAP.steps++;

  revealRoom(r);
  resolveRoom(r);
}

function resolveRoom(r) {
  if (r.done) {
    renderDungeon();
    return;
  }

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

  if (r.t === 'chest') {
    openChest(r, false);
    renderDungeon();
    save();
    return;
  }

  if (r.t === 'locked') {
    if (S.hero.keys[RUN.zi] > 0) {
      S.hero.keys[RUN.zi]--;
      r.done = true;

      openChest(r, true);

      log('🗝️ ' + KITEMS[RUN.zi].nm + ' открывает дверь.', 'good');
    } else {
      log(
        '🔒 Нужен «' + KITEMS[RUN.zi].nm +
        '». Купи в Гильдии или сними с босса.',
        'sys'
      );
    }

    renderDungeon();
    save();

    return;
  }

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
      }
    ]);

    log('⚠ ' + t.t, 'bad');

    if (t.hp) {
      S.hero.hp = Math.max(1, S.hero.hp - Math.round(S.cs.maxhp * t.hp / 100));
    } else {
      S.hero.mp = Math.max(0, S.hero.mp - Math.round(S.cs.maxmp * t.mp / 100));
    }

    renderDungeon();
    renderTop();
    save();

    return;
  }

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

  if (r.t === 'altar' || r.t === 'merch' || r.t === 'empty') {
    if (r.t === 'empty') {
      r.done = true;

      log(
        '📜 ' + P([
          'Тишина.',
          'Пепел кружится в воздухе.',
          'Где-то капает вода.'
        ]),
        'story'
      );
    }

    renderDungeon();

    return;
  }
}

function openChest(r, locked) {
  r.done = true;

  var zi = RUN.zi;
  var zl = ZONES[zi].lv + RUN.di;
  var c = S.cs;
  var src = zoneLootName();

  log(
    '🗝 Ты вскрываешь сундук (' + (locked ? 'запертый' : 'обычный') + ').',
    'loot'
  );

  addItem(genItem(zl + 2, c.mf, chestRarity(zl, locked)), src);

  if (Math.random() * 100 < (locked ? 40 : 25)) {
    addItem(genItem(zl + 2, c.mf, 3), src);
  }

  if (Math.random() * 100 < (locked ? 2 : 0.5)) {
    addItem(makeUnique(P(UNIQUES)), src);
  }

  var sigCh = locked ? 22 : 8;

  if (Math.random() * 100 < sigCh) {
    S.hero.sigils[zi]++;

    toast(SIGILS[zi].icon + ' Сигил: ' + SIGILS[zi].nm + '!');
    log('🔮 Сигил: ' + SIGILS[zi].nm, 'loot');
  }

  if (Math.random() * 100 < (locked ? 70 : 45)) {
    dropGem('сундук');
  }

  if (Math.random() < 0.4) {
    var fr = RI(1, 2);

    S.frag += fr;

    log('◆ Осколки: +' + fr, 'loot');
  }
}

function altarPick(i) {
  if (!RUN) return;

  var opts = [
    {
      k: 'dmg',
      pct: 15,
      n: '+15% урона'
    },
    {
      k: 'armor',
      pct: 25,
      n: '+25% брони'
    },
    {
      k: 'crit',
      pct: 8,
      n: '+8% крит'
    }
  ];

  var o = opts[i];

  RUN.buffs = RUN.buffs.filter(function(b) {
    return b.k !== o.k;
  });

  RUN.buffs.push({
    k: o.k,
    pct: o.pct,
    t: 9999,
    dg: true
  });

  var r = MAP.rooms[MAP.cur];

  r.done = true;

  log('🕯️ Алтарь: <b>' + o.n + '</b> (до конца данжа)', 'good');

  renderDungeon();
  save();
}

function merchBuy(w) {
  var zl = ZONES[RUN.zi].lv + RUN.di;

  if (w === 'pot') {
    if (S.gold < 35) {
      toast('Нужно 35 🪙');
      return;
    }

    S.gold -= 35;
    S.hero.pots.hp++;

    log('Куплено зелье (35 🪙)', 'loot');
  } else if (w === 'mana') {
    if (S.gold < 30) {
      toast('Нужно 30 🪙');
      return;
    }

    S.gold -= 30;
    S.hero.pots.mp++;

    log('Куплено зелье маны (30 🪙)', 'loot');
  } else {
    var it = genItem(zl + 1, 0, RI(1, 3));
    var pr = Math.round(sellPrice(it) * 2.2);

    if (S.gold < pr) {
      toast('Нужно ' + fmt(pr) + ' 🪙');
      return;
    }

    S.gold -= pr;

    addItem(it, 'торговец');
  }

  renderDungeon();
  renderTop();
  save();
}

function bossDoor() {
  var zi = RUN.zi;

  log(
    '🚪 Ты входишь в логово. <b>' + ZONES[zi].boss.n + '</b> ждал тебя.',
    'story'
  );

  S.cs = calcStats();

  startCombat(
    makeBoss(zi),
    {
      type: 'run',
      zi: zi
    }
  );

  save();
}

function retreatDungeon() {
  RUN = null;
  MAP = null;

  log('Ты покидаешь подземелье.', 'sys');

  S.town = 'gate';

  renderTown();
  save();
}

function initDungeon(zi, di) {
  genDungeonMap(zi, di);
  renderDungeon();
  save();
}

function renderDungeon() {
  var m = $('main');

  if (!RUN || !MAP) {
    S.town = 'gate';
    renderTown();
    return;
  }

  var z = ZONES[RUN.zi];
  var dn = z.dungeons[RUN.di];

  var CS = 60;
  var GAP = 16;
  var ST = CS + GAP;

  var minX = 9;
  var maxX = 0;
  var minY = 9;
  var maxY = 0;

  MAP.rooms.forEach(function(r) {
    if (r.seen) {
      minX = Math.min(minX, r.x);
      maxX = Math.max(maxX, r.x);
      minY = Math.min(minY, r.y);
      maxY = Math.max(maxY, r.y);
    }
  });

  if (minX > maxX) {
    minX = 0;
    maxX = 0;
    minY = 0;
    maxY = 0;
  }

  var W = (maxX - minX + 1) * ST + GAP;
  var H = (maxY - minY + 1) * ST + GAP;

  var ox = GAP - minX * ST;
  var oy = GAP - minY * ST;

  var cur = MAP.rooms[MAP.cur];

  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:' + Math.max(W, 460) + 'px;display:block;margin:0 auto">';

  MAP.rooms.forEach(function(r) {
    if (!r.seen) return;

    r.adj.forEach(function(nid) {
      if (nid <= r.id) return;

      var n = MAP.rooms[nid];

      if (!n.seen) return;

      if (n.x > r.x) {
        svg += '<rect x="' + (ox + r.x * ST + CS) + '" y="' + (oy + r.y * ST + CS / 2 - 9) +
          '" width="' + GAP + '" height="18" rx="3" fill="#3a2c1a"/>';
      }

      if (n.y > r.y) {
        svg += '<rect x="' + (ox + r.x * ST + CS / 2 - 9) + '" y="' + (oy + r.y * ST + CS) +
          '" width="18" height="' + GAP + '" rx="3" fill="#3a2c1a"/>';
      }
    });
  });

  MAP.rooms.forEach(function(r) {
    if (!r.seen) return;

    var here = r.id === MAP.cur;
    var av = !here && cur.adj.indexOf(r.id) >= 0;

    var fill = '#171008';
    var stroke = '#3a2c1a';

    if (r.t === 'boss') {
      fill = '#230d0d';
      stroke = '#6c2a2a';
    } else if (r.t === 'chest' || r.t === 'locked') {
      fill = '#1d160a';
      stroke = '#6a5222';
    } else if (r.t === 'altar') {
      fill = '#0f1a18';
      stroke = '#2c5a52';
    } else if (r.t === 'merch') {
      fill = '#18130c';
      stroke = '#5a4526';
    } else if (r.t === 'rest') {
      fill = '#1a120a';
      stroke = '#5a3a1c';
    }

    var ic;

    if (here) {
      ic = '🧭';
    } else if (r.done && (r.t === 'mob' || r.t === 'elite')) {
      ic = '☠';
    } else if (r.done) {
      ic = '✓';
    } else {
      ic = ROOMDEF[r.t] ? ROOMDEF[r.t].ic : '·';
    }

    var cls = 'droom' + (av ? ' av' : '') + (here ? ' here' : '') + (r.done && !here ? ' done' : '');

    svg += '<g class="' + cls + '" ' + (av ? 'onclick="moveTo(' + r.id + ')"' : '') + '>' +
      '<rect x="' + (ox + r.x * ST) + '" y="' + (oy + r.y * ST) +
      '" width="' + CS + '" height="' + CS + '" rx="9" fill="' + fill +
      '" stroke="' + (here ? '#f0cf8a' : stroke) + '" stroke-width="' + (here ? 3 : 2) + '"/>' +
      '<text x="' + (ox + r.x * ST + CS / 2) + '" y="' + (oy + r.y * ST + CS / 2 + 8) +
      '" text-anchor="middle" font-size="24">' + ic + '</text>' +
      '</g>';
  });

  svg += '</svg>';

  var html = '<button class="btn small" onclick="S.town=\'gate\';renderTown()">← К вратам</button> ' +
    '<span style="color:var(--dim);font-size:12px">(во время данжа город закрыт)</span>';

  html += '<h2 style="font-size:24px;color:var(--gold2);margin:8px 0">' + dn.ic + ' ' + dn.nm + '</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin-bottom:10px">' +
    z.nm + ' · комнат: ' + dn.rooms + ' · шагов: ' + MAP.steps +
    ' · клик по соседней комнате или стрелки/WASD' +
    '</div>';

  html += '<div class="panel" style="overflow-x:auto">' + svg;

  html += '<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:11px;color:var(--dim);justify-content:center;margin:6px 0">' +
    '<span>🧭 ты</span>' +
    '<span>⚔️ враги</span>' +
    '<span>💀 элита</span>' +
    '<span>🧰 сундук</span>' +
    '<span>🔒 заперто</span>' +
    '<span>🕯️ алтарь</span>' +
    '<span>⚠️ ловушки</span>' +
    '<span>🧳 торговец</span>' +
    '<span>🔥 костёр</span>' +
    '<span>👹 босс</span>' +
    '<span>☠ зачищено</span>' +
    '</div>';

  html += '<div style="text-align:center;margin-top:6px">' +
    '<b style="font-family:var(--fd);font-size:18px">' +
    (ROOMDEF[cur.t] ? ROOMDEF[cur.t].nm : '') +
    '</b>' +
    '<div style="color:var(--dim);font-size:12px;margin:2px 0 10px">' +
    (ROOMDEF[cur.t] ? ROOMDEF[cur.t].ds : '') +
    '</div>';

  if (cur.t === 'altar' && !cur.done) {
    html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
      '<button class="btn gold" onclick="altarPick(0)">🔥 +15% урона</button>' +
      '<button class="btn gold" onclick="altarPick(1)">🪨 +25% брони</button>' +
      '<button class="btn gold" onclick="altarPick(2)">🌪 +8% крит</button>' +
      '</div>';
  } else if (cur.t === 'merch') {
    html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
      '<button class="btn small" onclick="merchBuy(\'pot\')">🧪 Зелье — 35 🪙</button>' +
      '<button class="btn small" onclick="merchBuy(\'mana\')">🧪 Мана — 30 🪙</button>' +
      '<button class="btn small" onclick="merchBuy(\'item\')">🎁 Предмет</button>' +
      '</div>';
  } else if (cur.t === 'locked' && !cur.done) {
    html += '<div style="color:var(--dim);font-size:12px">' +
      'Нужен «' + KITEMS[RUN.zi].nm + '»: у тебя ' + (S.hero.keys[RUN.zi] || 0) + ' шт.' +
      '</div>';
  } else if (cur.t === 'boss') {
    html += '<button class="btn gold big" onclick="bossDoor()">👹 Войти в логово: ' + z.boss.n + '</button>';
  }

  html += '</div>' +
    '<div style="display:flex;gap:10px;justify-content:center;margin-top:10px">' +
    '<button class="btn" onclick="drinkPot(\'hp\')">🧪 Зелье (' + S.hero.pots.hp + ')</button>' +
    '<button class="btn danger" onclick="retreatDungeon()">🏳️ Покинуть данж</button>' +
    '</div>' +
    '</div>';

  m.innerHTML = html;
}

(function() {
  if (window.__dungeonKeysBound) return;

  window.__dungeonKeysBound = true;

  document.addEventListener('keydown', function(e) {
    if (!S || !RUN || !MAP) return;

    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

    var k = e.key.toLowerCase();

    var dirs = {
      arrowup: [0, -1],
      w: [0, -1],
      arrowdown: [0, 1],
      s: [0, 1],
      arrowleft: [-1, 0],
      a: [-1, 0],
      arrowright: [1, 0],
      d: [1, 0]
    };

    if (!dirs[k]) return;

    e.preventDefault();

    var cur = MAP.rooms[MAP.cur];
    var want = dirs[k];

    var best = null;
    var bestScore = 1e9;

    cur.adj.forEach(function(id) {
      var r = MAP.rooms[id];

      var dx = r.x - cur.x;
      var dy = r.y - cur.y;

      var dot = dx * want[0] + (-dy) * want[1];

      if (dot > 0 && dot < bestScore) {
        bestScore = dot;
        best = id;
      }
    });

    if (best) {
      moveTo(best);
    }
  });
})();