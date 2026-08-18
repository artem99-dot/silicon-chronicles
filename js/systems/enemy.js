'use strict';

function makeEnemy(zi, elite, dlvl) {
  var z = ZONES[zi];
  var m = P(z.mobs);
  var el = elite ? 2.0 : 1;
  var l = z.lv + (dlvl || 0) + RI(0, 2);

  S.lastZi = zi;

  var e = {
    n: m.n,
    f: m.f,
    lv: l,
    boss: false,
    elite: !!elite,
    hp: 0,
    maxhp: Math.round((30 + l * 20) * el),
    dmg: (5 + l * 2.8) * (elite ? 1.3 : 1),
    xp: Math.max(
      1,
      Math.round(l * 14 * el + z.lv * 4) *
      Math.pow(0.9, Math.max(0, l - S.hero.lvl))
    ),
    gold: Math.round(l * 3 + RI(0, l * 3) * (elite ? 1.8 : 1)),
    stun: 0,
    dot: 0,
    dotD: 0,
    dotEl: null,
    buffs: [],
    debuff: null,
    trait: null,
    elem: m.el || null,
    atkN: 0,
    slow: false,
    hitN: 0,
    arm: Math.round(l * 8 * (elite ? 1.3 : 1)),
    sp: Math.random() < 0.5
      ? P([
        { n: 'Жестокий выпад', m: 1.9 },
        { n: 'Рёв ярости', buff: { k: 'dmg', pct: 30, t: 8 } },
        { n: 'Каменная кожа', buff: { k: 'def', pct: 45, t: 8 } }
      ])
      : null
  };

  if (m.tr) {
    e.trait = TRAITS.find(function(t) {
      return t.k === m.tr;
    });
  } else {
    var tr = Math.random();

    if ((elite && tr < 0.4) || (!elite && tr < 0.18)) {
      e.trait = P(TRAITS);
    }
  }

  if (e.trait) {
    if (!elite) {
      e.maxhp = Math.round(e.maxhp * 1.35);
      e.xp = Math.round(e.xp * 1.5);
      e.gold = Math.round(e.gold * 1.5);
    }

    if (e.trait.k === 'venom' && !e.elem) {
      e.elem = 'poison';
    } else if (e.trait.k === 'burn' && !e.elem) {
      e.elem = 'fire';
    }
  }

  if (!e.elem && elite && Math.random() < 0.4) {
    e.elem = P(Object.keys(ELEMS));
  }

  e.hp = e.maxhp;

  return e;
}

function makeBoss(zi) {
  var z = ZONES[zi];
  var l = z.lv + 4;

  S.lastZi = zi;

  return {
    n: z.boss.n,
    f: z.boss.f,
    lv: l,
    boss: true,
    hp: 0,
    maxhp: Math.round((30 + l * 20) * 6.5),
    dmg: (5 + l * 2.8) * 1.5,
    xp: Math.round(l * 14 * 7 + z.lv * 24),
    gold: l * 15 + 60,
    stun: 0,
    dot: 0,
    dotD: 0,
    dotEl: null,
    buffs: [],
    debuff: null,
    trait: null,
    elem: z.boss.el || null,
    atkN: 0,
    slow: false,
    hitN: 0,
    arm: l * 18,
    sp: Object.assign({}, z.boss.sp),
    enr: false
  };
}

var ARENA_MOBS = [
  { n: 'Бешеный пёс арены', f: '🐕' },
  { n: 'Гладиатор-новобранец', f: '🗡️' },
  { n: 'Сетевой боец', f: '🕸️' },
  { n: 'Зверь из ямы', f: '🦬' },
  { n: 'Костолом', f: '🦴' },
  { n: 'Палач толпы', f: '🪓' },
  { n: 'Тень трибун', f: '🌫️' },
  { n: 'Красный минотавр', f: '🐂' }
];

var ARENA_ELITES = [
  { n: 'Чемпион-ветеран', f: '🏆' },
  { n: 'Гроза ям', f: '⚔️' },
  { n: 'Непобеждённый гладиатор', f: '🛡️' },
  { n: 'Любимец толпы', f: '👑' }
];

var ARENA_KING = {
  n: 'Король арены',
  f: '🤴'
};

function makeArenaEnemy(wave, diff) {
  var l = Math.max(
    1,
    S.hero.lvl + diff * 2 + Math.floor((wave - 1) / 3)
  );

  var k10 = wave % 10 === 0;
  var k5 = wave % 5 === 0;

  var m = k10
    ? ARENA_KING
    : k5
      ? P(ARENA_ELITES)
      : P(ARENA_MOBS);

  var mult = k10 ? 3.2 : k5 ? 2.0 : 1;

  var e = {
    n: m.n,
    f: m.f,
    lv: l,
    boss: false,
    elite: k5,
    hp: 0,
    maxhp: Math.round((30 + l * 20) * mult),
    dmg: (5 + l * 2.8) *
      (k10 ? 1.5 : k5 ? 1.3 : 1) *
      (1 + (wave - 1) * 0.05 + diff * 0.12),
    xp: Math.round((14 + l * 10 + wave * 6) * (1 + diff * 0.6)),
    gold: Math.round((8 + l * 3 + wave * 4) * (1 + diff * 0.6)),
    stun: 0,
    dot: 0,
    dotD: 0,
    dotEl: null,
    buffs: [],
    debuff: null,
    trait: null,
    elem: null,
    atkN: 0,
    slow: false,
    hitN: 0,
    arm: l * 8,
    sp: k5
      ? P([
        { n: 'Жестокий выпад', m: 1.9 }
      ])
      : null
  };

  if (k10) {
    e.elem = P(Object.keys(ELEMS));
  } else if (k5 && Math.random() < 0.5) {
    e.elem = P(Object.keys(ELEMS));
  } else if (Math.random() < 0.2) {
    e.trait = P(TRAITS);
  }

  e.hp = e.maxhp;

  return e;
}