'use strict';

function startCombat(enemy, ctx) {
  ctx = Object.assign({}, ctx || {}, {
    boss: !!(enemy && enemy.boss)
  });

  COM = {
    e: enemy,
    ctx: ctx,
    over: false,

    pbuffs: (RUN && RUN.buffs)
      ? RUN.buffs.map(function(b) {
        return Object.assign({}, b);
      })
      : [],

    pdot: null,
    t: 0,
    sec: 0,
    pAtk: 0,
    eAtk: 0,
    gcd: 0,
    potCd: 0,
    cd: {},
    iv: null
  };

  COM.e.hp = COM.e.maxhp;

  renderCombat();

  COM.iv = setInterval(combatTick, 250);
}

function stopCombat() {
  if (COM && COM.iv) {
    clearInterval(COM.iv);
    COM.iv = null;
  }
}

function feed(h, c) {
  var f = $('cfeed');
  if (!f) return;

  var p = document.createElement('p');
  p.className = c || 'p';
  p.innerHTML = h;

  f.appendChild(p);

  while (f.children.length > 60) {
    f.removeChild(f.firstChild);
  }

  f.scrollTop = f.scrollHeight;
}

function updateLowHpState() {
  if (!S || !S.hero || !S.cs) {
    document.body.classList.remove('low-hp');
    return;
  }

  var ratio = Math.max(0, S.hero.hp) / S.cs.maxhp;
  document.body.classList.toggle('low-hp', ratio <= 0.3);
}

function eDmgMul() {
  var e = COM.e;
  var m = 1;

  e.buffs.forEach(function(b) {
    if (b.k === 'dmg') m += b.pct / 100;
  });

  return m;
}

function dmgToPlayer(raw) {
  var a = S.cs.armor;

  COM.pbuffs.forEach(function(b) {
    if (b.k === 'armor') a *= (1 + b.pct / 100);
  });

  var red = a / (a + 40 + COM.e.lv * 18);
  var d = raw * (1 - red);

  COM.pbuffs.forEach(function(b) {
    if (b.k === 'shield') d *= (1 - b.pct / 100);
  });

  if (sp('oath') && S.hero.hp < S.cs.maxhp * 0.3) {
    d *= 0.8;
  }

  return Math.max(1, d);
}

function enemyStrike(mult) {
  var e = COM.e;
  var raw = e.dmg * mult * eDmgMul() * R(0.85, 1.15);

  if (e.elem) {
    var res = elemRes(e.elem);

    return Math.round(
      dmgToPlayer(raw * 0.6) +
      Math.max(1, raw * 0.4 * (1 - res))
    );
  }

  return Math.round(dmgToPlayer(raw));
}

function applyEnemyMods(d, sk) {
  var e = COM.e;

  var defB = e.buffs.find(function(b) {
    return b.k === 'def';
  });

  if (defB) d *= (1 - defB.pct / 100);

  if (e.trait && e.trait.k === 'stone' && !sk.pierce) {
    d *= 0.65;
  }

  if (e.trait && e.trait.k === 'curse') {
    d *= 0.8;
  }

  if (e.debuff) {
    d *= (1 + e.debuff.pct / 100);
  }

  if (e.boss && sp('reap')) {
    d *= 1.3;
  }

  var eArm = (e.arm || 0) * (sk.pierce ? 0.5 : 1);

  d *= (1 - eArm / (eArm + 120 + S.hero.lvl * 12));

  return Math.max(1, Math.round(d));
}

function onPlayerDealtDmg(e, d) {
  // Оставлено под будущие эффекты.
  // Вампиризм врага теперь обрабатывается в enemyVampHeal().
}

function enemyVampHeal(e, damage) {
  if (!e || !e.trait || e.trait.k !== 'vamp') return;
  if (e.hp <= 0) return;

  var heal = Math.max(1, Math.round(damage * 0.3));

  e.hp = Math.min(e.maxhp, e.hp + heal);

  feed('🩸 ' + e.n + ' высасывает жизнь: +' + fmt(heal), 'e');
  floatDmg('eface', '+' + fmt(heal), 'f-heal');
}

function floatDmg(elId, txt, cls) {
  var el = $(elId);
  if (!el) return;

  var s = document.createElement('span');
  s.className = 'float ' + (cls || '');
  s.textContent = txt;

  el.appendChild(s);

  setTimeout(function() {
    if (s.parentNode) {
      s.parentNode.removeChild(s);
    }
  }, 950);
}

function weaponProcs(base, e) {
  var wg = S.cs.wg;
  var fx = [];

  if (wg.burnCh && Math.random() * 100 < wg.burnCh) {
    e.dot = Math.max(e.dot, 3);
    e.dotD = Math.max(e.dotD, Math.max(1, Math.round(base * 0.12)));
    e.dotEl = 'fire';
    fx.push('🔥 поджог');
  }

  if (wg.poisonCh && Math.random() * 100 < wg.poisonCh) {
    e.dot = Math.max(e.dot, 3);
    e.dotD = Math.max(e.dotD, Math.max(1, Math.round(base * 0.12)));
    e.dotEl = 'poison';
    fx.push('☠ отрава');
  }

  if (wg.slow && !e.slow) {
    e.slow = true;
    fx.push('❄ замедление');
  }

  return fx;
}

