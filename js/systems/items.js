'use strict';

function tierOf(zl) {
  return Math.max(0, Math.min(TIERS.length - 1, Math.floor(zl / 5)));
}

function mobRarity(zl) {
  var t = tierOf(zl);

  return Math.random() < 0.75
    ? Math.min(4, t > 0 ? t : 0)
    : Math.max(0, t - 1);
}

function rollRarity(zl, mf) {
  var t = tierOf(zl);

  var W = [
    [55, 35, 9, 1, 0],
    [44, 38, 14, 3, 1],
    [34, 38, 20, 6.5, 1.5],
    [26, 37, 24, 10.5, 2.5],
    [19, 35, 27, 14, 5],
    [15, 33, 28, 17, 5],
    [12, 30, 29, 20, 6],
    [10, 28, 29, 22, 7]
  ][Math.min(7, t)] || [55, 35, 9, 1, 0];

  var boost = 1 + (mf || 0) / 100;
  var sum = 0;

  var adj = W.map(function(w, i) {
    var v = i >= 2 ? w * boost : w;
    sum += v;
    return v;
  });

  var r = Math.random() * sum;

  for (var i = 0; i < 5; i++) {
    if (r < adj[i]) return i;
    r -= adj[i];
  }

  return 0;
}

function chestRarity(zl, locked) {
  var t = tierOf(zl);

  return Math.min(4, t + (locked ? 2 : 1));
}

function bossRarity(zl) {
  var t = tierOf(zl);
  var r = Math.min(4, t + 1);

  if (Math.random() < 0.25) {
    r = Math.min(4, r + 1);
  }

  return r;
}

function genItem(zoneLv, mf, forceRar, slots) {
  var pool = BASES.filter(function(b) {
    return b.lv <= zoneLv + 2;
  });

  if (slots && slots.length) {
    pool = pool.filter(function(b) {
      return slots.indexOf(b.s) >= 0;
    });
  }

  if (!pool.length) pool = BASES;

  var base = P(pool.slice(-8));
  var rar = forceRar !== undefined ? forceRar : rollRarity(zoneLv, mf);
  var counts = [0, RI(1, 2), RI(3, 4), RI(5, 6), RI(6, 7)][rar];
  var used = {};
  var affNames = [];

  function pickFrom(arr) {
    var cand = arr.filter(function(a) {
      return !used[a.k];
    });

    if (!cand.length) return;

    var a = P(cand);
    used[a.k] = 1;

    var v = Math.max(
      1,
      Math.round(R(a.v[0], a.v[1]) * (0.7 + zoneLv * 0.06))
    );

    affNames.push({
      n: a.n,
      k: a.k,
      v: v
    });
  }

  for (var i = 0; i < Math.ceil(counts / 2); i++) {
    pickFrom(PRE);
  }

  var sufPool = base.s === 'weapon' ? SUF : SUF2;

  while (affNames.length < counts) {
    pickFrom(Math.random() < 0.5 ? PRE : sufPool);
  }

  var nm = base.nm;

  if (rar === 1 && affNames[0]) {
    nm = affNames[0].n + ' ' + nm.charAt(0).toLowerCase() + nm.slice(1);
  }

  if (rar === 2) {
    nm = nm + ' «' + P([
      'Волка',
      'Пепла',
      'Луны',
      'Крови',
      'Бури',
      'Пустоты',
      'Зари',
      'Врана',
      'Шипа',
      'Пламени'
    ]) + '»';
  }

  if (rar >= 3) {
    nm = P(LEGN);
  }

  var it = {
    id: uid(),
    slot: base.s,
    nm: nm,
    icon: base.icon,
    rar: rar,
    lvl: Math.max(1, zoneLv + RI(-1, 1)),
    enh: 0,
    mods: {},
    gems: [],
    sockets: 0
  };

  affNames.forEach(function(a) {
    it.mods[a.k] = (it.mods[a.k] || 0) + a.v;
  });

  if (base.dmg) {
    it.baseDmg = RI(base.dmg[0], base.dmg[1]);
  } else {
    it.armorFlat = Math.round((base.arm || 2) * (1 + zoneLv * 0.25));
  }

  if (rar === 4) {
    it.sockets = 2;
  } else if (rar === 3) {
    it.sockets = RI(1, 2);
  } else if (rar === 2 && Math.random() < 0.5) {
    it.sockets = 1;
  }

  return it;
}

function makeUnique(u) {
  return {
    id: uid(),
    slot: u.slot,
    nm: u.nm,
    icon: u.icon,
    rar: 4,
    lvl: u.lvl,
    enh: 0,
    unique: true,
    mods: Object.assign({}, u.mods),
    sp: u.sp,
    spd: u.spd,
    gems: [],
    sockets: 2,
    baseDmg: u.bd ? RI(u.bd[0], u.bd[1]) : undefined,
    armorFlat: u.arm || undefined
  };
}

