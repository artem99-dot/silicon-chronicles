var CLASSES = {
  war: {
    name: 'Воин',
    icon: '⚔️',
    desc: 'Стена из стали и злобы.',
    col: '#e0653a',
    skills: ['strike', 'cleave', 'warcry', 'blood', 'execute', 'storm']
  },

  mage: {
    name: 'Маг',
    icon: '🔥',
    desc: 'Хрупок, как стекло, и вдвое опаснее.',
    col: '#5a9fd6',
    skills: ['fireball', 'nova', 'arcanic', 'drain', 'meteor', 'tempest']
  },

  rog: {
    name: 'Разбойник',
    icon: '🗡️',
    desc: 'Сначала удар, потом вопросы.',
    col: '#7fb95c',
    skills: ['sneak', 'fan', 'poison', 'dance', 'evis', 'mark']
  },

  ran: {
    name: 'Следопыт',
    icon: '🏹',
    desc: 'Стрела находит цель даже в тумане.',
    col: '#c9b458',
    skills: ['aimed', 'rain', 'trap', 'pierce', 'hawk', 'barrage']
  },

  pal: {
    name: 'Паладин',
    icon: '🛡️',
    desc: 'Лечит себя верой, врагов — молотом.',
    col: '#f0cf8a',
    skills: ['smite', 'holy', 'shield', 'consecrate', 'judgement', 'aegis']
  }
};

var GROW = {
  war: { str: 1.2, vit: 0.9, dex: 0.3, int: 0.1 },
  mage: { int: 1.2, vit: 0.5, dex: 0.3, str: 0.1 },
  rog: { dex: 1.2, str: 0.5, vit: 0.4, int: 0.1 },
  ran: { dex: 1.0, str: 0.6, vit: 0.5, int: 0.2 },
  pal: { str: 1.0, vit: 1.0, int: 0.4, dex: 0.2 }
};