'use strict';

function renderTown() {
  if (!S) return;

  if (RUN && MAP) {
    renderDungeon();
    return;
  }

  pruneOrders();

  if (!S.ui) {
    S.ui = {
      mapPage: 0
    };
  }

  var m = $('main');
  var t = S.town || 'plaza';

  var subnav =
    '<div class="subnav">' +
    [
      ['plaza', '🏰', 'Площадь'],
      ['guild', '🏛️', 'Гильдия'],
      ['tavern', '🍺', 'Таверна'],
      ['inn', '🛏️', 'Гостиница'],
      ['forge', '⚒️', 'Кузница'],
      ['alch', '⚗️', 'Алхимик'],
      ['market', '⚖️', 'Рынок'],
      ['gate', '🗺️', 'Врата'],
      ['arena', '🏟️', 'Арена'],
      ['hero', '👤', 'Герой'],
      ['tree', '🌳', 'Умения'],
      ['inv', '🎒', 'Инвентарь']
    ].map(function(x) {
      return (
        '<button class="btn small ' + (t === x[0] ? 'gold' : '') + '" ' +
        'onclick="S.town=\'' + x[0] + '\';renderTown()">' +
        x[1] + ' ' + x[2] +
        '</button>'
      );
    }).join('') +
    '</div>';

  var html = subnav;

  if (t === 'plaza') html += townPlaza();
  else if (t === 'guild') html += townGuild();
  else if (t === 'tavern') html += townTavern();
  else if (t === 'inn') html += townInn();
  else if (t === 'forge') html += townForge();
  else if (t === 'alch') html += townAlch();
  else if (t === 'market') html += townMarket();
  else if (t === 'gate') html += townGate();
  else if (t === 'arena') html += townArena();
  else if (t === 'hero') html += townHero();
  else if (t === 'tree') html += townTree();
  else if (t === 'inv') html += townInv();

  m.innerHTML = html;

  if (t === 'tree') {
    drawTree();
  }
}

function townPlaza() {
  var ri = rankInfo();
  var act = activeTitle();

  var html =
    '<div class="panel">' +
    '<h2 style="font-size:22px;color:var(--gold2)">Грейхолд</h2>' +
    '<div style="color:var(--dim);font-size:12px;font-style:italic;margin:4px 0 12px">' +
    'последний город выжженных земель · ранг: ' + ri.r.ic + ' ' + ri.r.n +
    (ri.next ? ' · до повышения ' + (ri.next.p - ri.pts) + ' очков' : '') +
    '</div>' +
    '<div class="locgrid">' +

    '<div class="loccard" onclick="S.town=\'guild\';renderTown()">' +
    '<div class="lic">🏛️</div><h4>Гильдия наёмников</h4><p>Заказы, кости, карты</p>' +
    '</div>' +

    '<div class="loccard" onclick="S.town=\'tavern\';renderTown()">' +
    '<div class="lic">🍺</div><h4>Таверна</h4><p>15 блюд, баффы</p>' +
    '</div>' +

    '<div class="loccard" onclick="S.town=\'inn\';renderTown()">' +
    '<div class="lic">🛏️</div><h4>Гостиница</h4><p>Отдых, 3 уровня</p>' +
    '</div>' +

    '<div class="loccard" onclick="S.town=\'forge\';renderTown()">' +
    '<div class="lic">⚒️</div><h4>Кузница</h4><p>Заточка, крафт</p>' +
    '</div>' +

    '<div class="loccard" onclick="S.town=\'alch\';renderTown()">' +
    '<div class="lic">⚗️</div><h4>Алхимик</h4><p>Зелья, эликсиры</p>' +
    '</div>' +

    '<div class="loccard" onclick="S.town=\'market\';renderTown()">' +
    '<div class="lic">⚖️</div><h4>Рынок</h4><p>Купить/продать</p>' +
    '</div>' +

    '<div class="loccard" onclick="S.town=\'gate\';renderTown()">' +
    '<div class="lic">🗺️</div><h4>Врата</h4><p>Земли, данжи, боссы</p>' +
    '</div>' +

    '<div class="loccard" onclick="S.town=\'arena\';renderTown()">' +
    '<div class="lic">🏟️</div><h4>Арена</h4><p>Волны, золото, опыт</p>' +
    '</div>' +

    '</div>' +
    '</div>';

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">Активный титул:</b> ' +
    (
      act
        ? act.ic + ' ' + act.nm + ' (' + act.ds + ')'
        : '<span style="color:var(--dim2)">нет</span>'
    ) +
    ' <button class="btn small" onclick="S.town=\'hero\';renderTown()">Сменить</button>' +
    '</div>';

  return html;
}

