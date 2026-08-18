'use strict';

function sellItem(id) {
  var f = findItem(id);
  if (!f) return;

  var g = sellPrice(f.it);

  S.gold += g;

  if (f.from === 'inv') {
    S.hero.inv.splice(f.i, 1);
  } else {
    S.hero.eq[f.s] = null;
    S.cs = null;
  }

  bumpOrders('sell', 0, 1);

  log('Продано за <b>' + fmt(g) + '</b> 🪙', 'loot');

  save();
  renderTown();
  renderTop();
}

function troInfo(key) {
  key = +key;

  var zi = Math.floor(key / 10);
  var t = key % 10;

  if (t === 9) {
    var b = BOSS_TROPH[zi];

    return {
      nm: b.nm,
      icon: b.icon,
      zi: zi,
      price: 25 + zi * 15
    };
  }

  var tr = TROPH[zi][t];

  return {
    nm: tr.nm,
    icon: tr.icon,
    zi: zi,
    price: 4 + zi * 4
  };
}

function sellTroph(key, all) {
  var n = S.hero.troph[key] || 0;
  if (!n) return;

  var cnt = all ? n : 1;
  var inf = troInfo(key);
  var g = inf.price * cnt;

  S.hero.troph[key] -= cnt;
  S.gold += g;

  bumpOrders('sell', 0, cnt);

  log('Продано: ' + inf.nm + ' ×' + cnt + ' за ' + fmt(g) + ' 🪙', 'loot');

  save();
  renderTown();
  renderTop();
}

function troCount(zi) {
  return (
    (S.hero.troph[zi * 10] || 0) +
    (S.hero.troph[zi * 10 + 1] || 0)
  );
}

function totalTroph() {
  return Object.keys(S.hero.troph).reduce(function(s, k) {
    return s + ((k % 10 === 9) ? 0 : S.hero.troph[k]);
  }, 0);
}

function bTrophCount() {
  return Object.keys(S.hero.troph).reduce(function(s, k) {
    return s + ((k % 10 === 9) ? S.hero.troph[k] : 0);
  }, 0);
}

function consumeAnyTroph(n) {
  var keys = Object.keys(S.hero.troph).filter(function(k) {
    return k % 10 !== 9 && S.hero.troph[k] > 0;
  });

  for (var i = 0; i < keys.length; i++) {
    if (n <= 0) break;

    var t = Math.min(S.hero.troph[keys[i]], n);

    S.hero.troph[keys[i]] -= t;
    n -= t;
  }

  return n <= 0;
}

function consumeBTroph(n) {
  var keys = Object.keys(S.hero.troph).filter(function(k) {
    return k % 10 === 9 && S.hero.troph[k] > 0;
  });

  for (var i = 0; i < keys.length; i++) {
    if (n <= 0) break;

    var t = Math.min(S.hero.troph[keys[i]], n);

    S.hero.troph[keys[i]] -= t;
    n -= t;
  }

  return n <= 0;
}

function consumeZoneTroph(zi, n) {
  var left = n;
  var keys = [zi * 10, zi * 10 + 1];

  keys.forEach(function(k) {
    if (left <= 0) return;

    var have = S.hero.troph[k] || 0;
    var take = Math.min(have, left);

    if (take > 0) {
      S.hero.troph[k] = have - take;
      left -= take;
    }
  });

  return left <= 0;
}

function crushTroph(key) {
  if ((S.hero.troph[key] || 0) < 3) {
    toast('Нужно 3 трофея');
    return;
  }

  S.hero.troph[key] -= 3;
  S.frag++;

  log('◆ 3 трофея → 1 осколок', 'loot');

  save();
  renderTown();
  renderTop();
}

function craft(zi, type) {
  var need = {
    weapon: { t: 10, f: 2, g: 50 * (zi + 1) },
    armor: { t: 8, f: 1, g: 40 * (zi + 1) },
    trinket: { t: 6, f: 1, g: 30 * (zi + 1) }
  }[type];

  if (troCount(zi) < need.t) {
    toast('Не хватает трофеев');
    return;
  }

  if (S.frag < need.f) {
    toast('Не хватает осколков');
    return;
  }

  if (S.gold < need.g) {
    toast('Не хватает золота');
    return;
  }

  if (!consumeZoneTroph(zi, need.t)) {
    toast('Не хватает трофеев');
    return;
  }

  S.frag -= need.f;
  S.gold -= need.g;

  var mf = (S.cs || calcStats()).mf;
  var it;

  if (type === 'weapon') {
    it = genItem(ZONES[zi].lv + 2, mf, 2, ['weapon']);
  } else if (type === 'armor') {
    it = genItem(ZONES[zi].lv + 2, mf, 2, ['helmet', 'armor', 'gloves', 'boots']);
  } else {
    it = genItem(ZONES[zi].lv + 2, mf, RI(1, 2), ['amulet', 'ring']);
  }

  addItem(it, 'мастерская');

  save();
  renderTown();
  renderTop();
}

