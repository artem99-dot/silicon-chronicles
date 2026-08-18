'use strict';

var ORDERTTL = [8, 12, 15, 20, 25];

function genOrder() {
  var zs = unlockedZones();
  var zi = P(zs);
  var roll = Math.random();
  var o;
  var mult = 1 + RI(0, 3) * 0.25;

  if (roll < 0.28) {
    o = {
      type: 'kill',
      zi: zi,
      n: RI(5, 10) * Math.round(mult),
      gold: RI(40, 80) * Math.round(mult),
      xp: RI(60, 120) * Math.round(mult),
      frag: RI(1, 3)
    };
  } else if (roll < 0.42) {
    o = {
      type: 'boss',
      zi: zi,
      n: 1,
      gold: RI(150, 260),
      xp: RI(200, 320),
      frag: RI(4, 8),
      item: true
    };
  } else if (roll < 0.56) {
    o = {
      type: 'dungeon',
      zi: zi,
      n: 1,
      gold: RI(100, 180),
      xp: RI(140, 220),
      frag: RI(3, 6)
    };
  } else if (roll < 0.7) {
    o = {
      type: 'trophy',
      zi: zi,
      n: RI(4, 8),
      gold: RI(60, 120),
      xp: RI(50, 100),
      frag: RI(2, 4)
    };
  } else if (roll < 0.8) {
    o = {
      type: 'enh',
      zi: 0,
      n: RI(1, 3),
      gold: RI(80, 160),
      xp: RI(60, 120),
      frag: RI(2, 5)
    };
  } else if (roll < 0.9) {
    o = {
      type: 'arena',
      zi: 0,
      n: RI(5, 15),
      gold: RI(70, 150),
      xp: RI(80, 160),
      frag: RI(2, 5)
    };
  } else {
    o = {
      type: 'sell',
      zi: 0,
      n: RI(3, 6),
      gold: RI(50, 110),
      xp: RI(40, 90),
      frag: RI(1, 3)
    };
  }

  o.id = uid();
  o.prog = 0;

  o.deadline = now() + ORDERTTL[RI(0, ORDERTTL.length - 1)] * 60000;

  return o;
}

function unlockedZones() {
  var u = [];

  for (var i = 0; i < ZONES.length; i++) {
    if (i === 0 || S.hero.bosses[i - 1]) {
      u.push(i);
    }
  }

  return u;
}

function orderInfo(o) {
  var z = ZONES[o.zi] || ZONES[0];

  if (o.type === 'kill') {
    return {
      ic: '⚔',
      t: 'Истребление: ' + z.nm,
      d: 'Убей ' + o.n + ' врагов в «' + z.nm + '»'
    };
  }

  if (o.type === 'boss') {
    return {
      ic: '☠',
      t: 'Охота за головой',
      d: 'Срази ' + ZONES[o.zi].boss.n + ' (данж или призыв)'
    };
  }

  if (o.type === 'dungeon') {
    return {
      ic: '🕳️',
      t: 'Зачистка',
      d: 'Пройди данж в «' + z.nm + '» до конца'
    };
  }

  if (o.type === 'trophy') {
    return {
      ic: '🎭',
      t: 'Сбор трофеев',
      d: 'Собери ' + o.n + ' трофеев «' + z.nm + '» (сдаются продажей)'
    };
  }

  if (o.type === 'enh') {
    return {
      ic: '⚒',
      t: 'Работа кузнеца',
      d: 'Успешно заточи снаряжение ' + o.n + ' раз'
    };
  }

  if (o.type === 'arena') {
    return {
      ic: '🏟️',
      t: 'Испытание арены',
      d: 'Достигни волны ' + o.n + ' на арене'
    };
  }

  if (o.type === 'sell') {
    return {
      ic: '💰',
      t: 'Поставка',
      d: 'Продай ' + o.n + ' предметов/трофеев'
    };
  }

  return {
    ic: '?',
    t: o.type,
    d: ''
  };
}

function bumpOrders(type, zi, amt) {
  if (!S || !S.board) return;

  var hit = false;

  S.board.orders.forEach(function(o) {
    if (o.type !== type) return;

    var zoneMatch =
      o.zi === zi ||
      type === 'enh' ||
      type === 'arena' ||
      type === 'sell';

    if (!zoneMatch) return;
    if (o.prog >= o.n) return;

    if (type === 'arena') {
      var wave = amt || 0;

      if (wave > o.prog) {
        o.prog = Math.min(o.n, wave);
      }
    } else {
      o.prog = Math.min(o.n, o.prog + (amt || 1));
    }

    if (o.prog >= o.n) hit = true;
  });

  if (hit) {
    toast('📜 Заказ выполнен — забери награду в Гильдии!');
  }
}

function pruneOrders() {
  if (!S || !S.board) return;

  var changed = false;

  S.board.orders.forEach(function(o, i) {
    if (o.prog < o.n && o.deadline < now()) {
      S.board.orders[i] = genOrder();
      changed = true;
    }
  });

  if (changed) save();
}

function claimOrder(i) {
  var o = S.board.orders[i];

  if (!o || o.prog < o.n) return;

  if (o.type === 'trophy') {
    var need = o.n;
    var zi = o.zi;

    var have =
      (S.hero.troph[zi * 10] || 0) +
      (S.hero.troph[zi * 10 + 1] || 0);

    if (have < need) {
      toast('Не хватает трофеев');
      return;
    }

    var left = need;

    ['0', '1'].forEach(function(t) {
      var k = zi * 10 + (+t);
      var tk = Math.min(S.hero.troph[k] || 0, left);

      S.hero.troph[k] -= tk;
      left -= tk;
    });
  }

  S.gold += o.gold;
  S.frag += o.frag;

  log(
    '📜 Заказ выполнен! Награда: ' + fmt(o.gold) + ' 🪙, ' + o.frag + ' ◆',
    'loot'
  );

  if (o.item) {
    addItem(
      genItem(
        ZONES[o.zi].lv + 3,
        (S.cs || calcStats()).mf,
        Math.min(4, tierOf(ZONES[o.zi].lv) + 1)
      )
    );
  }

  gainXP(o.xp);

  S.board.orders[i] = genOrder();

  toast('📜 Награда получена');

  checkTitles();
  save();
  renderTown();
  renderTop();
}

function rerollOrder(i) {
  var cost = 20;

  if (S.gold < cost) {
    toast('Нужно 20 🪙');
    return;
  }

  S.gold -= cost;
  S.board.orders[i] = genOrder();

  log('📜 Заказ заменён.', 'sys');

  save();
  renderTown();
  renderTop();
}