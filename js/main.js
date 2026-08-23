'use strict';

/* =====================================================
   MAIN.JS — ТОЧКА ВХОДА ИГРЫ
   ===================================================== */

/* =====================================================
   1. CANVAS-ЭФФЕКТЫ (ПЕПЕЛ И УГОЛЬКИ)
   ===================================================== */

function initCanvasEffects() {
  var cv = document.getElementById('fx');
  if (!cv) return;
  
  var cx = cv.getContext('2d');
  var embers = [];
  
  function fxResize() {
    cv.width = innerWidth;
    cv.height = innerHeight;
  }
  
  addEventListener('resize', fxResize);
  fxResize();
  
  for (var ei = 0; ei < 60; ei++) {
    embers.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      v: R(0.2, 0.9),
      s: R(1, 2.6),
      a: R(0.1, 0.6),
      w: R(0, 6.28)
    });
  }
  
  (function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    embers.forEach(function(p) {
      p.y -= p.v;
      p.w += 0.02;
      p.x += Math.sin(p.w) * 0.3;
      if (p.y < -10) {
        p.y = innerHeight + 10;
        p.x = Math.random() * innerWidth;
      }
      cx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.w * 2));
      cx.fillStyle = Math.random() < 0.1 ? '#f0cf8a' : '#e0653a';
      cx.beginPath();
      cx.arc(p.x, p.y, p.s, 0, 6.28);
      cx.fill();
    });
    cx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
}

/* =====================================================
   2. МИГРАЦИЯ СОХРАНЕНИЙ
   ===================================================== */

function normalizeSave() {
  if (!S || !S.hero) return;
  
  // Ключи и сигилы
  while (S.hero.keys.length < 8) S.hero.keys.push(0);
  while (S.hero.sigils.length < 8) S.hero.sigils.push(0);
  
  // Самоцветы
  if (!S.hero.gems) S.hero.gems = {};
  Object.keys(S.hero.gems).forEach(function(k) {
    if (typeof S.hero.gems[k] === 'number') {
      S.hero.gems[k] = { n: S.hero.gems[k], lv: 1 };
    }
  });
  
  // Эликсиры
  if (!S.hero.elix) S.hero.elix = { rage: 0, stone: 0, swift: 0 };
  
  // Трофеи
  if (!S.hero.troph) S.hero.troph = {};
  
  // Бонусы характеристик
  if (!S.hero.bonus) S.hero.bonus = { str: 0, dex: 0, int: 0, vit: 0, luk: 0 };
  
  // Очки характеристик
  if (S.hero.sp === undefined) S.hero.sp = 3 * Math.max(0, S.hero.lvl - 1);
  
  // Древо навыков
  if (!S.hero.talloc) S.hero.talloc = { origin: true, r_0_1: true };
  
  // Титулы
  if (!S.hero.titles) S.hero.titles = { novice: 1 };
  if (!S.hero.title) S.hero.title = 'novice';
  
  // Статистика
  if (S.hero.enhOk === undefined) S.hero.enhOk = 0;
  if (S.hero.gamesWon === undefined) S.hero.gamesWon = 0;
  if (S.hero.meals === undefined) S.hero.meals = 0;
  
  // Арена
  if (S.arenaBest === undefined) S.arenaBest = 0;
  if (S.lastRank === undefined) S.lastRank = 0;
  
  // Временные баффы
  if (!S.timed) S.timed = [];
  
  // Заказы
  if (!S.board || !S.board.orders) {
    S.board = {
      orders: [
        genOrder(), genOrder(), genOrder(),
        genOrder(), genOrder(), genOrder()
      ]
    };
  }
  while (S.board.orders.length < 6) S.board.orders.push(genOrder());
  
  // Обереги
  S.hero.prot = S.hero.prot || 0;
  S.lastZi = S.lastZi || 0;
  if (!S.town) S.town = 'plaza';
  
  // Гнёзда и самоцветы в предметах
  Object.values(S.hero.eq).filter(Boolean).concat(S.hero.inv).forEach(function(it) {
    if (!it.gems) it.gems = [];
    if (it.sockets === undefined) it.sockets = 0;
  });
  
  // НОВАЯ СИСТЕМА НАВЫКОВ
  if (S.hero.newSkillSystem === undefined) {
    S.hero.newSkillSystem = true;
    
    // Мигрируем старые очки в новую систему
    var oldPts = S.hero.pts || 0;
    S.hero.skillPoints = oldPts;
    
    // Сбрасываем старое древо, если оно было
    S.hero.talloc = {};
    
    log('🔄 Система навыков обновлена. Очки навыков перенесены.', 'sys');
  }
  
  if (S.hero.skillPoints === undefined) {
    S.hero.skillPoints = 0;
  }
  
  // Питомцы
  if (!S.hero.pets) S.hero.pets = [];
  if (S.hero.activePet === undefined) S.hero.activePet = null;
  
  // UI настройки
  if (!S.ui) S.ui = { mapPage: 0 };
}

