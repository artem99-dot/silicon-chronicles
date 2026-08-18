'use strict';

function townArena() {
  var ri = rankInfo();

  if (ARENA) {
    return (
      '<div class="panel">' +
      '<div style="font-size:38px;text-align:center">🏟️</div>' +
      '<div style="text-align:center;font-family:var(--fd);font-size:22px;color:var(--gold2)">' +
      'Волна ' + (ARENA.wave - 1) + ' пройдена!' +
      '</div>' +
      '<div style="color:var(--dim);font-size:12px;text-align:center;margin:6px 0">' +
      'Каждая 5-я — чемпион, каждая 10-я — Король арены. Лута нет, только золото и опыт.' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
      '<button class="btn gold big" onclick="arenaFight()">⚔ Волна ' + ARENA.wave + '</button>' +
      '<button class="btn" onclick="drinkPot(\'hp\')">🧪 Зелье (' + S.hero.pots.hp + ')</button>' +
      '<button class="btn danger" onclick="arenaLeave()">🏳️ Уйти</button>' +
      '</div>' +
      '</div>'
    );
  }

  var html =
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">🏟️ Арена Грейхолда</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Рекорд: <b>' + (S.arenaBest || 0) + ' волн</b>. ' +
    'Награды растут с волной. Поражение не убивает. Враги уникальны, снаряжение не падает.' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:8px">' +

    '<div class="loccard">' +
    '<div class="lic">🟢</div>' +
    '<h4>Разминка</h4>' +
    '<p>Враги твоего уровня. ×1</p>' +
    '<button class="btn gold" onclick="arenaStart(0)">Начать</button>' +
    '</div>' +

    '<div class="loccard">' +
    '<div class="lic">🟡</div>' +
    '<h4>Испытание</h4>' +
    '<p>+2 уровня. ×1.6</p>' +
    '<button class="btn gold" onclick="arenaStart(1)">Начать</button>' +
    '</div>' +

    '<div class="loccard">' +
    '<div class="lic">🔴</div>' +
    '<h4>Кровавая</h4>' +
    '<p>+4 уровня. ×2.2. Нужен ' + RANKS[3].ic + ' Серебряный</p>' +
    '<button class="btn gold" onclick="arenaStart(2)" ' + (ri.idx >= 3 ? '' : 'disabled') + '>Начать</button>' +
    '</div>' +

    '</div>' +
    '</div>';

  return html;
}

