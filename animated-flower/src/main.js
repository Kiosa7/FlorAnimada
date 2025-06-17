const canvas = document.getElementById("florCanvas");
const ctx = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;
let colorMensaje = null;
// Lista de colores disponibles
const coloresDisponibles = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];

// Función para asignar colores únicos a las flores
function asignarColoresUnicos(numFlores) {
    if (numFlores > coloresDisponibles.length) {
        throw new Error('No hay suficientes colores para todas las flores');
    }
    // Copia la lista para no modificar la original
    let colores = [...coloresDisponibles];
    let coloresAsignados = [];
    for (let i = 0; i < numFlores; i++) {
        // Selecciona un color aleatorio
        const idx = Math.floor(Math.random() * colores.length);
        coloresAsignados.push(colores[idx]);
        // Elimina el color ya asignado
        colores.splice(idx, 1);
    }
    return coloresAsignados;
}

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
  dibujarNube(80, 60, 1);
  dibujarNube(200, 40, 0.7);
  dibujarNube(350, 70, 1.1);
  dibujarNube(500, 80, 0.9);
  dibujarNube(600, 40, 0.7);
  dibujarNube(700, 70, 0.7);   
   
  // Dibuja el mensaje si existe
  if (mensajeActual) {
    ctx.font = "24px Arial";
    ctx.fillStyle = colorMensaje || "black";
    ctx.textAlign = "center";
    ctx.fillText(mensajeActual, canvas.width / 2, canvas.height / 3);
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
  "Frida Petatán, ¡sigue adelante! 💪 Estás haciendo un trabajo increíble 🌟",
  "¡Cree en ti misma, Frida! ✨ Tienes todo lo necesario para lograrlo 🙌",
  "Cada día 🌅 es una nueva oportunidad para brillar, Frida 🌈",
  "Frida, nunca te rindas 💭 porque los sueños sí se cumplen 🎯",
  "Confía en tu proceso 🛤️ y disfruta el camino con alegría 💖",
  "¡Eres más fuerte de lo que imaginas, Frida! 🦁💪",
  "Hoy es un gran día para crecer 🌱 y avanzar, Frida 📈",
  "Recuerda, Frida, el esfuerzo constante siempre tiene recompensa 🏆💼",
  "Tu luz ✨ inspira a quienes te rodean, Frida 💡🤍",
  "Sigue persiguiendo tus metas con pasión 🔥, Frida 🚀",
  "Nada es imposible para una mente decidida 🧠 como la tuya, Frida 💫",
  "Frida, cada paso que das 👣 te acerca a tus sueños 🌟",
  "Hoy es perfecto para comenzar algo nuevo 🌅🔁 ¡Aprovecha, Frida!",
  "Tu sonrisa 😊 tiene el poder de cambiar el mundo, Frida 🌍",
  "Frida, confía en ti 💖 porque tienes un corazón valiente 🛡️",
  "Los desafíos 🌄 son oportunidades para crecer, Frida 🌱",
  "Sigue brillando con tu autenticidad, Frida ✨ ¡Eres única!",
  "Vas mejor de lo que piensas, Frida 💡 ¡Sigue así! 👍",
  "El mundo necesita tu talento 🎨, Frida 💫",
  "Frida, no te detengas 🚶‍♀️ porque vas por un buen camino ✅",
  "Tu constancia 🧱 te hace imparable, Frida 🔁",
  "Cada logro 🏁 comienza con el valor de intentarlo, Frida 💪",
  "Sigue escribiendo tu historia 📖 con pasión, Frida 🌟",
  "Tú puedes con todo esto y más 💪, Frida ✨",
  "Frida, cada día 🌞 es una nueva oportunidad para ser feliz 😊",
  "Mereces todo lo bueno que te pasa, Frida 🎁💖",
  "Nunca subestimes tu poder interior, Frida ⚡🧠",
  "Tienes un corazón inmenso ❤️ y valiente, Frida 🛡️",
  "Tu esfuerzo diario, Frida, es una fuente de inspiración 🙌🌟",
  "Eres un ejemplo de compromiso y dedicación, Frida 🏅👏",
  "Hoy es tu día para avanzar sin miedo, Frida ⏩🌅",
  "Frida, sigue firme con fe 🙏 y fuerza 💪",
  "Hasta los pequeños pasos 👟 te acercan a tu meta, Frida 🪜",
  "Tienes un alma fuerte y resiliente, Frida 🔄🌸",
  "Cada error 📘 es una gran lección, Frida 💡 ¡Aprende y sigue!",
  "Tu luz interior es inagotable ✨, Frida 🔥",
  "Nunca dejes de soñar en grande 💭, Frida 🚀",
  "Frida, tú eres la protagonista 🎬 de tu historia 🌟",
  "Todo es posible 🌍 si confías en ti, Frida ✅",
  "No pierdas la fe 🌠, Frida 💖 ¡Todo llega!",
  "Frida, lo mejor aún está por venir 🎉 ¡Prepárate! 🚪",
  "Eres única, especial y maravillosa 🌸, Frida 🦋",
  "Tu energía positiva ⚡ se siente, Frida 😄",
  "Frida Petatán, no hay límites cuando crees en ti 🔓🗺️",
  "Tu potencial es infinito ♾️, Frida 💡 ¡Explótalo!",
  "Cada amanecer 🌅 trae una nueva oportunidad, Frida 🤍",
  "Estás haciendo un gran trabajo 💼, Frida 👏 ¡Sigue así!",
  "Confía en tu intuición 🧘‍♀️, Frida 💭 ¡Te guía bien!",
  "Frida, no estás sola 🤝 en este camino 💞",
  "Tú puedes transformar tu mundo 🌍, Frida 🔁 ¡Cree en ti!",
  "Sigue creando magia ✨ en cada cosa que haces, Frida 🧙‍♀️",
  "Frida, no te rindas ahora 🏁 ¡Ya casi llegas! 🔜",
  "Sigue firme con tus metas 🎯, Frida 🛡️ ¡Tú puedes!",
  "Eres un rayo de sol ☀️ incluso en días grises ☁️, Frida",
  "Lograrás cosas increíbles 🌟, Frida 🙌 ¡No lo dudes!",
  "Tu perseverancia 🛤️ te lleva a lugares hermosos ⛰️, Frida",
  "Cada paso que das 🪜 es parte de tu camino, Frida 🎯",
  "Tus ideas son valiosas 💡, Frida 💰 ¡Exprésalas!",
  "No dejes de creer en ti, Frida 🔥💪 ¡Tienes poder!",
  "Tu esencia 🦋 es lo que te hace brillar ✨, Frida",
  "El universo 🌌 está de tu lado, Frida 🪐 ¡Avanza con fe!",
  "Frida, camina con amor ❤️ y determinación 🏃‍♀️",
  "La vida tiene grandes sorpresas 🎁 para ti, Frida 🎯",
  "Frida, mereces aplausos por todo lo que logras 👏👏",
  "Eres una guerrera ⚔️, Frida Petatán 🛡️ ¡Nunca te rindas!",
  "Gracias por ser tú, Frida 🙏 ¡Eres especial! 🌹",
  "Cada meta cumplida 🏆 habla de tu esfuerzo 📈, Frida",
  "Tu creatividad 🎨 es ilimitada, Frida 🧠 ¡Hazla volar!",
  "Nunca dejes de aprender y crecer, Frida 🌳📚",
  "Tú haces del mundo un lugar mejor 🌍, Frida ✨",
  "Frida, eres más valiente de lo que imaginas 🦸‍♀️💖",
  "Sigue creando recuerdos felices 📸, Frida 🌞",
  "Frida, hay muchas razones para sonreír 😊🌻 ¡Encuéntralas!",
  "Siembra amor 🌱 y cosecharás alegría ❤️😊, Frida",
  "No te detengas ahora 🏃‍♀️, Frida ➡️ ¡Sigue avanzando!",
  "Frida, tu corazón 💓 siempre te mostrará el camino 🧭",
  "Hoy será un gran día para ti 🌞🎉 ¡Disfrútalo, Frida!",
  "Cree en tus sueños ✨ y hazlos realidad ✔️, Frida",
  "Sigue construyendo tu futuro 🏗️ con amor 💭, Frida",
  "Todo esfuerzo 🎁 vale la pena 💼 ¡No te detengas, Frida!",
  "Tu alma dulce 🍬 y fuerte 💪 te hará llegar lejos, Frida",
  "Incluso los días nublados 🌧️ forman parte del arcoíris 🌈, Frida",
  "Frida, la vida brilla más con tu presencia ❤️🌍",
  "Brilla sin miedo ✨, Frida 🕯️ ¡Eres luz!",
  "Cada gran meta 🎯 empieza con un primer paso 👣, Frida",
  "Frida, tu actitud positiva 😄 es un regalo 🌟",
  "Sigue sembrando esperanza 🌱 en todo lo que haces 💖, Frida",
  "El amor que das deja huella 🖐️, Frida ❤️ ¡Nunca lo olvides!",
  "Hoy te espera algo hermoso 🎁, Frida 🌈 ¡Ábrete al cambio!",
  "Incluso si es difícil ⛰️, no te detengas 💪, Frida",
  "Frida, tú eres tu mejor inversión 🧠💼 ¡Cree en ti!",
  "Nunca dejes de soñar 🌠, Frida 💭 ¡Lo harás realidad!",
  "Tú tienes la llave 🔑 para abrir cualquier puerta 🔄, Frida",
  "Tu camino está lleno de bendiciones ✨, Frida 🙏",
  "Frida, incluso en la oscuridad 🌌 eres una luz brillante 🌟",
  "Cada día cuenta 📆 y tú sabes cómo hacerlo brillar ✨, Frida",
  "Tu voz 🎤 merece ser escuchada 💬, Frida ¡Exprésate!",
  "Frida, estás llena de posibilidades 🧩 ¡Actívalas! 🚀",
  "Hoy es tu momento 🎊, Frida Petatán 🎉 ¡Hazlo increíble!",
  "Nunca subestimes el impacto 💥 que tienes, Frida 💖",
  "Haz lo que amas 🎨 y verás magia 💫 en tu vida, Frida",
  "Tu valentía 💪 transforma todo a tu alrededor, Frida 🦸‍♀️",
  "La mejor versión de ti 🌟 está floreciendo 🌸, Frida",
];

  

let mensajeTimeout = 0;

canvas.addEventListener('click', function(e) {
    colorMensaje = colorAleatorio();
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
    ctx.fillStyle = "#87ceeb"; // Azul cielo
    ctx.fillRect(0, 0, canvas.width, canvas.height/2 * 0.4);
    
    // Dibuja el césped (centro)
    ctx.fillStyle = '#6ab150'; // Verde césped
    ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.5);

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

function dibujarNube(x, y, escala) {
  ctx.beginPath();
  ctx.arc(x, y, 20 * escala, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(
    x + 30 * escala,
    y - 20 * escala,
    30 * escala,
    Math.PI * 1,
    Math.PI * 1.85
  );
  ctx.arc(x + 60 * escala, y, 20 * escala, Math.PI * 1.5, Math.PI * 0.5);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function colorAleatorio() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}


