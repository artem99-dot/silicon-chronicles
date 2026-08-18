'use strict';

function cdFor(rank, mast) {
  return Math.max(1500, 2600 - 120 * (rank - 1) - (mast ? 200 : 0));
}

function sp(k) {
  return S && Object.values(S.hero.eq).some(function(it) {
    return it && it.sp === k;
  });
}

function activeTitle() {
  if (!S || !S.hero.title) return null;

  for (var i = 0; i < TITLES.length; i++) {
    if (TITLES[i].id === S.hero.title) {
      return TITLES[i];
    }
  }

  return null;
}

function checkTitles() {
  if (!S) return;

  TITLES.forEach(function(t) {
    if (!S.hero.titles[t.id] && t.cond()) {
      S.hero.titles[t.id] = 1;

      toast('🏅 Новый титул: ' + t.ic + ' ' + t.nm);
      log('🏅 Титул получен: <b>' + t.nm + '</b> (' + t.ds + ')', 'good');
    }
  });
}

function setTitle(id) {
  if (!S.hero.titles[id]) return;

  S.hero.title = (S.hero.title === id) ? null : id;
  S.cs = null;
  calcStats();

  log(
    S.hero.title
      ? 'Титул надет: <b>' + activeTitle().nm + '</b>'
      : 'Титул снят.',
    'sys'
  );

  save();
  renderTown();
  renderTop();
}

function rankPts() {
  var bc = Object.keys(S.hero.bosses).length;

  return (
    S.hero.lvl * 2 +
    bc * 6 +
    Math.floor((S.arenaBest || 0) / 5) * 2 +
    (S.hero.dungeons || 0)
  );
}

function rankInfo() {
  var p = rankPts();
  var idx = 0;

  for (var i = 0; i < RANKS.length; i++) {
    if (p >= RANKS[i].p) idx = i;
  }

  return {
    idx: idx,
    r: RANKS[idx],
    pts: p,
    next: RANKS[idx + 1] || null
  };
}

