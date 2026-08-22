var UNIQUES = [
  { nm: 'Зуб Лютоволка', slot: 'weapon', icon: '🗡️', lvl: 4, bd: [12, 16], mods: { phys: 10, crit: 3 }, sp: 'wolf', spd: 'Криты лечат 5% макс. ОЗ' },
  { nm: 'Слеза Арахны', slot: 'amulet', icon: '📿', lvl: 7, mods: { dex: 4, leech: 3 }, sp: 'tear', spd: 'Атаки отравляют врага' },
  { nm: 'Жатва Мортиса', slot: 'weapon', icon: '⚔️', lvl: 12, bd: [24, 32], mods: { dmg: 10, str: 4 }, sp: 'reap', spd: '+30% урона по боссам' },
  { nm: 'Сердце Вулкана', slot: 'ring', icon: '💍', lvl: 17, mods: { spell: 20, int: 5 }, sp: 'vulcan', spd: 'Атаки поджигают врага' },
  { nm: 'Клятва Последнего', slot: 'armor', icon: '🛡️', lvl: 14, arm: 22, mods: { hp: 12, vit: 4 }, sp: 'oath', spd: 'При ОЗ<30% −20% входящего урона' },
  { nm: 'Шёпот Полуночи', slot: 'boots', icon: '🥾', lvl: 20, arm: 14, mods: { evade: 8, dex: 5 }, sp: 'whisper', spd: '+15% к побегу' },
  { nm: 'Венец Сгоревших', slot: 'helmet', icon: '👑', lvl: 10, arm: 12, mods: { hp: 15, mp: 10 }, sp: 'crown', spd: 'Реген 2% ОЗ/ход' },
  { nm: 'Эхо Пустоты', slot: 'amulet', icon: '🌑', lvl: 18, mods: { xp: 15, mf: 15, int: 3 }, sp: 'echo', spd: 'Пустота шепчет имена мёртвых' },
  
  // НОВЫЕ УНИКАЛЬНЫЕ ПРЕДМЕТЫ
  { nm: 'Доспех Шипов', slot: 'armor', icon: '🛡️', lvl: 8, arm: 18, mods: { thorns: 15, vit: 3 }, sp: 'thorns', spd: 'Шипы наносят 15 урона атакующим' },
  { nm: 'Стена Грейхолда', slot: 'helmet', icon: '🪖', lvl: 15, arm: 16, mods: { block: 10, hp: 20 }, sp: 'wall', spd: '+10% шанс Блока (−50% урона)' },
  { nm: 'Рукавицы Палача', slot: 'gloves', icon: '🧤', lvl: 22, arm: 12, mods: { critd: 35, str: 5 }, sp: 'exec', spd: 'Навыки казнят врагов с <40% ОЗ' },
  { nm: 'Пепельный Жнец', slot: 'weapon', icon: '🪓', lvl: 28, bd: [45, 60], mods: { leech: 8, dmg: 12 }, sp: 'reaper', spd: 'Убийства восстанавливают 10% ОЗ' },
  { nm: 'Сапоги Странника', slot: 'boots', icon: '🥾', lvl: 12, arm: 8, mods: { spd: 15, gf: 10 }, sp: 'wanderer', spd: '+15% скорости, +10% золота' },
  { nm: 'Кольцо Вампира', slot: 'ring', icon: '💍', lvl: 25, mods: { leech: 6, hp: 10 }, sp: 'vampRing', spd: '+6% кражи жизни, вампиризм' },
  { nm: 'Корона Безумия', slot: 'helmet', icon: '👑', lvl: 30, arm: 5, mods: { crit: 15, dmg: 15, armor: -15 }, sp: 'madness', spd: '+15% крит, +15% урон, −15% брони' },
  { nm: 'Лук Ветра', slot: 'weapon', icon: '🏹', lvl: 18, bd: [20, 28], mods: { spd: 20, crit: 5 }, sp: 'wind', spd: 'Атаки бьют дважды (шанс 25%)' }
];