function townGuild() {
  var html =
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">🏛️ Гильдия наёмников</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Доска объявлений. У заказов есть срок — не успел, заказ сгорает.' +
    '</div>';

  html +=
    '<div style="margin-bottom:8px">' +
    '<button class="btn small" onclick="pruneOrders();renderTown()">🔄 Обновить список</button> ' +
    '<span style="color:var(--dim2);font-size:11px">(просроченные заменяются сами)</span>' +
    '</div>';

  S.board.orders.forEach(function(o, i) {
    var inf = orderInfo(o);
    var done = o.prog >= o.n;
    var left = o.deadline - now();

    var mins = Math.max(0, Math.floor(left / 60000));
    var secs = Math.max(0, Math.floor((left % 60000) / 1000));

    var expiring = left < 3 * 60000 && !done;

    html +=
      '<div class="order' + (done ? ' done' : '') + ((left < 0 && !done) ? ' exp' : '') + '">' +
      '<div class="oi">' + inf.ic + '</div>' +
      '<div style="flex:1">' +
      '<h4>' + inf.t + '</h4>' +
      '<p>' + inf.d + '</p>' +
      '<div class="rw">Награда: ' + fmt(o.gold) + ' 🪙 · ' + fmt(o.xp) + ' оп. · ' + o.frag + ' ◆' +
      (o.item ? ' · предмет' : '') + '</div>' +
      '</div>' +
      '<div style="text-align:center;min-width:90px">' +
      '<div class="tm' + (expiring ? ' low' : '') + '">⏳ ' +
      (done ? 'готово' : mins + ':' + (secs < 10 ? '0' : '') + secs) +
      '</div>' +
      '<div style="font-size:11px;color:var(--dim)">' + o.prog + '/' + o.n + '</div>' +
      '<button class="btn small ' + (done ? 'gold' : '') + '" ' +
      (done ? '' : 'disabled') + ' onclick="claimOrder(' + i + ')">Сдать</button> ' +
      '<button class="btn small" title="Заменить за 20🪙" onclick="rerollOrder(' + i + ')">↻</button>' +
      '</div>' +
      '</div>';
  });

  html += '</div>';

  html +=
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">🎲 Игральный зал</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Ставь золото. Выигрыш удваивает ставку, ничья возвращает её.' +
    '</div>' +
    '<div style="margin-bottom:8px">Ставка: ' +
    [10, 50, 100, 500].map(function(b) {
      return '<button class="btn small" onclick="GAMBET=' + b + ';renderTown()">' + b + '</button>';
    }).join(' ') +
    ' · текущая: <b style="color:var(--gold2)">' + GAMBET + ' 🪙</b>' +
    '</div>' +
    '<div style="display:flex;gap:16px;flex-wrap:wrap">' +
    '<div style="flex:1;min-width:240px">' +
    '<b>Кости</b>' +
    '<div style="margin:6px 0">' +
    '<span class="dice" id="dieA">⚀</span>' +
    '<span class="dice" id="dieB">⚀</span>' +
    '</div>' +
    '<button class="btn gold" onclick="rollDiceAnim()">🎲 Бросить кости</button>' +
    '</div>' +
    '<div style="flex:1;min-width:240px">' +
    '<b>Карты «Кровь и Честь»</b>' +
    '<div style="margin:6px 0">' +
    '<span class="playcard" id="cardA">?</span>' +
    '<span class="playcard" id="cardB">?</span>' +
    '</div>' +
    '<button class="btn gold" onclick="playCards(GAMBET)">🃏 Раздать</button>' +
    '</div>' +
    '</div>' +
    '<div class="gameres" id="gameres"></div>' +
    '</div>';

  return html;
}

