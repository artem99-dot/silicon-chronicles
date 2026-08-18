var RACES = {
  human: {
    name: 'Человек',
    icon: '🧑',
    desc: 'Дети пепла, упрямые и живучие.',
    b: { str: 1, dex: 1, int: 1, vit: 1 },
    mods: [{ k: 'xp', v: 10 }],
    trait: '+10% опыта, +1 ко всем хар-кам'
  },

  orc: {
    name: 'Орк',
    icon: '👹',
    desc: 'Чем ближе смерть — тем яростнее бьют.',
    b: { str: 3, vit: 2, dex: 0, int: -1 },
    mods: [],
    trait: 'Ярость: +25% урона при ОЗ<35%'
  },

  elf: {
    name: 'Эльф',
    icon: '🧝',
    desc: 'Бьют точно в щели брони.',
    b: { dex: 3, int: 2, str: 0, vit: -1 },
    mods: [{ k: 'crit', v: 3 }],
    trait: '+3% шанс крита'
  },

  dwarf: {
    name: 'Дворф',
    icon: '⛏️',
    desc: 'Сталь слушается их рук.',
    b: { str: 2, vit: 2, dex: 0, int: 0 },
    mods: [],
    trait: '+15% к шансу заточки'
  },

  undead: {
    name: 'Нежить',
    icon: '💀',
    desc: 'Чужая жизнь подпитывает их.',
    b: { int: 3, dex: 2, str: 0, vit: -2 },
    mods: [{ k: 'leech', v: 5 }],
    trait: '5% кражи жизни'
  }
};