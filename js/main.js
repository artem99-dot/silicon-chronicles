'use strict';

function normalizeSave() {
  while (S.hero.keys.length < 8) {
    S.hero.keys.push(0);
  }

  while (S.hero.sigils.length < 8) {
    S.hero.sigils.push(0);
  }

  if (!S.hero.gems) {
    S.hero.gems = {};
  }

  Object.keys(S.hero.gems).forEach(function(k) {
    if (typeof S.hero.gems[k] === 'number') {
      S.hero.gems[k] = {
        n: S.hero.gems[k],
        lv: 1
      };
    }
  });

  if (!S.hero.elix) {
    S.hero.elix = {
      rage: 0,
      stone: 0,
      swift: 0
    };
  }

  if (!S.hero.troph) {
    S.hero.troph = {};
  }

  if (!S.hero.bonus) {
    S.hero.bonus = {
      str: 0,
      dex: 0,
      int: 0,
      vit: 0,
      luk: 0
    };
  }

  if (S.hero.sp === undefined) {
    S.hero.sp = 3 * Math.max(0, S.hero.lvl - 1);
  }

  if (!S.hero.talloc) {
    S.hero.talloc = {
      origin: true,
      r_0_1: true
    };
  }

  if (!S.hero.titles) {
    S.hero.titles = {
      novice: 1
    };
  }

  if (!S.hero.title) {
    S.hero.title = 'novice';
  }

  if (S.hero.enhOk === undefined) S.hero.enhOk = 0;
  if (S.hero.gamesWon === undefined) S.hero.gamesWon = 0;
  if (S.hero.meals === undefined) S.hero.meals = 0;

  if (S.arenaBest === undefined) S.arenaBest = 0;
  if (S.lastRank === undefined) S.lastRank = 0;
  if (!S.timed) S.timed = [];

  if (!S.board || !S.board.orders) {
    S.board = {
      orders: [
        genOrder(),
        genOrder(),
        genOrder(),
        genOrder(),
        genOrder(),
        genOrder()
      ]
    };
  }

  while (S.board.orders.length < 6) {
    S.board.orders.push(genOrder());
  }

  S.hero.prot = S.hero.prot || 0;
  S.lastZi = S.lastZi || 0;

  if (!S.town) {
    S.town = 'plaza';
  }

  Object.values(S.hero.eq)
    .filter(Boolean)
    .concat(S.hero.inv)
    .forEach(function(it) {
      if (!it.gems) it.gems = [];
      if (it.sockets === undefined) it.sockets = 0;
    });
}

function renderAll() {
  try {
    renderTop();
    renderLog();
    renderTown();
  } catch (e) {
    showErr('renderAll: ' + e.message);
    console.error(e);
  }
}

function initGame() {
  var sv = null;

  try {
    sv = localStorage.getItem('AS3');
  } catch (e) {}

  if (sv) {
    try {
      S = JSON.parse(sv);

      S.ui = S.ui || {
        mapPage: 0
      };

      S.log = S.log || [];

      S.hero.pots = S.hero.pots || {
        hp: 0,
        mp: 0
      };

      normalizeSave();
      buildClassTree();

      S.cs = null;
      calcStats();

      if (!S.shopStock || !S.shopStock.length) {
        S.shopStock = genShopStock();
      }

      $('create').style.display = 'none';
      $('app').style.display = 'block';

      log('Летопись продолжается.', 'sys');

      renderAll();
    } catch (e) {
      showErr('load: ' + e.message);
      console.error(e);
      renderCreate();
    }
  } else {
    renderCreate();
  }
}

try {
  renderCreate();
} catch (e) {
  showErr('create: ' + e.message);
  console.error(e);
}

try {
  initGame();
} catch (e) {
  showErr('boot: ' + e.message);
  console.error(e);
}