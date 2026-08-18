'use strict';

(function() {
  function initFx() {
    initEmbers();
    initAsh();
  }

  function initEmbers() {
    var cv = document.getElementById('fx');
    if (!cv) return;

    var cx = cv.getContext('2d');
    var embers = [];

    function resize() {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    function makeEmber() {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        v: 0.2 + Math.random() * 0.7,
        s: 1 + Math.random() * 1.6,
        a: 0.1 + Math.random() * 0.5,
        w: Math.random() * Math.PI * 2
      };
    }

    for (var i = 0; i < 60; i++) {
      embers.push(makeEmber());
    }

    function loop() {
      cx.clearRect(0, 0, cv.width, cv.height);

      embers.forEach(function(p) {
        p.y -= p.v;
        p.w += 0.02;
        p.x += Math.sin(p.w) * 0.3;

        if (p.y < -10) {
          p.y = window.innerHeight + 10;
          p.x = Math.random() * window.innerWidth;
        }

        cx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.w * 2));
        cx.fillStyle = Math.random() < 0.1 ? '#f0cf8a' : '#e0653a';

        cx.beginPath();
        cx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        cx.fill();
      });

      cx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }

    loop();
  }

  function initAsh() {
    var cv = document.getElementById('ash');
    if (!cv) return;

    var cx = cv.getContext('2d');
    var particles = [];

    function resize() {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    function makeParticle() {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 0.6 + Math.random() * 1.8,
        speedY: 0.15 + Math.random() * 0.65,
        speedX: -0.15 + Math.random() * 0.35,
        alpha: 0.08 + Math.random() * 0.25
      };
    }

    for (var i = 0; i < 90; i++) {
      particles.push(makeParticle());
    }

    function tick() {
      cx.clearRect(0, 0, cv.width, cv.height);

      particles.forEach(function(p) {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > window.innerHeight + 10) {
          p.y = -10;
          p.x = Math.random() * window.innerWidth;
        }

        cx.beginPath();
        cx.fillStyle = 'rgba(210, 200, 180, ' + p.alpha + ')';
        cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cx.fill();
      });

      requestAnimationFrame(tick);
    }

    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFx);
  } else {
    initFx();
  }
})();