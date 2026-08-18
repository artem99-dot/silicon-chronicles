'use strict';

function log(h, cls) {
  if (!S) return;

  S.log.unshift({
    h: h,
    cls: cls || ''
  });

  if (S.log.length > 80) {
    S.log.pop();
  }

  if (typeof renderLog === 'function') {
    renderLog();
  }
}

function toast(h, cls) {
  var t = $('toast');
  if (!t) return;

  t.className = 'toast show ' + (cls || '');
  t.innerHTML = h;

  clearTimeout(t._x);

  t._x = setTimeout(function() {
    t.classList.remove('show');
  }, 2400);
}

function shake(el) {
  if (!el) return;

  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

function flashElement(el) {
  if (!el) return;

  el.classList.remove('hit-flash');
  void el.offsetWidth;
  el.classList.add('hit-flash');
}