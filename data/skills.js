var SKILLDB = {
  strike: {
    n: 'Мощный удар',
    mp: 6,
    mult: 1.7,
    txt: 'вкладывает всю массу в удар',
    m: { cb: 35 },
    md: '+35% крит'
  },

  cleave: {
    n: 'Размах',
    mp: 12,
    mult: 1.1,
    hits: 2,
    txt: 'широкий полукруг',
    m: { hits: 3 },
    md: '3 удара'
  },

  warcry: {
    n: 'Боевой клич',
    mp: 10,
    buff: [{ k: 'dmg', pct: 25, t: 8 }],
    txt: 'рёв, разжигающий кровь',
    m: { healPct: 15 },
    md: 'лечит 15% ОЗ'
  },

  blood: {
    n: 'Кровавый клинок',
    mp: 14,
    mult: 2.3,
    selfcost: 8,
    txt: 'кровь питает сталь',
    m: { leech: 25 },
    md: 'лечит 25% урона'
  },

  execute: {
    n: 'Казнь',
    mp: 10,
    mult: 1.9,
    exec: 30,
    txt: 'добивает раненого',
    m: { exec: 55 },
    md: 'порог 55%'
  },

  storm: {
    n: 'Железный шторм',
    mp: 18,
    mult: 0.65,
    hits: 4,
    txt: 'град ударов',
    m: { cb: 25 },
    md: '+25% крит'
  },

  fireball: {
    n: 'Огненный шар',
    mp: 10,
    mult: 1.9,
    mag: 1,
    txt: 'сгусток пламени',
    m: { dot: { pct: 12, t: 3 } },
    md: 'поджигает'
  },

  nova: {
    n: 'Ледяная нова',
    mp: 14,
    mult: 1.25,
    mag: 1,
    stun: 2,
    txt: 'кольцо стужи',
    m: { stun: 2 },
    md: 'оглушение 4с'
  },

  arcanic: {
    n: 'Чародейский залп',
    mp: 20,
    mult: 2.7,
    mag: 1,
    txt: 'поток магии',
    m: { cb: 20 },
    md: '+20% крит'
  },

  drain: {
    n: 'Похищение сущности',
    mp: 12,
    mult: 1.5,
    mag: 1,
    heal: 40,
    txt: 'вытягивает жизнь',
    m: { heal: 70 },
    md: 'лечит 70% урона'
  },

  meteor: {
    n: 'Метеор',
    mp: 26,
    mult: 3.4,
    mag: 1,
    txt: 'горящий камень',
    m: { dot: { pct: 14, t: 4 } },
    md: 'поджигает'
  },

  tempest: {
    n: 'Буря стихий',
    mp: 18,
    mult: 1.0,
    mag: 1,
    hits: 3,
    txt: 'три разряда',
    m: { hits: 4 },
    md: '4 разряда'
  },

  sneak: {
    n: 'Подлый удар',
    mp: 7,
    mult: 1.35,
    forcrit: 1,
    txt: 'всегда крит',
    m: { critd: 60 },
    md: '+60% крит.урона'
  },

  fan: {
    n: 'Веер клинков',
    mp: 12,
    mult: 0.7,
    hits: 3,
    txt: 'серия порезов',
    m: { hits: 4 },
    md: '4 пореза'
  },

  poison: {
    n: 'Отравленный клинок',
    mp: 9,
    mult: 1.0,
    dot: { pct: 14, t: 4 },
    txt: 'чёрная смола',
    m: { dot: { pct: 22, t: 4 } },
    md: 'яд сильнее'
  },

  dance: {
    n: 'Танец теней',
    mp: 12,
    mult: 0.9,
    hits: 2,
    after: [{ k: 'evade', pct: 30, t: 5 }],
    txt: '+30% уклонения',
    m: { leech: 15 },
    md: 'лечит 15% урона'
  },

  evis: {
    n: 'Потрошение',
    mp: 14,
    mult: 2.0,
    combo: 'poison',
    txt: '×1.8 по отравленным',
    m: { combo: 2.4 },
    md: 'комбо ×2.4'
  },

  mark: {
    n: 'Метка смерти',
    mp: 10,
    mult: 0.8,
    debuff: { pct: 25, t: 8 },
    txt: '+25% урона по врагу',
    m: { debuff: 40 },
    md: 'метка +40%'
  },

  aimed: {
    n: 'Прицельный выстрел',
    mp: 7,
    mult: 1.8,
    cb: 40,
    txt: 'точный выстрел',
    m: { cb: 70 },
    md: '+70% крит'
  },

  rain: {
    n: 'Град стрел',
    mp: 12,
    mult: 0.75,
    hits: 3,
    txt: 'три стрелы',
    m: { hits: 4 },
    md: '4 стрелы'
  },

  trap: {
    n: 'Капкан',
    mp: 9,
    mult: 0.9,
    dot: { pct: 12, t: 4 },
    txt: 'зазубренный капкан',
    m: { stun: 1 },
    md: 'оглушает'
  },

  pierce: {
    n: 'Пронзающий выстрел',
    mp: 12,
    mult: 2.1,
    pierce: 1,
    txt: 'прошивает броню',
    m: { cb: 30 },
    md: '+30% крит'
  },

  hawk: {
    n: 'Ястребиный глаз',
    mp: 10,
    buff: [
      { k: 'dmg', pct: 20, t: 8 },
      { k: 'crit', pct: 15, t: 8 }
    ],
    txt: '+урон, +крит',
    m: { buffT: 4 },
    md: '+4с'
  },

  barrage: {
    n: 'Заградительный огонь',
    mp: 18,
    mult: 0.6,
    hits: 4,
    txt: 'стена стрел',
    m: { dot: { pct: 9, t: 3 } },
    md: 'кровотечение'
  },

  smite: {
    n: 'Кара',
    mp: 8,
    mult: 1.6,
    heal: 15,
    txt: 'молот света',
    m: { heal: 30 },
    md: 'лечит 30% урона'
  },

  holy: {
    n: 'Свет зари',
    mp: 12,
    healPct: 30,
    txt: 'молитва',
    m: { healPct: 45 },
    md: 'лечит 45% ОЗ'
  },

  shield: {
    n: 'Щит веры',
    mp: 10,
    buff: [{ k: 'shield', pct: 50, t: 8 }],
    txt: '−50% входящего урона',
    m: { buffT: 4 },
    md: '+4с'
  },

  consecrate: {
    n: 'Освящение',
    mp: 12,
    mult: 1.1,
    dot: { pct: 10, t: 4 },
    txt: 'карающее пламя',
    m: { dot: { pct: 16, t: 4 } },
    md: 'пламя сильнее'
  },

  judgement: {
    n: 'Праведный суд',
    mp: 18,
    mult: 2.5,
    heal: 25,
    txt: 'колонна света',
    m: { exec: 35 },
    md: 'казнь 35%'
  },

  aegis: {
    n: 'Эгида рассвета',
    mp: 14,
    buff: [
      { k: 'shield', pct: 35, t: 8 },
      { k: 'regen', pct: 3, t: 8 }
    ],
    txt: '−35% урона, реген',
    m: { buffT: 4 },
    md: '+4с'
  }
};