function elemBonus(d) {
  var wg = S.cs.wg;
  var sum = wg.fire + wg.poison + wg.ice + wg.light;

  return sum > 0 ? Math.round(d * sum / 100) : 0;
}

function playerDmgMul() {
  var m = 1;

  if (sp('psalm')) {
    var miss = 1 - S.hero.hp / S.cs.maxhp;
    m += Math.floor(miss * 100 / 3) / 100;
  }

  return m;
}

function autoAttack() {
  if (!COM || COM.over) return;

  doPlayerHit(1, 'бьёт', 0);
}

function doPlayerHit(mult, verb, extraCrit) {
  if (!COM) return;

  var c = S.cs;
  var h = S.hero;
  var e = COM.e;

  var base = Math.round(R(c.dmgMin, c.dmgMax) * mult * playerDmgMul());

  if (h.race === 'orc' && h.hp < c.maxhp * 0.35) {
    base = Math.round(base * 1.25);
  }

  var pb = 1;

  COM.pbuffs.forEach(function(b) {
    if (b.k === 'dmg') pb += b.pct / 100;
  });

  base = Math.round(base * pb);

  var crit = Math.random() * 100 < critChance() + extraCrit;
  var d = applyEnemyMods(Math.round(base * (crit ? c.critd / 100 : 1)), {});
  var eb = elemBonus(d);

  e.hp -= d + eb;

  onPlayerDealtDmg(e, d + eb);

  e.hitN = (e.hitN || 0) + 1;

  var fcls = crit ? 'crit' : (eb > 0 ? ('f-' + (wgDomElem() || 'fire')) : '');

  feed(
    '⚔ ' + h.name + ' ' + verb + ': <b>' + fmt(d) + '</b>' +
    (eb ? ' <span style="color:#9fd0c8">+' + fmt(eb) + ' стихии</span>' : '') +
    (crit ? ' <span class="c">КРИТ!</span>' : ''),
    crit ? 'c' : 'p'
  );

  floatDmg('eface', '-' + fmt(d + eb), fcls);
  shake($('ecard'));

  if (typeof flashElement === 'function') {
    flashElement($('ecard'));
  }

  if (sp('bell') && e.hitN % 4 === 0 && e.hp > 0) {
    e.stun = Math.max(e.stun, 1);
    feed('🔔 Колокол оглушает!', 'c');
  }

  var fx = weaponProcs(base, e);

  if (fx.length) {
    feed('💎 ' + fx.join(', '), 's');
  }

  if (sp('tear') && e.hp > 0) {
    e.dot = Math.max(e.dot, 3);
    e.dotD = Math.max(e.dotD, Math.max(1, Math.round(base * 0.08)));
    e.dotEl = 'poison';
  }

  if (sp('vulcan') && e.hp > 0) {
    e.dot = Math.max(e.dot, 3);
    e.dotD = Math.max(e.dotD, Math.max(1, Math.round(base * 0.1)));
    e.dotEl = 'fire';
  }

  if (crit && sp('wolf')) {
    var wh = Math.round(c.maxhp * 0.05);
    h.hp = Math.min(c.maxhp, h.hp + wh);
    floatDmg('pface', '+' + fmt(wh), 'f-heal');
  }

  if (c.leech > 0) {
    var lh = Math.round((d + eb) * c.leech / 100);

    if (lh > 0) {
      h.hp = Math.min(c.maxhp, h.hp + lh);
      floatDmg('pface', '+' + fmt(lh), 'f-heal');
    }
  }

  if (e.hp <= 0) return onWin();

  renderTop();
}