function sellPrice(it) {
  return Math.round(
    (
      (8 + it.lvl * 5) *
      (1 + Object.keys(it.mods).length * 0.55) *
      RMUL[it.rar] *
      0.5 +
      (it.enh || 0) * 14
    ) *
    (it.unique ? 2 : 1)
  );
}

function itemTitle(it) {
  var mods = Object.keys(it.mods || {})
    .map(function(k) {
      return modStr(k, it.mods[k]);
    })
    .join(', ');

  var lines = [
    it.nm + ' (' + (it.unique ? 'уникальный' : RAR[it.rar]) + ', ур.' + it.lvl + ')',
    mods || 'Без особых свойств',
    it.spd ? '✧ ' + it.spd : '',
    S && S.hero && S.hero.lvl < it.lvl ? '⚠ Нужен ур. ' + it.lvl : ''
  ];

  return lines
    .filter(Boolean)
    .join('\n')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '&#10;');
}

function icell(it, oc, sm) {
  return (
    '<div class="icell r' + it.rar + (sm ? ' sm' : '') + '" ' +
    (oc ? 'onclick="' + oc + '"' : '') +
    ' title="' + itemTitle(it) + '">' +
    '<span>' + it.icon + '</span>' +
    (it.enh ? '<i>+' + it.enh + '</i>' : '') +
    '</div>'
  );
}

function addItem(it, src) {
  S.hero.inv.push(it);

  if (it.rar >= 3) {
    toast(
      '✦ ' + (it.unique ? 'УНИКАЛЬНЫЙ' : RAR[it.rar].toUpperCase()) + ': ' + it.nm + '!',
      'r' + it.rar
    );
  }

  log(
    (src ? '[' + src + '] ' : '') +
    'Лут: <span class="' + RC[it.rar] + '">' + it.nm + '</span>',
    it.rar >= 2 ? 'loot' : ''
  );
}

function findItem(id) {
  var i = S.hero.inv.findIndex(function(x) {
    return x.id === id;
  });

  if (i >= 0) {
    return {
      it: S.hero.inv[i],
      from: 'inv',
      i: i
    };
  }

  for (var s in S.hero.eq) {
    if (S.hero.eq[s] && S.hero.eq[s].id === id) {
      return {
        it: S.hero.eq[s],
        from: 'eq',
        s: s
      };
    }
  }

  return null;
}

function itemMenu(id) {
  var f = findItem(id);
  if (!f) return;

  var it = f.it;

  var eqBtn = f.from === 'inv'
    ? '<button class="btn" onclick="equipItem(\'' + id + '\')">Надеть</button>'
    : '<button class="btn" onclick="unequipItem(\'' + it.slot + '\')">Снять</button>';

  var sock = '';

  if (it.sockets) {
    sock = '<div style="margin-top:10px"><b style="color:var(--gold)">ГНЁЗДА (' + it.sockets + ')</b><br>';

    for (var i = 0; i < it.sockets; i++) {
      var gd = it.gems && it.gems[i];

      if (gd) {
        var g = typeof gd === 'string' ? gd : gd.k;

        sock +=
          '<span class="chip ck" onclick="removeGem(\'' + id + '\',' + i + ')" title="Вынуть">' +
          GEMS[g].icon + ' ' + GEMS[g].n + ' ✕</span> ';
      } else {
        var opts = Object.keys(GEMS).filter(function(k) {
          return ((S.hero.gems[k] || {}).n || 0) > 0;
        });

        if (opts.length) {
          sock +=
            '<select id="gsel_' + i + '" style="background:#0006;color:var(--txt);border:1px solid var(--lin2);padding:3px">' +
            opts.map(function(k) {
              return '<option value="' + k + '">' + GEMS[k].icon + ' ' + GEMS[k].n + ' ×' + S.hero.gems[k].n + '</option>';
            }).join('') +
            '</select>' +
            '<button class="btn small" onclick="socketGem(\'' + id + '\',' + i + ')">Вставить</button> ';
        } else {
          sock += '<span style="color:var(--dim2);font-size:11px">пусто (нет самоцветов)</span> ';
        }
      }
    }

    sock += '<div style="font-size:11px;color:var(--dim2);margin-top:4px">В оружии — атакующий эффект, в броне — сопротивление.</div></div>';
  }

  $('main').innerHTML =
    '<div class="panel">' +
    '<h2 style="font-size:24px;color:var(--gold2)">' + it.icon + ' ' + it.nm + '</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0 10px">' +
    (it.unique ? 'УНИКАЛЬНЫЙ' : RAR[it.rar]) +
    ' · ' +
    (SLOTN[it.slot] || 'предмет') +
    ' · ур. ' + it.lvl +
    (it.enh ? ' · +' + it.enh : '') +
    '</div>' +
    (
      Object.keys(it.mods).map(function(k) {
        return '<div class="statline"><span>✦ ' + modStr(k, it.mods[k]) + '</span></div>';
      }).join('') ||
      '<div style="color:var(--dim);font-size:12px">Без особых свойств.</div>'
    ) +
    (it.spd ? '<div class="statline"><span style="color:var(--gold2)">✧ ' + it.spd + '</span></div>' : '') +
    (it.baseDmg ? '<div class="statline"><span>⚔ Базовый урон</span><b>' + it.baseDmg + '</b></div>' : '') +
    (!it.baseDmg && it.armorFlat ? '<div class="statline"><span>🛡 Базовая броня</span><b>' + it.armorFlat + '</b></div>' : '') +
    sock +
    '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">' +
    eqBtn +
    ' <button class="btn" onclick="S.town=\'forge\';renderTown()">⚒ В кузницу</button>' +
    ' <button class="btn danger" onclick="sellItem(\'' + id + '\')">Продать (' + fmt(sellPrice(it)) + ' 🪙)</button>' +
    ' <button class="btn" onclick="renderTown()">Назад</button>' +
    '</div>' +
    '</div>';
}