function townHero() {
  var c = S.cs || calcStats();
  var h = S.hero;
  var ri = rankInfo();
  var act = activeTitle();

  var html =
    '<div class="panel">' +
    '<h2 style="font-size:22px;color:var(--gold2)">' + escapeHtml(h.name) + '</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    RACES[h.race].icon + ' ' + RACES[h.race].name + ' · ' +
    CLASSES[h.cls].icon + ' ' + CLASSES[h.cls].name +
    ', ур. ' + h.lvl + ' · ранг ' + ri.r.ic + ' ' + ri.r.n +
    (act ? ' · титул ' + act.ic + ' ' + act.nm : '') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
    '<div>' +
    '<b style="color:var(--gold)">ХАРАКТЕРИСТИКИ' + (h.sp > 0 ? ' — распредели очки!' : '') + '</b>';

  Object.keys(STATS).forEach(function(k) {
    html +=
      '<div class="statline">' +
      '<span>' + STATS[k] + '<span class="hint">' + STATHINT[k] + '</span></span>' +
      '<span style="display:flex;gap:8px;align-items:center">' +
      '<b>' + c[k] + '</b>' +
      (h.sp > 0 ? '<button class="btn small" onclick="addStat(\'' + k + '\')">+</button>' : '') +
      '</span>' +
      '</div>';
  });

  html +=
    '<div style="margin-top:8px">' +
    '<button class="btn small danger" onclick="respecStats()">🌀 Сброс (' + fmt(50 + h.lvl * 10) + ' 🪙)</button>' +
    '</div>' +
    '</div>' +
    '<div>' +
    '<b style="color:var(--gold)">БОЕВЫЕ КАЧЕСТВА</b>' +
    '<div class="statline"><span>Урон</span><b>' + fmt(c.dmgMin) + '–' + fmt(c.dmgMax) + '</b></div>' +
    '<div class="statline"><span>Сила чар</span><b>' + fmt(c.spellPow) + '</b></div>' +
    '<div class="statline"><span>Броня</span><b>' + fmt(c.armor) + '</b></div>' +
    '<div class="statline"><span>Крит. шанс</span><b>' + critChance().toFixed(1) + '%</b></div>' +
    '<div class="statline"><span>Крит. урон</span><b>' + c.critd.toFixed(0) + '%</b></div>' +
    '<div class="statline"><span>Уклонение</span><b>' + c.evade.toFixed(1) + '%</b></div>' +
    '<div class="statline"><span>Скорость атаки</span><b>' + (pInterval() / 1000).toFixed(1) + 'с</b></div>' +
    '<div class="statline"><span>Кража жизни</span><b>' + c.leech + '%</b></div>' +
    '<div class="statline"><span>Реген</span><b>' + c.regen + '%/ход</b></div>' +
    '<div class="statline"><span>Сопротивления</span><b style="font-size:11px">' +
    '🔥' + c.res.fire +
    ' ☠' + c.res.poison +
    ' ❄' + c.res.ice +
    ' ⚡' + c.res.light +
    ' 🌑' + c.res.shadow +
    '</b></div>' +
    '<div class="statline"><span>Бонус опыта</span><b>+' + c.xpB + '%</b></div>' +
    (S.buff ? '<div class="statline"><span>Благословение</span><b>' + S.buff.d + '</b></div>' : '') +
    '</div>' +
    '</div>' +
    '</div>';

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">🏅 ТИТУЛЫ (активен один)</b>' +
    '<div style="margin-top:8px">';

  TITLES.forEach(function(t) {
    var un = !!h.titles[t.id];
    var isActive = h.title === t.id;

    html +=
      '<div class="order' + (un ? '' : ' exp') + '" style="' + (isActive ? 'border-color:var(--gold)' : '') + '">' +
      '<div class="oi">' + t.ic + '</div>' +
      '<div style="flex:1">' +
      '<h4>' + t.nm + '</h4>' +
      '<p>' + t.ds + '</p>' +
      '</div>' +
      (
        un
          ? '<button class="btn small ' + (isActive ? 'gold' : '') + '" onclick="setTitle(\'' + t.id + '\')">' +
            (isActive ? 'Снять' : 'Надеть') +
            '</button>'
          : '<span style="font-size:11px;color:var(--dim2)">не открыт</span>'
      ) +
      '</div>';
  });

  html += '</div></div>';

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">УМЕНИЯ (изучаются в древе)</b>' +
    '<div style="margin-top:8px">';

  CLASSES[h.cls].skills.forEach(function(key, si) {
    var s = SKILLDB[key];
    var rk = skillRank(si);
    var mst = hasMastery(si);

    html +=
      '<div class="statline" style="' + (rk ? '' : 'opacity:.45') + '">' +
      '<span>' + s.n + ' <span style="color:var(--mana)">(' + s.mp + ' маны)</span>' +
      (mst ? '<span class="mast">МАСТЕРСТВО</span>' : '') +
      '</span>' +
      '<b style="font-weight:400;font-size:12px;max-width:380px;text-align:right">' +
      (
        rk
          ? 'ранг ' + rk + '/5 · кд ' + (cdFor(rk, mst) / 1000).toFixed(1) + 'с · ' + skillEffTxt(key, rk)
          : 'не изучено'
      ) +
      '</b>' +
      '</div>';
  });

  html += '</div></div>';

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">СНАРЯЖЕНИЕ</b>' +
    '<div style="margin-top:8px">';

  Object.keys(SLOTN).forEach(function(sl) {
    var it = h.eq[sl];

    html +=
      '<div class="statline">' +
      '<span>' + SLOTN[sl] + '</span>' +
      '<b style="font-weight:400">' +
      (
        it
          ? '<span class="' + RC[it.rar] + '" style="cursor:pointer" onclick="itemMenu(\'' + it.id + '\')">' +
            it.nm + (it.enh ? ' +' + it.enh : '') +
            '</span>'
          : '<span style="color:var(--dim2)">— пусто —</span>'
      ) +
      '</b>' +
      '</div>';
  });

  html += '</div></div>';

  return html;
}

function townTree() {
  if (!CT) buildClassTree();

  var html =
    '<button class="btn small" onclick="S.town=\'hero\';renderTown()">← Герой</button> ' +
    '<button class="btn small danger" onclick="refundTree()">🌀 Забыть всё (' + spentPts() * 30 + ' 🪙)</button> ' +
    '<span style="color:var(--dim);font-size:12px">очков: <b style="color:var(--gold)">' + S.hero.pts + '</b> · ' +
    'колесо — масштаб, перетаскивание — обзор</span>' +
    '<div id="treewrap" style="margin-top:10px">' +
    '<svg id="treesvg"></svg>' +
    '<div id="tt"></div>' +
    '</div>';

  return html;
}

