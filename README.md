# Add to Cart Microinteraction Pro

Microinteracción avanzada de "Agregar al Carrito" con física procedural, animaciones sincronizadas y audio generativo. Diseñada para desktop con Vanilla JavaScript.

## 🎯 Características

- ✨ Animación fluida de letras con trayectoria parabólica
- 🛒 Carrito animado con "caminata" física y ruedas rotando
- 📦 Paquetes que se elevan y reaccionan dinámicamente
- 🔊 Audio procedural generado con Web Audio API
- 💫 Efectos de aura y pulso en confirmación
- ♻️ Auto-reset automático con entrada orgánica de texto

---

## 🚀 Cómo Usar

Simplemente abre `index.html` en tu navegador moderno (Chrome, Firefox, Safari, Edge).

```bash
# Abre directamente el archivo o con un servidor local
npx serve .
```

---

## 🎨 Estructura del Proyecto

```
src/
├── index.html      # Estructura HTML
├── styles.css      # Estilos y animaciones CSS
├── script.js       # Lógica JavaScript
└── README.md       # Este archivo
```

---

## 🧠 Explicación de los Efectos

### 1. **Trayectoria Parabólica de las Letras**

Cada letra vuela individualmente hacia el carrito siguiendo una curva parabólica natural.

**Técnica:**
- Se calculan las coordenadas exactas del destino (carrito) y origen (letra)
- Se usan **CSS Custom Properties** (`--fly-x`, `--fly-y`, `--arc-h`) para cada letra
- La animación `absorbToCart` aplica una trayectoria de 5 keyframes con easing cúbico
- Cada letra tiene un retraso escalonado (`staggerDelay`) creando un efecto de "ola"

```javascript
// Cálculo dinámico de destino proyectado
const flyLandTime = flyStartTime + flyDuration;
const cartProgressAtLand = Math.min(1, flyLandTime / walkDuration);
const cartXAtLand = cartProgressAtLand * totalDistance;
```

**Por qué funciona:**
Las letras no apuntan al carrito estático, sino a donde **estará el carrito** cuando cada letra llegue. Esto crea la ilusión de absorción magnética perfecta.

---

### 2. **Caminata Continua del Carrito con requestAnimationFrame**

El carrito "camina" físicamente hacia la derecha mientras las letras vuelan hacia él.

**Técnica:**
- **60fps** con `requestAnimationFrame` para animación ultra suave
- Oscilación sinusoidal (`Math.sin`) simula el movimiento vertical de caminar
- Las ruedas rotan proporcionalmente a la distancia recorrida
- Reacción de impacto: cada letra que entra añade una pequeña rotación (`impactRot`)

```javascript
const stepAngle = progress * Math.PI * steps;
const y = -Math.abs(Math.sin(stepAngle)) * 1.3;
const walkRot = Math.sin(stepAngle) * 2.2;
```

**Física de Ruedas:**
```javascript
const wheelPerimeter = 2 * Math.PI * 3.5; // Circunferencia SVG
const wheelAngle = (x / wheelPerimeter) * 360; // Rotación proporcional
```

---

### 3. **Elevación Progresiva de Paquetes**

Los paquetes coloridos dentro del carrito se elevan gradualmente conforme llegan las letras.

**Técnica:**
- Detección de "aterrizaje" de cada letra mediante timestamp
- `translateY` dinámico con CSS Variable (`--p-y`)
- Animación `packageBounceAnim` con squash & stretch para rebote orgánico

```javascript
const levelY = 22 - ((i + 1) * (22 / totalLetters));
packagesGroup.style.transform = `translateY(${levelY}px)`;
```

**Squash & Stretch:**
```css
40% { transform: translateY(calc(var(--p-y) + 1.2px)) scaleY(0.93) scaleX(1.03); }
```

---

### 4. **Audio Procedural con Web Audio API**

Sonidos generados en tiempo real sin archivos de audio externos.

**Técnica Pop (al absorber letras):**
```javascript
osc.frequency.setValueAtTime(baseFreq * 1.5, now);
osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.04);
```
- Frecuencia descendente rápida crea el efecto "pop"
- Frecuencia base aumenta con cada letra (escala ascendente)