/* =====================================================
   НОВАЯ СИСТЕМА ДРЕВА НАВЫКОВ
   ===================================================== */

// Переопределяем buildClassTree для новой системы
window.buildClassTree = function () {
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

  // Центральная точка
  mk('origin', 0, 0, -1, 'origin');

  // 6 навыков: 3 активных + 3 пассивных
  CLASSES[cls].skills.forEach(function (key, si) {
    var angle = (-90 + si * 60) * Math.PI / 180;
    var prev = 'origin';

    // 5 рангов для каждого навыка
    [95, 150, 205, 260, 315].forEach(function (dist, ri) {
      var jit = (((si * 3 + ri * 7) % 9) - 4) * Math.PI / 180;
      var id = 'r_' + si + '_' + (ri + 1);

      mk(
        id,
        Math.cos(angle + jit) * dist,
        Math.sin(angle + jit) * dist,
        si,
        'rank'
      );

      adj[prev].push(id);
      adj[id].push(prev);

      prev = id;
    });

    // Мастерство (6-й ранг)
    var mid = 'm_' + si;

    mk(
      mid,
      Math.cos(angle) * 388,
      Math.sin(angle) * 388,
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
};

// Переопределяем функцию получения ранга
window.skillRank = function (si) {
  var r = 0;

  for (var k = 1; k <= 5; k++) {
    if (talloc()['r_' + si + '_' + k]) {
      r = k;
    } else {
      break;
    }
  }

  return r;
};

// Переопределяем проверку мастерства
window.hasMastery = function (si) {
  return !!talloc()['m_' + si];
};