function drawTree() {
  if (!CT) buildClassTree();

  var svg = $('treesvg');
  if (!svg) return;

  var wrap = $('treewrap');
  var W = wrap.clientWidth || 800;
  var H = wrap.clientHeight || 560;

  if (!treeBuilt) {
    VIEW = {
      x: W / 2,
      y: H / 2,
      k: Math.max(0.45, Math.min(W, H) / 950)
    };

    treeBuilt = true;
  }

  var col = CLASSES[S.hero.cls].col;
  var ta = talloc();

  var out = '<g id="tg" transform="translate(' + VIEW.x + ',' + VIEW.y + ') scale(' + VIEW.k + ')">';

  out += '<circle cx="0" cy="0" r="388" fill="none" stroke="#241b10" stroke-width="1" stroke-dasharray="4 8"/>';

  var seen = {};

  CT.nodes.forEach(function(n) {
    (CT.adj[n.id] || []).forEach(function(b) {
      var key = [n.id, b].sort().join('-');
      if (seen[key]) return;

      seen[key] = 1;

      var a = CT.byId[n.id];
      var c2 = CT.byId[b];

      if (!a || !c2) return;

      var on = ta[n.id] && ta[b];

      out +=
        '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + c2.x + '" y2="' + c2.y + '" ' +
        'stroke="' + (on ? col : '#332a1c') + '" ' +
        'stroke-width="' + (on ? 2.6 : 1.4) + '" ' +
        'opacity="' + (on ? 0.95 : 0.7) + '"/>';
    });
  });

  CT.nodes.forEach(function(n) {
    var on = !!ta[n.id];
    var av = !on && canAllocCT(n.id);

    var r = n.kind === 'mastery' ? 13 : n.kind === 'origin' ? 9 : 8;

    var fill = on ? col : '#141008';
    var stroke = on ? col : av ? col : '#4a3d28';

    var rankNum = n.kind === 'rank' ? n.id.split('_')[2] : '';

    out +=
      '<g class="nd' + (av ? ' av' : '') + '" data-id="' + n.id + '">' +
      '<circle class="halo" cx="' + n.x + '" cy="' + n.y + '" r="' + (r + 7) + '" fill="none" stroke="' + col + '" stroke-width="1.5" opacity="0"/>' +
      '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (on ? 2.5 : 1.6) + '" ' +
      (on ? 'style="filter:drop-shadow(0 0 5px ' + col + ')"' : '') + '/>';

    if (n.kind === 'mastery') {
      out +=
        '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + (r + 4) + '" fill="none" stroke="' + (on ? col : '#5a4526') + '" stroke-width="1.2" stroke-dasharray="3 3"/>' +
        '<text x="' + n.x + '" y="' + (n.y + 4) + '" text-anchor="middle" font-size="11" fill="' + (on ? '#120d07' : '#5a4526') + '" style="pointer-events:none">★</text>';
    }

    if (n.kind === 'rank') {
      out +=
        '<text x="' + n.x + '" y="' + (n.y + 3.5) + '" text-anchor="middle" font-size="9" fill="' + (on ? '#120d07' : '#7a6a48') + '" style="pointer-events:none;font-weight:bold">' +
        rankNum +
        '</text>';
    }

    out += '</g>';
  });

  out += '</g>';

  svg.innerHTML = out;

  svg.onpointerdown = function(e) {
    svg.setPointerCapture(e.pointerId);

    dragS = {
      x: e.clientX,
      y: e.clientY,
      vx: VIEW.x,
      vy: VIEW.y,
      moved: 0,
      el: (e.target && e.target.closest) ? e.target.closest('.nd') : null
    };
  };

  svg.onpointermove = function(e) {
    if (!dragS) return;

    var dx = e.clientX - dragS.x;
    var dy = e.clientY - dragS.y;

    dragS.moved = Math.max(dragS.moved, Math.abs(dx) + Math.abs(dy));

    VIEW.x = dragS.vx + dx;
    VIEW.y = dragS.vy + dy;

    var g = $('tg');

    if (g) {
      g.setAttribute('transform', 'translate(' + VIEW.x + ',' + VIEW.y + ') scale(' + VIEW.k + ')');
    }
  };

  svg.onpointerup = function(e) {
    if (dragS && dragS.moved < 6) {
      var el = dragS.el || ((e.target && e.target.closest) ? e.target.closest('.nd') : null);

      if (el) {
        allocNode(el.dataset.id);
      }
    }

    dragS = null;
  };

  svg.onwheel = function(e) {
    e.preventDefault();

    var rect = svg.getBoundingClientRect();

    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var f = e.deltaY > 0 ? 0.88 : 1.14;

    var k2 = Math.max(0.3, Math.min(3, VIEW.k * f));

    VIEW.x = mx - (mx - VIEW.x) * (k2 / VIEW.k);
    VIEW.y = my - (my - VIEW.y) * (k2 / VIEW.k);
    VIEW.k = k2;

    var g = $('tg');

    if (g) {
      g.setAttribute('transform', 'translate(' + VIEW.x + ',' + VIEW.y + ') scale(' + VIEW.k + ')');
    }
  };

  svg.querySelectorAll('.nd').forEach(function(g) {
    g.addEventListener('mouseenter', function(e) {
      showTT(g.dataset.id, e);
    });

    g.addEventListener('mouseleave', hideTT);
  });
}