function useSkill(key) {
  if (!COM || COM.over) return;

  var cls = S.hero.cls;
  var si = CLASSES[cls].skills.indexOf(key);
  var sk = SKILLDB[key];

  if (si < 0 || !sk) return;

  var rank = skillRank(si);
  var mast = hasMastery(si);

  if (rank < 1) return;

  var h = S.hero;
  var c = S.cs;

  if ((COM.cd[key] || 0) > 0 || COM.gcd > 0) return;

  if (h.mp < sk.mp) {
    feed('Недостаточно маны!', 's');
    return;
  }

  h.mp -= sk.mp;

  COM.cd[key] = cdFor(rank, mast);
  COM.gcd = 900;

  var rMul = 1 + 0.15 * (rank - 1);

  if (sk.selfcost) {
    var cost = Math.round(c.maxhp * sk.selfcost / 100);
    h.hp = Math.max(1, h.hp - cost);
    feed('🩸 Цена крови: −' + fmt(cost) + ' ОЗ', 'e');
  }

  if (sk.healPct) {
    var pct = sk.healPct * (1 + 0.12 * (rank - 1));

    if (mast && sk.m && sk.m.healPct) {
      pct = sk.m.healPct;
    }

    pct *= (1 + c.healPow / 100);

    var am = Math.round(c.maxhp * pct / 100);

    h.hp = Math.min(c.maxhp, h.hp + am);

    feed('🕊 +' + fmt(am) + ' ОЗ', 'c');
    floatDmg('pface', '+' + fmt(am), 'f-heal');

    renderTop();
    return;
  }

  if (sk.buff) {
    var extra = (mast && sk.m && sk.m.buffT) ? sk.m.buffT : 0;

    sk.buff.forEach(function(b) {
      COM.pbuffs.push({
        k: b.k === 'evade' ? 'evade' : b.k,
        pct: Math.round(b.pct * rMul),
        t: b.t + extra
      });
    });

    feed('✦ ' + sk.n, 'c');

    if (mast && sk.m && sk.m.healPct) {
      var am2 = Math.round(c.maxhp * sk.m.healPct / 100);

      h.hp = Math.min(c.maxhp, h.hp + am2);

      feed('✚ +' + fmt(am2) + ' ОЗ', 'c');
      floatDmg('pface', '+' + fmt(am2), 'f-heal');
    }

    renderTop();
    return;
  }

  var e = COM.e;
  var mult = (sk.mult || 1) * rMul;

  var base = Math.round(
    (sk.mag
      ? c.spellPow * mult
      : R(c.dmgMin, c.dmgMax) * mult
    ) *
    playerDmgMul()
  );

  var hits = sk.hits || 1;

  if (mast && sk.m && sk.m.hits) {
    hits = sk.m.hits;
  }

  var cb = sk.cb || 0;

  if (mast && sk.m && sk.m.cb) {
    cb += sk.m.cb;
  }

  var critdB = (mast && sk.m && sk.m.critd) ? sk.m.critd : 0;

  var execTh = sk.exec || 0;

  if (mast && sk.m && sk.m.exec) {
    execTh = sk.m.exec;
  }

  if (execTh && e.hp <= e.maxhp * execTh / 100) {
    base = Math.round(base * 1.6);
    feed('⚖ Порог казни!', 'c');
  }

  if (sk.combo === 'poison' && e.dot > 0) {
    base = Math.round(base * ((mast && sk.m && sk.m.combo) ? sk.m.combo : 1.8));
    feed('☣ Комбо!', 'c');
  }

  var dealt = 0;

  for (var i = 0; i < hits; i++) {
    if (e.hp <= 0) break;

    var crit = sk.forcrit
      ? true
      : Math.random() * 100 < critChance() + cb;

    var d = applyEnemyMods(
      Math.round(base * (crit ? (c.critd + critdB) / 100 : 1)),
      sk
    );

    var eb = elemBonus(d);

    e.hp -= d + eb;
    dealt += d + eb;

    onPlayerDealtDmg(e, d + eb);

    e.hitN = (e.hitN || 0) + 1;

    var fcls = crit
      ? 'crit'
      : (eb > 0
        ? ('f-' + (wgDomElem() || 'fire'))
        : (sk.mag ? ('f-' + (wgDomElem() || 'fire')) : '')
      );

    feed(
      '⚔ ' + sk.n + (hits > 1 ? ' (' + (i + 1) + '/' + hits + ')' : '') +
      ': <b>' + fmt(d) + '</b>' +
      (eb ? ' <span style="color:#9fd0c8">+' + fmt(eb) + '</span>' : '') +
      (crit ? ' <span class="c">КРИТ!</span>' : ''),
      crit ? 'c' : 'p'
    );

    floatDmg('eface', '-' + fmt(d + eb), fcls);
    shake($('ecard'));

    if (typeof flashElement === 'function') {
      flashElement($('ecard'));
    }

    if (sp('bell') && e.hitN % 4 === 0 && e.hp > 0) {
      e.stun = Math.max(e.stun, 1);
      feed('🔔 Оглушение!', 'c');
    }

    var fx = weaponProcs(base, e);

    if (fx.length && i === 0) {
      feed('💎 ' + fx.join(', '), 's');
    }

    if (crit && sp('wolf')) {
      var wh = Math.round(c.maxhp * 0.05);
      h.hp = Math.min(c.maxhp, h.hp + wh);
      floatDmg('pface', '+' + fmt(wh), 'f-heal');
    }
  }

  var dotSrc = null;

  if (mast && sk.m && sk.m.dot) {
    dotSrc = sk.m.dot;
  } else if (sk.dot) {
    dotSrc = sk.dot;
  }

  if (dotSrc && e.hp > 0) {
    e.dot = dotSrc.t;
    e.dotD = Math.max(1, Math.round(base * dotSrc.pct / 100));
    e.dotEl = sk.mag ? 'fire' : 'poison';

    feed('☠ Эффект терзает врага', 's');
  }

  if (sp('tear') && e.hp > 0 && !dotSrc) {
    e.dot = Math.max(e.dot, 3);
    e.dotD = Math.max(e.dotD, Math.max(1, Math.round(base * 0.08)));
    e.dotEl = 'poison';
  }

  if (sp('vulcan') && e.hp > 0 && !dotSrc) {
    e.dot = Math.max(e.dot, 3);
    e.dotD = Math.max(e.dotD, Math.max(1, Math.round(base * 0.1)));
    e.dotEl = 'fire';
  }

  if (sk.stun && e.hp > 0) {
    e.stun = Math.max(
      e.stun,
      (sk.stun || 0) + ((mast && sk.m && sk.m.stun) ? sk.m.stun : 0)
    );

    feed('❄ Оглушение!', 's');
  }

  if (sk.debuff && e.hp > 0) {
    e.debuff = {
      pct: (mast && sk.m && sk.m.debuff) ? sk.m.debuff : sk.debuff.pct,
      t: sk.debuff.t
    };

    feed('💀 Метка: +' + e.debuff.pct + '% урона', 's');
  }

  var healPct = 0;

  if (sk.heal) {
    healPct = (mast && sk.m && sk.m.heal) ? sk.m.heal : sk.heal;
  }

  if (mast && sk.m && sk.m.leech) {
    healPct += sk.m.leech;
  }

  if (c.leech > 0) {
    healPct += c.leech;
  }

  if (healPct > 0 && dealt > 0) {
    var am3 = Math.round(dealt * healPct / 100 * (1 + c.healPow / 100));

    h.hp = Math.min(c.maxhp, h.hp + am3);

    floatDmg('pface', '+' + fmt(am3), 'f-heal');
  }

  if (sk.after) {
    sk.after.forEach(function(b) {
      COM.pbuffs.push({
        k: b.k === 'evade' ? 'evade' : b.k,
        pct: Math.round(b.pct * rMul),
        t: b.t
      });
    });
  }

  if (e.hp <= 0) return onWin();

  renderTop();
}

