'use strict';

function save() {
  try {
    localStorage.setItem('AS3', JSON.stringify(S));
  } catch (e) {
    console.error('Ошибка сохранения', e);
  }
}