function townTavern() {
  var avail = todayMenu();
  var mins = Math.ceil(30 - ((now() / 60000) % 30));

  var html =
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">🍺 Таверна «Три угля»</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Меню меняется каждые 30 минут. Сегодня подают ещё ' + mins + ' мин. ' +
    'Еда даёт временный бафф.' +
    '</div>' +
    '<div class="foodgrid">';

  FOODS.forEach(function(f, i) {
    var isAvail = avail.indexOf(i) >= 0;

    html +=
      '<div class="foodcard' + (isAvail ? ' avail' : '') + '">' +
      '<div class="fic">' + f.icon + '</div>' +
      '<h5>' + f.n + '</h5>' +
      '<p>' + f.d + ' · ' + f.dur + ' мин</p>' +
      (
        isAvail
          ? '<button class="btn small gold" onclick="eatFood(' + i + ')">' + f.cost + ' 🪙 Съесть</button>'
          : '<span style="color:var(--dim2);font-size:10px">не сегодня</span>'
      ) +
      '</div>';
  });

  html += '</div></div>';

  return html;
}

function townInn() {
  var c = S.cs || calcStats();

  var html =
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">🛏️ Гостиница «Последний приют»</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Отдых восстанавливает силы. ОЗ: ' + fmt(S.hero.hp) + '/' + fmt(c.maxhp) +
    '</div>' +

    '<div class="inncard">' +
    '<h5>Общий зал — бесплатно</h5>' +
    '<p>Восстановление ОЗ до 50%, полная мана. Жёсткая лавка, шум.</p>' +
    '<button class="btn" onclick="restInn(1)">Вздремнуть</button>' +
    '</div>' +

    '<div class="inncard">' +
    '<h5>Тёплая постель — ' + (30 + S.hero.lvl * 5) + ' 🪙</h5>' +
    '<p>Полное восстановление ОЗ и маны.</p>' +
    '<button class="btn" onclick="restInn(2)">Выспаться</button>' +
    '</div>' +

    '<div class="inncard">' +
    '<h5>Люкс — ' + (80 + S.hero.lvl * 10) + ' 🪙</h5>' +
    '<p>Полное восстановление + бафф на 30 мин: зелья лечат +50%, макс. ОЗ +10%.</p>' +
    '<button class="btn gold" onclick="restInn(3)">Люкс</button>' +
    '</div>' +
    '</div>';

  return html;
}

