'use strict';

function arenaStart(diff) {
  if (diff === 2 && rankInfo().idx < 3) {
    toast('Нужен Серебряный ранг');
    return;
  }

  ARENA = {
    wave: 1,
    diff: diff
  };

  arenaFight();
}

function arenaFight() {
  var A = ARENA;

  if (!A) return;

  S.cs = calcStats();

  startCombat(
    makeArenaEnemy(A.wave, A.diff),
    {
      type: 'arena',
      zi: 0
    }
  );
}

function arenaLeave() {
  ARENA = null;

  S.town = 'arena';

  renderTown();
  save();

  log('Ты покидаешь арену.', 'sys');
}