function showTT(id, e) {
  if (!CT) return;

  var nd = CT.byId[id];
  if (!nd) return;

  var tt = $('tt');
  var ta = talloc();

  var html = '';

  if (nd.kind === 'origin') {
    html =
      '<b style="color:var(--gold)">Начало</b>' +
      '<div class="m">Отсюда расходятся шесть путей.</div>';
  } else {
    var key = CLASSES[S.hero.cls].skills[nd.si];
    var sk = SKILLDB[key];
    var rk = skillRank(nd.si);

    if (nd.kind === 'mastery') {
      html =
        '<b style="color:' + CLASSES[S.hero.cls].col + '">★ ' + sk.n + ': мастерство</b>' +
        '<div class="m">' + sk.md + '</div>' +
        '<div class="st">' +
        (
          ta[id]
            ? '✓ освоено'
            : canAllocCT(id)
              ? 'можно освоить · 1 очко (нужен ранг 5)'
              : 'нужен 5-й ранг'
        ) +
        '</div>';
    } else {
      html =
        '<b style="color:' + CLASSES[S.hero.cls].col + '">' + sk.n + ' — ранг ' + rk + '/5</b>' +
        '<div class="m">' + skillEffTxt(key, Math.max(1, rk)) + '</div>' +
        '<div style="color:var(--dim);font-size:11px;margin-top:3px">' + sk.txt + '</div>' +
        '<div style="color:var(--gold2);font-size:11px;margin-top:3px">Мастерство: ' + sk.md + '</div>' +
        '<div class="st">' +
        (
          ta[id]
            ? '✓ освоено'
            : canAllocCT(id)
              ? 'можно освоить · 1 очко'
              : 'нужен предыдущий ранг'
        ) +
        '</div>';
    }
  }

  tt.innerHTML = html;

  var wr = $('treewrap').getBoundingClientRect();

  tt.style.display = 'block';
  tt.style.left = Math.min(e.clientX - wr.left + 14, wr.width - 280) + 'px';
  tt.style.top = Math.min(e.clientY - wr.top + 10, wr.height - 140) + 'px';
}

function hideTT() {
  var t = $('tt');
  if (t) t.style.display = 'none';
}