/* =====================================================
   3. РЕНДЕРИНГ
   ===================================================== */

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

/* =====================================================
   4. ИНИЦИАЛИЗАЦИЯ ИГРЫ
   ===================================================== */

function initGame() {
  var sv = null;
  
  try {
    sv = localStorage.getItem('AS3');
  } catch (e) {}
  
  if (sv) {
    try {
      S = JSON.parse(sv);
      S.ui = S.ui || { mapPage: 0 };
      S.log = S.log || [];
      S.hero.pots = S.hero.pots || { hp: 0, mp: 0 };
      
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

/* =====================================================
   5. ОБРАБОТКА КЛАВИАТУРЫ (ДАНЖ)
   ===================================================== */

document.addEventListener('keydown', function(e) {
  // Навигация в данже
  if (!S || !RUN || !MAP) return;
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  
  var k = e.key.toLowerCase();
  var dirs = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0]
  };
  
  if (!dirs[k]) return;
  
  e.preventDefault();
  
  var cur = MAP.rooms[MAP.cur];
  var want = dirs[k];
  var best = null;
  var bestScore = 1e9;
  
  cur.adj.forEach(function(id) {
    var r = MAP.rooms[id];
    var dx = r.x - cur.x;
    var dy = r.y - cur.y;
    var dot = dx * want[0] + (-dy) * want[1];
    
    if (dot > 0 && dot < bestScore) {
      bestScore = dot;
      best = id;
    }
  });
  
  if (best) moveTo(best);
});

/* =====================================================
   6. ТАЙМЕРЫ ЗАКАЗОВ
   ===================================================== */

function updateGuildTimers() {
  if (!S || !S.board || S.town !== 'guild') return;
  
  var orders = document.querySelectorAll('.order');
  if (!orders.length) return;
  
  orders.forEach(function(el, i) {
    var o = S.board.orders[i];
    if (!o) return;
    
    var tm = el.querySelector('.tm');
    if (!tm) return;
    
    if (o.prog >= o.n) {
      tm.textContent = 'готово';
      tm.classList.remove('low');
      el.classList.add('done');
      return;
    }
    
    var left = o.deadline - now();
    
    if (left <= 0) {
      tm.textContent = 'сгорел';
      tm.classList.add('low');
      el.classList.add('exp');
      return;
    }
    
    var mins = Math.max(0, Math.floor(left / 60000));
    var secs = Math.max(0, Math.floor((left % 60000) / 1000));
    
    tm.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
    tm.classList.toggle('low', left < 3 * 60000);
  });
}

// Обновляем таймеры каждую секунду
setInterval(updateGuildTimers, 1000);

/* =====================================================
   7. ЗАПУСК
   ===================================================== */

// Инициализируем canvas-эффекты
initCanvasEffects();

// Запускаем игру
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

/* =====================================================
   8. ЭКСПОРТ/ИМПОРТ СОХРАНЕНИЯ (БОНУС)
   ===================================================== */

function exportSave() {
  if (!S) {
    toast('Нет сохранения');
    return;
  }
  
  try {
    var data = JSON.stringify(S);
    var encoded = btoa(unescape(encodeURIComponent(data)));
    
    var textarea = document.createElement('textarea');
    textarea.value = encoded;
    textarea.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;height:60%;z-index:9999;background:#000;color:#fff;padding:20px;font-family:monospace;font-size:12px;';
    
    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Закрыть';
    closeBtn.className = 'btn';
    closeBtn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:10000;';
    closeBtn.onclick = function() {
      textarea.remove();
      closeBtn.remove();
    };
    
    document.body.appendChild(textarea);
    document.body.appendChild(closeBtn);
    
    textarea.select();
    toast('Скопируйте текст сохранения');
  } catch (e) {
    toast('Ошибка экспорта');
    console.error(e);
  }
}

function importSave() {
  var encoded = prompt('Вставьте код сохранения:');
  if (!encoded) return;
  
  try {
    var data = decodeURIComponent(escape(atob(encoded)));
    var imported = JSON.parse(data);
    
    if (!imported.hero) {
      toast('Неверный формат сохранения');
      return;
    }
    
    if (!confirm('Это заменит текущее сохранение. Продолжить?')) return;
    
    localStorage.setItem('AS3', JSON.stringify(imported));
    location.reload();
  } catch (e) {
    toast('Ошибка импорта');
    console.error(e);
  }
}

// Делаем функции доступными глобально
window.exportSave = exportSave;
window.importSave = importSave;