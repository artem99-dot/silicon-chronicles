'use strict';

function renderTop() {
  if (!S || !S.hero) return;

  var c = S.cs || calcStats();
  var h = S.hero;

  $('t-name').textContent = h.name;
  $('t-race').textContent = RACES[h.race].name + ' · ' + CLASSES[h.cls].name;
  $('t-lvl').textContent = h.lvl;

  var ri = rankInfo();

  $('topbar-rank').textContent = ri.r.ic + ' ' + ri.r.n;

  $('b-hp').style.width = (Math.max(0, h.hp) / c.maxhp * 100) + '%';
  $('t-hp').textContent = 'ОЗ ' + fmt(Math.max(0, h.hp)) + '/' + fmt(c.maxhp);

  $('b-mp').style.width = (Math.max(0, h.mp) / c.maxmp * 100) + '%';
  $('t-mp').textContent = 'Мана ' + fmt(Math.max(0, h.mp)) + '/' + fmt(c.maxmp);

  $('b-xp').style.width = (h.xp / xpNeed(h.lvl) * 100) + '%';
  $('t-xp').textContent = 'опыт ' + fmt(h.xp) + '/' + fmt(xpNeed(h.lvl));

  $('t-gold').textContent = fmt(S.gold) + ' 🪙';
  $('t-frag').textContent = fmt(S.frag) + ' ◆';

  if (typeof updateLowHpState === 'function') {
    updateLowHpState();
  }
}

function renderLog() {
  if (!S) return;

  var el = $('logbox');
  if (!el) return;

  el.innerHTML = S.log.map(function(e) {
    return '<div class="le ' + e.cls + '">' + e.h + '</div>';
  }).join('');
}