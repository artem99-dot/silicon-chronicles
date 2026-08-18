var ZONES = [
  {
    id: 'wolf_forest',
    nm: 'Волчий лес',
    lv: 1,
    icon: '🌲',
    ds: 'Серые тени между мёртвых сосен.',
    mobs: ENEMIES.wolf_forest,
    dungeons: [
      { nm: 'Логово стаи', ic: '🐾', rooms: 8 },
      { nm: 'Тропа контрабандистов', ic: '🌿', rooms: 10 }
    ],
    boss: BOSSES.wolf_forest
  },

  {
    id: 'old_mine',
    nm: 'Старая шахта',
    lv: 5,
    icon: '⛏️',
    ds: 'Жилы серебра иссякли.',
    mobs: ENEMIES.old_mine,
    dungeons: [
      { nm: 'Верхние забои', ic: '⛏️', rooms: 9 },
      { nm: 'Гнездовье', ic: '🕸️', rooms: 11 }
    ],
    boss: BOSSES.old_mine
  },

  {
    id: 'royal_crypt',
    nm: 'Королевский склеп',
    lv: 10,
    icon: '⚰️',
    ds: 'Усыпальница сгоревших королей.',
    mobs: ENEMIES.royal_crypt,
    dungeons: [
      { nm: 'Галерея скорби', ic: '🕯️', rooms: 10 },
      { nm: 'Чёрная крипта', ic: '⬛', rooms: 12 }
    ],
    boss: BOSSES.royal_crypt
  },

  {
    id: 'ash_mountains',
    nm: 'Пепельные горы',
    lv: 16,
    icon: '🌋',
    ds: 'Земля дрожит, из трещин дышит жар.',
    mobs: ENEMIES.ash_mountains,
    dungeons: [
      { nm: 'Осыпи', ic: '⛰️', rooms: 11 },
      { nm: 'Кратер', ic: '☄️', rooms: 13 }
    ],
    boss: BOSSES.ash_mountains
  },

  {
    id: 'sunken_temple',
    nm: 'Затонувший храм',
    lv: 21,
    icon: '🌊',
    ds: 'Море ушло, храм остался.',
    mobs: ENEMIES.sunken_temple,
    dungeons: [
      { nm: 'Неф колоколов', ic: '🔔', rooms: 12 },
      { nm: 'Алтарь глубин', ic: '🐙', rooms: 14 }
    ],
    boss: BOSSES.sunken_temple
  },

  {
    id: 'night_citadel',
    nm: 'Цитадель Ночи',
    lv: 26,
    icon: '🌑',
    ds: 'Крепость из самой темноты.',
    mobs: ENEMIES.night_citadel,
    dungeons: [
      { nm: 'Внешние стены', ic: '🧱', rooms: 13 },
      { nm: 'Тронный зал', ic: '🌑', rooms: 15 }
    ],
    boss: BOSSES.night_citadel
  },

  {
    id: 'abyss_forge',
    nm: 'Горнило Бездны',
    lv: 31,
    icon: '🔥',
    ds: 'Кузница, в которой ковали пепел.',
    mobs: ENEMIES.abyss_forge,
    dungeons: [
      { nm: 'Ковочный двор', ic: '⚒️', rooms: 14 },
      { nm: 'Ядро горнила', ic: '🔥', rooms: 16 }
    ],
    boss: BOSSES.abyss_forge
  },

  {
    id: 'ash_throne',
    nm: 'Трон Пепла',
    lv: 36,
    icon: '👑',
    ds: 'Здесь пепел родился.',
    mobs: ENEMIES.ash_throne,
    dungeons: [
      { nm: 'Пепельные врата', ic: '🚪', rooms: 15 },
      { nm: 'Сердце пепла', ic: '🖤', rooms: 17 }
    ],
    boss: BOSSES.ash_throne
  }
];

function PAGEOF(i) {
  return i < 2 ? 0 : (i < 4 ? 1 : (i < 6 ? 2 : 3));
}