function attackOnce(second) {
  if (!COM) return;

  var e = COM.e;

  if (Math.random() * 100 < dodgeChance()) {
    feed('🌀 ' + e.n + ' промахивается!', 's');
    return;
  }

  var d = enemyStrike(1);

  S.hero.hp -= d;

  var fcls = e.elem ? ('f-' + e.elem) : '';

  feed(
    '🩸 ' + e.n + ' атакует' + (second ? ' повторно' : '') +
    ': <b>' + fmt(d) + '</b>' +
    (
      e.elem
        ? ' <span style="color:' + ELEMS[e.elem].c + '">' +
          ELEMS[e.elem].icon + ' ' + ELEMS[e.elem].n.toLowerCase() +
          '</span>'
        : ''
    ),
    'e'
  );

  floatDmg('pface', '-' + fmt(d), fcls);
  shake($('pcard'));

  if (typeof flashElement === 'function') {
    flashElement($('pcard'));
  }

  enemyVampHeal(e, d);

  if (e.trait && (e.trait.k === 'venom' || e.trait.k === 'burn')) {
    var el = e.trait.k === 'burn' ? 'fire' : 'poison';

    COM.pdot = {
      k: el,
      d: Math.max(
        1,
        Math.round(e.dmg * (el === 'fire' ? 0.15 : 0.12) * (1 - elemRes(el)))
      ),
      t: 3
    };

    feed((el === 'fire' ? '🔥 Ожог' : '☠ Яд') + '!', 'e');
  }

  if (S.hero.hp <= 0) return;

  if (!second && e.trait && e.trait.k === 'swift' && Math.random() < 0.25) {
    feed('⚡ Быстрая атака!', 'e');
    attackOnce(true);
  }
}

function enemyAct() {
  if (!COM || COM.over) return;

  var e = COM.e;

  if (!e.enr && e.boss && e.hp < e.maxhp * 0.25) {
    e.enr = true;
    e.buffs.push({
      k: 'dmg',
      pct: 60,
      t: 999
    });

    feed('💢 ' + e.n + ' в ярости! (+60% урона)', 'e');
  }

  e.atkN++;

  var useSp = e.sp && e.atkN % 3 === 0;

  if (useSp) {
    feed('💥 ' + e.n + ' применяет «' + e.sp.n + '»!', 'e');

    var d = enemyStrike(e.sp.m || 1.6);

    S.hero.hp -= d;

    var fcls = e.elem ? ('f-' + e.elem) : 'crit';

    feed(
      'Ты получаешь <b>' + fmt(d) + '</b>' +
      (
        e.elem
          ? ' <span style="color:' + ELEMS[e.elem].c + '">' +
            ELEMS[e.elem].icon +
            '</span>'
          : ''
      ),
      'e'
    );

    floatDmg('pface', '-' + fmt(d), fcls);
    shake($('main'));

    if (typeof flashElement === 'function') {
      flashElement($('pcard'));
    }

    enemyVampHeal(e, d);

    if (e.sp.heal) {
      var am = Math.round(e.maxhp * e.sp.heal / 100);

      e.hp = Math.min(e.maxhp, e.hp + am);

      feed(e.n + ' лечится ' + fmt(am), 'e');
    }

    if (e.sp.buff) {
      e.buffs.push(Object.assign({}, e.sp.buff));
    }
  } else {
    attackOnce(false);
  }

  if (S.hero.hp <= 0) return onLose();
}

