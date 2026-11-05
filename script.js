// =============================================================================
// ADD TO CART MICROINTERACTION - VANILLA JS
// Codea con Horacio
// =============================================================================

// Contexto de Web Audio API para sonidos procedurales
let audioCtx = null;

/**
 * Obtiene o crea el contexto de audio, asegurando que esté activo
 */
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Reproduce un sonido breve tipo "pop" cada vez que una letra es absorbida
 * @param {number} index - Índice de la letra (0-9)
 * @param {number} total - Total de letras
 */
function playCartPopSound(index, total) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Frecuencia ascendente por índice (efecto de escala)
  const baseFreq = 280 + (index * 42);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq * 1.5, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.04);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.14, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.065);
}

/**
 * Reproduce un acorde ascendente de confirmación al finalizar
 */
function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 739.99,  time: 0.00, duration: 0.35 },
    { freq: 932.33,  time: 0.05, duration: 0.40 },
    { freq: 1108.73, time: 0.10, duration: 0.45 },
    { freq: 1479.98, time: 0.15, duration: 0.60 }
  ];

  notes.forEach(note => {
    const noteTime = now + note.time;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, noteTime);

    gain.gain.setValueAtTime(0.0001, noteTime);
    gain.gain.linearRampToValueAtTime(0.08, noteTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + note.duration + 0.01);
  });
}

