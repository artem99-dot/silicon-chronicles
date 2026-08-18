var RECIPES = [
  {
    id: 'hp',
    n: 'Зелье лечения',
    icon: '🧪',
    gold: 25,
    tro: 2,
    out: { pot: 'hp' },
    d: 'лечит 35% ОЗ'
  },

  {
    id: 'mp',
    n: 'Зелье маны',
    icon: '🧪',
    gold: 20,
    tro: 2,
    out: { pot: 'mp' },
    d: '+50% маны'
  },

  {
    id: 'rage',
    n: 'Эликсир Ярости',
    icon: '🔥',
    gold: 80,
    btro: 1,
    out: { elix: 'rage' },
    d: '+25% урона 10с'
  },

  {
    id: 'stone',
    n: 'Эликсир Камня',
    icon: '🪨',
    gold: 80,
    btro: 1,
    out: { elix: 'stone' },
    d: '+40% брони 10с'
  },

  {
    id: 'swift',
    n: 'Эликсир Сокола',
    icon: '🦅',
    gold: 80,
    btro: 1,
    out: { elix: 'swift' },
    d: '+35% скорости 10с'
  },

  {
    id: 'prot',
    n: 'Камень-оберег',
    icon: '🛡',
    gold: 150,
    btro: 2,
    out: { prot: 1 },
    d: 'спасает предмет'
  },

  {
    id: 'gem',
    n: 'Случайный самоцвет',
    icon: '💎',
    gold: 120,
    frag: 4,
    out: { gem: 1 },
    d: 'самоцвет для гнезда'
  }
];

var ELIXN = {
  rage: {
    n: 'Эликсир Ярости',
    icon: '🔥',
    d: '+25% урона 10с'
  },

  stone: {
    n: 'Эликсир Камня',
    icon: '🪨',
    d: '+40% брони 10с'
  },

  swift: {
    n: 'Эликсир Сокола',
    icon: '🦅',
    d: '+35% скорости 10с'
  }
};