function combatTick() {
  if (!COM || COM.over) return;

  var dt = 250;
  var e = COM.e;
  var h = S.hero;
  var c = S.cs;

  COM.t += dt;
  COM.gcd = Math.max(0, COM.gcd - dt);
  COM.potCd = Math.max(0, COM.potCd - dt);

  Object.keys(COM.cd).forEach(function(k) {
    COM.cd[k] = Math.max(0, COM.cd[k] - dt);
  });

  COM.sec += dt;

  if (COM.sec >= 1000) {
    COM.sec -= 1000;

    if (e.dot > 0 && e.hp > 0) {
      e.hp -= e.dotD;

      feed('☠ Эффект: <b>' + fmt(e.dotD) + '</b>', 's');
      floatDmg('eface', '-' + fmt(e.dotD), 'f-' + (e.dotEl === 'fire' ? 'fire' : 'poison'));

      e.dot--;

      if (e.hp <= 0) return onWin();
    }

    if (COM.pdot) {
      h.hp -= COM.pdot.d;

      feed(
        (COM.pdot.k === 'fire' ? '🔥 Ожоги' : '☠ Яд') +
        ': <b>' + fmt(COM.pdot.d) + '</b>',
        'e'
      );

      floatDmg('pface', '-' + fmt(COM.pdot.d), 'f-' + (COM.pdot.k === 'fire' ? 'fire' : 'poison'));

      COM.pdot.t--;

      if (COM.pdot.t <= 0) COM.pdot = null;

      if (h.hp <= 0) return onLose();
    }

    if (e.trait && e.trait.k === 'regen' && e.hp > 0) {
      var am = Math.max(1, Math.round(e.maxhp * 0.03));

      e.hp = Math.min(e.maxhp, e.hp + am);

      feed('💚 ' + e.n + ' регенерирует ' + fmt(am), 's');
    }

    if (sp('crown')) {
      var am2 = Math.round(c.maxhp * 0.02);
      h.hp = Math.min(c.maxhp, h.hp + am2);
    }

    COM.pbuffs.forEach(function(b) {
      if (b.k === 'regen') {
        var am3 = Math.round(c.maxhp * b.pct / 100);
        h.hp = Math.min(c.maxhp, h.hp + am3);
      }
    });

    if (c.regen > 0) {
      var rg = Math.round(c.maxhp * c.regen / 100);
      h.hp = Math.min(c.maxhp, h.hp + rg);
    }

    COM.pbuffs = COM.pbuffs.filter(function(b) {
      b.t--;
      return b.t > 0;
    });

    e.buffs = e.buffs.filter(function(b) {
      b.t--;
      return b.t > 0;
    });

    if (e.debuff) {
      e.debuff.t--;
      if (e.debuff.t <= 0) e.debuff = null;
    }

    if (RUN) {
      RUN.buffs = COM.pbuffs
        .filter(function(b) {
          return b.dg;
        })
        .map(function(b) {
          return Object.assign({}, b);
        });
    }
  }

  COM.pAtk += dt;

  if (COM.pAtk >= pInterval()) {
    COM.pAtk = 0;

    if (!COM.over) autoAttack();

    if (!COM) return;
  }

  if (e.stun > 0) {
    e.stun -= dt / 1000;
  } else {
    COM.eAtk += dt;

    var eInt = 2600 * (e.slow ? 1.15 : 1);

    if (COM.eAtk >= eInt) {
      COM.eAtk = 0;

      enemyAct();

      if (!COM) return;
    }
  }

  renderCombatLive();
}

function renderCombatLive() {
  if (!COM) return;
  if (!$('ehp')) return;

  $('ehp').style.width = Math.max(0, COM.e.hp / COM.e.maxhp * 100) + '%';
  $('ehpt').textContent = fmt(Math.max(0, COM.e.hp)) + ' / ' + fmt(COM.e.maxhp);

  $('php').style.width = Math.max(0, S.hero.hp / S.cs.maxhp * 100) + '%';
  $('phpt').textContent = fmt(Math.max(0, S.hero.hp)) + ' / ' + fmt(S.cs.maxhp);

  if ($('pmpi')) {
    $('pmpi').style.width = Math.max(0, S.hero.mp / S.cs.maxmp * 100) + '%';
  }

  if ($('pmpt')) {
    $('pmpt').textContent = fmt(S.hero.mp) + ' маны';
  }

  if ($('pstat')) {
    $('pstat').innerHTML = COM.pdot
      ? (COM.pdot.k === 'fire' ? '🔥 горит' : '☠ отравлен')
      : '';
  }

  if ($('patk')) {
    $('patk').style.width = Math.min(100, COM.pAtk / pInterval() * 100) + '%';
  }

  if ($('eatk')) {
    $('eatk').style.width = Math.min(100, COM.eAtk / (2600 * (COM.e.slow ? 1.15 : 1)) * 100) + '%';
  }

  CLASSES[S.hero.cls].skills.forEach(function(key) {
    var b = $('skb_' + key);
    if (!b) return;

    var cd = COM.cd[key] || 0;

    b.disabled =
      S.hero.mp < SKILLDB[key].mp ||
      cd > 0 ||
      COM.gcd > 0 ||
      COM.over;

    var s = b.querySelector('small');

    if (s) {
      s.textContent = cd > 0
        ? 'перезарядка ' + (cd / 1000).toFixed(1) + 'с'
        : 'ранг ' + skillRankByKey(key) + ' · ' + SKILLDB[key].mp + ' маны';
    }
  });

  var ph = $('potH');
  var pm = $('potM');

  if (ph) ph.disabled = !S.hero.pots.hp || COM.potCd > 0;
  if (pm) pm.disabled = !S.hero.pots.mp || COM.potCd > 0;

  ['rage', 'stone', 'swift'].forEach(function(k) {
    var b = $('elx_' + k);
    if (!b) return;

    b.disabled = !(S.hero.elix[k] > 0) || COM.potCd > 0;

    var s = b.querySelector('small');

    if (s) {
      s.textContent = '×' + S.hero.elix[k];
    }
  });

  updateLowHpState();

  renderTop();
}

