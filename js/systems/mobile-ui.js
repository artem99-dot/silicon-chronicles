'use strict';

(function () {

  function isMobileUI() {
    try {
      return window.matchMedia('(max-width: 760px)').matches;
    } catch (e) {
      return false;
    }
  }

  window.isMobileUI = isMobileUI;

  function ensureUI() {
    if (!window.S) return;

    if (!S.ui) {
      S.ui = {};
    }
  }

  /*
    Добавляем класс на body, если открыто на телефоне.
    Можно использовать для будущих стилей.
  */
  function updateBodyClass() {
    document.body.classList.toggle('mobile-ui', isMobileUI());
  }

  window.addEventListener('resize', updateBodyClass);
  updateBodyClass();

  /* =====================================================
     МОБИЛЬНОЕ ДРЕВО НАВЫКОВ
     ===================================================== */

  var oldTownTree = window.townTree;
  var oldDrawTree = window.drawTree;

  window.townTree = function () {
    if (isMobileUI()) {
      return townTreeMobile();
    }

    if (typeof oldTownTree === 'function') {
      return oldTownTree.apply(this, arguments);
    }

    return '';
  };

  window.drawTree = function () {
    if (isMobileUI()) {
      return;
    }

    if (typeof oldDrawTree === 'function') {
      oldDrawTree.apply(this, arguments);
    }
  };

  function treeNodeId(si, kind) {
    if (kind === 'mastery') {
      return 'm_' + si;
    }

    var rank = skillRank(si);
    return 'r_' + si + '_' + (rank + 1);
  }

  window.treeSelect = function (si, kind) {
    ensureUI();

    S.ui.treeSel = {
      si: si,
      kind: kind
    };

    renderTown();

    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (e) {}
  };

  window.treeCancel = function () {
    ensureUI();
    S.ui.treeSel = null;
    renderTown();
  };

  window.treeConfirm = function () {
    ensureUI();

    var sel = S.ui.treeSel;
    if (!sel) return;

    var id = treeNodeId(sel.si, sel.kind);

    S.ui.treeSel = null;

    if (typeof allocNode === 'function') {
      allocNode(id);
    }

    renderTown();
  };

  function rankPips(rank) {
    var html = '<span class="tree-rank">';

    for (var i = 1; i <= 5; i++) {
      html += '<i class="' + (i <= rank ? 'on' : '') + '"></i>';
    }

    html += '</span>';

    return html;
  }

  function treeConfirmHtml() {
    ensureUI();

    var sel = S.ui.treeSel;
    if (!sel) return '';

    var si = sel.si;
    var kind = sel.kind;
    var key = CLASSES[S.hero.cls].skills[si];
    var sk = SKILLDB[key];

    if (!sk) return '';

    var rank = skillRank(si);
    var mast = hasMastery(si);

    var nodeId = treeNodeId(si, kind);
    var can = false;

    if (window.CT && typeof canAllocCT === 'function') {
      can = canAllocCT(nodeId) && S.hero.pts > 0;
    } else {
      can = S.hero.pts > 0;
    }

    var title = '';
    var desc = '';

    if (kind === 'mastery') {
      title = '★ Мастерство: ' + sk.n;

      desc =
        '<b>Эффект мастерства:</b><br>' + sk.md + '<br><br>' +
        (mast ? 'Мастерство уже освоено.' : 'Для освоения нужен 5-й ранг навыка и 1 очко навыков.');
    } else {
      title = 'Навык: ' + sk.n;

      var curTxt = rank > 0
        ? skillEffTxt(key, rank)
        : 'Навык ещё не изучен.';

      var nextTxt = rank < 5
        ? skillEffTxt(key, rank + 1)
        : 'Достигнут максимальный ранг.';

      desc =
        '<b>Текущий ранг:</b> ' + rank + '/5<br>' +
        '<b>Сейчас:</b> ' + curTxt + '<br><br>' +
        '<b>После прокачки:</b> ' + nextTxt + '<br><br>' +
        'Стоимость: <b>1 очко навыков</b>.';
    }

    var reason = '';

    if (S.hero.pts < 1) {
      reason = 'Недостаточно очков навыков.';
    } else if (kind === 'rank' && rank >= 5) {
      reason = 'Ранг уже максимальный.';
    } else if (kind === 'mastery' && rank < 5) {
      reason = 'Сначала изучи 5-й ранг навыка.';
    } else if (kind === 'mastery' && mast) {
      reason = 'Мастерство уже освоено.';
    }

    return (
      '<div class="panel tree-confirm">' +
      '<h3>' + title + '</h3>' +
      '<div class="tree-confirm-desc">' + desc + '</div>' +
      (reason ? '<div style="color:var(--blood);font-size:12px;margin-bottom:8px">' + reason + '</div>' : '') +
      '<div class="tree-confirm-actions">' +
      '<button class="btn gold" onclick="treeConfirm()" ' + (can ? '' : 'disabled') + '>✔ Прокачать</button>' +
      '<button class="btn" onclick="treeCancel()">✖ Отмена</button>' +
      '</div>' +
      '</div>'
    );
  }

  function townTreeMobile() {
    if (!window.CT) {
      buildClassTree();
    }

    ensureUI();

    var cls = S.hero.cls;
    var skills = CLASSES[cls].skills;
    var sel = S.ui.treeSel || null;

    var html =
      '<button class="btn small" onclick="S.town=\'hero\';renderTown()">← Герой</button> ' +
      '<button class="btn small danger" onclick="refundTree()">🌀 Забыть всё (' + spentPts() * 30 + ' 🪙)</button>' +
      '<div style="margin:8px 0;color:var(--dim);font-size:12px">' +
      'Очков навыков: <b class="gold-strong">' + S.hero.pts + '</b><br>' +
      'Нажми «Выбрать», чтобы увидеть эффект перед прокачкой.' +
      '</div>';

    html += treeConfirmHtml();

    html += '<div class="tree-mobile">';

    skills.forEach(function (key, si) {
      var sk = SKILLDB[key];
      var rank = skillRank(si);
      var mast = hasMastery(si);

      var isSelected =
        sel &&
        sel.si === si;

      var selectedKind = isSelected ? sel.kind : '';

      var currentTxt = rank > 0
        ? skillEffTxt(key, rank)
        : 'Не изучено';

      var nextTxt = rank < 5
        ? skillEffTxt(key, rank + 1)
        : 'Максимальный ранг';

      html +=
        '<div class="tree-skill' + (isSelected ? ' selected' : '') + '">' +
        '<div>' +
        '<h4>' + sk.n + (mast ? ' <span class="mast">МАСТЕРСТВО</span>' : '') + '</h4>' +
        rankPips(rank) +
        '<div class="tree-desc">' +
        '<b>Сейчас:</b> ' + currentTxt + '<br>' +
        '<b>Дальше:</b> ' + nextTxt + '<br>' +
        '<b>Мастерство:</b> ' + sk.md +
        '</div>' +
        '</div>' +

        '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="btn small tree-select-btn ' + (isSelected && selectedKind === 'rank' ? 'gold' : '') + '" ' +
        'onclick="treeSelect(' + si + ',\'rank\')">' +
        (rank >= 5 ? 'Ранг макс.' : 'Выбрать ранг') +
        '</button>' +

        '<button class="btn small tree-select-btn ' + (isSelected && selectedKind === 'mastery' ? 'gold' : '') + '" ' +
        'onclick="treeSelect(' + si + ',\'mastery\')">' +
        (mast ? 'Мастерство ✔' : 'Выбрать мастерство') +
        '</button>' +
        '</div>' +
        '</div>';
    });

    html += '</div>';

    return html;
  }

})();