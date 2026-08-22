'use strict';

(function () {

  /* =====================================================
     ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
     ===================================================== */

  function ensureUI() {
    if (!window.S) return;

    if (!S.ui) {
      S.ui = {};
    }

    if (!S.ui.sellSel) {
      S.ui.sellSel = {};
    }
  }

  function safeRender() {
    if (typeof renderTown === 'function') renderTown();
    if (typeof renderTop === 'function') renderTop();
  }

  /* =====================================================
     1. ЗАТОЧКА УЛУЧШАЕТ ВСЕ ХАРАКТЕРИСТИКИ ПРЕДМЕТА
     ===================================================== */

  function ensureEnhBase(it) {
    if (!it) return;

    if (!it.enhBase) {
      it.enhBase = Object.assign({}, it.mods || {});
    }

    if (it.enhBaseAt === undefined) {
      it.enhBaseAt = it.enh || 0;
    }
  }

  function applyEnhMods(it) {
    if (!it) return;

    ensureEnhBase(it);

    var diff = Math.max(0, (it.enh || 0) - (it.enhBaseAt || 0));
    var mul = 1 + 0.18 * diff;

    Object.keys(it.enhBase || {}).forEach(function (k) {
      it.mods[k] = Math.max(1, Math.round((it.enhBase[k] || 0) * mul));
    });
  }

  window.applyEnhMods = applyEnhMods;

  /*
    Полностью переопределяем doEnhance,
    чтобы при успешной заточке улучшались все моды предмета.
  */
  window.doEnhance = function (id) {
    var f = findItem(id);
    if (!f) return;

    var it = f.it;
    var n = (it.enh || 0) + 1;

    if (n > 15) {
      toast('Предел +15');
      return;
    }

    var cost = enhCost(it);

    if (S.gold < cost.gold || S.frag < cost.frag) {
      toast('Не хватает ресурсов');
      return;
    }

    S.gold -= cost.gold;
    S.frag -= cost.frag;

    if (Math.random() * 100 < enhChance(it)) {
      it.enh = n;

      applyEnhMods(it);

      S.cs = null;
      calcStats();

      S.hero.enhOk = (S.hero.enhOk || 0) + 1;

      bumpOrders('enh', 0, 1);

      toast('⚒ ' + it.nm + ' +' + n + '!');
      log('⚒ <b>' + it.nm + '</b> заточен до +' + n + '. Все характеристики улучшены.', 'good');

      checkTitles();
    } else {
      if (S.hero.prot > 0) {
        S.hero.prot--;
        it.enh = Math.max(0, it.enh - 1);

        applyEnhMods(it);

        S.cs = null;
        calcStats();

        toast('🛡 Оберег спас предмет');
        log('Заточка сорвалась, оберег раскололся. ' + it.nm + ' +' + it.enh, 'bad');
      } else {
        if (f.from === 'inv') {
          S.hero.inv.splice(f.i, 1);
        } else {
          S.hero.eq[f.s] = null;
          S.cs = null;
        }

        toast('💥 ПРЕДМЕТ УНИЧТОЖЕН');
        log('💥 <b>' + it.nm + '</b> рассыпался пеплом.', 'bad');
      }
    }

    save();
    safeRender();
  };

  /* =====================================================
     2. СРАВНЕНИЕ ПРЕДМЕТОВ
     ===================================================== */

  var CUSTOM_STAT_NAMES = {
    __baseDmg: 'Урон оружия',
    __armorFlat: 'Базовая броня',
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

  function statName(k) {
    if (CUSTOM_STAT_NAMES[k]) return CUSTOM_STAT_NAMES[k];

    if (window.MODNAMES && MODNAMES[k]) {
      return MODNAMES[k];
    }

    return k;
  }

  function effectiveBaseDamage(it) {
    if (!it || !it.baseDmg) return 0;
    return Math.round(it.baseDmg * (1 + (it.enh || 0) * 0.18));
  }

  function effectiveArmorFlat(it) {
    if (!it || !it.armorFlat) return 0;
    return Math.round(it.armorFlat * (1 + (it.enh || 0) * 0.18));
  }

  function itemStatsForCompare(it) {
    var out = {};

    if (!it) return out;

    if (it.baseDmg) {
      out.__baseDmg = effectiveBaseDamage(it);
    }

    if (it.armorFlat) {
      out.__armorFlat = effectiveArmorFlat(it);
    }

    Object.keys(it.mods || {}).forEach(function (k) {
      out[k] = it.mods[k];
    });

    return out;
  }

  function compareItemHtml(candidate, current) {
    if (!candidate) return '';

    var cs = itemStatsForCompare(candidate);
    var rs = current ? itemStatsForCompare(current) : {};

    var keys = [];

    function addKey(k) {
      if (keys.indexOf(k) < 0) keys.push(k);
    }

    Object.keys(cs).forEach(addKey);
    Object.keys(rs).forEach(addKey);

    keys.sort(function (a, b) {
      if (a === '__baseDmg') return -1;
      if (b === '__baseDmg') return 1;
      if (a === '__armorFlat') return -1;
      if (b === '__armorFlat') return 1;
      return a.localeCompare(b);
    });

    var rows = keys.map(function (k) {
      var candVal = cs[k] || 0;
      var curVal = rs[k] || 0;
      var diff = candVal - curVal;

      var diffHtml = '';

      if (diff > 0) {
        diffHtml = '<span class="cmp-diff cmp-up">+' + fmt(diff) + '</span>';
      } else if (diff < 0) {
        diffHtml = '<span class="cmp-diff cmp-down">' + fmt(diff) + '</span>';
      } else {
        diffHtml = '<span class="cmp-diff cmp-same">=</span>';
      }

      return (
        '<div class="cmp-row">' +
        '<span class="cmp-name">' + statName(k) + '</span>' +
        '<span class="cmp-value"><b>' + fmt(candVal) + '</b> ' + diffHtml + '</span>' +
        '</div>'
      );
    }).join('');

    var note = current
      ? 'Сравнение с надетым предметом: <b>' + current.nm + '</b>'
      : 'Слот пуст — показаны характеристики нового предмета.';

    return (
      '<div class="panel cmp-panel">' +
      '<div class="cmp-title">📊 Сравнение с экипировкой</div>' +
      rows +
      '<div class="cmp-note">' + note + '</div>' +
      '</div>'
    );
  }

  /* =====================================================
     3. НОВОЕ МЕНЮ ПРЕДМЕТА СРАВНЕНИЕМ
     ===================================================== */

  window.itemMenu = function (id) {
    var f = findItem(id);
    if (!f) return;

    var it = f.it;

    var eqBtn = f.from === 'inv'
      ? '<button class="btn" onclick="equipItem(\'' + id + '\')">Надеть</button>'
      : '<button class="btn" onclick="unequipItem(\'' + it.slot + '\')">Снять</button>';

    var sock = '';

    if (it.sockets) {
      sock = '<div style="margin-top:10px"><b style="color:var(--gold)">ГНЁЗДА (' + it.sockets + ')</b><br>';

      for (var i = 0; i < it.sockets; i++) {
        var gd = it.gems && it.gems[i];

        if (gd) {
          var g = typeof gd === 'string' ? gd : gd.k;

          sock +=
            '<span class="chip ck" onclick="removeGem(\'' + id + '\',' + i + ')" title="Вынуть">' +
            GEMS[g].icon + ' ' + GEMS[g].n + ' ✕</span> ';
        } else {
          var opts = Object.keys(GEMS).filter(function (k) {
            return ((S.hero.gems[k] || {}).n || 0) > 0;
          });

          if (opts.length) {
            sock +=
              '<select id="gsel_' + i + '" style="background:#0006;color:var(--txt);border:1px solid var(--lin2);padding:3px">' +
              opts.map(function (k) {
                return '<option value="' + k + '">' + GEMS[k].icon + ' ' + GEMS[k].n + ' ×' + S.hero.gems[k].n + '</option>';
              }).join('') +
              '</select>' +
              '<button class="btn small" onclick="socketGem(\'' + id + '\',' + i + ')">Вставить</button> ';
          } else {
            sock += '<span style="color:var(--dim2);font-size:11px">пусто (нет самоцветов)</span> ';
          }
        }
      }

      sock += '<div style="font-size:11px;color:var(--dim2);margin-top:4px">В оружии — атакующий эффект, в броне — сопротивление.</div></div>';
    }

    var cmp = '';

    if (f.from === 'inv' && it.slot && it.slot !== '_') {
      cmp = compareItemHtml(it, S.hero.eq[it.slot]);
    }

    $('main').innerHTML =
      '<div class="panel">' +
      '<h2 style="font-size:24px;color:var(--gold2)">' + it.icon + ' ' + it.nm + '</h2>' +
      '<div style="color:var(--dim);font-size:12px;margin:4px 0 10px">' +
      (it.unique ? 'УНИКАЛЬНЫЙ' : RAR[it.rar]) +
      ' · ' +
      (SLOTN[it.slot] || 'предмет') +
      ' · ур. ' + it.lvl +
      (it.enh ? ' · +' + it.enh : '') +
      '</div>' +

      '<div style="color:var(--dim2);font-size:11px;margin-bottom:10px">' +
      'Заточка улучшает все свойства предмета на +18% за уровень.' +
      '</div>' +

      (
        Object.keys(it.mods).map(function (k) {
          return '<div class="statline"><span>✦ ' + modStr(k, it.mods[k]) + '</span></div>';
        }).join('') ||
        '<div style="color:var(--dim);font-size:12px">Без особых свойств.</div>'
      ) +

      (it.spd ? '<div class="statline"><span style="color:var(--gold2)">✧ ' + it.spd + '</span></div>' : '') +

      (it.baseDmg ? '<div class="statline"><span>⚔ Урон с учётом заточки</span><b>' + effectiveBaseDamage(it) + '</b></div>' : '') +
      (!it.baseDmg && it.armorFlat ? '<div class="statline"><span>🛡 Броня с учётом заточки</span><b>' + effectiveArmorFlat(it) + '</b></div>' : '') +

      cmp +
      sock +

      '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">' +
      eqBtn +
      ' <button class="btn" onclick="S.town=\'forge\';renderTown()">⚒ В кузницу</button>' +
      ' <button class="btn danger" onclick="sellItem(\'' + id + '\')">Продать (' + fmt(sellPrice(it)) + ' 🪙)</button>' +
      ' <button class="btn" onclick="renderTown()">Назад</button>' +
      '</div>' +
      '</div>';
  };

  /* =====================================================
     4. БЫСТРАЯ ПРОДАЖА
     ===================================================== */

  window.toggleQuickSell = function () {
    ensureUI();

    S.ui.quickSell = !S.ui.quickSell;

    if (!S.ui.quickSell) {
      S.ui.sellSel = {};
    }

    save();
    safeRender();
  };

  window.toggleSellSel = function (id) {
    ensureUI();

    if (S.ui.sellSel[id]) {
      delete S.ui.sellSel[id];
    } else {
      S.ui.sellSel[id] = 1;
    }

    save();
    safeRender();
  };

  window.selectSellRarity = function (maxRarity) {
    ensureUI();

    S.hero.inv.forEach(function (it) {
      if (!it.orb && it.rar <= maxRarity) {
        S.ui.sellSel[it.id] = 1;
      }
    });

    save();
    safeRender();
  };

  window.clearSellSelection = function () {
    ensureUI();
    S.ui.sellSel = {};
    save();
    safeRender();
  };

  window.sellSelected = function () {
    ensureUI();

    var sel = S.ui.sellSel || {};
    var ids = Object.keys(sel).filter(function (id) {
      return sel[id];
    });

    if (!ids.length) {
      toast('Выбери предметы для продажи');
      return;
    }

    var total = 0;
    var cnt = 0;

    for (var i = S.hero.inv.length - 1; i >= 0; i--) {
      var it = S.hero.inv[i];

      if (sel[it.id]) {
        total += sellPrice(it);
        cnt++;
        S.hero.inv.splice(i, 1);
        delete sel[it.id];
      }
    }

    if (!cnt) {
      toast('Выбранные предметы не найдены');
      safeRender();
      return;
    }

    if (!confirm('Продать ' + cnt + ' предметов за ' + fmt(total) + ' 🪙?')) {
      safeRender();
      return;
    }

    S.gold += total;

    bumpOrders('sell', 0, cnt);

    log('Быстрая продажа: <b>' + cnt + '</b> предметов за <b>' + fmt(total) + '</b> 🪙', 'loot');
    toast('Продано ' + cnt + ' предметов за ' + fmt(total) + ' 🪙');

    save();
    safeRender();
  };

  window.invItemClick = function (id) {
    ensureUI();

    if (S.ui.quickSell) {
      toggleSellSel(id);
    } else {
      itemMenu(id);
    }
  };

  /* =====================================================
     5. КОРОТКИЕ ХАРАКТЕРИСТИКИ ДЛЯ СПИСКА ИНВЕНТАРЯ
     ===================================================== */

  function itemShortStats(it) {
    var parts = [];

    if (it.baseDmg) {
      parts.push('⚔ ' + effectiveBaseDamage(it));
    }

    if (it.armorFlat) {
      parts.push('🛡 ' + effectiveArmorFlat(it));
    }

    var keys = Object.keys(it.mods || {});

    keys.slice(0, 3).forEach(function (k) {
      parts.push(statName(k) + ' ' + it.mods[k]);
    });

    if (keys.length > 3) {
      parts.push('…+' + (keys.length - 3));
    }

    return parts.join(' · ');
  }

  /* =====================================================
     6. НОВЫЙ ИНВЕНТАРЬ
     ===================================================== */

  window.townInv = function () {
    ensureUI();

    var h = S.hero;
    var c = S.cs || calcStats();

    var list = h.inv.slice().sort(function (a, b) {
      return b.rar - a.rar || b.lvl - a.lvl;
    });

    var quick = !!S.ui.quickSell;
    var sel = S.ui.sellSel || {};

    var selCount = 0;
    var selGold = 0;

    list.forEach(function (it) {
      if (sel[it.id]) {
        selCount++;
        selGold += sellPrice(it);
      }
    });

    var html =
      '<div class="panel">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<span class="chip">🪙 ' + fmt(S.gold) + '</span>' +
      '<span class="chip">◆ ' + fmt(S.frag) + '</span>' +
      '<span class="chip ck" onclick="drinkPot(\'hp\')">🧪 ОЗ ×' + h.pots.hp + '</span>' +
      '<span class="chip ck" onclick="drinkPot(\'mp\')">🧪 Мана ×' + h.pots.mp + '</span>' +
      '<span class="chip">🛡 Обереги ×' + h.prot + '</span>' +
      '<span class="chip">🔥×' + h.elix.rage + ' 🪨×' + h.elix.stone + ' 🦅×' + h.elix.swift + '</span>' +
      '<span class="chip ck" onclick="useOrb()">🌀 Орб ×' +
      h.inv.filter(function (x) {
        return x.orb;
      }).length +
      '</span>' +
      '</div>' +
      '</div>';

    html +=
      '<div class="panel quick-bar">' +
      '<button class="btn ' + (quick ? 'danger' : 'gold') + '" onclick="toggleQuickSell()">' +
      (quick ? '✖ Закончить быструю продажу' : '⚡ Быстрая продажа') +
      '</button>';

    if (quick) {
      html +=
        '<button class="btn small" onclick="selectSellRarity(0)">Выбрать обычные</button>' +
        '<button class="btn small" onclick="selectSellRarity(1)">Обычные + волшебные</button>' +
        '<button class="btn small" onclick="clearSellSelection()">Снять выбор</button>' +
        '<button class="btn small danger" onclick="sellSelected()">Продать выбранные</button>' +
        '<span class="quick-info">Выбрано: <b>' + selCount + '</b> · Цена: <b class="gold-strong">' + fmt(selGold) + ' 🪙</b></span>';
    } else {
      html += '<span class="quick-info">Нажми предмет, чтобы открыть сравнение.</span>';
    }

    html += '</div>';

    html += '<div class="invwrap">';

    /* Экипировка */
    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">ЭКИПИРОВКА</b>' +
      '<div class="doll">';

    var DOLL = [
      ['', 'helmet', ''],
      ['weapon', 'armor', 'amulet'],
      ['gloves', 'boots', 'ring']
    ];

    DOLL.forEach(function (row) {
      row.forEach(function (sl) {
        if (!sl) {
          html += '<div></div>';
          return;
        }

        var it = h.eq[sl];

        if (it) {
          html += icell(it, "itemMenu('" + it.id + "')");
        } else {
          html +=
            '<div class="slot" title="' + SLOTN[sl] + '">' +
            SLOTICON[sl] +
            '<small>' + SLOTN[sl].toUpperCase() + '</small>' +
            '</div>';
        }
      });
    });

    html +=
      '</div>' +
      '<div style="font-size:12px;color:var(--dim);line-height:1.9;margin-top:6px">' +
      '⚔ Урон: <b style="color:var(--txt)">' + fmt(c.dmgMin) + '–' + fmt(c.dmgMax) + '</b><br>' +
      '🛡 Броня: <b style="color:var(--txt)">' + fmt(c.armor) + '</b><br>' +
      '💥 Крит: <b style="color:var(--txt)">' + critChance().toFixed(1) + '%/' + c.critd.toFixed(0) + '%</b><br>' +
      '❤ ОЗ: <b style="color:var(--txt)">' + fmt(h.hp) + '/' + fmt(c.maxhp) + '</b>' +
      '</div>' +
      '</div>';

    /* Сумка */
    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">СУМКА (' + list.length + ')</b>' +
      '<div class="bag" style="margin-top:8px">';

    if (list.length) {
      html += list.map(function (it) {
        var selected = !!sel[it.id];

        return (
          '<div class="invitem r' + it.rar + (selected ? ' selected' : '') + '" onclick="invItemClick(\'' + it.id + '\')">' +
          '<div class="invicon">' + it.icon + '</div>' +
          '<div>' +
          '<div class="invname ' + RC[it.rar] + '">' + it.nm + (it.enh ? ' +' + it.enh : '') + '</div>' +
          '<div class="invstats">' +
          (SLOTN[it.slot] || 'предмет') + ' · ур. ' + it.lvl +
          (itemShortStats(it) ? '<br>' + itemShortStats(it) : '') +
          '</div>' +
          '</div>' +
          '<div class="invright">' +
          '<div>💰 ' + fmt(sellPrice(it)) + '</div>' +
          (quick ? '<div class="sell-checkbox">' + (selected ? '☑' : '☐') + '</div>' : '') +
          '</div>' +
          '</div>'
        );
      }).join('');
    } else {
      html += '<span style="color:var(--dim2);font-size:12px">Пусто.</span>';
    }

    html += '</div></div></div>';

    /* Сигилы и ключи */
    var sigRows = h.sigils.map(function (n, i) {
      return n > 0
        ? '<span class="chip">' + SIGILS[i].icon + ' ' + SIGILS[i].nm + ' ×' + n + '</span>'
        : '';
    }).join('');

    var keyRows = h.keys.map(function (n, i) {
      return n > 0
        ? '<span class="chip">' + KITEMS[i].icon + ' ' + KITEMS[i].nm + ' ×' + n + '</span>'
        : '';
    }).join('');

    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">🔮 СИГИЛЫ И 🗝️ КЛЮЧИ</b>' +
      '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' +
      (sigRows || '<span style="color:var(--dim2);font-size:12px">Сигилов нет.</span>') +
      '</div>' +
      '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' +
      (keyRows || '<span style="color:var(--dim2);font-size:12px">Ключей нет.</span>') +
      '</div>' +
      '</div>';

    /* Самоцветы */
    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">💎 САМОЦВЕТЫ</b>' +
      '<div style="margin-top:6px">';

    var gemRows = Object.keys(GEMS)
      .filter(function (k) {
        return ((h.gems[k] || {}).n || 0) > 0;
      })
      .map(function (k) {
        var g = h.gems[k];
        var lv = g.lv || 1;

        return (
          '<div class="statline">' +
          '<span>' + GEMS[k].icon + ' ' + GEMS[k].n + ' <b>ур.' + lv + '</b> ×' + g.n +
          '<span class="hint">Оружие: ' + gemWeaponTxt(k, lv) + ' · Броня: ' + gemArmorTxt(k, lv) + '</span>' +
          '</span>' +
          (
            g.n >= 3
              ? '<button class="btn small gold" onclick="mergeGem(\'' + k + '\')">⬆ Слить 3 → ур.' + (lv + 1) + '</button>'
              : '<span style="font-size:11px;color:var(--dim2)">для улучшения нужно 3</span>'
          ) +
          '</div>'
        );
      }).join('');

    html += (gemRows || '<span style="color:var(--dim2);font-size:12px">Самоцветов нет.</span>') + '</div></div>';

    /* Трофеи */
    html +=
      '<div class="panel">' +
      '<b style="color:var(--gold)">🎭 ТРОФЕИ</b>' +
      '<div style="margin-top:6px">';

    var troRows = '';

    Object.keys(h.troph).forEach(function (k) {
      var n = h.troph[k];
      if (!n) return;

      var inf = troInfo(k);

      troRows +=
        '<div class="item" style="border-left-color:#8a7a5c">' +
        '<span style="font-size:20px">' + inf.icon + '</span>' +
        '<div style="flex:1">' +
        '<span class="nm" style="color:#d8c8a8">' + inf.nm + '</span>' +
        '<div class="ds">Трофей · ' + ZONES[inf.zi].nm + ' · ' + inf.price + ' 🪙</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;align-items:center">' +
        '<b>×' + n + '</b>' +
        '<button class="btn small" onclick="sellTroph(' + k + ',1)">Продать 1</button>' +
        '<button class="btn small" onclick="sellTroph(' + k + ',' + n + ')">Все</button>' +
        '</div>' +
        '</div>';
    });

    html += (troRows || '<span style="color:var(--dim2);font-size:12px">Трофеев нет.</span>') + '</div></div>';

    return html;
  };

})();