function brew(id) {
  var r = RECIPES.find(function(x) {
    return x.id === id;
  });

  if (!r) return;

  if (S.gold < r.gold) {
    toast('Не хватает золота');
    return;
  }

  if (r.tro && totalTroph() < r.tro) {
    toast('Нужно ' + r.tro + ' трофеев');
    return;
  }

  if (r.btro && bTrophCount() < r.btro) {
    toast('Нужно ' + r.btro + ' трофеев боссов');
    return;
  }

  if (r.frag && S.frag < r.frag) {
    toast('Не хватает осколков');
    return;
  }

  S.gold -= r.gold;

  if (r.tro) consumeAnyTroph(r.tro);
  if (r.btro) consumeBTroph(r.btro);
  if (r.frag) S.frag -= r.frag;

  if (r.out.pot) {
    S.hero.pots[r.out.pot]++;
    log('⚗ Сварено: ' + r.n, 'good');
  }

  if (r.out.elix) {
    S.hero.elix[r.out.elix]++;
    log('⚗ Сварено: ' + r.n, 'good');
  }

  if (r.out.prot) {
    S.hero.prot++;
    log('⚒ Камень-оберег готов', 'good');
  }

  if (r.out.gem) {
    var gk = P(Object.keys(GEMS));

    if (!S.hero.gems[gk]) {
      S.hero.gems[gk] = {
        n: 0,
        lv: 1
      };
    }

    S.hero.gems[gk].n++;

    log('💎 Самоцвет: ' + GEMS[gk].n, 'loot');
    toast('💎 ' + GEMS[gk].n);
  }

  save();
  renderTown();
  renderTop();
}

function enhChance(it) {
  var n = (it.enh || 0) + 1;
  var c = 95 - 9 * n;

  if (S.hero.race === 'dwarf') {
    c += 15;
  }

  return Math.max(5, Math.min(95, c));
}

function enhCost(it) {
  var n = (it.enh || 0) + 1;

  return {
    gold: 20 + n * 30 + it.lvl * 5 * n,
    frag: 1 + n
  };
}

function doEnhance(id) {
  var f = findItem(id);
  if (!f) return;

  var it = f.it;
  var n = (it.enh || 0) + 1;

  if (n > 15) {
    toast('Предел +15');
    return;
  }

  var cost = enhCost(it);

  if (S.gold < cost.gold || S.frag < cost.frag) {
    toast('Не хватает ресурсов');
    return;
  }

  S.gold -= cost.gold;
  S.frag -= cost.frag;

  if (Math.random() * 100 < enhChance(it)) {
    it.enh = n;

    S.cs = null;
    calcStats();

    S.hero.enhOk = (S.hero.enhOk || 0) + 1;

    bumpOrders('enh', 0, 1);

    toast('⚒ ' + it.nm + ' +' + n + '!');
    log('⚒ <b>' + it.nm + '</b> заточен до +' + n, 'good');

    checkTitles();
  } else {
    if (S.hero.prot > 0) {
      S.hero.prot--;
      it.enh = Math.max(0, it.enh - 1);

      toast('🛡 Оберег спас предмет');
      log('Заточка сорвалась, оберег раскололся. ' + it.nm + ' +' + it.enh, 'bad');
    } else {
      if (f.from === 'inv') {
        S.hero.inv.splice(f.i, 1);
      } else {
        S.hero.eq[f.s] = null;
        S.cs = null;
      }

      toast('💥 ПРЕДМЕТ УНИЧТОЖЕН');
      log('💥 <b>' + it.nm + '</b> рассыпался пеплом.', 'bad');
    }
  }

  save();
  renderTown();
  renderTop();
}

function useOrb() {
  var i = S.hero.inv.findIndex(function(x) {
    return x.orb;
  });

  if (i < 0) {
    toast('Нет Орба Забвения');
    return;
  }

  var spent = spentPts();

  if (spent <= 0) {
    toast('Нет распределённых очков');
    return;
  }

  S.hero.inv.splice(i, 1);

  S.hero.pts += spent;
  S.hero.talloc = {
    origin: true,
    r_0_1: true
  };

  S.cs = null;

  log('🌀 Очки навыков возвращены: ' + spent, 'sys');

  save();
  renderTown();
  renderTop();
}

function menuWindow() {
  return Math.floor(now() / 1800000);
}

