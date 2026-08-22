'use strict';

(function () {

  /* =====================================================
     1. ДОБАВЛЯЕМ НОВЫЕ СТАТЫ (BLOCK, THORNS) В РАСЧЁТ
     ===================================================== */
  var oldCalcStats = window.calcStats;

  window.calcStats = function () {
    var o = oldCalcStats();
    if (!o || !S || !S.hero) return o;

    var block = 0;
    var thorns = 0;

    Object.values(S.hero.eq).filter(Boolean).forEach(function (it) {
      if (it.mods && it.mods.block) block += it.mods.block;
      if (it.mods && it.mods.thorns) thorns += it.mods.thorns;
    });

    // Блок каппится на 40%, чтобы не было имбы
    o.block = Math.min(40, block);
    o.thorns = thorns;

    S.cs = o;
    return o;
  };

  /* =====================================================
     2. ВНЕДРЯЕМ БЛОК И ШИПЫ В БОЕВУЮ СИСТЕМУ
     ===================================================== */
  
  // Перехватываем входящий урон по игроку для Блока
  var oldDmgToPlayer = window.dmgToPlayer;
  if (typeof oldDmgToPlayer === 'function') {
    window.dmgToPlayer = function (raw) {
      var d = oldDmgToPlayer(raw);

      if (S.cs && S.cs.block > 0 && Math.random() * 100 < S.cs.block) {
        d = d * 0.5;
        if (window.COM) {
          feed('🛡️ <b>БЛОК!</b> Урон снижен вдвое.', 's');
          floatDmg('pface', 'БЛОК', 'f-ice');
        }
      }

      return d;
    };
  }

  // Перехватываем атаку врага для Шипов
  var oldAttackOnce = window.attackOnce;
  if (typeof oldAttackOnce === 'function') {
    window.attackOnce = function (second) {
      var hpBefore = S.hero.hp;
      oldAttackOnce(second);

      // Если игрок выжил и у него есть шипы
      if (S.hero.hp > 0 && S.cs && S.cs.thorns > 0 && window.COM && COM.e && COM.e.hp > 0) {
        var thornDmg = Math.round(S.cs.thorns * R(0.8, 1.2));
        COM.e.hp -= thornDmg;

        feed('🩸 Шипы вонзаются в ' + COM.e.n + ': <b>' + fmt(thornDmg) + '</b>', 'p');
        floatDmg('eface', '-' + fmt(thornDmg), 'f-shadow');

        if (typeof shake === 'function') shake($('ecard'));
        if (typeof flashElement === 'function') flashElement($('ecard'));

        if (COM.e.hp <= 0) {
          onWin();
        }
      }
    };
  }

  /* =====================================================
     3. УНИКАЛЬНЫЕ ЭФФЕКТЫ (ЛУК ВЕТРА, ЖНЕЦ)
     ===================================================== */
  var oldDoPlayerHit = window.doPlayerHit;
  if (typeof oldDoPlayerHit === 'function') {
    window.doPlayerHit = function (mult, verb, extraCrit) {
      oldDoPlayerHit(mult, verb, extraCrit);

      // Лук Ветра: 25% шанс ударить дважды
      if (sp('wind') && Math.random() < 0.25 && window.COM && COM.e && COM.e.hp > 0) {
        setTimeout(function () {
          if (window.COM && COM.e && COM.e.hp > 0) {
            feed('🌪️ Ветер направляет второй удар!', 's');
            oldDoPlayerHit(mult * 0.7, 'бьёт снова', 0);
          }
        }, 150);
      }

      // Пепельный Жнец: убийство лечит 10%
      if (sp('reaper') && window.COM && COM.e && COM.e.hp <= 0) {
        var heal = Math.round(S.cs.maxhp * 0.10);
        S.hero.hp = Math.min(S.cs.maxhp, S.hero.hp + heal);
        feed('💀 Жатва жизни: +' + fmt(heal) + ' ОЗ', 'c');
        floatDmg('pface', '+' + fmt(heal), 'f-heal');
      }
    };
  }

  /* =====================================================
     4. РЕБАЛАНС: ОПЫТ И ЗОЛОТО
     ===================================================== */
  
  // Немного сглаживаем кривую опыта на высоких уровнях
  window.xpNeed = function (l) {
    if (l <= 10) return Math.round(42 * Math.pow(l, 1.75));
    return Math.round(45 * Math.pow(l, 1.8)); // Чуть дольше после 10 lvl
  };

  // Увеличиваем дроп золота с элит и боссов
  var oldGainGold = window.gainGold;
  if (typeof oldGainGold === 'function') {
    window.gainGold = function (n) {
      if (window.COM && COM.e) {
        if (COM.e.boss) n = Math.round(n * 1.3);
        else if (COM.e.elite) n = Math.round(n * 1.2);
      }
      return oldGainGold(n);
    };
  }

  /* =====================================================
     5. ПОВЫШАЕМ ШАНС ЛУТА В СЕКРЕТНЫХ ДАНЖАХ
     ===================================================== */
  var oldOpenChest = window.openChest;
  if (typeof oldOpenChest === 'function') {
    window.openChest = function (r, locked) {
      // Если это 3-й данж (индекс 2), считаем его "секретным"
      var isSecretDungeon = (window.RUN && RUN.di === 2);
      
      if (isSecretDungeon) {
        // В секретных данжах сундуки всегда дают редкость не ниже эпической (3)
        if (!locked) locked = true; 
      }

      oldOpenChest(r, locked);
    };
  }

  /* =====================================================
     6. ОБНОВЛЯЕМ ТЕКСТЫ СРАВНЕНИЯ (ЧТОБЫ ВИДЕТЬ БЛОК/ШИПЫ)
     ===================================================== */
  if (window.CUSTOM_STAT_NAMES) {
    window.CUSTOM_STAT_NAMES.block = 'Шанс Блока';
    window.CUSTOM_STAT_NAMES.thorns = 'Урон Шипов';
  } else {
    // Если QoL ещё не загрузился, патчим MODNAMES
    if (window.MODNAMES) {
      window.MODNAMES.block = 'Шанс Блока';
      window.MODNAMES.thorns = 'Урон Шипов';
    }
  }

})();