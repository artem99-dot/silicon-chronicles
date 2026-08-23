'use strict';

/* =====================================================
   НОВАЯ СИСТЕМА НАВЫКОВ
   3 активных + 3 пассивных на класс
   ===================================================== */

var SKILLDB = {
  /* ========================================
     ВОИН
     ======================================== */
  
  // Активные
  war_strike: {
    n: 'Ошеломляющий выпад',
    type: 'active',
    mp: 8,
    mult: 1.4,
    txt: 'Наносит 140% урона. Накладывает контузию на 2с.',
    effects: {
      concuss: { t: 2, slowPct: 10 },
      bonusVsSlowed: { dmgMul: 1.08, t: 4 }
    },
    cd: 4000,
    desc: 'Контроль и ослабление врага.'
  },

  war_armor_break: {
    n: 'Раскол брони',
    type: 'active',
    mp: 10,
    mult: 1.2,
    txt: 'Наносит 120% урона. Снижает броню врага на 12% на 6с.',
    effects: {
      armorBreak: { pct: 12, t: 6 }
    },
    cd: 6000,
    desc: 'Пробивает броню, усиливает весь урон.'
  },

  war_battle_cry: {
    n: 'Боевой клич',
    type: 'active',
    mp: 12,
    txt: 'На 6с: +15% урона, +8% скорости, атаки накладывают кровотечение.',
    effects: {
      buff: [
        { k: 'dmg', pct: 15, t: 6 },
        { k: 'spd', pct: 8, t: 6 }
      ],
      bleed: { pct: 3, t: 2 }
    },
    cd: 12000,
    desc: 'Окно усиления для серии ударов.'
  },

  // Пассивные
  war_bloodlust: {
    n: 'Кровавая жажда',
    type: 'passive',
    txt: 'При ОЗ <50%: атаки лечат 5% урона. Получение урона даёт заряды ярости (+4% к следующей атаке, макс 5).',
    effects: {
      lowHpLeech: { threshold: 0.5, pct: 5 },
      rageStacks: { max: 5, pctPerStack: 4 }
    },
    desc: 'Выживаемость и разгон на низком ОЗ.'
  },

  war_executioner: {
    n: 'Палач',
    type: 'passive',
    txt: '+15% урона по врагам <40% ОЗ. Атаки игнорируют 15% брони. Против боссов: +5% крит.',
    effects: {
      executeBonus: { threshold: 0.4, dmgPct: 15, armorPen: 15 },
      bossCrit: { pct: 5 }
    },
    desc: 'Добивание и усиление в поздней фазе боя.'
  },

  war_storm: {
    n: 'Железный шторм',
    type: 'passive',
    txt: 'Каждый 4-й удар наносит дополнительный удар на 40% урона. Каждый 6-й полученный удар даёт +8% брони на 5с.',
    effects: {
      procAttack: { every: 4, mult: 0.4 },
      procDefense: { every: 6, armorPct: 8, t: 5 }
    },
    desc: 'Ритм ударов и защита.'
  },

  /* ========================================
     МАГ
     ======================================== */
  
  // Активные
  mage_fireball: {
    n: 'Огненный шар',
    type: 'active',
    mp: 10,
    mult: 1.6,
    mag: 1,
    txt: 'Наносит 160% магического урона. Накладывает Ожог на 3с. Если враг уже горит: всплеск пламени.',
    effects: {
      burn: { pct: 12, t: 3 },
      igniteBonus: { mult: 1.15 }
    },
    cd: 3000,
    desc: 'Основной источник периодического урона.'
  },

  mage_nova: {
    n: 'Ледяная нова',
    type: 'active',
    mp: 14,
    mult: 1.2,
    mag: 1,
    txt: 'Наносит 120% магического урона. Замедляет атаки врага на 15% на 4с. Если враг горит: замедление до 20%.',
    effects: {
      slow: { pct: 15, t: 4 },
      slowVsBurning: { pct: 20 }
    },
    cd: 8000,
    desc: 'Контроль и защита.'
  },

  mage_drain: {
    n: 'Похищение сущности',
    type: 'active',
    mp: 12,
    mult: 1.3,
    mag: 1,
    txt: 'Наносит 130% магического урона. Лечит на 50% урона. Возвращает 8% маны. При ОЗ <40%: лечение до 80%.',
    effects: {
      heal: { pct: 50 },
      manaReturn: { pct: 8 },
      lowHpHeal: { threshold: 0.4, pct: 80 }
    },
    cd: 6000,
    desc: 'Устойчивость в долгих боях.'
  },

  // Пассивные
  mage_focus: {
    n: 'Чародейская фокусировка',
    type: 'passive',
    txt: 'Каждое магическое попадание даёт заряд фокуса (+2% силы чар, +1% крит, макс 5). При 5 зарядах: следующий навык усилен на 20%.',
    effects: {
      focusStacks: { max: 5, spellPct: 2, critPct: 1 },
      focusBonus: { stacks: 5, mult: 1.2 }
    },
    desc: 'Разгон силы чар через активные навыки.'
  },

  mage_meteor_sense: {
    n: 'Метеоритное чутьё',
    type: 'passive',
    txt: 'Все периодические эффекты длятся на 1с дольше. Их урон +15%. Каждые 3 тика возвращают 3% маны.',
    effects: {
      dotExtension: { t: 1 },
      dotBonus: { pct: 15 },
      manaRegen: { ticks: 3, pct: 3 }
    },
    desc: 'Усиление дотов и возврат маны.'
  },

  mage_elemental_storm: {
    n: 'Буря стихий',
    type: 'passive',
    txt: 'Каждое 3-е магическое попадание вызывает разряд стихии (35% силы чар) с эффектом самоцвета оружия.',
    effects: {
      elementalProc: { every: 3, mult: 0.35 }
    },
    desc: 'Стихийный билд через самоцветы.'
  },

  /* ========================================
     РАЗБОЙНИК
     ======================================== */
  
  // Активные
  rog_sneak: {
    n: 'Подлый удар',
    type: 'active',
    mp: 7,
    mult: 1.5,
    txt: 'Наносит 150% урона. Всегда критует. Накладывает Метку на 3 удара (+10% шанса крита). Если цель отравлена: +20% крит. урона.',
    effects: {
      forceCrit: 1,
      mark: { hits: 3, critPct: 10 },
      vsPoisoned: { critdPct: 20 }
    },
    cd: 5000,
    desc: 'Открытие боя и криты.'
  },

  rog_poison: {
    n: 'Отравленный клинок',
    type: 'active',
    mp: 9,
    mult: 1.2,
    txt: 'Наносит 120% урона. Накладывает сильный яд на 4с. Пока враг отравлен: его атаки на 8% медленнее, ты получаешь +5% уклонения.',
    effects: {
      poison: { pct: 14, t: 4 },
      slowEnemy: { pct: 8 },
      evadeBonus: { pct: 5 }
    },
    cd: 7000,
    desc: 'Яд и ослабление врага.'
  },

  rog_dance: {
    n: 'Танец теней',
    type: 'active',
    mp: 12,
    txt: 'На 5с: +25% уклонения, +10% крит. Если уклонился от атаки: следующая атака +30% урона.',
    effects: {
      buff: [
        { k: 'evade', pct: 25, t: 5 },
        { k: 'crit', pct: 10, t: 5 }
      ],
      dodgeBonus: { mult: 1.3 }
    },
    cd: 15000,
    desc: 'Уклонение и контратака.'
  },

  // Пассивные
  rog_fan: {
    n: 'Веер клинков',
    type: 'passive',
    txt: 'Каждый 3-й удар наносит дополнительный удар на 35% урона. Если цель отравлена: доп. удар может критовать.',
    effects: {
      procAttack: { every: 3, mult: 0.35 },
      vsPoisoned: { canCrit: 1 }
    },
    desc: 'Ритмические удары.'
  },

  rog_eviscerate: {
    n: 'Потрошение',
    type: 'passive',
    txt: 'По отравленным или кровоточащим врагам: +12% урона. Криты по таким врагам восстанавливают 2% ОЗ.',
    effects: {
      vsDebuffed: { dmgPct: 12 },
      critHeal: { pct: 2 }
    },
    desc: 'Урон по ослабленным и лечение.'
  },

  rog_mark: {
    n: 'Метка смерти',
    type: 'passive',
    txt: 'Криты с шансом 25% накладывают Метку смерти на 4с (+8% урона по цели). Пока метка активна: +5% скорости атаки.',
    effects: {
      markOnCrit: { chance: 25, dmgPct: 8, t: 4 },
      markBonus: { spdPct: 5 }
    },
    desc: 'Критовый цикл.'
  },

  /* ========================================
     СЛЕДОПЫТ
     ======================================== */
  
  // Активные
  ran_aimed: {
    n: 'Прицельный выстрел',
    type: 'active',
    mp: 7,
    mult: 1.7,
    txt: 'Наносит 170% урона. Повышенный шанс крита. Накладывает Уязвимость на 4с (+6% урона по цели). Если цель замедлена: +20% урона.',
    effects: {
      critBonus: { pct: 30 },
      vulnerability: { dmgPct: 6, t: 4 },
      vsSlowed: { mult: 1.2 }
    },
    cd: 4000,
    desc: 'Фокус и уязвимость.'
  },

  ran_trap: {
    n: 'Капкан',
    type: 'active',
    mp: 9,
    mult: 1.1,
    txt: 'Наносит 110% урона. Замедляет врага на 15% на 4с. Если уже замедлен: короткое оглушение. Пока в капкане: +5% крит по цели.',
    effects: {
      slow: { pct: 15, t: 4 },
      stunVsSlowed: { t: 1 },
      critBonus: { pct: 5 }
    },
    cd: 6000,
    desc: 'Контроль и усиление критов.'
  },

  ran_hawk: {
    n: 'Ястребиный глаз',
    type: 'active',
    mp: 10,
    txt: 'На 6с: +10% крит, +10% скорости, атаки игнорируют 15% брони. При ОЗ <50%: +10% уклонения.',
    effects: {
      buff: [
        { k: 'crit', pct: 10, t: 6 },
        { k: 'spd', pct: 10, t: 6 }
      ],
      armorPen: { pct: 15 },
      lowHpEvade: { threshold: 0.5, pct: 10 }
    },
    cd: 12000,
    desc: 'Окно точности и пробития.'
  },

  // Пассивные
  ran_rain: {
    n: 'Град стрел',
    type: 'passive',
    txt: 'Каждый 4-й выстрел выпускает дополнительную стрелу на 40% урона. Если цель замедлена: игнорирует 10% брони.',
    effects: {
      procAttack: { every: 4, mult: 0.4 },
      vsSlowed: { armorPen: 10 }
    },
    desc: 'Ритмические выстрелы.'
  },

  ran_pierce: {
    n: 'Пронзающие стрелы',
    type: 'passive',
    txt: 'Атаки игнорируют 8% брони. Криты снижают броню на 4% на 3с (складывается до 3 раз).',
    effects: {
      armorPen: { pct: 8 },
      critArmorBreak: { pct: 4, t: 3, max: 3 }
    },
    desc: 'Пробитие брони.'
  },

  ran_barrage: {
    n: 'Заградительный огонь',
    type: 'passive',
    txt: 'Атаки по замедленным врагам накладывают кровотечение на 2с (3% урона/с). Пока враг кровоточит: +5% скорости атаки.',
    effects: {
      bleedVsSlowed: { pct: 3, t: 2 },
      bleedBonus: { spdPct: 5 }
    },
    desc: 'Контроль через кровотечение.'
  },

  /* ========================================
     ПАЛАДИН
     ======================================== */
  
  // Активные
  pal_smite: {
    n: 'Кара',
    type: 'active',
    mp: 8,
    mult: 1.5,
    txt: 'Наносит 150% урона. Лечит на 25% урона. Если активен Щит веры: урон +20%.',
    effects: {
      heal: { pct: 25 },
      vsShield: { mult: 1.2 }
    },
    cd: 3000,
    desc: 'Урон и лечение.'
  },

  pal_shield: {
    n: 'Щит веры',
    type: 'active',
    mp: 10,
    txt: 'На 5с: -35% входящего урона. Пока щит активен: атаки лечат на 2% урона. После окончания: реген 2%/с на 3с.',
    effects: {
      buff: [{ k: 'shield', pct: 35, t: 5 }],
      shieldHeal: { pct: 2 },
      postShieldRegen: { pct: 2, t: 3 }
    },
    cd: 15000,
    desc: 'Защита и усиление атак.'
  },

  pal_judgement: {
    n: 'Праведный суд',
    type: 'active',
    mp: 18,
    mult: 1.9,
    txt: 'Наносит 190% урона. Если цель <35% ОЗ: урон +40%. Снимает один негативный эффект. На 2с иммунитет к периодическим эффектам.',
    effects: {
      execute: { threshold: 0.35, mult: 1.4 },
      cleanse: 1,
      immunity: { t: 2 }
    },
    cd: 20000,
    desc: 'Добивание и очищение.'
  },

  // Пассивные
  pal_dawn: {
    n: 'Свет зари',
    type: 'passive',
    txt: 'Все источники лечения усилены на 20%. Избыточное лечение превращается в барьер (5% макс ОЗ). Пока барьер активен: +5% брони.',
    effects: {
      healBonus: { pct: 20 },
      overhealBarrier: { pct: 5 },
      barrierArmor: { pct: 5 }
    },
    desc: 'Усиление лечения и барьер.'
  },

  pal_consecrate: {
    n: 'Освящение',
    type: 'passive',
    txt: 'Атаки накладывают священный огонь на 3с (периодический световой урон). Против боссов и проклятых: +25% сильнее. Пока враг горит: +3% реген.',
    effects: {
      holyFire: { pct: 8, t: 3 },
      vsBoss: { mult: 1.25 },
      burnRegen: { pct: 3 }
    },
    desc: 'Световой дот и реген.'
  },

  pal_aegis: {
    n: 'Эгида рассвета',
    type: 'passive',
    txt: 'Постоянно: +5% брони, +5% ко всем сопротивлениям. При первом падении ОЗ ниже 40%: на 4с -30% урона, +3% реген. Перезарядка: 30с.',
    effects: {
      passiveArmor: { pct: 5 },
      passiveRes: { pct: 5 },
      emergencyShield: { threshold: 0.4, dmgReduction: 30, regen: 3, t: 4, cd: 30 }
    },
    desc: 'Экстренное спасение.'
  }
};