function calcStats() {
  if (!S) return null;

  var h = S.hero;

  var st = {
    str: 5,
    dex: 5,
    int: 5,
    vit: 5,
    luk: 3
  };

  var mods = [];
  var race = RACES[h.race];

  Object.keys(race.b).forEach(function(k) {
    st[k] += race.b[k];
  });

  Object.keys(h.bonus || {}).forEach(function(k) {
    st[k] += (h.bonus[k] || 0);
  });

  (race.mods || []).forEach(function(m) {
    mods.push(m);
  });

  Object.keys(GROW[h.cls]).forEach(function(k) {
    st[k] += Math.floor(h.lvl * GROW[h.cls][k]);
  });

  function eqSum(k) {
    return Object.values(h.eq)
      .filter(Boolean)
      .reduce(function(sum, it) {
        return sum + ((it.mods && it.mods[k]) || 0);
      }, 0);
  }

  function eqArmor() {
    return Object.values(h.eq)
      .filter(Boolean)
      .reduce(function(sum, it) {
        var enhMul = 1 + (it.enh || 0) * 0.18;
        return sum + ((it.armorFlat || 0) * enhMul);
      }, 0);
  }

  ['str', 'dex', 'int', 'vit', 'luk'].forEach(function(k) {
    st[k] += eqSum(k);
  });

  var agg = {};

  mods.forEach(function(m) {
    agg[m.k] = (agg[m.k] || 0) + m.v;
  });

  Object.values(h.eq)
    .filter(Boolean)
    .forEach(function(it) {
      Object.keys(it.mods || {}).forEach(function(k) {
        agg[k] = (agg[k] || 0) + it.mods[k];
      });
    });

  if (S.buff && S.buff.mods) {
    Object.keys(S.buff.mods).forEach(function(k) {
      agg[k] = (agg[k] || 0) + S.buff.mods[k];
    });
  }

  S.timed = (S.timed || []).filter(function(b) {
    return b.until > now();
  });

  S.timed.forEach(function(b) {
    agg[b.k] = (agg[b.k] || 0) + b.v;
  });

  var tb = activeTitle() ? activeTitle().d : {};

  Object.keys(tb).forEach(function(k) {
    agg[k] = (agg[k] || 0) + tb[k];
  });

  var res = {
    fire: 0,
    poison: 0,
    ice: 0,
    light: 0,
    shadow: 0
  };

  if (agg.resall) {
    Object.keys(res).forEach(function(k) {
      res[k] += agg.resall;
    });
  }

  ['fire', 'poison', 'ice', 'light', 'shadow'].forEach(function(k) {
    if (agg['res' + k]) res[k] += agg['res' + k];
  });

  var wg = {
    fire: 0,
    poison: 0,
    ice: 0,
    light: 0,
    burnCh: 0,
    poisonCh: 0,
    slow: false,
    critB: 0,
    leechB: 0,
    dmgB: 0
  };

  var gm = {
    ruby: 'fire',
    emerald: 'poison',
    sapphire: 'ice',
    topaz: 'light',
    onyx: 'shadow'
  };

  Object.values(h.eq)
    .filter(Boolean)
    .forEach(function(it) {
      (it.gems || []).forEach(function(gd) {
        if (!gd) return;

        var g = typeof gd === 'string' ? gd : gd.k;
        var lv = (typeof gd === 'object' && gd.lv) || 1;

        if (it.slot === 'weapon') {
          if (g === 'ruby') {
            wg.fire += gemVal(20, lv);
            wg.burnCh = 20;
          } else if (g === 'emerald') {
            wg.poison += gemVal(20, lv);
            wg.poisonCh = 25;
          } else if (g === 'sapphire') {
            wg.ice += gemVal(20, lv);
            wg.slow = true;
          } else if (g === 'topaz') {
            wg.light += gemVal(15, lv);
            wg.critB += gemVal(5, lv);
          } else if (g === 'onyx') {
            wg.leechB += gemVal(6, lv);
          } else if (g === 'diamond') {
            wg.dmgB += gemVal(10, lv);
          }
        } else {
          if (g === 'diamond') {
            Object.keys(res).forEach(function(k) {
              res[k] += gemVal(8, lv);
            });
          } else if (gm[g]) {
            res[gm[g]] += gemVal(12, lv);
          }
        }
      });
    });

  Object.keys(res).forEach(function(k) {
    res[k] = Math.min(60, res[k]);
  });

  var lvl = h.lvl;
  var o = {};

  o.str = st.str;
  o.dex = st.dex;
  o.int = st.int;
  o.vit = st.vit;
  o.luk = st.luk;

  o.hpPct = agg.hp || 0;
  o.mpAdd = agg.mp || 0;
  o.phys = agg.phys || 0;
  o.spell = agg.spell || 0;
  o.dmgAll = (agg.dmg || 0) + wg.dmgB;

  o.crit = Math.max(0, 5 + st.dex * 0.35 + (agg.crit || 0) + wg.critB);
  o.critd = 150 + (agg.critd || 0);

  o.armorPct = agg.armor || 0;
  o.evade = Math.min(45, st.dex * 0.3 + (agg.evade || 0));

  o.leech = (agg.leech || 0) + wg.leechB;
  o.gf = agg.gf || 0;
  o.mf = agg.mf || 0;
  o.xpB = agg.xp || 0;
  o.spd = agg.spd || 0;
  o.regen = agg.regen || 0;
  o.healPow = agg.healPow || 0;

  o.res = res;
  o.wg = wg;

  var w = h.eq.weapon;
  var wDmg = w && w.baseDmg ? w.baseDmg * (1 + (w.enh || 0) * 0.18) : 2;
  var enh = w ? 1 + (w.enh || 0) * 0.08 : 1;
  var physMul = 1 + o.phys / 100;

  o.dmgMin = Math.max(
    1,
    Math.round(
      (wDmg * 0.8 + st.str * 1.1 + lvl * 0.6) *
      enh *
      physMul *
      (1 + o.dmgAll / 100)
    ) || 2
  );

  o.dmgMax = Math.max(
    o.dmgMin + 1,
    Math.round(
      (wDmg * 1.2 + st.str * 1.5 + lvl * 0.9) *
      enh *
      physMul *
      (1 + o.dmgAll / 100)
    ) || 3
  );

  o.spellPow = Math.max(
    1,
    Math.round(
      (8 + st.int * 1.4 + lvl * 0.8) *
      (1 + o.spell / 100) *
      (1 + o.dmgAll / 100)
    ) || 2
  );

  o.armor = Math.max(
    0,
    Math.round(
      (st.vit * 0.5 + eqArmor() + lvl * 0.5) *
      (1 + Math.max(-60, o.armorPct) / 100)
    )
  );

  o.maxhp = Math.max(
    10,
    Math.round((40 + st.vit * 8 + lvl * 5) * (1 + o.hpPct / 100))
  );

  o.maxmp = Math.max(
    5,
    Math.round(18 + st.int * 5 + lvl * 3 + o.mpAdd)
  );

  h.hp = Math.min(h.hp, o.maxhp);
  h.mp = Math.min(h.mp, o.maxmp);

  S.cs = o;

  return o;
}