function useElixir(k) {
  if (!COM) return;

  var h = S.hero;

  if (!(h.elix[k] > 0) || COM.potCd > 0) return;

  h.elix[k]--;
  COM.potCd = 2000;

  if (k === 'rage') {
    COM.pbuffs.push({
      k: 'dmg',
      pct: 25,
      t: 10
    });
  }

  if (k === 'stone') {
    COM.pbuffs.push({
      k: 'armor',
      pct: 40,
      t: 10
    });
  }

  if (k === 'swift') {
    COM.pbuffs.push({
      k: 'swiftB',
      pct: 35,
      t: 10
    });
  }

  feed('⚗ ' + ELIXN[k].n + ' выпит!', 'c');

  renderCombatLive();
}

function tryFlee() {
  if (!COM || COM.over) return;

  var ch = 60 + (sp('whisper') ? 15 : 0);

  if (COM.e.boss) {
    feed('От босса не сбежать!', 'e');
    return;
  }

  if (COM.ctx.type === 'arena') {
    feed('С арены не сбегают!', 'e');
    return;
  }

  if (Math.random() * 100 < ch) {
    feed('💨 Ты сбежал!', 's');
    log('Ты сбежал из боя.', 'sys');

    stopCombat();

    var wasRun = COM.ctx.type === 'run';

    COM = null;

    if (wasRun && RUN && MAP) {
      renderDungeon();
    } else {
      S.town = S.town || 'gate';
      renderTown();
    }

    save();

    return;
  }

  feed('Побег не удался!', 'e');
}

function drinkPot(k) {
  var h = S.hero;
  var c = S.cs;

  if (!h.pots[k]) {
    toast('Зелий нет');
    return;
  }

  if (COM && COM.potCd > 0) return;

  if (k === 'hp' && h.hp >= c.maxhp) {
    toast('Здоровье полное');
    return;
  }

  if (k === 'mp' && h.mp >= c.maxmp) {
    toast('Мана полная');
    return;
  }

  h.pots[k]--;

  if (k === 'hp') {
    var base = 0.35 * (1 + c.healPow / 100);
    var am = Math.round(c.maxhp * base);

    h.hp = Math.min(c.maxhp, h.hp + am);

    if (COM) {
      COM.potCd = 2000;
      feed('🧪 +' + fmt(am) + ' ОЗ', 'c');
      floatDmg('pface', '+' + fmt(am), 'f-heal');
    } else {
      log('🧪 +' + fmt(am) + ' ОЗ', 'good');
    }
  } else {
    h.mp = Math.min(c.maxmp, h.mp + Math.round(c.maxmp * 0.5));

    if (COM) {
      COM.potCd = 2000;
      feed('🧪 +50% маны', 'c');
    } else {
      log('🧪 Мана восстановлена', 'good');
    }
  }

  if (COM) {
    renderCombatLive();
  } else {
    renderTown();
  }

  renderTop();
}

function zoneLootName() {
  return RUN
    ? ZONES[RUN.zi].nm + ' · ' + (
      ZONES[RUN.zi].dungeons[RUN.di]
        ? ZONES[RUN.zi].dungeons[RUN.di].nm
        : ''
    )
    : ZONES[S.lastZi || 0].nm;
}