/* =====================================================
   БАЛАНС ОЧКОВ НАВЫКОВ
   ===================================================== */

function getSkillPointsForLevel(lvl) {
  // Уровни 1-5: 1 очко за уровень
  // Уровни 6-15: 1 очко за уровень + 1 бонусное за каждые 3 уровня
  // Уровни 16+: 1 очко за уровень + 1 бонусное за каждые 2 уровня
  
  var pts = 0;
  
  for (var i = 1; i <= lvl; i++) {
    pts += 1; // Базовое очко за уровень
    
    if (i >= 6 && i <= 15) {
      if (i % 3 === 0) pts += 1; // Бонусные очки
    } else if (i >= 16) {
      if (i % 2 === 0) pts += 1;
    }
  }
  
  return pts;
}

function getBossBonusPoints(bossesKilled) {
  // За каждого убитого босса: +1 очко
  // Но максимум 4 бонусных очка от боссов
  return Math.min(4, bossesKilled);
}

function getTotalSkillPoints(hero) {
  var base = getSkillPointsForLevel(hero.lvl);
  var bossBonus = getBossBonusPoints(Object.keys(hero.bosses || {}).length);
  
  return base + bossBonus;
}

function getSpentSkillPoints(hero) {
  if (!hero.talloc) return 0;
  
  var spent = 0;
  
  Object.keys(hero.talloc).forEach(function(id) {
    if (id === 'origin') return;
    
    var rank = hero.talloc[id];
    spent += rank;
  });
  
  return spent;
}

function getAvailableSkillPoints(hero) {
  return getTotalSkillPoints(hero) - getSpentSkillPoints(hero);
}