function townForge() {
  var list = Object.values(S.hero.eq)
    .filter(Boolean)
    .concat(
      S.hero.inv.filter(function(x) {
        return !x.orb;
      })
    );

  var html =
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">⚒️ Кузница Борга</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Заточка даёт +18% базового урона/брони за ступень. ' +
    'Провал уничтожает предмет (оберег спасает). Дворфы +15% к шансу.' +
    '</div>';

  if (list.length) {
    list.forEach(function(it) {
      var n = (it.enh || 0) + 1;
      var ch = enhChance(it);
      var cost = enhCost(it);

      html +=
        '<div class="item r' + it.rar + '">' +
        '<span style="font-size:20px">' + it.icon + '</span>' +
        '<div style="flex:1">' +
        '<span class="nm ' + RC[it.rar] + '">' + it.nm + (it.enh ? ' +' + it.enh : '') + '</span>' +
        '<div class="ds">До +' + n + ': шанс <b style="color:' +
        (ch >= 60 ? '#8fe08f' : ch >= 30 ? 'var(--gold)' : 'var(--blood)') +
        '">' + ch + '%</b> · ' + fmt(cost.gold) + ' 🪙 + ' + cost.frag + ' ◆</div>' +
        '</div>' +
        '<button class="btn small ' + (ch < 30 ? 'danger' : '') + '" ' +
        'onclick="doEnhance(\'' + it.id + '\')" ' +
        (n > 15 ? 'disabled' : '') + '>' +
        (n > 15 ? 'Предел' : '⚒ Точить') +
        '</button>' +
        '</div>';
    });
  } else {
    html += '<div style="color:var(--dim);font-size:12px">Нечего точить.</div>';
  }

  html += '</div>';

  html +=
    '<div class="panel">' +
    '<h2 style="font-size:18px;color:var(--gold2)">🔨 Мастерская</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Кует редкие предметы из трофеев зоны.' +
    '</div>';

  ZONES.forEach(function(z, zi) {
    var cnt = troCount(zi);
    var un = zi === 0 || S.hero.bosses[zi - 1];

    html +=
      '<div class="item" style="border-left-color:#8a7a5c">' +
      '<span style="font-size:20px">' + z.icon + '</span>' +
      '<div style="flex:1">' +
      '<span class="nm" style="color:#d8c8a8">' + z.nm + '</span>' +
      '<div class="ds">Трофеев: <b>' + cnt + '</b> · ' +
      'оружие 10🎭+2◆+' + (50 * (zi + 1)) + '🪙 · ' +
      'броня 8🎭+1◆+' + (40 * (zi + 1)) + '🪙 · ' +
      'украшение 6🎭+1◆+' + (30 * (zi + 1)) + '🪙</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
      '<button class="btn small" ' +
      ((un && cnt >= 10 && S.frag >= 2 && S.gold >= 50 * (zi + 1)) ? '' : 'disabled') +
      ' onclick="craft(' + zi + ',\'weapon\')">⚔</button>' +
      '<button class="btn small" ' +
      ((un && cnt >= 8 && S.frag >= 1 && S.gold >= 40 * (zi + 1)) ? '' : 'disabled') +
      ' onclick="craft(' + zi + ',\'armor\')">🛡</button>' +
      '<button class="btn small" ' +
      ((un && cnt >= 6 && S.frag >= 1 && S.gold >= 30 * (zi + 1)) ? '' : 'disabled') +
      ' onclick="craft(' + zi + ',\'trinket\')">📿</button>' +
      '</div>' +
      '</div>';
  });

  html += '</div>';

  html +=
    '<div class="panel">' +
    '<b style="color:var(--gold)">Расколоть трофеи (3 → 1 ◆)</b>' +
    '<div style="margin-top:6px">';

  var crush = '';

  Object.keys(S.hero.troph).forEach(function(k) {
    var n = S.hero.troph[k] || 0;
    if (n < 3) return;

    var inf = troInfo(k);

    crush += '<button class="btn small" onclick="crushTroph(' + k + ')">' +
      inf.icon + ' ' + inf.nm + ' ×3 → ◆1</button> ';
  });

  html += (crush || '<span style="color:var(--dim2);font-size:12px">Нужно 3 трофея одного вида.</span>') +
    '</div></div>';

  return html;
}

function townAlch() {
  var html =
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">⚗️ Алхимик Мира</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Реагенты: обычных трофеев <b>' + totalTroph() + '</b> · ' +
    'трофеев боссов <b>' + bTrophCount() + '</b> · ' +
    'осколков <b>' + fmt(S.frag) + '</b>' +
    '</div>';

  RECIPES.forEach(function(r) {
    var need =
      (r.tro ? r.tro + ' 🎭 ' : '') +
      (r.btro ? r.btro + ' 👑 ' : '') +
      (r.frag ? r.frag + ' ◆ ' : '') +
      r.gold + ' 🪙';

    var ok =
      S.gold >= r.gold &&
      (!r.tro || totalTroph() >= r.tro) &&
      (!r.btro || bTrophCount() >= r.btro) &&
      (!r.frag || S.frag >= r.frag);

    html +=
      '<div class="item" style="border-left-color:#4fb3a5">' +
      '<span style="font-size:20px">' + r.icon + '</span>' +
      '<div style="flex:1">' +
      '<span class="nm" style="color:#bfe0da">' + r.n + '</span>' +
      '<div class="ds">' + r.d + ' · Нужно: ' + need + '</div>' +
      '</div>' +
      '<button class="btn small" ' + (ok ? '' : 'disabled') + ' onclick="brew(\'' + r.id + '\')">⚗ Сварить</button>' +
      '</div>';
  });

  html += '</div>';

  return html;
}

