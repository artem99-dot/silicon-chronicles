'use strict';

(function () {

  /* =====================================================
     0. ПОДГОТОВКА ДАННЫХ И СОХРАНЕНИЙ
     ===================================================== */

  function ensureHeroExtras() {
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

  var oldNormalizeSave = window.normalizeSave;

  if (typeof oldNormalizeSave === 'function') {
    window.normalizeSave = function () {
      var r = oldNormalizeSave.apply(this, arguments);
      ensureHeroExtras();
      return r;
    };
  }

  var oldStartGame = window.startGame;

  if (typeof oldStartGame === 'function') {
    window.startGame = function () {
      var r = oldStartGame.apply(this, arguments);
      ensureHeroExtras();
      save();
      return r;
    };
  }

  /* =====================================================
     1. makeUnique должен сохранять поле set
     ===================================================== */

  var oldMakeUnique = window.makeUnique;

  if (typeof oldMakeUnique === 'function') {
    window.makeUnique = function (u) {
      var it = oldMakeUnique.apply(this, arguments);

      if (u && u.set) {
        it.set = u.set;
      }

      if (u && u.set && window.SETS && SETS[u.set]) {
        it.spd = (it.spd ? it.spd + ' · ' : '') + 'Сет: ' + SETS[u.set].nm;
      }

      return it;
    };
  }

  /* =====================================================
     2. РАСЧЁТ СЕТОВЫХ БОНУСОВ И ПИТОМЦА
     ===================================================== */

  function applyBonus(o, bonus) {
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
      } else if (k === 'resall') {
        if (!o.res) {
          o.res = {
            fire: 0,
            poison: 0,
            ice: 0,
            light: 0,
            shadow: 0
          };
        }

        Object.keys(o.res).forEach(function (rk) {
          o.res[rk] = Math.min(60, (o.res[rk] || 0) + v);
        });
      } else if (
        k === 'crit' ||
        k === 'critd' ||
        k === 'evade' ||
        k === 'leech' ||
        k === 'mf' ||
        k === 'gf' ||
        k === 'xpB' ||
        k === 'spd' ||
        k === 'regen' ||
        k === 'block' ||
        k === 'thorns'
      ) {
        o[k] = (o[k] || 0) + v;

        if (k === 'evade') {
          o.evade = Math.min(45, o.evade);
        }
      } else {
        o[k] = (o[k] || 0) + v;
      }
    });
  }

  var oldCalcStats = window.calcStats;

  if (typeof oldCalcStats === 'function') {
    window.calcStats = function () {
      var o = oldCalcStats.apply(this, arguments);

      if (!o || !window.S || !S.hero) {
        return o;
      }

      ensureHeroExtras();

      var counts = {};

      Object.values(S.hero.eq)
        .filter(Boolean)
        .forEach(function (it) {
          if (it.set) {
            counts[it.set] = (counts[it.set] || 0) + 1;
          }
        });

      var active = [];

      if (window.SETS) {
        Object.keys(SETS).forEach(function (setId) {
          var set = SETS[setId];
          var cnt = counts[setId] || 0;

          Object.keys(set.bonuses).forEach(function (need) {
            var needNum = parseInt(need, 10);

            if (cnt >= needNum) {
              applyBonus(o, set.bonuses[need]);

              active.push({
                set: setId,
                need: needNum,
                count: cnt
              });
            }
          });
        });
      }

      if (window.PETS && S.hero.activePet) {
        var pet = null;

        for (var i = 0; i < PETS.length; i++) {
          if (PETS[i].id === S.hero.activePet) {
            pet = PETS[i];
            break;
          }
        }

        if (pet) {
          applyBonus(o, pet.bonus);
        }
      }

      o.setCounts = counts;
      o.setActive = active;

      S.cs = o;

      return o;
    };
  }

  /* =====================================================
     3. ПЕРЕБАЛАНС ЛУТА
     ===================================================== */

  function getLootContext() {
    if (window.__chestCtx) {
      return Object.assign({ kind: 'chest' }, window.__chestCtx);
    }

    if (window.COM && COM.e && COM.ctx) {
      return {
        kind: COM.e.boss ? 'boss' : COM.e.elite ? 'elite' : 'mob',
        zi: COM.ctx.zi || 0,
        di: window.RUN ? RUN.di : 0,
        floor: window.RUN ? ((RUN.floor || 1) - 1) : 0,
        arena: COM.ctx.type === 'arena',
        training: COM.ctx.type === 'training'
      };
    }

    return {
      kind: 'other'
    };
  }

  function lootScore(ctx) {
    if (!ctx || ctx.arena || ctx.training || ctx.kind === 'other') {
      return 0;
    }

    var zi = ctx.zi || 0;
    var di = ctx.di || 0;
    var floor = ctx.floor || 0;

    var score = zi * 10 + di * 6 + floor * 4;

    if (ctx.kind === 'boss') {
      score += 18;
    } else if (ctx.kind === 'elite') {
      score += 8;
    } else if (ctx.kind === 'chest') {
      score += ctx.locked ? 10 : 5;
    }

    return score;
  }

  /*
    Редкость сундуков теперь зависит от сложности данжа.
  */
  var oldChestRarity = window.chestRarity;

  window.chestRarity = function (zl, locked) {
    var ctx = getLootContext();

    if (ctx.kind === 'chest') {
      var score = lootScore(ctx);
      var r = 0;

      if (score < 15) {
        r = locked ? 1 : 0;
      } else if (score < 35) {
        r = RI(0, 1) + (locked ? 1 : 0);
      } else if (score < 60) {
        r = RI(1, 2) + (locked ? 1 : 0);
      } else if (score < 85) {
        r = RI(2, 3) + (locked ? 1 : 0);
      } else {
        r = Math.random() < 0.3 ? 4 : 3 + (locked ? 1 : 0);
      }

      return Math.max(0, Math.min(4, r));
    }

    if (typeof oldChestRarity === 'function') {
      return oldChestRarity.apply(this, arguments);
    }

    var t = tierOf(zl);

    return Math.min(4, t + (locked ? 2 : 1));
  };

  /*
    Редкость боссов также зависит от сложности.
  */
  var oldBossRarity = window.bossRarity;

  window.bossRarity = function (zl) {
    var ctx = getLootContext();

    if (ctx.kind === 'boss') {
      var score = lootScore(ctx);

      if (score < 25) {
        return Math.random() < 0.8 ? 1 : 2;
      }

      if (score < 45) {
        return RI(1, 2);
      }

      if (score < 70) {
        return RI(2, 3);
      }

      return Math.random() < 0.35 ? 4 : 3;
    }

    if (typeof oldBossRarity === 'function') {
      return oldBossRarity.apply(this, arguments);
    }

    var t = tierOf(zl);
    var r = Math.min(4, t + 1);

    if (Math.random() < 0.25) {
      r = Math.min(4, r + 1);
    }

    return r;
  };

  /*
    Обычные враги в простых зонах дают много мусора.
  */
  var oldMobRarity = window.mobRarity;

  window.mobRarity = function (zl) {
    var ctx = getLootContext();

    if (ctx.kind === 'mob' || ctx.kind === 'elite') {
      var score = lootScore(ctx);

      if (score < 12) {
        return 0;
      }

      if (score < 25) {
        return Math.random() < 0.8 ? 0 : 1;
      }

      if (score < 45) {
        var roll = Math.random();

        if (roll < 0.55) return 1;
        if (roll < 0.75) return 2;
        return 0;
      }

      if (score < 70) {
        return RI(1, 2);
      }

      return Math.random() < 0.25 ? 3 : RI(1, 2);
    }

    if (typeof oldMobRarity === 'function') {
      return oldMobRarity.apply(this, arguments);
    }

    var t = tierOf(zl);

    return Math.random() < 0.75
      ? Math.min(4, t > 0 ? t : 0)
      : Math.max(0, t - 1);
  };

  function shouldSuppressItem(it, ctx) {
    if (!it || !ctx) return false;
    if (it.__guaranteed) return false;

    var score = lootScore(ctx);
    var rar = it.rar || 0;

    if (it.set) {
      if (score < 65) return Math.random() < 0.95;
      if (score < 85) return Math.random() < 0.5;
      return Math.random() < 0.15;
    }

    if (it.unique) {
      if (score < 35) return Math.random() < 0.92;
      if (score < 60) return Math.random() < 0.6;
      if (score < 80) return Math.random() < 0.3;
      return Math.random() < 0.08;
    }

    if (rar >= 4) {
      if (score < 55) return Math.random() < 0.95;
      if (score < 75) return Math.random() < 0.5;
      return Math.random() < 0.2;
    }

    if (rar === 3) {
      if (score < 25) return Math.random() < 0.85;
      if (score < 45) return Math.random() < 0.55;
      if (score < 65) return Math.random() < 0.3;
      return Math.random() < 0.12;
    }

    if (rar === 2) {
      if (score < 15) return Math.random() < 0.5;
      if (score < 35) return Math.random() < 0.3;
      if (score < 60) return Math.random() < 0.12;
      return false;
    }

    if (rar === 1 && ctx.kind === 'chest' && score < 12) {
      return Math.random() < 0.35;
    }

    return false;
  }

  function convertToGold(it, src) {
    if (!window.S) return;

    var price = 10;

    if (typeof sellPrice === 'function') {
      price = sellPrice(it);
    }

    var g = Math.max(1, Math.round(price * 0.65));

    S.gold += g;

    var gotFrag = false;

    if ((it.rar || 0) >= 2 && Math.random() < 0.25) {
      S.frag++;
      gotFrag = true;
    }

    log(
      '⚱️ Добыча оказалась ветхой: <b>+' + fmt(g) + '</b> 🪙' +
      (gotFrag ? ' и +1 ◆' : ''),
      'loot'
    );

    if ((it.rar || 0) >= 3) {
      toast('⚱️ Ветхая добыча → золото');
    }

    if (typeof renderTop === 'function') {
      renderTop();
    }
  }

  /*
    Дополнительные награды в сложных данжах:
    - сетовые предметы;
    - питомцы.
  */
  var baseAddItem = window.addItem;

  function maybeBonusDrops(ctx, src) {
    if (!ctx || ctx.arena || ctx.training) return;

    var score = lootScore(ctx);

    if (score < 60) return;

    if (window.SET_ITEMS && SET_ITEMS.length) {
      var setChance = 0;

      if (ctx.kind === 'boss') {
        setChance = 0.08 + Math.min(0.08, score / 1500);
      } else if (ctx.kind === 'chest' && ctx.locked) {
        setChance = 0.03;
      }

      if (setChance > 0 && Math.random() < setChance) {
        var u = P(SET_ITEMS);
        var it = makeUnique(u);

        it.__guaranteed = true;

        if (typeof baseAddItem === 'function') {
          baseAddItem(it, src);
        }

        delete it.__guaranteed;
      }
    }

    if (window.PETS && S.hero && S.hero.pets) {
      var unowned = PETS.filter(function (p) {
        return S.hero.pets.indexOf(p.id) < 0;
      });

      if (unowned.length) {
        var petChance = ctx.kind === 'boss' ? 0.008 : 0.002;

        if (score >= 85) {
          petChance += 0.005;
        }

        if (Math.random() < petChance) {
          var pet = P(unowned);

          S.hero.pets.push(pet.id);

          if (!S.hero.activePet) {
            S.hero.activePet = pet.id;
          }

          toast('🐾 Получен питомец: ' + pet.nm + '!');
          log('🐾 <b>' + pet.nm + '</b> теперь следует за тобой.', 'story');

          if (typeof save === 'function') {
            save();
          }
        }
      }
    }
  }

  /*
    Оборачиваем addItem, чтобы резать лёгкий лут
    и выдавать бонусы в сложных данжах.
  */
  if (typeof baseAddItem === 'function') {
    window.addItem = function (it, src) {
      if (window.S && it) {
        ensureHeroExtras();

        var ctx = getLootContext();

        if (
          ctx.kind === 'chest' ||
          ctx.kind === 'boss' ||
          ctx.kind === 'elite' ||
          ctx.kind === 'mob'
        ) {
          if (ctx.kind === 'boss' && window.COM && !COM.__bonusRolled) {
            COM.__bonusRolled = true;
            maybeBonusDrops(ctx, src);
          }

          if (ctx.kind === 'chest' && window.__chestCtx && !window.__chestCtx.rolled) {
            window.__chestCtx.rolled = true;
            maybeBonusDrops(ctx, src);
          }

          if (shouldSuppressItem(it, ctx)) {
            convertToGold(it, src);
            return;
          }
        }
      }

      return baseAddItem.apply(this, arguments);
    };
  }

  /*
    Контекст для сундуков.
  */
  var oldOpenChest = window.openChest;

  if (typeof oldOpenChest === 'function') {
    window.openChest = function (r, locked) {
      window.__chestCtx = {
        zi: window.RUN ? RUN.zi : 0,
        di: window.RUN ? RUN.di : 0,
        floor: window.RUN ? ((RUN.floor || 1) - 1) : 0,
        locked: !!locked,
        rolled: false
      };

      var result = oldOpenChest.apply(this, arguments);

      window.__chestCtx = null;

      return result;
    };
  }

  /* =====================================================
     4. ТРЕНИРОВОЧНЫЙ ЗАЛ
     ===================================================== */

  var STAT_LABELS = {
    dmgAll: '% урона',
    crit: '% крит',
    critd: '% крит. урона',
    armorPct: '% брони',
    hpPct: '% ОЗ',
    mpAdd: 'макс. мана',
    mf: '% поиска лута',
    gf: '% золота',
    xpB: '% опыта',
    leech: '% кражи жизни',
    spd: '% скорости',
    regen: '% регена',
    block: '% блока',
    thorns: 'урона шипами',
    resfire: 'сопр. огню',
    respoison: 'сопр. яду',
    resice: 'сопр. льду',
    reslight: 'сопр. молнии',
    resshadow: 'сопр. тьме'
  };

  function bonusText(bonus) {
    if (!bonus) return '';

    return Object.keys(bonus)
      .map(function (k) {
        var name = STAT_LABELS[k] || k;
        return '+' + bonus[k] + ' ' + name;
      })
      .join(', ');
  }

  function petById(id) {
    if (!window.PETS) return null;

    for (var i = 0; i < PETS.length; i++) {
      if (PETS[i].id === id) {
        return PETS[i];
      }
    }

    return null;
  }

  function setPet(id) {
    ensureHeroExtras();

    if (S.hero.pets.indexOf(id) < 0) return;

    S.hero.activePet = id;

    S.cs = null;
    calcStats();

    log('🐾 Питомец выбран: <b>' + petById(id).nm + '</b>', 'good');

    save();
    renderTown();
    renderTop();
  }

  function unsetPet() {
    ensureHeroExtras();

    S.hero.activePet = null;

    S.cs = null;
    calcStats();

    log('🐾 Питомец убран.', 'sys');

    save();
    renderTown();
    renderTop();
  }

  window.setPet = setPet;
  window.unsetPet = unsetPet;

  function startTrainingDummy() {
    ensureHeroExtras();

    S.town = 'hall';
    S.cs = calcStats();

    var hp = 6000 + S.hero.lvl * 900;

    var dummy = {
      n: 'Тренировочный манекен',
      f: '🎯',
      lv: S.hero.lvl,
      boss: false,
      elite: false,
      hp: hp,
      maxhp: hp,
      dmg: 0,
      xp: 0,
      gold: 0,
      stun: 999999,
      dot: 0,
      dotD: 0,
      dotEl: null,
      buffs: [],
      debuff: null,
      trait: null,
      elem: null,
      atkN: 0,
      slow: false,
      hitN: 0,
      arm: 0,
      sp: null
    };

    startCombat(dummy, {
      type: 'training',
      zi: 0
    });
  }

  window.startTrainingDummy = startTrainingDummy;

  function townHall() {
    ensureHeroExtras();

    var h = S.hero;
    var c = S.cs || calcStats();
    var ri = rankInfo();
    var act = activeTitle();

    var allItems = h.inv.concat(Object.values(h.eq).filter(Boolean));
    var uniqueCount = allItems.filter(function (it) {
      return it.unique;
    }).length;

    var html = '';

    html +=
      '<div class="panel">' +
      '<h2 style="font-size:22px;color:var(--gold2)">🏋️ Тренировочный зал</h2>' +
      '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
      'Здесь можно изучить билд, посмотреть статистику, активные сеты и питомцев.' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
      '<button class="btn gold" onclick="startTrainingDummy()">🎯 Бить манекен</button>' +
      '<button class="btn" onclick="S.town=\'hero\';renderTown()">👤 Герой</button>' +
      '<button class="btn" onclick="S.town=\'inv\';renderTown()">🎒 Инвентарь</button>' +
      '</div>' +
      '</div>';

    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">ОСНОВНЫЕ ПОКАЗАТЕЛИ</b>' +
      '<div class="statline"><span>Имя</span><b>' + h.name + '</b></div>' +
      '<div class="statline"><span>Класс и раса</span><b>' + CLASSES[h.cls].name + ' / ' + RACES[h.race].name + '</b></div>' +
      '<div class="statline"><span>Уровень</span><b>' + h.lvl + '</b></div>' +
      '<div class="statline"><span>Ранг</span><b>' + ri.r.ic + ' ' + ri.r.n + '</b></div>' +
      '<div class="statline"><span>Титул</span><b>' + (act ? act.ic + ' ' + act.nm : 'нет') + '</b></div>' +
      '<div class="statline"><span>Урон</span><b>' + fmt(c.dmgMin) + '–' + fmt(c.dmgMax) + '</b></div>' +
      '<div class="statline"><span>Сила чар</span><b>' + fmt(c.spellPow) + '</b></div>' +
      '<div class="statline"><span>Броня</span><b>' + fmt(c.armor) + '</b></div>' +
      '<div class="statline"><span>Крит</span><b>' + critChance().toFixed(1) + '% / ' + c.critd.toFixed(0) + '%</b></div>' +
      '<div class="statline"><span>Уклонение</span><b>' + c.evade.toFixed(1) + '%</b></div>' +
      '<div class="statline"><span>Скорость атаки</span><b>' + (pInterval() / 1000).toFixed(1) + 'с</b></div>' +
      '<div class="statline"><span>Кража жизни</span><b>' + (c.leech || 0) + '%</b></div>' +
      '<div class="statline"><span>Реген</span><b>' + (c.regen || 0) + '%</b></div>' +
      '<div class="statline"><span>Поиск лута</span><b>+' + (c.mf || 0) + '%</b></div>' +
      '<div class="statline"><span>Бонус золота</span><b>+' + (c.gf || 0) + '%</b></div>' +
      '<div class="statline"><span>Бонус опыта</span><b>+' + (c.xpB || 0) + '%</b></div>' +
      (c.block !== undefined ? '<div class="statline"><span>Блок</span><b>' + c.block + '%</b></div>' : '') +
      (c.thorns !== undefined ? '<div class="statline"><span>Шипы</span><b>' + c.thorns + '</b></div>' : '') +
      '</div>';

    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">РЕКОРДЫ</b>' +
      '<div class="statline"><span>Убийств</span><b>' + fmt(h.kills) + '</b></div>' +
      '<div class="statline"><span>Боссов повержено</span><b>' + Object.keys(h.bosses).length + ' / ' + ZONES.length + '</b></div>' +
      '<div class="statline"><span>Данжей пройдено</span><b>' + (h.dungeons || 0) + '</b></div>' +
      '<div class="statline"><span>Лучшая арена</span><b>' + (S.arenaBest || 0) + ' волн</b></div>' +
      '<div class="statline"><span>Уникальных предметов</span><b>' + uniqueCount + '</b></div>' +
      '<div class="statline"><span>Успешных заточек</span><b>' + (h.enhOk || 0) + '</b></div>' +
      '<div class="statline"><span>Съедено блюд</span><b>' + (h.meals || 0) + '</b></div>' +
      '<div class="statline"><span>Выиграно азартных игр</span><b>' + (h.gamesWon || 0) + '</b></div>' +
      '</div>';

    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">🧩 СЕТЫ</b>' +
      '<div style="color:var(--dim2);font-size:11px;margin:4px 0">' +
      'Сетовые предметы падают только в самых опасных данжах. Бонус даётся за 2 и 4 предмета.' +
      '</div>';

    if (window.SETS && window.SET_ITEMS) {
      Object.keys(SETS).forEach(function (setId) {
        var set = SETS[setId];
        var items = SET_ITEMS.filter(function (it) {
          return it.set === setId;
        });

        var cnt = (c.setCounts && c.setCounts[setId]) || 0;

        html +=
          '<div class="item" style="border-left-color:#d3a44c">' +
          '<span style="font-size:22px">' + set.icon + '</span>' +
          '<div style="flex:1">' +
          '<div class="nm" style="color:var(--gold2)">' + set.nm + ' <b>(' + cnt + '/4)</b></div>' +
          '<div class="ds">' +
          items.map(function (it) {
            return it.icon + ' ' + it.nm;
          }).join('<br>') +
          '</div>' +
          '<div style="margin-top:6px;font-size:12px">';

        Object.keys(set.bonuses).forEach(function (need) {
          var isActive = cnt >= parseInt(need, 10);

          html +=
            '<div style="' + (isActive ? 'color:#9fe08f;font-weight:700' : 'color:var(--dim)') + '">' +
            '(' + need + '): ' + bonusText(set.bonuses[need]) +
            (isActive ? ' ✓' : '') +
            '</div>';
        });

        html += '</div></div></div>';
      });
    }

    html += '</div>';

    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">🐾 ПИТОМЦЫ</b>' +
      '<div style="color:var(--dim2);font-size:11px;margin:4px 0">' +
      'Питомцы падают крайне редко и только в самых опасных местах. Активен может быть один.' +
      '</div>';

    if (window.PETS) {
      PETS.forEach(function (p) {
        var owned = h.pets.indexOf(p.id) >= 0;
        var isActive = h.activePet === p.id;

        html +=
          '<div class="item" style="border-left-color:' + (owned ? '#7fb95c' : '#3a2f20') + '">' +
          '<span style="font-size:22px">' + p.icon + '</span>' +
          '<div style="flex:1">' +
          '<div class="nm" style="color:' + (owned ? 'var(--gold2)' : 'var(--dim)') + '">' + p.nm + '</div>' +
          '<div class="ds">' + p.ds + '</div>' +
          '<div class="af">' + bonusText(p.bonus) + '</div>' +
          '</div>' +
          '<div>' +
          (
            owned
              ? (
                isActive
                  ? '<button class="btn small" onclick="unsetPet()">Убрать</button>'
                  : '<button class="btn small gold" onclick="setPet(\'' + p.id + '\')">Выбрать</button>'
              )
              : '<span style="color:var(--dim2);font-size:11px">не получен</span>'
          ) +
          '</div>' +
          '</div>';
      });
    }

    html += '</div>';

    return html;
  }

  window.townHall = townHall;

  /* =====================================================
     5. ПЕРЕКАВКА У КУЗНЕЦА
     ===================================================== */

  function reforgeCost(it) {
    var n = Object.keys(it.mods || {}).length;

    return {
      gold: 300 + it.lvl * 35 + it.rar * 180 + n * 40,
      frag: 3 + it.rar
    };
  }

  function reforgePool(it) {
    var basePool = it.slot === 'weapon'
      ? PRE.concat(SUF)
      : PRE.concat(SUF2);

    var seen = {};

    return basePool.filter(function (a) {
      if (it.mods && it.mods[a.k] !== undefined) return false;
      if (seen[a.k]) return false;

      seen[a.k] = true;

      return true;
    });
  }

  function reforgeMenu(id) {
    var f = findItem(id);

    if (!f) return;

    var it = f.it;
    var cost = reforgeCost(it);

    var rows = Object.keys(it.mods || {}).map(function (k) {
      return (
        '<div class="statline">' +
        '<span>✦ ' + modStr(k, it.mods[k]) + '</span>' +
        '<button class="btn small danger" onclick="reforgeStat(\'' + id + '\',\'' + k + '\')">Перековать</button>' +
        '</div>'
      );
    }).join('');

    $('main').innerHTML =
      '<div class="panel">' +
      '<h2 style="font-size:24px;color:var(--gold2)">⚒ Перековка</h2>' +
      '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
      it.icon + ' <span class="' + RC[it.rar] + '">' + it.nm + '</span>' +
      ' · ' + (SLOTN[it.slot] || 'предмет') +
      ' · ур. ' + it.lvl +
      (it.enh ? ' · +' + it.enh : '') +
      '</div>' +

      '<div style="color:var(--blood);font-size:12px;margin-bottom:10px">' +
      'Внимание: выбранный стат будет удалён и заменён на случайный новый. ' +
      'Цена большая и не возвращается.' +
      '</div>' +

      '<div class="statline"><span>Стоимость одной перековки</span><b>' + fmt(cost.gold) + ' 🪙 + ' + cost.frag + ' ◆</b></div>' +

      rows +

      '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn" onclick="S.town=\'forge\';renderTown()">← В кузницу</button>' +
      '<button class="btn" onclick="renderTown()">В город</button>' +
      '</div>' +
      '</div>';
  }

  function reforgeStat(id, oldKey) {
    var f = findItem(id);

    if (!f) return;

    var it = f.it;

    if (!it.mods || it.mods[oldKey] === undefined) return;

    var pool = reforgePool(it);

    if (!pool.length) {
      toast('Больше нечего перековывать');
      return;
    }

    var cost = reforgeCost(it);

    if (S.gold < cost.gold || S.frag < cost.frag) {
      toast('Не хватает ресурсов для перековки');
      return;
    }

    var affix = P(pool);

    var baseVal = Math.max(
      1,
      Math.round(R(affix.v[0], affix.v[1]) * (0.9 + it.lvl * 0.06))
    );

    var finalVal = baseVal;

    if (it.enhBase) {
      delete it.enhBase[oldKey];

      it.enhBase[affix.k] = baseVal;

      finalVal = Math.max(
        1,
        Math.round(baseVal * (1 + 0.18 * (it.enh || 0)))
      );
    }

    delete it.mods[oldKey];

    it.mods[affix.k] = finalVal;

    S.gold -= cost.gold;
    S.frag -= cost.frag;

    S.cs = null;
    calcStats();

    log(
      '⚒ Перековка: <b>' + modStr(oldKey, 0).replace(' +0', '') + '</b> → <b>' + modStr(affix.k, finalVal) + '</b>',
      'good'
    );

    toast('⚒ Перековка завершена');

    save();
    reforgeMenu(id);
    renderTop();
  }

  window.reforgeMenu = reforgeMenu;
  window.reforgeStat = reforgeStat;

  function reforgeForgePanel() {
    var items = Object.values(S.hero.eq)
      .filter(Boolean)
      .concat(
        S.hero.inv.filter(function (x) {
          return !x.orb && Object.keys(x.mods || {}).length > 0;
        })
      );

    if (!items.length) {
      return (
        '<div class="panel">' +
        '<b style="color:var(--gold)">⚒ Перековка</b>' +
        '<div style="color:var(--dim);font-size:12px;margin-top:4px">' +
        'Нет предметов с характеристиками для перековки.' +
        '</div>' +
        '</div>'
      );
    }

    var rows = items.map(function (it) {
      return (
        '<div class="item r' + it.rar + '">' +
        '<span style="font-size:20px">' + it.icon + '</span>' +
        '<div style="flex:1">' +
        '<span class="nm ' + RC[it.rar] + '">' + it.nm + (it.enh ? ' +' + it.enh : '') + '</span>' +
        '<div class="ds">' + Object.keys(it.mods || {}).length + ' характеристик</div>' +
        '</div>' +
        '<button class="btn small" onclick="reforgeMenu(\'' + it.id + '\')">Перековать</button>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="panel">' +
      '<b style="color:var(--gold)">⚒ Перековка</b>' +
      '<div style="color:var(--dim);font-size:12px;margin:4px 0">' +
      'За большую плату можно заменить один выбранный стат предмета на случайный новый.' +
      '</div>' +
      rows +
      '</div>'
    );
  }

  /* =====================================================
     6. ОБЕРТКА ДЛЯ ТРЕНИРОВКИ
     ===================================================== */

  var oldOnWin = window.onWin;

  if (typeof oldOnWin === 'function') {
    window.onWin = function () {
      if (window.COM && COM.ctx && COM.ctx.type === 'training') {
        stopCombat();

        COM = null;

        toast('Тренировка завершена');

        S.town = 'hall';
        renderTown();
        renderTop();

        return;
      }

      return oldOnWin.apply(this, arguments);
    };
  }

  var oldOnLose = window.onLose;

  if (typeof oldOnLose === 'function') {
    window.onLose = function () {
      if (window.COM && COM.ctx && COM.ctx.type === 'training') {
        stopCombat();

        COM = null;

        toast('Тренировка остановлена');

        S.town = 'hall';
        renderTown();
        renderTop();

        return;
      }

      return oldOnLose.apply(this, arguments);
    };
  }

  /* =====================================================
     7. ВСТРАИВАНИЕ ЗАЛА В ГОРОД
     ===================================================== */

  var oldRenderTown = window.renderTown;

  if (typeof oldRenderTown === 'function') {
    window.renderTown = function () {
      var result = oldRenderTown.apply(this, arguments);

      if (!window.S) return result;

      var m = $('main');

      if (!m) return result;

      var nav = m.querySelector('.subnav');

      if (nav && !nav.querySelector('.hall-tab')) {
        nav.insertAdjacentHTML(
          'beforeend',
          '<button class="btn small hall-tab ' + (S.town === 'hall' ? 'gold' : '') + '" ' +
          'onclick="S.town=\'hall\';renderTown()">🏋️ Зал</button>'
        );
      }

      if (S.town === 'plaza') {
        var grid = m.querySelector('.locgrid');

        if (grid) {
          grid.insertAdjacentHTML(
            'beforeend',
            '<div class="loccard" onclick="S.town=\'hall\';renderTown()">' +
            '<div class="lic">🏋️</div>' +
            '<h4>Тренировочный зал</h4>' +
            '<p>Статистика, сеты, питомцы</p>' +
            '</div>'
          );
        }
      }

      if (S.town === 'hall') {
        m.insertAdjacentHTML('beforeend', townHall());
      }

      if (S.town === 'forge') {
        m.insertAdjacentHTML('beforeend', reforgeForgePanel());
      }

      return result;
    };
  }

  /* =====================================================
     8. ПЕРЕНАЗНАЧЕНИЕ НЕКОТОРЫХ ГЛОБАЛЬНЫХ ФУНКЦИЙ
     ===================================================== */

  window.setPet = setPet;
  window.unsetPet = unsetPet;
  window.startTrainingDummy = startTrainingDummy;
  window.reforgeMenu = reforgeMenu;
  window.reforgeStat = reforgeStat;

})();