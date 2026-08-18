'use strict';

function buildClassTree() {
  if (!S) return;

  var cls = S.hero.cls;
  var nodes = [];
  var adj = {};
  var byId = {};

  function mk(id, x, y, si, kind) {
    var nd = {
      id: id,
      x: x,
      y: y,
      si: si,
      kind: kind
    };

    nodes.push(nd);
    byId[id] = nd;
    adj[id] = [];

    return nd;
  }

  mk('origin', 0, 0, -1, 'origin');

  CLASSES[cls].skills.forEach(function(key, si) {
    var a = (-90 + si * 60) * Math.PI / 180;
    var prev = 'origin';

    [95, 150, 205, 260, 315].forEach(function(dist, ri) {
      var jit = (((si * 3 + ri * 7) % 9) - 4) * Math.PI / 180;
      var id = 'r_' + si + '_' + (ri + 1);

      mk(
        id,
        Math.cos(a + jit) * dist,
        Math.sin(a + jit) * dist,
        si,
        'rank'
      );

      adj[prev].push(id);
      adj[id].push(prev);

      prev = id;
    });

    var mid = 'm_' + si;

    mk(
      mid,
      Math.cos(a) * 388,
      Math.sin(a) * 388,
      si,
      'mastery'
    );

    adj[prev].push(mid);
    adj[mid].push(prev);
  });

  CT = {
    nodes: nodes,
    adj: adj,
    byId: byId
  };
}

function talloc() {
  return S.hero.talloc;
}

function canAllocCT(id) {
  if (!CT) return false;
  if (talloc()[id]) return false;

  return CT.adj[id].some(function(a) {
    return talloc()[a];
  });
}

function skillRank(si) {
  var r = 0;

  for (var k = 1; k <= 5; k++) {
    if (talloc()['r_' + si + '_' + k]) {
      r = k;
    } else {
      break;
    }
  }

  return r;
}

function skillRankByKey(key) {
  var si = CLASSES[S.hero.cls].skills.indexOf(key);

  return si < 0 ? 0 : skillRank(si);
}

function hasMastery(si) {
  return !!talloc()['m_' + si];
}

function allocNode(id) {
  if (!CT) return;

  var nd = CT.byId[id];

  if (!nd || !canAllocCT(id)) return;

  if (S.hero.pts < 1) {
    toast('Нет очков навыков');
    return;
  }

  S.hero.pts--;
  talloc()[id] = true;

  var key = CLASSES[S.hero.cls].skills[nd.si];

  toast(
    (nd.kind === 'mastery' ? '🌟 Мастерство: ' : '📖 Изучено: ') +
    SKILLDB[key].n
  );

  log(
    nd.kind === 'mastery'
      ? '🌟 Мастерство: <b>' + SKILLDB[key].n + '</b>'
      : '📖 Изучено: <b>' + SKILLDB[key].n + '</b> ранг ' + skillRank(nd.si),
    'good'
  );

  save();
  renderTown();
  renderTop();
}

function spentPts() {
  return Math.max(0, Object.keys(talloc()).length - 2);
}

function refundTree() {
  var spent = spentPts();

  if (!spent) {
    toast('Нечего забывать');
    return;
  }

  var cost = spent * 30;

  if (S.gold < cost) {
    toast('Нужно ' + fmt(cost) + ' 🪙');
    return;
  }

  S.gold -= cost;
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

function skillEffTxt(key, rank) {
  var sk = SKILLDB[key];
  var rMul = 1 + 0.15 * Math.max(0, rank - 1);
  var parts = [];

  if (sk.mult) {
    var mult = sk.mult * rMul;

    parts.push(
      'урон ×' + mult.toFixed(2) +
      (sk.hits ? ' ×' + sk.hits : '') +
      (sk.mag ? ' (магия)' : '')
    );

    if (S && S.cs) {
      var est = sk.mag
        ? Math.round(S.cs.spellPow * mult)
        : Math.round((S.cs.dmgMin + S.cs.dmgMax) / 2 * mult);

      parts.push('≈' + fmt(est));
    }
  }

  if (sk.healPct) {
    parts.push(
      'лечит ' +
      Math.round(sk.healPct * (1 + 0.12 * Math.max(0, rank - 1))) +
      '% ОЗ'
    );
  }

  if (sk.buff) {
    parts.push(
      sk.buff
        .map(function(b) {
          return '+' + Math.round(b.pct * rMul) + '% ' + b.k + ' ' + b.t + 'с';
        })
        .join(', ')
    );
  }

  if (sk.dot) {
    parts.push('эффект ' + sk.dot.pct + '%×' + sk.dot.t + 'с');
  }

  if (sk.selfcost) {
    parts.push('цена ' + sk.selfcost + '% ОЗ');
  }

  if (sk.exec) {
    parts.push('казнь ' + sk.exec + '%');
  }

  if (sk.combo) {
    parts.push('комбо по отравленным');
  }

  if (sk.debuff) {
    parts.push('метка +' + sk.debuff.pct + '%');
  }

  parts.push('мана ' + sk.mp);

  return parts.join(' · ');
}