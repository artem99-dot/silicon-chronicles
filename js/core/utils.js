'use strict';

window.addEventListener('error', function(e) {
  var el = document.getElementById('err');

  if (el) {
    el.style.display = 'block';
    el.textContent = 'Ошибка: ' + (e.message || '?') + (e.lineno ? ' (стр. ' + e.lineno + ')' : '');
  }
});

function showErr(m) {
  var el = document.getElementById('err');

  if (el) {
    el.style.display = 'block';
    el.textContent = 'Ошибка: ' + m;
  }
}

function $(id) {
  return document.getElementById(id);
}

function R(a, b) {
  return a + Math.random() * (b - a);
}

function RI(a, b) {
  return Math.floor(R(a, b + 1));
}

function P(a) {
  return a[RI(0, a.length - 1)];
}

function fmt(n) {
  var v = Math.floor(Number(n));
  return isNaN(v) ? '0' : v.toLocaleString('ru-RU');
}

var UID = 0;

function uid() {
  UID++;
  return 'x' + UID + Math.random().toString(36).slice(2, 5);
}

function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;

    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;

    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  var a = arr.slice();

  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor((rng || Math.random)() * (i + 1));
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
  }

  return a;
}

function now() {
  return Date.now();
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

window.MODNAMES = window.MODNAMES || {
  str: 'Сила',
  dex: 'Ловкость',
  int: 'Интеллект',
  vit: 'Выносливость',
  luk: 'Удача',
  hp: 'Макс. ОЗ',
  mp: 'Мана',
  phys: 'Физ. урон',
  spell: 'Сила чар',
  dmg: 'Урон',
  crit: 'Шанс крита',
  critd: 'Крит. урон',
  armor: 'Броня',
  evade: 'Уклонение',
  leech: 'Кража жизни',
  gf: 'Золото',
  mf: 'Поиск лута',
  xp: 'Опыт',
  spd: 'Скорость',
  regen: 'Реген',
  healPow: 'Сила зелий',
  resall: 'Все сопротивления',
  resfire: 'Сопр. огню',
  respoison: 'Сопр. яду',
  resice: 'Сопр. льду',
  reslight: 'Сопр. молнии',
  resshadow: 'Сопр. тьме'
};

function modStr(k, v) {
  var name = window.MODNAMES[k] || k;
  return name + ' +' + v;
}