function townMarket() {
  var goods = [
    ['hp', '🧪 Зелье лечения', 30, 'лечит 35% ОЗ'],
    ['mp', '🧪 Зелье маны', 25, '+50% маны'],
    ['frag', '◆ Осколок силы', 60, 'материал заточки'],
    ['prot', '🛡 Камень-оберег', 220, 'спасает предмет'],
    ['orb', '🌀 Орб Забвения', 450, 'возврат очков навыков']
  ];

  var html =
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">🛡 Оружейная лавка Борга</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Только простое снаряжение (ур. героя −3, редкость низкая). ' +
    'Ценный лут — в подземельях.' +
    '</div>';

  if (S.shopStock.length) {
    S.shopStock.forEach(function(it, i) {
      var pr = stockPrice(it);

      html +=
        '<div class="item r' + it.rar + '" onclick="buyStock(' + i + ')">' +
        '<span style="font-size:20px">' + it.icon + '</span>' +
        '<div style="flex:1">' +
        '<span class="nm ' + RC[it.rar] + '">' + it.nm +
        (
          S.hero.lvl < it.lvl
            ? ' <span style="color:var(--blood)">(нужен ур.' + it.lvl + ')</span>'
            : ''
        ) +
        '</span>' +
        '<div class="ds">' + RAR[it.rar] + ' · ур. ' + it.lvl + ' · ' +
        (SLOTN[it.slot] || '') + ' · ' +
        (it.baseDmg ? '⚔' + it.baseDmg : '🛡' + (it.armorFlat || 0)) +
        (it.sockets ? ' · гнёзда ' + it.sockets : '') +
        '</div>' +
        (
          Object.keys(it.mods).length
            ? '<div class="af">✦ ' +
              Object.keys(it.mods).map(function(k) {
                return modStr(k, it.mods[k]);
              }).join(' · ') +
              '</div>'
            : ''
        ) +
        '</div>' +
        '<span class="eq">🪙 ' + fmt(pr) + '</span>' +
        '</div>';
    });
  } else {
    html += '<div style="color:var(--dim);font-size:12px">Всё раскуплено.</div>';
  }

  html += '<button class="btn small" onclick="refreshStock()">🔄 Обновить (25 🪙)</button></div>';

  html += '<div class="panel"><h2 style="font-size:18px;color:var(--gold2)">🗝️ Ключи от данжей</h2>';

  unlockedZones().forEach(function(zi) {
    html +=
      '<div class="statline">' +
      '<span>' + KITEMS[zi].icon + ' ' + KITEMS[zi].nm +
      ' <span style="color:var(--dim2)">(у тебя ' + (S.hero.keys[zi] || 0) + ')</span></span>' +
      '<button class="btn small" onclick="buyKey(' + zi + ')">' + fmt(keyPrice(zi)) + ' 🪙</button>' +
      '</div>';
  });

  html += '</div>';

  html += '<div class="panel"><h2 style="font-size:18px;color:var(--gold2)">Расходники</h2>';

  goods.forEach(function(x) {
    html +=
      '<div class="statline">' +
      '<span>' + x[1] + '<span class="hint">' + x[3] + '</span></span>' +
      '<button class="btn small" onclick="buy(\'' + x[0] + '\')">' + x[2] + ' 🪙</button>' +
      '</div>';
  });

  html += '</div>';

  html += '<div class="panel"><h2 style="font-size:18px;color:var(--gold2)">Продать</h2><div style="max-height:360px;overflow-y:auto">';

  var sellList = S.hero.inv.slice().sort(function(a, b) {
    return b.rar - a.rar;
  });

  if (sellList.length) {
    html += sellList.map(function(it) {
      return (
        '<div class="item r' + it.rar + '" onclick="sellItem(\'' + it.id + '\')">' +
        '<span style="font-size:20px">' + it.icon + '</span>' +
        '<div style="flex:1">' +
        '<span class="nm ' + RC[it.rar] + '">' + it.nm + '</span>' +
        '<div class="ds">' + RAR[it.rar] + ' · ур.' + it.lvl + '</div>' +
        '</div>' +
        '<span class="eq">💰 ' + fmt(sellPrice(it)) + '</span>' +
        '</div>'
      );
    }).join('');
  } else {
    html += '<span style="color:var(--dim2);font-size:12px">Нечего продать.</span>';
  }

  html += '</div></div>';

  return html;
}