**Técnica Success Chord:**
```javascript
const notes = [
  { freq: 739.99,  time: 0.00, duration: 0.35 }, // Fa#5
  { freq: 932.33,  time: 0.05, duration: 0.40 }, // La#5
  { freq: 1108.73, time: 0.10, duration: 0.45 }, // Do#6
  { freq: 1479.98, time: 0.15, duration: 0.60 }  // Fa#6
];
```
- Acorde ascendente (Fa# Mayor arpegiado)
- Notas superpuestas con delays escalonados

---

### 5. **Morphing a Círculo con Aura y Pulso**

Transformación suave del botón rectangular a círculo perfecto.

**Técnica:**
- Transición CSS en `width` y `border-radius` con easing suave
- Clase `.is-circle` cambia dimensiones: `320px × 90px` → `90px × 90px`
- Anillo de aura con `@keyframes auraSpin360` rotando 360° con gradiente de opacidad
- Pulso simultáneo con `transform: scale(1.15)` y sombra expansiva

```css
.cart-btn.is-circle {
  width: 90px;
  border-radius: 50%;
}

@keyframes auraSpin360 {
  0% { transform: rotate(0deg) scale(0.85); opacity: 0; }
  100% { transform: rotate(360deg) scale(1.22); opacity: 0; }
}
```

---

### 6. **Entrada Orgánica de Texto (Reset)**

Al resetear, las letras reaparecen con movimiento natural desde posiciones aleatorias.

**Técnica:**
```javascript
const inX = (Math.random() * 4 - 2).toFixed(1); // Deriva horizontal
const inY = (-8 - Math.random() * 4).toFixed(1); // Caída desde arriba
const inRot = (Math.random() * 8 - 4).toFixed(1); // Rotación aleatoria
```

**Animación con Bounce:**
```css
@keyframes organicTextIn {
  0% { transform: translate(var(--in-x), var(--in-y)) rotate(var(--in-rot)) scale(0.7); }
  70% { transform: translate(0, 1px) scale(1.05); } /* Overshoot */
  100% { transform: translate(0, 0) scale(1); }
}
```

---

## 🎭 Cronología de la Animación

```
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 1: Anticipación (80ms)                                         │
│ └─ Carrito retrocede ligeramente                                    │
│                                                                      │
│ FASE 2: Caminata + Absorción (800ms)                                │
│ ├─ Carrito camina 28px a la derecha                                 │
│ ├─ Ruedas rotan proporcionalmente                                   │
│ ├─ Letras vuelan en ola (60ms entre cada una)                       │
│ ├─ Paquetes se elevan progresivamente                               │
│ └─ Sonidos "pop" con cada letra                                     │
│                                                                      │
│ FASE 3: Frenado + Regreso (340ms)                                   │
│ ├─ Frenado con sobrepaso inercial (140ms)                           │
│ ├─ Texto se oculta                                                  │
│ └─ Carrito regresa al centro (200ms)                                │
│                                                                      │
│ FASE 4: Confirmación (850ms)                                        │
│ ├─ Botón se transforma a círculo (300ms)                            │
│ ├─ Aura rota 360° + pulso                                           │
│ ├─ Badge check aparece                                              │
│ └─ Acorde de éxito (4 notas)                                        │
│                                                                      │
│ FASE 5: Auto-Reset (1820ms después)                                 │
│ ├─ Badge y aura desaparecen                                         │
│ ├─ Botón vuelve a rectángulo                                        │
│ ├─ Texto reaparece con entrada orgánica                             │
│ └─ Listo para nuevo ciclo                                           │
└─────────────────────────────────────────────────────────────────────┘
```

**Duración Total:** ~3.9 segundos (sin pausas opcionales)

---

## 🎓 Conceptos Clave Aprendidos

1. **Sincronización Temporal:** Coordinar múltiples animaciones usando timestamps precisos
2. **Física Procedural:** Simular movimiento orgánico con matemáticas (seno, curvas de Bézier)
3. **CSS Custom Properties:** Variables CSS dinámicas desde JavaScript
4. **requestAnimationFrame:** Control fino de animaciones a 60fps
5. **Web Audio API:** Generación de sonido sintético sin archivos
6. **Squash & Stretch:** Principio de animación tradicional aplicado con CSS

---

## 📚 Referencias Técnicas

- **Easing Functions:** [easings.net](https://easings.net/)
- **Web Audio API:** [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **requestAnimationFrame:** [MDN Guide](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- **12 Principles of Animation:** [Disney Animation Principles](https://www.creativebloq.com/advice/understand-the-12-principles-of-animation)

---

## 🎬 Créditos

**Desarrollado por:** Codea con Horacio  
**Tecnologías:** HTML5, CSS3, Vanilla JavaScript  
**Paradigma:** Zero dependencies, Pure Vanilla

---

## 📄 Licencia

Proyecto educativo de código abierto. Úsalo, modifícalo y compártelo libremente.

---

**¿Preguntas o mejoras?** Abre un issue o contacta en [tus redes sociales]