function onWin() {
  if (!COM) return;

  stopCombat();

  COM.over = true;

  var e = COM.e;
  var c = S.cs;
  var ctx = COM.ctx;
  var zi = ctx.zi;
  var zl = ZONES[zi].lv + (ctx.dlvl || 0);

  if (ctx.room) {
    ctx.room.done = true;
  }

  var g = gainGold(Math.round(e.gold * R(0.8, 1.3)));

  log('☠ <b>' + e.n + '</b> повержен! Добыча: <b>' + fmt(g) + '</b> 🪙', 'good');

  if (ctx.type !== 'arena') {
    bumpOrders('kill', zi, 1);
  }

  var src = zoneLootName();

  if (ctx.type !== 'arena') {
    var gearCh = e.boss ? 100 : e.elite ? 35 : 18 + c.mf * 0.2;

    if (Math.random() * 100 < gearCh) {
      var rar = e.boss
        ? bossRarity(zl)
        : (
          e.elite
            ? Math.min(4, mobRarity(zl) + (Math.random() < 0.15 ? 1 : 0))
            : mobRarity(zl)
        );

      addItem(genItem(zl + 2, c.mf, rar), src);
    }

    var setCh = e.boss ? 60 : e.elite ? 12 : 6;

    if (Math.random() * 100 < setCh + c.mf * 0.2) {
      addItem(genItem(zl + 2, c.mf, 3), src);
    }

    if (e.boss && Math.random() < 0.05) {
      addItem(makeUnique(P(UNIQUES)), src);
    } else if (e.elite && Math.random() < 0.01) {
      addItem(makeUnique(P(UNIQUES)), src);
    }

    if (e.boss) {
      var fr = RI(8, 16);
      S.frag += fr;
      log('◆ Осколки: +' + fr, 'loot');
    } else if (e.elite) {
      if (Math.random() < 0.6) {
        var fr2 = RI(1, 2);
        S.frag += fr2;
        log('◆ Осколки: +' + fr2, 'loot');
      }
    } else if (Math.random() < 0.25) {
      S.frag++;
      log('◆ Осколки: +1', 'loot');
    }

    var tNum = e.boss ? 3 : e.elite ? 2 : (Math.random() < 0.45 ? 1 : 0);

    if (tNum > 0) {
      var ti = RI(0, 1);
      var key = zi * 10 + ti;

      S.hero.troph[key] = (S.hero.troph[key] || 0) + tNum;

      log('🎭 Трофей: ' + TROPH[zi][ti].nm + ' ×' + tNum, 'loot');
    }

    var gemCh = e.boss ? 60 : e.elite ? 12 : 3;

    if (Math.random() * 100 < gemCh) {
      dropGem('добыча');
    }
  }

  if (e.boss) {
    bumpOrders('boss', zi, 1);

    var bk = zi * 10 + 9;

    S.hero.troph[bk] = (S.hero.troph[bk] || 0) + 1;

    log('🎭 Трофей босса: <b>' + BOSS_TROPH[zi].nm + '</b>', 'loot');

    S.hero.keys[zi]++;

    log('🗝️ Ключ: ' + KITEMS[zi].nm, 'loot');

    if (!S.hero.bosses[zi]) {
      S.hero.bosses[zi] = 1;

      log('🏆 <b>' + e.n + '</b> пал впервые.', 'story');

      if (zi === ZONES.length - 1) {
        toast('👑 ТРОН ПУСТ. Ты — легенда.');
      }
    }
  }

  S.hero.kills++;

  gainXP(e.xp);
  checkTitles();

  COM = null;

  save();

  if (ctx.type === 'arena') {
    var A = ARENA;

    if (A) {
      S.arenaBest = Math.max(S.arenaBest || 0, A.wave);

      bumpOrders('arena', 0, A.wave);

      A.wave++;
    }

    S.town = 'arena';

    renderTown();
    save();

    return;
  }

  if (e.boss && ctx.type === 'run') {
    S.hero.dungeons = (S.hero.dungeons || 0) + 1;

    bumpOrders('dungeon', zi, 1);

    RUN = null;
    MAP = null;

    toast('🏆 Данж пройден!');
    log('🕳 Подземелье зачищено.', 'good');

    S.town = 'gate';

    renderTown();

    return;
  }

  if (e.boss) {
    RUN = null;
    MAP = null;

    toast('🏆 Босс повержен!');

    S.town = 'gate';

    renderTown();

    return;
  }

  if (ctx.type === 'run') {
    renderDungeon();
    save();
  } else {
    S.town = 'gate';
    renderTown();
  }
}

function onLose() {
  if (!COM) return;

  if (COM.ctx && COM.ctx.type === 'arena') {
    stopCombat();

    COM.over = true;
    COM = null;
    ARENA = null;

    var c2 = calcStats();

    S.hero.hp = Math.max(1, Math.round(c2.maxhp * 0.3));

    log('🏟️ Поражение на арене.', 'sys');
    toast('Поражение на арене');

    save();

    S.town = 'arena';

    renderTown();

    return;
  }

  stopCombat();

  COM.over = true;
  COM = null;

  RUN = null;
  MAP = null;

  var lost = Math.round(S.gold * 0.2);

  S.gold -= lost;

  var forgeNote = '';

  Object.values(S.hero.eq)
    .filter(Boolean)
    .forEach(function(it) {
      if (it.enh > 0) {
        it.enh--;
        forgeNote = ' Заточка −1.';
      }
    });

  calcStats();

  S.hero.hp = S.cs.maxhp;
  S.hero.mp = S.cs.maxmp;

  log('💀 Ты пал… Потеряно <b>' + fmt(lost) + '</b> 🪙.' + forgeNote, 'bad');
  toast('💀 Ты пал…');

  save();

  S.town = 'plaza';

  renderTown();
}

function hunt(zi) {
  S.cs = calcStats();
  S.lastZi = zi;

  startCombat(
    makeEnemy(zi, Math.random() < 0.15, 0),
    {
      type: 'hunt',
      zi: zi
    }
  );
}

function fightBoss(zi) {
  if (!(S.hero.sigils[zi] > 0)) {
    toast('Нужен сигил: ' + SIGILS[zi].nm);
    return;
  }

  S.hero.sigils[zi]--;

  S.cs = calcStats();

  RUN = null;
  MAP = null;

  log(
    '🔮 Сигил «' + SIGILS[zi].nm + '» вспыхивает. ' +
    ZONES[zi].boss.n + ' отвечает на призыв!',
    'story'
  );

  startCombat(
    makeBoss(zi),
    {
      type: 'boss',
      zi: zi
    }
  );

  save();
}

