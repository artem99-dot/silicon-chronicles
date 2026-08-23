'use strict';

var CLASSES = {
  war: {
    name: 'Воин',
    icon: '⚔️',
    desc: 'Стена из стали и злобы.',
    col: '#e0653a',
    skills: [
      'war_strike',
      'war_armor_break',
      'war_battle_cry',
      'war_bloodlust',
      'war_executioner',
      'war_storm'
    ]
  },

  mage: {
    name: 'Маг',
    icon: '🔥',
    desc: 'Хрупок, как стекло, и вдвое опаснее.',
    col: '#5a9fd6',
    skills: [
      'mage_fireball',
      'mage_nova',
      'mage_drain',
      'mage_focus',
      'mage_meteor_sense',
      'mage_elemental_storm'
    ]
  },

  rog: {
    name: 'Разбойник',
    icon: '🗡️',
    desc: 'Сначала удар, потом вопросы.',
    col: '#7fb95c',
    skills: [
      'rog_sneak',
      'rog_poison',
      'rog_dance',
      'rog_fan',
      'rog_eviscerate',
      'rog_mark'
    ]
  },

  ran: {
    name: 'Следопыт',
    icon: '🏹',
    desc: 'Стрела находит цель даже в тумане.',
    col: '#c9b458',
    skills: [
      'ran_aimed',
      'ran_trap',
      'ran_hawk',
      'ran_rain',
      'ran_pierce',
      'ran_barrage'
    ]
  },

  pal: {
    name: 'Паладин',
    icon: '🛡️',
    desc: 'Лечит себя верой, врагов — молотом.',
    col: '#f0cf8a',
    skills: [
      'pal_smite',
      'pal_shield',
      'pal_judgement',
      'pal_dawn',
      'pal_consecrate',
      'pal_aegis'
    ]
  }
};

var GROW = {
  war: { str: 1.2, vit: 0.9, dex: 0.3, int: 0.1 },
  mage: { int: 1.2, vit: 0.5, dex: 0.3, str: 0.1 },
  rog: { dex: 1.2, str: 0.5, vit: 0.4, int: 0.1 },
  ran: { dex: 1.0, str: 0.6, vit: 0.5, int: 0.2 },
  pal: { str: 1.0, vit: 1.0, int: 0.4, dex: 0.2 }
};