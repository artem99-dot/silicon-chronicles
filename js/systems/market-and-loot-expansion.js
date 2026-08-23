'use strict';

(function () {

  /* =====================================================
     0. ОПРЕДЕЛЯЕМ, ЕСТЬ ЛИ УЖЕ СИСТЕМА СЕТОВ/ПИТОМЦЕВ
     ===================================================== */

  var hadSets = !!window.SETS;
  var hadPets = !!window.PETS;

  window.SETS = window.SETS || {};
  window.SET_ITEMS = window.SET_ITEMS || [];
  window.PETS = window.PETS || [];

  window.MARKET_SET_ITEMS = window.MARKET_SET_ITEMS || [];
  window.SHOP_PETS = window.SHOP_PETS || [];

  function ensureHero() {
    if (!window.S || !S.hero) return;

    if (!S.hero.pets) {
      S.hero.pets = [];
    }

    if (S.hero.activePet === undefined) {
      S.hero.activePet = null;
    }

    if (!S.ui) {
      S.ui = {};
    }
  }

  /* =====================================================
     1. НОВЫЕ СЕТЫ: НАЧАЛО И СЕРЕДИНА ИГРЫ
     ===================================================== */

  SETS.mx_scavenger = {
    nm: 'Промысловик',
    icon: '🧵',
    bonuses: {
      2: {
        gf: 10,
        xpB: 5
      },
      4: {
        dmgAll: 6,
        mf: 10
      }
    }
  };

  SETS.mx_iron = {
    nm: 'Железный авангард',
    icon: '🛡️',
    bonuses: {
      2: {
        armorPct: 12,
        hpPct: 8
      },
      4: {
        dmgAll: 10,
        crit: 5
      }
    }
  };

  var newSetItems = [
    /* Промысловик — ранний сет */
    {
      id: 'mx_scav_weapon',
      set: 'mx_scavenger',
      nm: 'Ржавый клинок промысловика',
      slot: 'weapon',
      icon: '🗡️',
      lvl: 5,
      bd: [8, 12],
      mods: { dmg: 3, gf: 3 },
      spd: 'Входит в сет «Промысловик»',
      price: 650
    },

    {
      id: 'mx_scav_armor',
      set: 'mx_scavenger',
      nm: 'Куртка промысловика',
      slot: 'armor',
      icon: '🧥',
      lvl: 5,
      arm: 8,
      mods: { hp: 6, gf: 4 },
      spd: 'Входит в сет «Промысловик»',
      price: 600
    },

    {
      id: 'mx_scav_helmet',
      set: 'mx_scavenger',
      nm: 'Капюшон промысловика',
      slot: 'helmet',
      icon: '🧢',
      lvl: 5,
      arm: 5,
      mods: { mf: 5, mp: 8 },
      spd: 'Входит в сет «Промысловик»',
      price: 500
    },

    {
      id: 'mx_scav_boots',
      set: 'mx_scavenger',
      nm: 'Сапоги промысловика',
      slot: 'boots',
      icon: '🥾',
      lvl: 5,
      arm: 4,
      mods: { spd: 4, xp: 4 },
      spd: 'Входит в сет «Промысловик»',
      price: 500
    },

    /* Железный авангард — средний сет */
    {
      id: 'mx_iron_weapon',
      set: 'mx_iron',
      nm: 'Молот авангарда',
      slot: 'weapon',
      icon: '🔨',
      lvl: 14,
      bd: [20, 28],
      mods: { dmg: 8, str: 4 },
      spd: 'Входит в сет «Железный авангард»',
      price: 1800
    },

    {
      id: 'mx_iron_armor',
      set: 'mx_iron',
      nm: 'Латы авангарда',
      slot: 'armor',
      icon: '🛡️',
      lvl: 14,
      arm: 24,
      mods: { hp: 12, vit: 5 },
      spd: 'Входит в сет «Железный авангард»',
      price: 1700
    },

    {
      id: 'mx_iron_helmet',
      set: 'mx_iron',
      nm: 'Шлем авангарда',
      slot: 'helmet',
      icon: '🪖',
      lvl: 14,
      arm: 14,
      mods: { armor: 8, crit: 3 },
      spd: 'Входит в сет «Железный авангард»',
      price: 1500
    },

    {
      id: 'mx_iron_gloves',
      set: 'mx_iron',
      nm: 'Рукавицы авангарда',
      slot: 'gloves',
      icon: '🧤',
      lvl: 14,
      arm: 10,
      mods: { critd: 12, str: 3 },
      spd: 'Входит в сет «Железный авангард»',
      price: 1400
    }
  ];

  newSetItems.forEach(function (tpl) {
    var alreadyMarket = MARKET_SET_ITEMS.some(function (x) {
      return x.id === tpl.id;
    });

    if (!alreadyMarket) {
      MARKET_SET_ITEMS.push(tpl);
    }

    var alreadySetPool = SET_ITEMS.some(function (x) {
      return x.nm === tpl.nm;
    });

    if (!alreadySetPool) {
      SET_ITEMS.push(tpl);
    }
  });

  /* =====================================================
     2. МАГАЗИННЫЕ ПИТОМЦЫ
     ===================================================== */

  var shopPets = [
    {
      id: 'gilded_crow',
      nm: 'Золочёная ворона',
      icon: '🐦',
      ds: 'Таскает блестящее и иногда возвращается.',
      bonus: {
        gf: 12,
        mf: 8
      },
      price: 18000
    },

    {
      id: 'basalt_turtle',
      nm: 'Базальтовая черепаха',
      icon: '🐢',
      ds: 'Медленная, но почти неразрушимая.',
      bonus: {
        armorPct: 12,
        hpPct: 10
      },
      price: 24000
    }
  ];

  shopPets.forEach(function (p) {
    var inPets = PETS.some(function (x) {
      return x.id === p.id;
    });

    if (!inPets) {
      PETS.push(p);
    }

    var inShop = SHOP_PETS.some(function (x) {
      return x.id === p.id;
    });

    if (!inShop) {
      SHOP_PETS.push(p);
    }
  });

  /* =====================================================
     3. БОЛЬШЕ ЛУТА: НОВЫЕ УНИКАЛЫ
     ===================================================== */

  var newUniques = [
    /* Ранние */
    {
      nm: 'Клык новичка',
      slot: 'weapon',
      icon: '🗡️',
      lvl: 3,
      bd: [7, 10],
      mods: { phys: 4, crit: 2 },
      spd: 'Проще некуда, но режет.'
    },

    {
      nm: 'Оберег из бересты',
      slot: 'amulet',
      icon: '📿',
      lvl: 3,
      mods: { hp: 6, vit: 2 },
      spd: 'Пахнет дымом и дорогой.'
    },

    {
      nm: 'Медное кольцо старателя',
      slot: 'ring',
      icon: '💍',
      lvl: 4,
      mods: { gf: 8, xp: 4 },
      spd: 'Приносит мелкую удачу.'
    },

    {
      nm: 'Шапка рудокопа',
      slot: 'helmet',
      icon: '🪖',
      lvl: 6,
      arm: 7,
      mods: { mf: 8, vit: 2 },
      spd: 'С ней меньше бьют по голове.'
    },

    {
      nm: 'Наручи охотника',
      slot: 'gloves',
      icon: '🧤',
      lvl: 6,
      arm: 5,
      mods: { crit: 3, dex: 2 },
      spd: 'Рука сама ищет слабое место.'
    },

    /* Средние */
    {
      nm: 'Клинок серого наёмника',
      slot: 'weapon',
      icon: '⚔️',
      lvl: 10,
      bd: [16, 24],
      mods: { dmg: 8, crit: 4 },
      spd: 'Не задаёт вопросов.'
    },

    {
      nm: 'Кольчуга ветерана',
      slot: 'armor',
      icon: '🛡️',
      lvl: 11,
      arm: 18,
      mods: { hp: 12, vit: 4 },
      spd: 'Помнит не одну осаду.'
    },

    {
      nm: 'Сапоги пепельного ветра',
      slot: 'boots',
      icon: '🥾',
      lvl: 12,
      arm: 9,
      mods: { spd: 10, evade: 5 },
      spd: 'Пепел не успевает за тобой.'
    },

    {
      nm: 'Амулет старой шахты',
      slot: 'amulet',
      icon: '📿',
      lvl: 12,
      mods: { mf: 12, gf: 10, int: 3 },
      spd: 'Тёмные штольни шепчут о золоте.'
    },

    {
      nm: 'Перчатки кровавого обета',
      slot: 'gloves',
      icon: '🧤',
      lvl: 13,
      arm: 9,
      mods: { critd: 20, leech: 3 },
      spd: 'Клятва, написанная не чернилами.'
    },

    /* Позже */
    {
      nm: 'Кольцо пепельной вдовы',
      slot: 'ring',
      icon: '💍',
      lvl: 18,
      mods: { crit: 6, critd: 18, int: 4 },
      spd: 'Она ждала. И не дождалась.'
    },

    {
      nm: 'Плащ последнего часа',
      slot: 'armor',
      icon: '🧥',
      lvl: 20,
      arm: 26,
      mods: { hp: 18, armor: 12, spd: 5 },
      spd: 'Тянет время перед концом.'
    }
  ];

  if (window.UNIQUES) {
    newUniques.forEach(function (u) {
      var exists = UNIQUES.some(function (x) {
        return x.nm === u.nm;
      });

      if (!exists) {
        UNIQUES.push(u);
      }
    });
  }

  /* =====================================================
     4. НОВЫЕ АФФИКСЫ И ЛЕГЕНДАРНЫЕ ИМЕНА
     ===================================================== */

  function addAffix(arr, obj) {
    if (!arr) return;

    var exists = arr.some(function (a) {
      return a.k === obj.k && a.n === obj.n;
    });

    if (!exists) {
      arr.push(obj);
    }
  }

  addAffix(window.PRE, {
    n: 'Восстанавливающий',
    k: 'regen',
    v: [1, 3]
  });

  addAffix(window.SUF, {
    n: 'быка',
    k: 'hp',
    v: [4, 10]
  });

  addAffix(window.SUF2, {
    n: 'всепоглощения',
    k: 'resall',
    v: [2, 5]
  });

  if (window.LEGN) {
    var newLegn = [
      'Клятва Промысловика',
      'Сталь Авангарда',
      'Серая дорога',
      'Пепельная сделка',
      'Ветер над шахтой',
      'Железная тишина'
    ];

    newLegn.forEach(function (n) {
      if (LEGN.indexOf(n) < 0) {
        LEGN.push(n);
      }
    });
  }

  /* =====================================================
     5. ЕСЛИ НЕТ СТАРОЙ СИСТЕМЫ СЕТОВ/ПИТОМЦЕВ,
        ДОБАВЛЯЕМ МИНИМАЛЬНЫЙ РАСЧЁТ
     ===================================================== */

  var MX_LABELS = {
    gf: '% золота',
    xpB: '% опыта',
    mf: '% поиска лута',
    dmgAll: '% урона',
    armorPct: '% брони',
    hpPct: '% ОЗ',
    crit: '% крит',
    critd: '% крит. урона',
    spd: '% скорости',
    leech: '% кражи жизни',
    regen: '% регена',
    mpAdd: 'макс. маны'
  };

  function mxBonusText(bonus) {
    if (!bonus) return '';

    return Object.keys(bonus)
      .map(function (k) {
        return '+' + bonus[k] + ' ' + (MX_LABELS[k] || k);
      })
      .join(', ');
  }

  function mxApplyBonus(o, bonus) {
    if (!o || !bonus) return;

    Object.keys(bonus).forEach(function (k) {
      var v = bonus[k];

      if (k === 'hpPct') {
        var oldHpPct = o.hpPct || 0;

        o.hpPct = oldHpPct + v;

        var ratio = (1 + o.hpPct / 100) / (1 + oldHpPct / 100);

        o.maxhp = Math.max(10, Math.round((o.maxhp || 10) * ratio));

        if (window.S && S.hero) {
          S.hero.hp = Math.min(S.hero.hp, o.maxhp);
        }
      } else if (k === 'mpAdd') {
        o.mpAdd = (o.mpAdd || 0) + v;
        o.maxmp = (o.maxmp || 0) + v;

        if (window.S && S.hero) {
          S.hero.mp = Math.min(S.hero.mp, o.maxmp);
        }
      } else if (k === 'dmgAll') {
        var oldDmgAll = o.dmgAll || 0;

        o.dmgAll = oldDmgAll + v;

        var factor = (1 + o.dmgAll / 100) / (1 + oldDmgAll / 100);

        o.dmgMin = Math.max(1, Math.round((o.dmgMin || 1) * factor));
        o.dmgMax = Math.max(o.dmgMin + 1, Math.round((o.dmgMax || 2) * factor));
        o.spellPow = Math.max(1, Math.round((o.spellPow || 1) * factor));
      } else if (k === 'armorPct') {
        o.armorPct = (o.armorPct || 0) + v;
        o.armor = Math.max(0, Math.round((o.armor || 0) * (1 + v / 100)));
      } else {
        o[k] = (o[k] || 0) + v;
      }
    });
  }

  if (!hadSets && !hadPets) {
    var oldCalcStats = window.calcStats;

    if (typeof oldCalcStats === 'function') {
      window.calcStats = function () {
        var o = oldCalcStats.apply(this, arguments);

        if (!o || !window.S || !S.hero) {
          return o;
        }

        ensureHero();

        var counts = {};

        Object.values(S.hero.eq)
          .filter(Boolean)
          .forEach(function (it) {
            if (it.set) {
              counts[it.set] = (counts[it.set] || 0) + 1;
            }
          });

        Object.keys(SETS).forEach(function (setId) {
          var set = SETS[setId];
          var cnt = counts[setId] || 0;

          Object.keys(set.bonuses || {}).forEach(function (need) {
            if (cnt >= parseInt(need, 10)) {
              mxApplyBonus(o, set.bonuses[need]);
            }
          });
        });

        if (S.hero.activePet) {
          var pet = null;

          for (var i = 0; i < PETS.length; i++) {
            if (PETS[i].id === S.hero.activePet) {
              pet = PETS[i];
              break;
            }
          }

          if (pet) {
            mxApplyBonus(o, pet.bonus);
          }
        }

        S.cs = o;

        return o;
      };
    }
  }

  /* =====================================================
     6. КОНТЕКСТ ДЛЯ ЛУТА
     ===================================================== */

  function mxContext() {
    if (window.__mx_chestCtx) {
      return {
        kind: 'chest',
        zi: window.__mx_chestCtx.zi,
        locked: window.__mx_chestCtx.locked
      };
    }

    if (window.COM && COM.e && COM.ctx) {
      return {
        kind: COM.e.boss ? 'boss' : COM.e.elite ? 'elite' : 'mob',
        zi: COM.ctx.zi || 0
      };
    }

    if (window.RUN) {
      return {
        kind: 'run',
        zi: RUN.zi || 0
      };
    }

    return {
      kind: 'other'
    };
  }

  var oldOpenChest = window.openChest;

  if (typeof oldOpenChest === 'function') {
    window.openChest = function (r, locked) {
      window.__mx_chestCtx = {
        zi: window.RUN ? RUN.zi : 0,
        locked: !!locked,
        rolled: false
      };

      var result = oldOpenChest.apply(this, arguments);

      window.__mx_chestCtx = null;

      return result;
    };
  }

  /* =====================================================
     7. БАЛАНС УНИКАЛЬНОГО ЛУТА ПО УРОВНЮ ЗОНЫ
     ===================================================== */

  var oldMakeUnique = window.makeUnique;

  if (typeof oldMakeUnique === 'function') {
    window.makeUnique = function (u) {
      if (u && !u.set && window.UNIQUES && window.ZONES) {
        var ctx = mxContext();

        if (ctx && typeof ctx.zi === 'number' && ZONES[ctx.zi]) {
          var maxLvl = ZONES[ctx.zi].lv + 8;

          if (u.lvl > maxLvl) {
            var eligible = UNIQUES.filter(function (x) {
              return !x.set && x.lvl <= maxLvl;
            });

            if (eligible.length) {
              u = P(eligible);
            }
          }
        }
      }

      return oldMakeUnique(u);
    };
  }

  /* =====================================================
     8. ДРОП РАННИХ И СРЕДНИХ СЕТОВ
     ===================================================== */

  function ownsSetPiece(setId, slot) {
    if (!window.S || !S.hero) return false;

    var all = S.hero.inv.concat(
      Object.values(S.hero.eq).filter(Boolean)
    );

    for (var i = 0; i < all.length; i++) {
      var it = all[i];

      if (it && it.set === setId && it.slot === slot) {
        return true;
      }
    }

    return false;
  }

  var baseAddItem = window.addItem;

  function grantSetPiece(setId, src) {
    if (!window.S || !S.hero) return;

    var candidates = MARKET_SET_ITEMS.filter(function (tpl) {
      return tpl.set === setId && !ownsSetPiece(setId, tpl.slot);
    });

    if (!candidates.length) return;

    var tpl = P(candidates);

    setTimeout(function () {
      window.__mxGranting = true;

      try {
        var it = makeUnique(tpl);

        it.set = tpl.set;
        it.__guaranteed = true;

        if (typeof baseAddItem === 'function') {
          baseAddItem(it, src);
        }

        if (window.RUN && window.MAP && typeof renderDungeon === 'function') {
          renderDungeon();
        } else if (!window.COM && typeof renderTown === 'function') {
          renderTown();
        }

        if (typeof renderTop === 'function') {
          renderTop();
        }
      } finally {
        window.__mxGranting = false;
      }
    }, 0);
  }

  function maybeMxSetDrop(ctx, src) {
    if (!ctx || ctx.kind === 'other') return;

    var setId = null;
    var chance = 0;
    var zi = ctx.zi || 0;

    if (zi <= 2) {
      setId = 'mx_scavenger';
    } else if (zi <= 4) {
      setId = 'mx_iron';
    } else {
      return;
    }

    if (ctx.kind === 'boss') {
      chance = 0.06;
    } else if (ctx.kind === 'elite') {
      chance = 0.012;
    } else if (ctx.kind === 'chest') {
      chance = ctx.locked ? 0.04 : 0.008;
    } else {
      return;
    }

    if (Math.random() >= chance) return;

    grantSetPiece(setId, src);
  }

  if (typeof baseAddItem === 'function') {
    window.addItem = function (it, src) {
      if (!window.__mxGranting && window.S && it) {
        var ctx = mxContext();

        if (ctx.kind !== 'other') {
          if (ctx.kind === 'boss' && window.COM) {
            if (!COM.__mxSetRolled) {
              COM.__mxSetRolled = true;
              maybeMxSetDrop(ctx, src);
            }
          } else if (ctx.kind === 'elite' && window.COM) {
            if (!COM.__mxSetRolled) {
              COM.__mxSetRolled = true;
              maybeMxSetDrop(ctx, src);
            }
          } else if (ctx.kind === 'chest' && window.__mx_chestCtx) {
            if (!window.__mx_chestCtx.rolled) {
              window.__mx_chestCtx.rolled = true;
              maybeMxSetDrop(ctx, src);
            }
          }
        }
      }

      return baseAddItem.apply(this, arguments);
    };
  }

  /* =====================================================
     9. БАЛАНС МАГАЗИНА
     ===================================================== */

  var oldStockPrice = window.stockPrice;

  window.stockPrice = function (it) {
    var p;

    if (typeof oldStockPrice === 'function') {
      p = oldStockPrice.apply(this, arguments);
    } else {
      p = Math.round(sellPrice(it) * 2.5);
    }

    if (window.S && S.hero) {
      p *= 1 + S.hero.lvl * 0.02;
    }

    if (it && it.set) {
      p *= 2.2;
    }

    if (it && it.unique) {
      p *= 1.4;
    }

    return Math.round(p);
  };

  window.refreshStock = function () {
    if (!window.S) return;

    var cost = 40 + S.hero.lvl * 4;

    if (S.gold < cost) {
      toast('Нужно ' + fmt(cost) + ' 🪙');
      return;
    }

    S.gold -= cost;
    S.shopStock = genShopStock();

    log('🛒 Новый товар.', 'sys');

    save();
    renderTown();
    renderTop();
  };

  /* =====================================================
     10. ПОКУПКА ПИТОМЦЕВ И СЕТОВ
     ===================================================== */

  window.buyShopPet = function (id) {
    ensureHero();

    var pet = null;

    for (var i = 0; i < SHOP_PETS.length; i++) {
      if (SHOP_PETS[i].id === id) {
        pet = SHOP_PETS[i];
        break;
      }
    }

    if (!pet) return;

    if (S.hero.pets.indexOf(id) >= 0) {
      toast('Питомец уже куплен');
      return;
    }

    if (S.gold < pet.price) {
      toast('Не хватает золота');
      return;
    }

    S.gold -= pet.price;
    S.hero.pets.push(id);

    if (!S.hero.activePet) {
      S.hero.activePet = id;
    }

    S.cs = null;

    if (typeof calcStats === 'function') {
      calcStats();
    }

    toast('🐾 Питомец куплен: ' + pet.nm + '!');
    log('🐾 Питомец: <b>' + pet.nm + '</b>', 'good');

    save();
    renderTown();
    renderTop();
  };

  window.mxTogglePet = function (id) {
    ensureHero();

    if (S.hero.pets.indexOf(id) < 0) return;

    if (S.hero.activePet === id) {
      S.hero.activePet = null;
      log('🐾 Питомец убран.', 'sys');
    } else {
      S.hero.activePet = id;

      var pet = null;

      for (var i = 0; i < PETS.length; i++) {
        if (PETS[i].id === id) {
          pet = PETS[i];
          break;
        }
      }

      log('🐾 Питомец выбран: <b>' + (pet ? pet.nm : id) + '</b>', 'good');
    }

    S.cs = null;

    if (typeof calcStats === 'function') {
      calcStats();
    }

    save();
    renderTown();
    renderTop();
  };

  window.mxBuySetPiece = function (id) {
    ensureHero();

    var tpl = null;

    for (var i = 0; i < MARKET_SET_ITEMS.length; i++) {
      if (MARKET_SET_ITEMS[i].id === id) {
        tpl = MARKET_SET_ITEMS[i];
        break;
      }
    }

    if (!tpl) return;

    if (ownsSetPiece(tpl.set, tpl.slot)) {
      toast('Эта часть сета уже есть');
      return;
    }

    if (S.hero.lvl < tpl.lvl) {
      toast('Нужен уровень ' + tpl.lvl);
      return;
    }

    if (S.gold < tpl.price) {
      toast('Не хватает золота');
      return;
    }

    S.gold -= tpl.price;

    var it = makeUnique(tpl);

    it.set = tpl.set;
    it.__guaranteed = true;

    addItem(it, 'рынок');

    save();
    renderTown();
    renderTop();
  };

  /* =====================================================
     11. UI МАГАЗИНА
     ===================================================== */

  function mxPetShopHtml() {
    if (!window.S) return '';

    ensureHero();

    var html =
      '<div class="panel">' +
      '<h2 style="font-size:20px;color:var(--gold2)">🐾 Питомцы Гильдии</h2>' +
      '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
      'Редкие спутники. Цена велика, но они остаются навсегда.' +
      '</div>';

    SHOP_PETS.forEach(function (p) {
      var owned = S.hero.pets.indexOf(p.id) >= 0;
      var active = S.hero.activePet === p.id;

      html +=
        '<div class="item" style="border-left-color:' + (owned ? '#7fb95c' : '#d3a44c') + '">' +
        '<span style="font-size:24px">' + p.icon + '</span>' +
        '<div style="flex:1">' +
        '<span class="nm" style="color:var(--gold2)">' + p.nm + '</span>' +
        '<div class="ds">' + p.ds + '</div>' +
        '<div class="af">' + mxBonusText(p.bonus) + '</div>' +
        '</div>' +
        '<div style="text-align:right;min-width:130px">';

      if (!owned) {
        html +=
          '<div class="eq">🪙 ' + fmt(p.price) + '</div>' +
          '<button class="btn small gold" onclick="buyShopPet(\'' + p.id + '\')">Купить</button>';
      } else if (active) {
        html +=
          '<div class="eq" style="color:#9fe08f">Активен</div>' +
          '<button class="btn small" onclick="mxTogglePet(\'' + p.id + '\')">Убрать</button>';
      } else {
        html +=
          '<div class="eq">Куплен</div>' +
          '<button class="btn small gold" onclick="mxTogglePet(\'' + p.id + '\')">Выбрать</button>';
      }

      html += '</div></div>';
    });

    html += '</div>';

    return html;
  }

  function mxSetShopHtml() {
    if (!window.S) return '';

    ensureHero();

    var shopSetIds = ['mx_scavenger', 'mx_iron'];

    var html =
      '<div class="panel">' +
      '<h2 style="font-size:20px;color:var(--gold2)">🧩 Сеты для начала и середины игры</h2>' +
      '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
      'Можно купить здесь или редко найти в соответствующих землях. ' +
      'Бонус работает за 2 и 4 предмета.' +
      '</div>';

    shopSetIds.forEach(function (setId) {
      var set = SETS[setId];

      if (!set) return;

      var pieces = MARKET_SET_ITEMS.filter(function (tpl) {
        return tpl.set === setId;
      });

      html +=
        '<div style="border:1px solid var(--lin);padding:10px;margin-top:10px">' +
        '<b style="color:var(--gold2)">' + set.icon + ' ' + set.nm + '</b>' +
        '<div style="font-size:12px;color:var(--dim);margin:4px 0">';

      Object.keys(set.bonuses || {}).forEach(function (need) {
        html +=
          '<div>(' + need + '): ' + mxBonusText(set.bonuses[need]) + '</div>';
      });

      html += '</div>';

      pieces.forEach(function (tpl) {
        var owned = ownsSetPiece(tpl.set, tpl.slot);
        var lockedByLevel = S.hero.lvl < tpl.lvl;

        html +=
          '<div class="item" style="border-left-color:#d3a44c">' +
          '<span style="font-size:20px">' + tpl.icon + '</span>' +
          '<div style="flex:1">' +
          '<span class="nm" style="color:var(--gold2)">' + tpl.nm + '</span>' +
          '<div class="ds">' +
          (SLOTN[tpl.slot] || tpl.slot) + ' · ур. ' + tpl.lvl +
          (tpl.baseDmg ? ' · ⚔ ' + tpl.bd[0] + '–' + tpl.bd[1] : '') +
          (tpl.arm ? ' · 🛡 ' + tpl.arm : '') +
          '</div>' +
          '<div class="af">' +
          Object.keys(tpl.mods || {})
            .map(function (k) {
              return modStr(k, tpl.mods[k]);
            })
            .join(' · ') +
          '</div>' +
          '</div>' +
          '<div style="text-align:right;min-width:120px">';

        if (owned) {
          html += '<div class="eq" style="color:#9fe08f">Есть</div>';
        } else {
          html +=
            '<div class="eq">🪙 ' + fmt(tpl.price) + '</div>' +
            '<button class="btn small gold" onclick="mxBuySetPiece(\'' + tpl.id + '\')" ' +
            (lockedByLevel ? 'disabled title="Нужен уровень ' + tpl.lvl + '"' : '') +
            '>Купить</button>';
        }

        html += '</div></div>';
      });

      html += '</div>';
    });

    html += '</div>';

    return html;
  }

  var oldTownMarket = window.townMarket;

  if (typeof oldTownMarket === 'function') {
    window.townMarket = function () {
      var html = oldTownMarket.apply(this, arguments);

      return html + mxPetShopHtml() + mxSetShopHtml();
    };
  }

  /* =====================================================
     12. НОРМАЛИЗАЦИЯ СОХРАНЕНИЙ
     ===================================================== */

  var oldNormalizeSave = window.normalizeSave;

  if (typeof oldNormalizeSave === 'function') {
    window.normalizeSave = function () {
      var result = oldNormalizeSave.apply(this, arguments);

      ensureHero();

      return result;
    };
  }

  var oldStartGame = window.startGame;

  if (typeof oldStartGame === 'function') {
    window.startGame = function () {
      var result = oldStartGame.apply(this, arguments);

      ensureHero();

      return result;
    };
  }

})();