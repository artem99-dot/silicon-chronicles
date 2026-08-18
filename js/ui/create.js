'use strict';

function renderCreate() {
  var rg = $('racegrid');
  var cg = $('classgrid');
  var cs2 = $('csum');

  if (!rg || !cg) {
    showErr('Не найдены элементы #racegrid/#classgrid');
    return;
  }

  rg.innerHTML = Object.keys(RACES).map(function(k) {
    var r = RACES[k];

    return (
      '<div class="selcard' + (selR === k ? ' on' : '') + '" onclick="selR=\'' + k + '\';renderCreate()">' +
      '<h4>' + r.icon + ' ' + r.name + '</h4>' +
      '<p>' + r.desc + '</p>' +
      '<div class="bn">✦ ' + r.trait + '</div>' +
      '</div>'
    );
  }).join('');

  cg.innerHTML = Object.keys(CLASSES).map(function(k) {
    var c = CLASSES[k];

    return (
      '<div class="selcard' + (selC === k ? ' on' : '') + '" onclick="selC=\'' + k + '\';renderCreate()">' +
      '<h4>' + c.icon + ' ' + c.name + '</h4>' +
      '<p>' + c.desc + '</p>' +
      '<div class="bn">Умения: ' +
      c.skills.slice(0, 3).map(function(s) {
        return SKILLDB[s].n;
      }).join(', ') +
      ' — и другие в древе</div>' +
      '</div>'
    );
  }).join('');

  if (cs2) {
    cs2.innerHTML =
      'Выбор: <b style="color:var(--gold)">' +
      RACES[selR].name + ' ' + CLASSES[selC].name +
      '</b>. За уровни — очки навыков и характеристик.';
  }
}

function startGame() {
  var name = ($('cname').value.trim() || 'Безымянный');
  var safeName = escapeHtml(name);

  S = {
    town: 'plaza',
    gold: 60,
    frag: 2,
    buff: null,
    log: [],
    ui: {
      mapPage: 0
    },
    lastZi: 0,
    arenaBest: 0,
    lastRank: 0,
    timed: [],

    hero: {
      name: name,
      race: selR,
      cls: selC,
      lvl: 1,
      xp: 0,
      pts: 1,
      sp: 0,
      hp: 1,
      mp: 1,
      kills: 0,
      dungeons: 0,
      bosses: {},
      gamesWon: 0,
      meals: 0,
      inv: [],
      eq: {},
      talloc: {
        origin: true,
        r_0_1: true
      },
      bonus: {
        str: 0,
        dex: 0,
        int: 0,
        vit: 0,
        luk: 0
      },
      pots: {
        hp: 2,
        mp: 1
      },
      prot: 0,
      troph: {},
      gems: {},
      elix: {
        rage: 0,
        stone: 0,
        swift: 0
      },
      enhOk: 0,
      keys: [0, 0, 0, 0, 0, 0, 0, 0],
      sigils: [0, 0, 0, 0, 0, 0, 0, 0],
      titles: {
        novice: 1
      },
      title: 'novice'
    }
  };

  buildClassTree();
  calcStats();

  S.hero.hp = S.cs.maxhp;
  S.hero.mp = S.cs.maxmp;

  S.hero.eq.weapon = genItem(1, 0, 1, ['weapon']);
  S.hero.eq.armor = genItem(1, 0, 1, ['armor']);

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

  S.shopStock = genShopStock();

  $('create').style.display = 'none';
  $('app').style.display = 'block';

  log(
    '⚜ <b>' + safeName + '</b>, ' +
    RACES[selR].name.toLowerCase() + ' ' +
    CLASSES[selC].name.toLowerCase() +
    ', входит в Грейхолд.',
    'story'
  );

  log(
    'Совет: распредели очки в <b>Герое</b> и <b>древе</b>, ' +
    'возьми заказ в <b>Гильдии</b>, поешь в <b>Таверне</b>, ' +
    'затем иди в «Логово стаи». Босс ждёт в конце данжа — ' +
    'сигил не нужен, если идёшь сам.',
    'sys'
  );

  save();
  renderAll();
}