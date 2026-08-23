'use strict';

(function () {

  /* =====================================================
     ДОПОЛНИТЕЛЬНЫЕ УНИКАЛЬНЫЕ ПРЕДМЕТЫ
     ===================================================== */

  function addUnique(item) {
    if (!window.UNIQUES) return;

    var exists = UNIQUES.some(function (x) {
      return x.nm === item.nm;
    });

    if (!exists) {
      UNIQUES.push(item);
    }
  }

  var extraUniques = [
    {
      nm: 'Пепельный рубак',
      slot: 'weapon',
      icon: '🪓',
      lvl: 6,
      bd: [14, 20],
      mods: { phys: 8, dmg: 5 },
      spd: 'Простой, грубый и очень злой.'
    },

    {
      nm: 'Кольцо углей',
      slot: 'ring',
      icon: '💍',
      lvl: 9,
      mods: { spell: 12, crit: 4 },
      spd: 'Тлеет даже в ладони.'
    },

    {
      nm: 'Амулет стойкости',
      slot: 'amulet',
      icon: '📿',
      lvl: 8,
      mods: { hp: 14, armor: 6 },
      spd: 'С ним легче пережить первую минуту боя.'
    },

    {
      nm: 'Сапоги пепельного ветра',
      slot: 'boots',
      icon: '🥾',
      lvl: 13,
      arm: 10,
      mods: { spd: 12, evade: 5 },
      spd: 'Пепел не успевает коснуться подошвы.'
    },

    {
      nm: 'Шлем охотника',
      slot: 'helmet',
      icon: '🪖',
      lvl: 11,
      arm: 11,
      mods: { crit: 5, luk: 4 },
      spd: 'Глаза находят слабое место раньше, чем рука.'
    },

    {
      nm: 'Перчатки кровавой луны',
      slot: 'gloves',
      icon: '🧤',
      lvl: 16,
      arm: 12,
      mods: { critd: 24, str: 4 },
      spd: 'После каждой ночи их приходится отмывать.'
    },

    {
      nm: 'Доспех последнего часа',
      slot: 'armor',
      icon: '🛡️',
      lvl: 21,
      arm: 26,
      mods: { hp: 18, vit: 5 },
      spd: 'Выкован для того, кто не собирается отступать.'
    },

    {
      nm: 'Лук серого неба',
      slot: 'weapon',
      icon: '🏹',
      lvl: 19,
      bd: [24, 34],
      mods: { crit: 6, spd: 10 },
      spd: 'Стрела уходит в цель, как дождь в землю.'
    },

    {
      nm: 'Кинжал тишины',
      slot: 'weapon',
      icon: '🗡️',
      lvl: 24,
      bd: [28, 40],
      mods: { crit: 8, leech: 5 },
      spd: 'Не звенит. Не прощает.'
    },

    {
      nm: 'Венец пустоты',
      slot: 'helmet',
      icon: '👑',
      lvl: 27,
      arm: 14,
      mods: { int: 7, mp: 18, spell: 14 },
      spd: 'В нём слышно, как молчит бездна.'
    },

    {
      nm: 'Пояс каменного быка',
      slot: 'armor',
      icon: '🐂',
      lvl: 15,
      arm: 19,
      mods: { vit: 6, hp: 10 },
      spd: 'Тяжёлый, как упрямство.'
    },

    {
      nm: 'Серьга контрабандиста',
      slot: 'amulet',
      icon: '🦻',
      lvl: 12,
      mods: { gf: 12, mf: 8 },
      spd: 'Половина Грейхолда спрашивает, где ты это взял.'
    }
  ];

  extraUniques.forEach(addUnique);

  /* =====================================================
     ДОПОЛНИТЕЛЬНЫЕ ЛЕГЕНДАРНЫЕ НАЗВАНИЯ
     ===================================================== */

  function addLegn(name) {
    if (!window.LEGN) return;

    if (LEGN.indexOf(name) < 0) {
      LEGN.push(name);
    }
  }

  var extraLegn = [
    'Клятва Угля',
    'Серый Рассвет',
    'Голос Бездны',
    'Сталь Последнего Часа',
    'Пепельная Слеза',
    'Ветер Над Тронной Залой',
    'Молитва Контрабандиста',
    'Зубы Старой Шахты',
    'Холод Затонувших Колоколов',
    'Тень Королевского Склепа',
    'Рука Горнила',
    'Шёпот Восьмой Твердыни'
  ];

  extraLegn.forEach(addLegn);

})();