function townGate() {
  var html =
    '<div class="panel">' +
    '<h2 style="font-size:20px;color:var(--gold2)">🗺️ Врата города</h2>' +
    '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
    'Выбери землю. Данж ведёт к боссу — сигил не нужен, если идёшь сам.' +
    '</div>';

  var page = S.ui.mapPage || 0;

  var names = [
    'Рубеж',
    'Средние земли',
    'Земли тьмы',
    'Запретные земли'
  ];

  html +=
    '<div style="margin-bottom:10px">' +
    [0, 1, 2, 3].map(function(i) {
      return (
        '<button class="btn small ' + (page === i ? 'gold' : '') + '" ' +
        'onclick="S.ui.mapPage=' + i + ';renderTown()">' +
        names[i] +
        '</button>'
      );
    }).join(' ') +
    '</div>';

  ZONES.forEach(function(z, i) {
    if (PAGEOF(i) !== page) return;

    var un = i === 0 || S.hero.bosses[i - 1];
    var hasSig = S.hero.sigils[i] > 0;

    html +=
      '<div class="panel" style="' + (un ? '' : 'opacity:.45;filter:grayscale(.6)') + '">' +
      '<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:250px">' +
      '<span style="color:var(--gold);font-size:11px;font-weight:700">' +
      z.icon + ' ЗОНА ' + (i + 1) + ' · ур. ' + z.lv + '+' +
      '</span>' +
      '<h3 style="font-size:19px">' + z.nm + '</h3>' +
      '<p style="color:var(--dim);font-size:12px;font-style:italic">' + z.ds + '</p>' +
      '<div style="color:var(--blood);font-size:12px">☠ ' + z.boss.n +
      (z.boss.el ? ' · ' + ELEMS[z.boss.el].icon + ' ' + ELEMS[z.boss.el].n : '') +
      (S.hero.bosses[i] ? ' <span style="color:#7fb95c">— повержен</span>' : '') +
      ' · сигил ' +
      (
        hasSig
          ? '<span style="color:#8fe08f">есть ×' + S.hero.sigils[i] + '</span>'
          : '<span style="color:var(--dim2)">нет</span>'
      ) +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:5px;margin-top:6px">' +
      z.dungeons.map(function(d, di) {
        return (
          '<div class="drow">' +
          '<span>' + d.ic + '</span>' +
          '<div style="flex:1">' +
          '<div class="nm2">' + d.nm + '</div>' +
          '<div class="ds2">комнат: ' + d.rooms + '</div>' +
          '</div>' +
          '<button class="btn small gold" ' + (un ? '' : 'disabled') + ' onclick="initDungeon(' + i + ',' + di + ')">Войти</button>' +
          '</div>'
        );
      }).join('') +
      '</div>' +
      '<div style="font-size:10px;color:var(--dim2);margin-top:6px">' +
      'Дроп по тиру зоны. Выше тира — только боссы/сундуки. Уникалы — редчайшая удача.' +
      '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;justify-content:center;min-width:170px">' +
      (
        un
          ? '<button class="btn" onclick="hunt(' + i + ')">⚔ Охотиться</button>' +
            '<button class="btn danger" onclick="fightBoss(' + i + ')" ' +
            (hasSig && S.hero.lvl >= z.lv ? '' : 'disabled') +
            ' title="' + (hasSig ? 'Сигил будет потрачен' : 'Нужен сигил') + '">' +
            SIGILS[i].icon + ' Призвать босса ' + (hasSig ? '(' + S.hero.sigils[i] + ')' : '') +
            '</button>'
          : '<button class="btn" disabled>Путь закрыт</button>' +
            '<div style="font-size:11px;color:var(--dim)">Победи: ' + ZONES[i - 1].boss.n + '</div>'
      ) +
      '</div>' +
      '</div>' +
      '</div>';
  });

  html += '</div>';

  return html;
}