var TITLES = [
  {
    id: 'novice',
    nm: 'Новичок',
    ic: '🌱',
    d: { xp: 5 },
    ds: '+5% опыта',
    cond: function() {
      return true;
    }
  },

  {
    id: 'hunter',
    nm: 'Охотник',
    ic: '🏹',
    d: { dmg: 3 },
    ds: '+3% урона',
    cond: function() {
      return S.hero.kills >= 25;
    }
  },

  {
    id: 'slayer',
    nm: 'Истребитель',
    ic: '⚔️',
    d: { dmg: 6 },
    ds: '+6% урона',
    cond: function() {
      return S.hero.kills >= 100;
    }
  },

  {
    id: 'butcher',
    nm: 'Мясник Пепла',
    ic: '🩸',
    d: { dmg: 10 },
    ds: '+10% урона',
    cond: function() {
      return S.hero.kills >= 300;
    }
  },

  {
    id: 'bosslayer',
    nm: 'Гроза хранителей',
    ic: '☠',
    d: { crit: 3 },
    ds: '+3% крит',
    cond: function() {
      return Object.keys(S.hero.bosses).length >= 1;
    }
  },

  {
    id: 'legend',
    nm: 'Легенда Грейхолда',
    ic: '👑',
    d: { dmg: 12 },
    ds: '+12% урона',
    cond: function() {
      return Object.keys(S.hero.bosses).length >= 8;
    }
  },

  {
    id: 'arena10',
    nm: 'Боец арены',
    ic: '🏟️',
    d: { gold: 5 },
    ds: '+5% золота',
    cond: function() {
      return (S.arenaBest || 0) >= 10;
    }
  },

  {
    id: 'gambler',
    nm: 'Игрок',
    ic: '🎲',
    d: { gold: 5 },
    ds: '+5% золота',
    cond: function() {
      return (S.hero.gamesWon || 0) >= 10;
    }
  },

  {
    id: 'rich',
    nm: 'Золотой кошель',
    ic: '💰',
    d: { gold: 10 },
    ds: '+10% золота',
    cond: function() {
      return S.gold >= 10000;
    }
  },

  {
    id: 'collector',
    nm: 'Коллекционер',
    ic: '💎',
    d: { mf: 10 },
    ds: '+10% лута',
    cond: function() {
      return S.hero.inv
        .concat(Object.values(S.hero.eq).filter(Boolean))
        .some(function(it) {
          return it.unique;
        });
    }
  },

  {
    id: 'survivor',
    nm: 'Ветеран подземелий',
    ic: '🕳️',
    d: { hp: 10 },
    ds: '+10% ОЗ',
    cond: function() {
      return (S.hero.dungeons || 0) >= 10;
    }
  },

  {
    id: 'smith',
    nm: 'Мастер стали',
    ic: '⚒️',
    d: { armor: 10 },
    ds: '+10% брони',
    cond: function() {
      return (S.hero.enhOk || 0) >= 10;
    }
  },

  {
    id: 'gourmet',
    nm: 'Гурман',
    ic: '🍲',
    d: { hp: 5 },
    ds: '+5% ОЗ',
    cond: function() {
      return (S.hero.meals || 0) >= 15;
    }
  }
];