function socketGem(itId, idx) {
  var sel = $('gsel_' + idx);
  var g = sel && sel.value;

  if (!g || !((S.hero.gems[g] || {}).n > 0)) {
    toast('Нет самоцветов');
    return;
  }

  var f = findItem(itId);
  if (!f) return;

  var it = f.it;

  if (!it.gems) it.gems = [];

  if (it.gems[idx]) {
    var old = typeof it.gems[idx] === 'string' ? it.gems[idx] : it.gems[idx].k;

    if (!S.hero.gems[old]) {
      S.hero.gems[old] = {
        n: 0,
        lv: 1
      };
    }

    S.hero.gems[old].n++;
  }

  it.gems[idx] = g;
  S.hero.gems[g].n--;

  S.cs = null;
  calcStats();

  log('💎 Самоцвет вставлен: ' + GEMS[g].n, 'good');

  save();
  itemMenu(itId);
  renderTop();
}

function removeGem(itId, idx) {
  var f = findItem(itId);
  if (!f) return;

  var it = f.it;
  var gd = it.gems && it.gems[idx];

  if (!gd) return;

  var g = typeof gd === 'string' ? gd : gd.k;

  if (!S.hero.gems[g]) {
    S.hero.gems[g] = {
      n: 0,
      lv: 1
    };
  }

  S.hero.gems[g].n++;
  it.gems[idx] = null;

  S.cs = null;
  calcStats();

  log('Самоцвет вынут: ' + GEMS[g].n, 'sys');

  save();
  itemMenu(itId);
  renderTop();
}

function mergeGem(k) {
  var g = S.hero.gems[k];

  if (!g || g.n < 3) {
    toast('Нужно 3 одинаковых');
    return;
  }

  g.n -= 3;
  g.lv = (g.lv || 1) + 1;

  S.cs = null;
  calcStats();

  toast('💎 ' + GEMS[k].n + ' → ур.' + g.lv + '!');
  log('💎 Самоцвет улучшен: ' + GEMS[k].n + ' ур.' + g.lv, 'good');

  save();
  renderTown();
  renderTop();
}

function equipItem(id) {
  var f = findItem(id);

  if (!f || f.from !== 'inv') return;

  var it = f.it;

  if (it.orb) {
    toast('Нельзя надеть');
    return;
  }

  if (S.hero.lvl < it.lvl) {
    toast('Нужен ур. ' + it.lvl);
    return;
  }

  S.hero.inv.splice(f.i, 1);

  var old = S.hero.eq[it.slot];

  if (old) S.hero.inv.push(old);

  S.hero.eq[it.slot] = it;

  S.cs = null;
  calcStats();

  log('Надето: <span class="' + RC[it.rar] + '">' + it.nm + '</span>', 'good');

  save();
  renderTown();
  renderTop();
}

function unequipItem(slot) {
  var it = S.hero.eq[slot];

  if (!it) return;

  S.hero.eq[slot] = null;
  S.hero.inv.push(it);

  S.cs = null;
  calcStats();

  save();
  renderTown();
  renderTop();
}

function dropGem(src) {
  var gk = P(Object.keys(GEMS));

  if (!S.hero.gems[gk]) {
    S.hero.gems[gk] = {
      n: 0,
      lv: 1
    };
  }

  S.hero.gems[gk].n++;

  log('💎 Самоцвет (' + src + '): ' + GEMS[gk].n, 'loot');
}