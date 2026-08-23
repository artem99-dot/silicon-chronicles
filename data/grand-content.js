'use strict';

/* =====================================================
   СЕТЫ
   ===================================================== */

var SETS = {
  ash_knight: {
    nm: 'Пепельный рыцарь',
    icon: '🛡️',
    bonuses: {
      2: {
        armorPct: 15,
        hpPct: 8
      },
      4: {
        dmgAll: 12
      }
    }
  },

  void_stalker: {
    nm: 'Тень Пустоты',
    icon: '🌑',
    bonuses: {
      2: {
        crit: 6,
        mf: 12
      },
      4: {
        critd: 35,
        spd: 10
      }
    }
  },

  ember_sage: {
    nm: 'Мудрец Углей',
    icon: '🔥',
    bonuses: {
      2: {
        dmgAll: 8,
        gf: 10
      },
      4: {
        dmgAll: 12,
        xpB: 10
      }
    }
  },

  grave_warden: {
    nm: 'Страж Могил',
    icon: '⚰️',
    bonuses: {
      2: {
        hpPct: 12,
        regen: 2
      },
      4: {
        armorPct: 25,
        leech: 5
      }
    }
  }
};

/* =====================================================
   СЕТОВЫЕ ПРЕДМЕТЫ
   Они не добавляются в общий пул уникалок.
   Падают только в очень сложных данжах.
   ===================================================== */

var SET_ITEMS = [
  /* Пепельный рыцарь */
  {
    nm: 'Клинок пепельного рыцаря',
    slot: 'weapon',
    icon: '⚔️',
    lvl: 20,
    bd: [30, 42],
    mods: { dmg: 8, str: 5 },
    set: 'ash_knight',
    spd: 'Входит в сет «Пепельный рыцарь»'
  },

  {
    nm: 'Доспех пепельного рыцаря',
    slot: 'armor',
    icon: '🛡️',
    lvl: 20,
    arm: 32,
    mods: { hp: 14, vit: 5 },
    set: 'ash_knight',
    spd: 'Входит в сет «Пепельный рыцарь»'
  },

  {
    nm: 'Шлем пепельного рыцаря',
    slot: 'helmet',
    icon: '🪖',
    lvl: 20,
    arm: 18,
    mods: { armor: 10, vit: 4 },
    set: 'ash_knight',
    spd: 'Входит в сет «Пепельный рыцарь»'
  },

  {
    nm: 'Сапоги пепельного рыцаря',
    slot: 'boots',
    icon: '🥾',
    lvl: 20,
    arm: 14,
    mods: { spd: 8, armor: 6 },
    set: 'ash_knight',
    spd: 'Входит в сет «Пепельный рыцарь»'
  },

  /* Тень Пустоты */
  {
    nm: 'Кинжал тени пустоты',
    slot: 'weapon',
    icon: '🗡️',
    lvl: 24,
    bd: [28, 40],
    mods: { crit: 7, dex: 6 },
    set: 'void_stalker',
    spd: 'Входит в сет «Тень Пустоты»'
  },

  {
    nm: 'Рукавицы тени пустоты',
    slot: 'gloves',
    icon: '🧤',
    lvl: 24,
    arm: 12,
    mods: { crit: 5, critd: 18 },
    set: 'void_stalker',
    spd: 'Входит в сет «Тень Пустоты»'
  },

  {
    nm: 'Сапоги тени пустоты',
    slot: 'boots',
    icon: '🥾',
    lvl: 24,
    arm: 13,
    mods: { spd: 10, evade: 6 },
    set: 'void_stalker',
    spd: 'Входит в сет «Тень Пустоты»'
  },

  {
    nm: 'Амулет тени пустоты',
    slot: 'amulet',
    icon: '📿',
    lvl: 24,
    mods: { mf: 12, crit: 4 },
    set: 'void_stalker',
    spd: 'Входит в сет «Тень Пустоты»'
  },

  /* Мудрец Углей */
  {
    nm: 'Посох углей',
    slot: 'weapon',
    icon: '🔥',
    lvl: 22,
    bd: [26, 38],
    mods: { dmg: 10, int: 5 },
    set: 'ember_sage',
    spd: 'Входит в сет «Мудрец Углей»'
  },

  {
    nm: 'Корона углей',
    slot: 'helmet',
    icon: '👑',
    lvl: 22,
    arm: 12,
    mods: { mp: 18, int: 5 },
    set: 'ember_sage',
    spd: 'Входит в сет «Мудрец Углей»'
  },

  {
    nm: 'Амулет углей',
    slot: 'amulet',
    icon: '📿',
    lvl: 22,
    mods: { dmg: 8, gf: 8 },
    set: 'ember_sage',
    spd: 'Входит в сет «Мудрец Углей»'
  },

  {
    nm: 'Перстень углей',
    slot: 'ring',
    icon: '💍',
    lvl: 22,
    mods: { xp: 10, dmg: 6 },
    set: 'ember_sage',
    spd: 'Входит в сет «Мудрец Углей»'
  },

  /* Страж Могил */
  {
    nm: 'Доспех стража могил',
    slot: 'armor',
    icon: '🛡️',
    lvl: 26,
    arm: 38,
    mods: { hp: 18, vit: 6 },
    set: 'grave_warden',
    spd: 'Входит в сет «Страж Могил»'
  },

  {
    nm: 'Рукавицы стража могил',
    slot: 'gloves',
    icon: '🧤',
    lvl: 26,
    arm: 14,
    mods: { hp: 10, armor: 8 },
    set: 'grave_warden',
    spd: 'Входит в сет «Страж Могил»'
  },

  {
    nm: 'Кольцо стража могил',
    slot: 'ring',
    icon: '💍',
    lvl: 26,
    mods: { regen: 2, hp: 12 },
    set: 'grave_warden',
    spd: 'Входит в сет «Страж Могил»'
  },

  {
    nm: 'Амулет стража могил',
    slot: 'amulet',
    icon: '📿',
    lvl: 26,
    mods: { armor: 12, leech: 4 },
    set: 'grave_warden',
    spd: 'Входит в сет «Страж Могил»'
  }
];

/* =====================================================
   ПИТОМЦЫ
   Получение очень сложное: только самые опасные данжи.
   ===================================================== */

var PETS = [
  {
    id: 'ash_wolf',
    nm: 'Пепельный волчонок',
    icon: '🐺',
    ds: 'Его кормят не мясом, а углями.',
    bonus: {
      dmgAll: 6,
      crit: 3
    }
  },

  {
    id: 'void_eye',
    nm: 'Око Пустоты',
    icon: '👁️',
    ds: 'Оно смотрит сквозь пепел и жадность.',
    bonus: {
      mf: 15,
      xpB: 10
    }
  },

  {
    id: 'ember_salamander',
    nm: 'Угольная саламандра',
    icon: '🦎',
    ds: 'Спит в золе и просыпается от звона золота.',
    bonus: {
      dmgAll: 5,
      gf: 10
    }
  },

  {
    id: 'bone_guard',
    nm: 'Костяной стражик',
    icon: '💀',
    ds: 'Собран из трофеев, которые никто не хотел нести.',
    bonus: {
      armorPct: 12,
      hpPct: 8
    }
  }
];