function wgDomElem() {
  var wg = S.cs.wg;
  var best = null;
  var bestValue = 0;

  ['fire', 'poison', 'ice', 'light'].forEach(function(k) {
    if (wg[k] > bestValue) {
      bestValue = wg[k];
      best = k;
    }
  });

  return best;
}

function critChance() {
  var cr = S.cs ? S.cs.crit : 0;

  cr -= Math.max(0, cr - 50) * 0.5;

  if (COM) {
    COM.pbuffs.forEach(function(b) {
      if (b.k === 'crit') cr += b.pct;
    });
  }

  return cr;
}

function dodgeChance() {
  var d = S.cs ? S.cs.evade : 0;

  if (COM) {
    COM.pbuffs.forEach(function(b) {
      if (b.k === 'evade') d += b.pct;
    });
  }

  return Math.min(45, d);
}

function pInterval() {
  var pb = 1;

  if (COM) {
    COM.pbuffs.forEach(function(b) {
      if (b.k === 'swiftB') {
        pb = Math.max(0.5, 1 - b.pct / 100);
      }
    });
  }

  var spd = (S.cs && S.cs.spd) || 0;

  return Math.max(900, 2200 * (1 - spd / 200) * pb);
}

function elemRes(el) {
  return Math.min(0.6, ((S.cs && S.cs.res[el]) || 0) / 100);
}

function addStat(k) {
  if (!S || S.hero.sp < 1) return;

  S.hero.sp--;
  S.hero.bonus[k]++;

  S.cs = null;
  calcStats();

  log('Характеристика повышена: <b>' + STATS[k] + '</b>', 'good');

  save();
  renderTown();
  renderTop();
}

function respecStats() {
  var total = Object.values(S.hero.bonus).reduce(function(a, b) {
    return a + b;
  }, 0);

  if (!total) {
    toast('Очки не распределены');
    return;
  }

  var cost = 50 + S.hero.lvl * 10;

  if (S.gold < cost) {
    toast('Нужно ' + fmt(cost) + ' 🪙');
    return;
  }

  S.gold -= cost;
  S.hero.sp += total;
  S.hero.bonus = {
    str: 0,
    dex: 0,
    int: 0,
    vit: 0,
    luk: 0
  };

  S.cs = null;
  calcStats();

  log('🌀 Очки характеристик возвращены: ' + total, 'sys');

  save();
  renderTown();
  renderTop();
}

function xpNeed(l) {
  return Math.round(42 * Math.pow(l, 1.75));
}

function gainXP(n) {
  var h = S.hero;
  var c = S.cs || calcStats();

  n = Math.round(n * (1 + c.xpB / 100));
  h.xp += n;

  log('Получено опыта: <b>' + fmt(n) + '</b>', 'sys');

  while (h.xp >= xpNeed(h.lvl)) {
    h.xp -= xpNeed(h.lvl);
    h.lvl++;
    h.pts += 1;
    h.sp += 3;

    var cs = calcStats();

    h.hp = Math.min(cs.maxhp, h.hp + Math.round(cs.maxhp * 0.6));
    h.mp = cs.maxmp;

    toast('⚜ УРОВЕНЬ ' + h.lvl + '! +1 очко навыков, +3 очка характеристик');
    log('⚜ Достигнут <b>' + h.lvl + '</b> уровень!', 'good');
  }

  renderTop();
  save();
}

function gainGold(n) {
  var c = S.cs || calcStats();

  n = Math.round(n * (1 + c.gf / 100));
  S.gold += n;

  return n;
}