function townInv() {
  var h = S.hero;
  var c = S.cs || calcStats();

  var list = h.inv.slice().sort(function(a, b) {
    return b.rar - a.rar || b.lvl - a.lvl;
  });

  var html =
    '<div class="panel">' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
    '<span class="chip">🪙 ' + fmt(S.gold) + '</span>' +
    '<span class="chip">◆ ' + fmt(S.frag) + '</span>' +
    '<span class="chip ck" onclick="drinkPot(\'hp\')">🧪 ОЗ ×' + h.pots.hp + '</span>' +
    '<span class="chip ck" onclick="drinkPot(\'mp\')">🧪 Мана ×' + h.pots.mp + '</span>' +
    '<span class="chip">🛡 Обереги ×' + h.prot + '</span>' +
    '<span class="chip">🔥×' + h.elix.rage + ' 🪨×' + h.elix.stone + ' 🦅×' + h.elix.swift + '</span>' +
    '<span class="chip ck" onclick="useOrb()">🌀 Орб Забвения ×' +
    h.inv.filter(function(x) {
      return x.orb;
    }).length +
    '</span>' +
    '</div>' +
    '</div>';

  html +=
    '<div class="invwrap">' +
    '<div class="panel">' +
    '<b style="color:var(--gold)">ЭКИПИРОВКА</b>' +
    '<div class="doll">';

  var DOLL = [
    ['', 'helmet', ''],
    ['weapon', 'armor', 'amulet'],
    ['gloves', 'boots', 'ring']
  ];

  DOLL.forEach(function(row) {
    row.forEach(function(sl) {
      if (!sl) {
        html += '<div></div>';
        return;
      }

      var it = h.eq[sl];

      if (it) {
        html += icell(it, "itemMenu('" + it.id + "')");
      } else {
        html +=
          '<div class="slot" title="' + SLOTN[sl] + '">' +
          SLOTICON[sl] +
          '<small>' + SLOTN[sl].toUpperCase() + '</small>' +
          '</div>';
      }
    });
  });

  html +=
    '</div>' +
    '<div style="font-size:12px;color:var(--dim);line-height:1.9;margin-top:6px">' +
    '⚔ Урон: <b style="color:var(--txt)">' + fmt(c.dmgMin) + '–' + fmt(c.dmgMax) + '</b><br>' +
    '🛡 Броня: <b style="color:var(--txt)">' + fmt(c.armor) + '</b><br>' +
    '💥 Крит: <b style="color:var(--txt)">' + critChance().toFixed(1) + '%/' + c.critd.toFixed(0) + '%</b><br>' +
    '❤ ОЗ: <b style="color:var(--txt)">' + fmt(h.hp) + '/' + fmt(c.maxhp) + '</b>' +
    '</div>' +
    '</div>';

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">СУМКА (' + list.length + ')</b>' +
    '<div class="bag" style="margin-top:8px">';

  if (list.length) {
    html += list.map(function(it) {
      return icell(it, "itemMenu('" + it.id + "')", true);
    }).join('');
  } else {
    html += '<span style="color:var(--dim2);font-size:12px">Пусто.</span>';
  }

  html += '</div></div></div>';

  var sigRows = h.sigils.map(function(n, i) {
    return n > 0
      ? '<span class="chip">' + SIGILS[i].icon + ' ' + SIGILS[i].nm + ' ×' + n + '</span>'
      : '';
  }).join('');

  var keyRows = h.keys.map(function(n, i) {
    return n > 0
      ? '<span class="chip">' + KITEMS[i].icon + ' ' + KITEMS[i].nm + ' ×' + n + '</span>'
      : '';
  }).join('');

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">🔮 СИГИЛЫ И 🗝️ КЛЮЧИ</b>' +
    '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' +
    (sigRows || '<span style="color:var(--dim2);font-size:12px">Сигилов нет.</span>') +
    '</div>' +
    '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' +
    (keyRows || '<span style="color:var(--dim2);font-size:12px">Ключей нет.</span>') +
    '</div>' +
    '</div>';

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">💎 САМОЦВЕТЫ</b>' +
    '<div style="margin-top:6px">';

  var gemRows = Object.keys(GEMS)
    .filter(function(k) {
      return ((h.gems[k] || {}).n || 0) > 0;
    })
    .map(function(k) {
      var g = h.gems[k];
      var lv = g.lv || 1;

      return (
        '<div class="statline">' +
        '<span>' + GEMS[k].icon + ' ' + GEMS[k].nm + ' <b>ур.' + lv + '</b> ×' + g.n +
        '<span class="hint">Оружие: ' + gemWeaponTxt(k, lv) + ' · Броня: ' + gemArmorTxt(k, lv) + '</span>' +
        '</span>' +
        (
          g.n >= 3
            ? '<button class="btn small gold" onclick="mergeGem(\'' + k + '\')">⬆ Слить 3 → ур.' + (lv + 1) + '</button>'
            : '<span style="font-size:11px;color:var(--dim2)">для улучшения нужно 3</span>'
        ) +
        '</div>'
      );
    }).join('');

  html += (gemRows || '<span style="color:var(--dim2);font-size:12px">Самоцветов нет.</span>') +
    '</div></div>';

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">🎭 ТРОФЕИ</b>' +
    '<div style="margin-top:6px">';

  var troRows = '';

  Object.keys(h.troph).forEach(function(k) {
    var n = h.troph[k];
    if (!n) return;

    var inf = troInfo(k);

    troRows +=
      '<div class="item" style="border-left-color:#8a7a5c">' +
      '<span style="font-size:20px">' + inf.icon + '</span>' +
      '<div style="flex:1">' +
      '<span class="nm" style="color:#d8c8a8">' + inf.nm + '</span>' +
      '<div class="ds">Трофей · ' + ZONES[inf.zi].nm + ' · ' + inf.price + ' 🪙</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;align-items:center">' +
      '<b>×' + n + '</b>' +
      '<button class="btn small" onclick="sellTroph(' + k + ',1)">Продать 1</button>' +
      '<button class="btn small" onclick="sellTroph(' + k + ',' + n + ')">Все</button>' +
      '</div>' +
      '</div>';
  });

  html += (troRows || '<span style="color:var(--dim2);font-size:12px">Трофеев нет.</span>') +
    '</div></div>';

  return html;
}