function renderCombat() {
  var m = $('main');

  if (!COM) {
    renderTown();
    return;
  }

  var e = COM.e;
  var c = S.cs;
  var h = S.hero;

  var ehp = Math.max(0, e.hp) / e.maxhp * 100;

  var traitTag = e.trait
    ? '<span style="color:' + e.trait.c + '">' + e.trait.icon + ' ' + e.trait.n + '</span> · '
    : '';

  var elemTag = e.elem
    ? '<span style="color:' + ELEMS[e.elem].c + '">' + ELEMS[e.elem].icon + ' ' + ELEMS[e.elem].n + '</span> · '
    : '';

  var arenaNote = COM.ctx.type === 'arena' && ARENA
    ? ' 🏟️ Арена — волна ' + ARENA.wave + '. Лута нет.'
    : '';

  var html = '<div style="color:var(--dim);font-size:12px;margin-bottom:10px">' +
    'Герой бьёт сам — жми умения.' +
    arenaNote +
    (RUN ? ' Побег вернёт на карту данжа.' : '') +
    '</div>';

  html += '<div id="arena">' +
    '<div class="combatant" id="pcard">' +
    '<div class="tag">' + RACES[h.race].name + ' · ур. ' + h.lvl + '</div>' +
    '<div class="face" id="pface">' + CLASSES[h.cls].icon + '</div>' +
    '<h3>' + h.name + '</h3>' +
    '<div id="pstat" style="font-size:11px;color:#9fd0a8;min-height:14px">' +
    (COM.pdot ? (COM.pdot.k === 'fire' ? '🔥 горит' : '☠ отравлен') : '') +
    '</div>' +
    '<div class="bar hp" style="margin-top:4px">' +
    '<i id="php" style="width:' + (Math.max(0, h.hp) / c.maxhp * 100) + '%"></i>' +
    '<span id="phpt">' + fmt(Math.max(0, h.hp)) + '/' + fmt(c.maxhp) + '</span>' +
    '</div>' +
    '<div class="bar mp" style="margin-top:4px">' +
    '<i id="pmpi" style="width:' + (h.mp / c.maxmp * 100) + '%"></i>' +
    '<span id="pmpt">' + fmt(h.mp) + ' маны</span>' +
    '</div>' +
    '<div class="chlabel">РАЗМАХ</div>' +
    '<div class="bar" style="height:6px">' +
    '<i id="patk" style="width:0%;background:linear-gradient(90deg,#d3a44c,#f0cf8a)"></i>' +
    '</div>' +
    '</div>' +

    '<div class="combatant enemy' + (e.boss ? ' boss' : '') + '" id="ecard">' +
    '<div class="tag">' + traitTag + elemTag + (e.boss ? 'ХРАНИТЕЛЬ' : e.elite ? 'матёрый' : 'противник') + ' · ур. ' + e.lv + '</div>' +
    '<div class="face" id="eface">' + e.f + '</div>' +
    '<h3>' + e.n + '</h3>' +
    '<div style="font-size:11px;color:var(--dim);min-height:14px">' +
    (e.stun > 0 ? '❄ оглушён' : e.dot > 0 ? '☠ терзает эффект' : '') +
    '</div>' +
    '<div class="bar hp" style="margin-top:4px">' +
    '<i id="ehp" style="width:' + ehp + '%"></i>' +
    '<span id="ehpt">' + fmt(Math.max(0, e.hp)) + '/' + fmt(e.maxhp) + '</span>' +
    '</div>' +
    '<div class="chlabel">ЗАМАХ</div>' +
    '<div class="bar" style="height:6px">' +
    '<i id="eatk" style="width:0%;background:linear-gradient(90deg,#8c2020,#e0605a)"></i>' +
    '</div>' +
    '</div>' +
    '</div>';

  html += '<div id="cfeed"></div><div class="skillbar">';

  CLASSES[h.cls].skills.forEach(function(key, si) {
    var s = SKILLDB[key];
    var rk = skillRank(si);

    if (rk < 1) {
      html += '<button class="btn" disabled title="Изучи в древе">' + s.n + '<small>не изучено</small></button>';
      return;
    }

    html += '<button class="btn" id="skb_' + key + '" onclick="useSkill(\'' + key + '\')" title="' +
      s.txt + (hasMastery(si) ? ' · ' + s.md : '') + '">' +
      s.n + (hasMastery(si) ? '★' : '') +
      '<small>ранг ' + rk + ' · ' + s.mp + ' маны</small>' +
      '</button>';
  });

  html += '<button class="btn" id="potH" onclick="drinkPot(\'hp\')">🧪 ОЗ (' + h.pots.hp + ')<small>зелье</small></button>';
  html += '<button class="btn" id="potM" onclick="drinkPot(\'mp\')">🧪 Мана (' + h.pots.mp + ')<small>зелье</small></button>';

  ['rage', 'stone', 'swift'].forEach(function(k) {
    html += '<button class="btn" id="elx_' + k + '" onclick="useElixir(\'' + k + '\')" ' +
      ((S.hero.elix[k] > 0) ? '' : 'disabled') + '>' +
      ELIXN[k].icon +
      '<small>×' + S.hero.elix[k] + '</small>' +
      '</button>';
  });

  html += '<button class="btn danger" onclick="tryFlee()" ' +
    ((e.boss || COM.ctx.type === 'arena') ? 'disabled' : '') + '>' +
    '💨 Побег<small>' + (60 + (sp('whisper') ? 15 : 0)) + '%</small>' +
    '</button></div>';

  m.innerHTML = html;

  feed(
    'Бой начался. ' +
    (
      e.boss
        ? e.n + ' смотрит на тебя, как на надпись на надгробии.'
        : e.trait
          ? e.trait.icon + ' ' + e.n + ' — ' + e.trait.n.toLowerCase() + '.'
          : e.n + ' преграждает путь!'
    ) +
    (e.elem ? ' Стихия: ' + ELEMS[e.elem].icon + ' ' + ELEMS[e.elem].n + '.' : ''),
    's'
  );

  renderCombatLive();
}