// =============================================================================
// INICIALIZACIÓN DEL DOM
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.getElementById('cartBtn');
  const textWrapper = document.getElementById('textWrapper');
  const cartWrapper = document.getElementById('cartWrapper');
  const packagesGroup = document.getElementById('packagesGroup');
  const checkBadge = document.getElementById('checkBadge');
  const wheelBack = document.getElementById('wheelBack');
  const wheelFront = document.getElementById('wheelFront');
  const letters = document.querySelectorAll('.letter');

  let isAnimating = false;
  const totalLetters = letters.length;

  // Radio de rueda SVG = 3.5px -> Perímetro C = 2 * PI * 3.5 = 21.99px
  const wheelPerimeter = 2 * Math.PI * 3.5;

  // ---------------------------------------------------------------------------
  // EVENTO PRINCIPAL: CLICK EN EL BOTÓN
  // ---------------------------------------------------------------------------
  cartBtn.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    cartBtn.classList.add('disabled');

    // Reset inicial de estados
    packagesGroup.style.transform = 'translateY(22px)';
    packagesGroup.style.setProperty('--p-y', '22px');
    checkBadge.classList.remove('show');

    letters.forEach(l => {
      l.classList.remove('flying', 'text-in');
      l.style.opacity = '1';
      l.style.transform = '';
    });

    // -------------------------------------------------------------------------
    // FASE 1: ANTICIPACIÓN ULTRA-RÁPIDA (80ms)
    // -------------------------------------------------------------------------
    cartWrapper.style.transition = 'transform 0.08s ease-out';
    cartWrapper.style.transform = 'translate(-3px, 0.5px) rotate(-2deg) scaleX(0.98)';

    setTimeout(() => {
      // Desactivar transiciones CSS en cartWrapper para control directo vía requestAnimationFrame
      cartWrapper.style.transition = 'none';

      // Posición inicial absoluta del carrito
      const cartRect0 = cartWrapper.getBoundingClientRect();
      const cartCenterX0 = cartRect0.left + cartRect0.width * 0.48;
      const cartCenterY0 = cartRect0.top + cartRect0.height * 0.38;

      // Parámetros de la caminata continua
      const walkDuration = 800; // ms totales de caminata
      const totalDistance = 28; // px avanzados
      const flyDuration = 280;  // ms de vuelo individual por letra
      const staggerDelay = 60;  // ms entre disparos de letras (ola rápida)

      // -----------------------------------------------------------------------
      // PRECÁLCULO DE TRAYECTORIAS CON DESTINO DINÁMICO PROYECTADO
      // -----------------------------------------------------------------------
      letters.forEach((letter, i) => {
        const lRect = letter.getBoundingClientRect();
        const lCenterX = lRect.left + lRect.width / 2;
        const lCenterY = lRect.top + lRect.height / 2;

        const flyStartTime = i * staggerDelay;
        const flyLandTime = flyStartTime + flyDuration;

        // Dónde estará el carrito cuando ESTA letra aterrice exactamente
        const cartProgressAtLand = Math.min(1, flyLandTime / walkDuration);
        const cartXAtLand = cartProgressAtLand * totalDistance;

        const deltaX = (cartCenterX0 - lCenterX) + cartXAtLand;
        const deltaY = cartCenterY0 - lCenterY;

        const arcH = -20 - (i % 3) * 4;
        const driftX = (i % 2 === 0 ? 2 : -2);

        letter.style.setProperty('--fly-x', `${deltaX}px`);
        letter.style.setProperty('--fly-y', `${deltaY}px`);
        letter.style.setProperty('--arc-h', `${arcH}px`);
        letter.style.setProperty('--drift-x', `${driftX}px`);

        // Disparo en ola escalonada de las letras
        setTimeout(() => {
          letter.classList.add('flying');
        }, flyStartTime);
      });

      // -----------------------------------------------------------------------
      // FASE 2: CAMINATA CONTINUA CON requestAnimationFrame (800ms)
      // -----------------------------------------------------------------------
      const startTime = performance.now();
      const landed = new Array(totalLetters).fill(false);
      let impactRot = 0;

      function animateWalk(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / walkDuration);
        const x = progress * totalDistance;

        // Oscilación orgánica continua de caminata
        const steps = 6;
        const stepAngle = progress * Math.PI * steps;
        const y = -Math.abs(Math.sin(stepAngle)) * 1.3;
        const walkRot = Math.sin(stepAngle) * 2.2;
        const scaleX = 1 + Math.sin(stepAngle) * 0.012;
        const scaleY = 1 - Math.sin(stepAngle) * 0.012;

        // Atenuación de vibración por impacto
        impactRot *= 0.82;
        const finalRot = walkRot + impactRot;

        // Única fuente de verdad para el transform del carrito
        cartWrapper.style.transform = `translate(${x}px, ${y}px) rotate(${finalRot}deg) scale(${scaleX}, ${scaleY})`;

        // Giro continuo de las ruedas según distancia recorrida
        const wheelAngle = (x / wheelPerimeter) * 360;
        wheelBack.style.transform = `rotate(${wheelAngle}deg)`;
        wheelFront.style.transform = `rotate(${wheelAngle}deg)`;

        // Detección de entrada e impacto por cada letra absorbida
        letters.forEach((_, i) => {
          const landTime = i * staggerDelay + flyDuration;
          if (elapsed >= landTime && !landed[i]) {
            landed[i] = true;

            // Elevación progresiva de paquetes dentro del cesto
            const levelY = 22 - ((i + 1) * (22 / totalLetters));
            packagesGroup.style.transform = `translateY(${levelY}px)`;
            packagesGroup.style.setProperty('--p-y', `${levelY}px`);

            // Reacción de bounce en el paquete
            packagesGroup.classList.remove('package-bounce');
            void packagesGroup.offsetWidth; // forzar reflow
            packagesGroup.classList.add('package-bounce');

            // Inclinación ligera de impacto y sonido de absorción
            impactRot = (i % 2 === 0 ? 1.6 : -1.6);
            playCartPopSound(i, totalLetters);
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animateWalk);
        } else {
          // Iniciar frenado inercial al completar la caminata
          startBraking(totalDistance);
        }
      }

      requestAnimationFrame(animateWalk);

    }, 80); // Fin anticipación
  });

  // ---------------------------------------------------------------------------
  // FASE 3: FRENADO, REGRESO Y MORPH A CÍRCULO
  // ---------------------------------------------------------------------------
  function startBraking(finalX) {
    // Frenado con sobrepaso inercial (140ms)
    cartWrapper.style.transition = 'transform 0.14s cubic-bezier(0.25, 1, 0.5, 1)';
    cartWrapper.style.transform = `translate(${finalX + 1.5}px, 0.4px) rotate(1deg)`;

    setTimeout(() => {
      // Ocultar wrapper de texto
      textWrapper.classList.add('is-hidden');

      // Regreso suave al centro (200ms)
      cartWrapper.style.transition = 'transform 0.20s var(--ease-smooth)';
      cartWrapper.style.transform = 'translate(0px, 0px) rotate(0deg)';
      wheelBack.style.transform = 'rotate(0deg)';
      wheelFront.style.transform = 'rotate(0deg)';

      setTimeout(() => {
        // Transformación rápida a Círculo (300ms)
        cartBtn.classList.add('is-circle');

        setTimeout(() => {
          // -------------------------------------------------------------------
          // FASE 4: CONFIRMACIÓN (CHECK, AURA Y CHIME DE ÉXITO)
          // -------------------------------------------------------------------
          cartBtn.classList.add('is-aura-active', 'is-pulsing');
          checkBadge.classList.add('show');
          playSuccessSound();

          setTimeout(() => {
            cartBtn.classList.remove('is-aura-active', 'is-pulsing');

            // Pausa antes del auto-reset
            setTimeout(() => {
              resetAll();
            }, 1500);
          }, 550);
        }, 300); // Fin morph círculo
      }, 200); // Fin regreso al centro
    }, 140); // Fin frenado
  }

  // ---------------------------------------------------------------------------
  // FASE 5: AUTO-RESET RÁPIDO
  // ---------------------------------------------------------------------------
  function resetAll() {
    checkBadge.classList.remove('show');
    packagesGroup.style.transform = 'translateY(22px)';
    packagesGroup.style.setProperty('--p-y', '22px');

    cartBtn.classList.remove('is-circle');

    setTimeout(() => {
      textWrapper.classList.remove('is-hidden');

      // Entrada orgánica de letras al restaurar estado
      letters.forEach((l, idx) => {
        l.classList.remove('flying');

        const inX = (Math.random() * 4 - 2).toFixed(1);
        const inY = (-8 - Math.random() * 4).toFixed(1);
        const inRot = (Math.random() * 8 - 4).toFixed(1);
        const delay = idx * 25;

        l.style.setProperty('--in-x', `${inX}px`);
        l.style.setProperty('--in-y', `${inY}px`);
        l.style.setProperty('--in-rot', `${inRot}deg`);
        l.style.animationDelay = `${delay}ms`;

        l.classList.add('text-in');
      });

      setTimeout(() => {
        letters.forEach(l => {
          l.classList.remove('text-in');
          l.style.animationDelay = '';
          l.style.transform = '';
          l.style.opacity = '1';
        });
        cartBtn.classList.remove('disabled');
        isAnimating = false;
      }, 320);
    }, 300);
  }
});