function todayMenu() {
  var rng = mulberry32(menuWindow());

  return shuffle(
    FOODS.map(function(f, i) {
      return i;
    }),
    rng
  ).slice(0, 3);
}

function eatFood(i) {
  var f = FOODS[i];
  var avail = todayMenu();

  if (avail.indexOf(i) < 0) {
    toast('Сегодня это не подают');
    return;
  }

  if (S.gold < f.cost) {
    toast('Не хватает золота');
    return;
  }

  S.gold -= f.cost;
  S.hero.meals = (S.hero.meals || 0) + 1;

  S.timed.push({
    k: f.buff.k,
    v: f.buff.v,
    until: now() + f.dur * 60000
  });

  S.cs = null;
  calcStats();

  log('🍽️ Ты ешь: <b>' + f.n + '</b> (' + f.d + ', ' + f.dur + ' мин)', 'good');
  toast('🍽️ ' + f.n + ': ' + f.d);

  checkTitles();
  save();
  renderTown();
  renderTop();
}

function restInn(tier) {
  var c = S.cs || calcStats();

  if (tier === 1) {
    S.hero.hp = Math.max(S.hero.hp, Math.round(c.maxhp * 0.5));
    S.hero.mp = c.maxmp;

    log('🛏️ Ты вздремнул на лавке. ОЗ до 50%.', 'good');
  } else if (tier === 2) {
    var cost = 30 + S.hero.lvl * 5;

    if (S.gold < cost) {
      toast('Нужно ' + fmt(cost) + ' 🪙');
      return;
    }

    S.gold -= cost;
    S.hero.hp = c.maxhp;
    S.hero.mp = c.maxmp;

    log('🛏️ Полное восстановление.', 'good');
  } else {
    var cost3 = 80 + S.hero.lvl * 10;

    if (S.gold < cost3) {
      toast('Нужно ' + fmt(cost3) + ' 🪙');
      return;
    }

    S.gold -= cost3;
    S.hero.hp = c.maxhp;
    S.hero.mp = c.maxmp;

    S.timed.push({
      k: 'healPow',
      v: 50,
      until: now() + 30 * 60000
    });

    S.timed.push({
      k: 'hp',
      v: 10,
      until: now() + 30 * 60000
    });

    S.cs = null;
    calcStats();

    log('🛏️ Люкс: полное восстановление + бафф на 30 мин.', 'good');
  }

  save();
  renderTown();
  renderTop();
}

function playDice(bet) {
  if (S.gold < bet) {
    toast('Не хватает золота');
    return;
  }

  S.gold -= bet;

  var a = RI(1, 6) + RI(1, 6);
  var b = RI(1, 6) + RI(1, 6);
  var msg;

  if (a > b) {
    S.gold += bet * 2;
    S.hero.gamesWon = (S.hero.gamesWon || 0) + 1;

    msg = '🎲 Ты ' + a + ' против ' + b + '. <b style="color:#8fe08f">Выигрыш ' + fmt(bet * 2) + ' 🪙!</b>';
    log('🎲 Выигрыш в кости: +' + fmt(bet * 2) + ' 🪙', 'good');
  } else if (a === b) {
    S.gold += bet;
    msg = '🎲 Ничья ' + a + ':' + b + '. Ставка возвращена.';
  } else {
    msg = '🎲 Ты ' + a + ' против ' + b + '. <b style="color:#e5aaaa">Проигрыш ' + fmt(bet) + ' 🪙.</b>';
    log('🎲 Проигрыш в кости: −' + fmt(bet) + ' 🪙', 'bad');
  }

  checkTitles();
  save();
  renderTown();
  renderTop();

  var el = $('gameres');

  if (el) {
    el.innerHTML = msg;
  }
}

var CARDN = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'В',
  12: 'Д',
  13: 'К',
  14: 'Т'
};

