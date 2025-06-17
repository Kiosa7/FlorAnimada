const canvas = document.getElementById("florCanvas");
const ctx = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;

function drawStem(ctx, x, y, length, angle, color = "#228B22") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x,
    y + length * 0.3,
    x + 30 * Math.sin(angle),
    y + length * 0.7,
    x,
    y + length
  );
  ctx.stroke();
  ctx.restore();
}

function drawFlower(
  ctx,
  x,
  y,
  scale,
  rotation,
  color,
  centerColor,
  petals = 6,
  k = 3
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Pétalos
  const a = 32 * scale;
  ctx.beginPath();
  for (let theta = 0; theta <= Math.PI * 2; theta += 0.01) {
    let r = a * Math.sin(k * theta);
    let px = r * Math.cos(theta);
    let py = r * Math.sin(theta);
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fill();

  // Centro
  ctx.beginPath();
  ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2);
  ctx.fillStyle = centerColor;
  ctx.shadowBlur = 0;
  ctx.fill();

  ctx.restore();
}

// Generar muchas flores aleatorias
const garden = [];
const flowerColors = ["#e63946", "#d90429", "#ff477e", "#43aa8b", "#4361ee", "#f9c74f", "#f3722c"];
const centerColors = ["#f1c40f", "#fff", "#f9c74f", "#f3722c"];
const numFlowers = 18;
const marginX = 40;
const marginY = 60;
const usableWidth = w - 2 * marginX;
const usableHeight = 120;

for (let i = 0; i < numFlowers; i++) {
  // Distribución horizontal uniforme con un poco de aleatoriedad
  const col = i % numFlowers;
  const x = marginX + (usableWidth / (numFlowers - 1)) * i + (Math.random() - 0.5) * 20;
  // Distribución vertical con variación
  const y = h/2 + marginY + Math.random() * usableHeight;
  const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
  const centerColor = centerColors[Math.floor(Math.random() * centerColors.length)];
  const scale = 0.8 + Math.random() * 0.7;
  const swaySpeed = 0.01 + Math.random() * 0.01;
  const swayOffset = Math.random() * 10;
  const petals = 5 + Math.floor(Math.random() * 3);
  const k = 2 + Math.floor(Math.random() * 3);
  garden.push({ x, y, color, centerColor, scale, swaySpeed, swayOffset, petals, k });
}

let t = 0;

// 1. Variable global para el mensaje
let mensajeActual = '';

// 2. Dibuja el mensaje arriba de las flores en animate()
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fondo de jardín
  dibujarFondoJardin();

  // Dibuja el mensaje si existe
  if (mensajeActual) {
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(mensajeActual, canvas.width / 2, 40);
  }

  garden.forEach((flower) => {
    const sway = Math.sin(t * flower.swaySpeed + flower.swayOffset) * 0.18;
    flower.currentSway = sway;
    drawStem(ctx, flower.x, flower.y, 100 + flower.scale * 30, sway);
    drawFlower(
      ctx,
      flower.x,
      flower.y,
      flower.scale,
      sway,
      flower.color,
      flower.centerColor,
      flower.petals,
      flower.k
    );
  });

  t += 1;
  requestAnimationFrame(animate);
}

animate();

const mensajeDiv = document.getElementById('mensajeMotivacional');

// Mensajes de motivación
const mensajes = [
  "¡Sigue adelante, lo estás haciendo genial!",
  "¡Cree en ti, eres capaz de lograrlo!",
  "¡Cada día es una nueva oportunidad!",
  "¡Nunca te rindas, los sueños se cumplen!",
  "¡Confía en tu proceso y disfruta el camino!",
  "¡Eres más fuerte de lo que crees!",
  "¡Hoy es un gran día para crecer!"
];

let mensajeTimeout = 0;

canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let flower of garden) {
    const fx = flower.x;
    const fy = flower.y;
    const r = 32 * flower.scale;
    const dx = mouseX - fx;
    const dy = mouseY - fy;
    if (dx*dx + dy*dy < r*r) {
      mensajeActual = mensajes[Math.floor(Math.random() * mensajes.length)];
      animate();

      clearTimeout(window._mensajeTimeout);
      window._mensajeTimeout = setTimeout(() => {
        mensajeActual = '';
        animate();
      }, 20000);
      break;
    }
  }
});

function dibujarFondoJardin() {
    // Dibuja el cielo (arriba)
    ctx.fillStyle = '#87ceeb'; // Azul cielo
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

    // Dibuja el césped (centro)
    ctx.fillStyle = '#6ab150'; // Verde césped
    ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.5);

    // Dibuja la tierra (abajo)
    ctx.fillStyle = '#a0522d'; // Marrón tierra
    ctx.fillRect(0, canvas.height * 0.9, canvas.width, canvas.height * 0.1);

    // Opcional: arbustos simples sobre el césped
    for (let i = 0; i < canvas.width; i += 120) {
        ctx.beginPath();
        ctx.arc(i + 40, canvas.height * 0.85, 30, Math.PI, 2 * Math.PI);
        ctx.arc(i + 70, canvas.height * 0.85, 25, Math.PI, 2 * Math.PI);
        ctx.arc(i + 100, canvas.height * 0.85, 20, Math.PI, 2 * Math.PI);
        ctx.fillStyle = '#357a38';
        ctx.fill();
    }

  
}

