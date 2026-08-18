var GEMS = {
  ruby: {
    n: 'Рубин Пламени',
    icon: '🔴'
  },

  emerald: {
    n: 'Изумруд Гнили',
    icon: '🟢'
  },

  sapphire: {
    n: 'Сапфир Стужи',
    icon: '🔵'
  },

  topaz: {
    n: 'Топаз Бури',
    icon: '🟡'
  },

  onyx: {
    n: 'Оникс Тьмы',
    icon: '⚫'
  },

  diamond: {
    n: 'Алмаз Чистоты',
    icon: '⚪'
  }
};

function gemVal(b, lv) {
  return Math.round(b * (1 + 0.5 * ((lv || 1) - 1)));
}

function gemWeaponTxt(k, lv) {
  return {
    ruby: '+' + gemVal(20, lv) + '% огнём, поджог',
    emerald: '+' + gemVal(20, lv) + '% ядом, отрава',
    sapphire: '+' + gemVal(20, lv) + '% льдом, замедление',
    topaz: '+' + gemVal(15, lv) + '% молнией, +' + gemVal(5, lv) + '% крит',
    onyx: 'кража жизни ' + gemVal(6, lv) + '%',
    diamond: '+' + gemVal(10, lv) + '% урона'
  }[k];
}

function gemArmorTxt(k, lv) {
  if (k === 'diamond') {
    return '+' + gemVal(8, lv) + '% ко всем сопр.';
  }

  return '+' + gemVal(12, lv) + '% сопр. ' + {
    ruby: 'огню',
    emerald: 'яду',
    sapphire: 'льду',
    topaz: 'молнии',
    onyx: 'тьме'
  }[k];
}