function playCards(bet) {
  if (S.gold < bet) {
    toast('Не хватает золота');
    return;
  }

  S.gold -= bet;

  var suits = ['♠', '♦', '♥', '♣'];
  var a = RI(2, 14);
  var b = RI(2, 14);
  var sa = P(suits);
  var sb = P(suits);

  function red(s) {
    return s === '♦' || s === '♥';
  }

  var msg;

  if (a > b) {
    S.gold += bet * 2;
    S.hero.gamesWon = (S.hero.gamesWon || 0) + 1;

    msg = '🃏 ' + CARDN[a] + sa + ' против ' + CARDN[b] + sb + '. <b style="color:#8fe08f">Выигрыш ' + fmt(bet * 2) + ' 🪙!</b>';
    log('🃏 Выигрыш в карты: +' + fmt(bet * 2) + ' 🪙', 'good');
  } else if (a === b) {
    S.gold += bet;
    msg = '🃏 Ничья. Ставка возвращена.';
  } else {
    msg = '🃏 ' + CARDN[a] + sa + ' против ' + CARDN[b] + sb + '. <b style="color:#e5aaaa">Проигрыш ' + fmt(bet) + ' 🪙.</b>';
    log('🃏 Проигрыш в карты: −' + fmt(bet) + ' 🪙', 'bad');
  }

  checkTitles();
  save();
  renderTown();
  renderTop();

  var el = $('gameres');

  if (el) {
    el.innerHTML = msg;

    var ca = $('cardA');
    var cb2 = $('cardB');

    if (ca) {
      ca.textContent = CARDN[a] + sa;
      ca.className = 'playcard' + (red(sa) ? ' red' : '');
    }

    if (cb2) {
      cb2.textContent = CARDN[b] + sb;
      cb2.className = 'playcard' + (red(sb) ? ' red' : '');
    }
  }
}

function rollDiceAnim() {
  if (S.gold < GAMBET) {
    toast('Не хватает золота');
    return;
  }

  var da = $('dieA');
  var db = $('dieB');

  if (!da || !db) {
    playDice(GAMBET);
    return;
  }

  var n = 0;

  var iv = setInterval(function() {
    da.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][RI(0, 5)];
    db.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][RI(0, 5)];

    n++;

    if (n > 8) {
      clearInterval(iv);
      playDice(GAMBET);
    }
  }, 80);
}

function genShopStock() {
  var lvl = Math.max(1, S.hero.lvl - 3);
  var arr = [];

  function rr() {
    return Math.min(
      S.hero.lvl >= 12 ? 2 : 1,
      Math.max(0, rollRarity(lvl, 0) - 1)
    );
  }

  arr.push(genItem(lvl, 0, rr(), ['weapon']));
  arr.push(genItem(lvl, 0, rr(), ['weapon']));

  arr.push(genItem(lvl, 0, rr(), ['helmet', 'armor', 'gloves', 'boots']));
  arr.push(genItem(lvl, 0, rr(), ['helmet', 'armor', 'gloves', 'boots']));

  arr.push(genItem(lvl, 0, rr(), ['amulet', 'ring']));
  arr.push(genItem(lvl, 0, rr(), ['amulet', 'ring', 'weapon']));

  return arr;
}

function stockPrice(it) {
  return Math.round(sellPrice(it) * 2.5);
}

function buyStock(i) {
  var it = S.shopStock[i];
  if (!it) return;

  var pr = stockPrice(it);

  if (S.gold < pr) {
    toast('Не хватает золота');
    return;
  }

  S.gold -= pr;
  S.shopStock.splice(i, 1);

  addItem(it, 'лавка');

  save();
  renderTown();
  renderTop();
}

function refreshStock() {
  if (S.gold < 25) {
    toast('Нужно 25 🪙');
    return;
  }

  S.gold -= 25;
  S.shopStock = genShopStock();

  log('🛒 Новый товар.', 'sys');

  save();
  renderTown();
  renderTop();
}

function buyKey(zi) {
  var pr = keyPrice(zi);

  if (S.gold < pr) {
    toast('Нужно ' + fmt(pr) + ' 🪙');
    return;
  }

  S.gold -= pr;
  S.hero.keys[zi]++;

  log('🗝️ Куплен ключ: ' + KITEMS[zi].nm, 'loot');

  save();
  renderTown();
  renderTop();
}

function buy(k) {
  var prices = {
    hp: 30,
    mp: 25,
    frag: 60,
    prot: 220,
    orb: 450
  };

  var g = prices[k];

  if (S.gold < g) {
    toast('Не хватает золота');
    return;
  }

  S.gold -= g;

  if (k === 'hp') {
    S.hero.pots.hp++;
  } else if (k === 'mp') {
    S.hero.pots.mp++;
  } else if (k === 'frag') {
    S.frag++;
  } else if (k === 'prot') {
    S.hero.prot++;
  } else {
    S.hero.inv.push({
      id: uid(),
      orb: true,
      nm: 'Орб Забвения',
      icon: '🌀',
      rar: 3,
      lvl: 1,
      enh: 0,
      mods: {},
      slot: '_',
      gems: [],
      sockets: 0
    });
  }

  log(
    'Куплено: ' +
    (
      k === 'hp'
        ? 'зелье лечения'
        : k === 'mp'
          ? 'зелье маны'
          : k === 'frag'
            ? 'осколок'
            : k === 'prot'
              ? 'Камень-оберег'
              : 'Орб Забвения'
    ),
    'loot'
  );

  save();
  renderTown();
  renderTop();
}