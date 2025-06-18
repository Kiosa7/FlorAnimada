const canvas = document.getElementById("florCanvas");
const ctx = canvas.getContext("2d");
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

function brightenColor(hexColor, percent) {
    if (!hexColor || hexColor.length < 7) hexColor = '#FFC0CB'; // Default to pink if invalid or too short
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, r + Math.floor(255 * (percent / 100))));
    g = Math.min(255, Math.max(0, g + Math.floor(255 * (percent / 100))));
    b = Math.min(255, Math.max(0, b + Math.floor(255 * (percent / 100))));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function drawLeaf(ctx, x, y, size, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0); // Tip of leaf attachment
    ctx.quadraticCurveTo(size * 0.8, -size * 0.4, size, 0); // Upper curve
    ctx.quadraticCurveTo(size * 0.8, size * 0.4, 0, 0);    // Lower curve
    ctx.fill();
    ctx.restore();
}

function drawStem(ctx, baseX, baseY, length, swayAngle, stemColor = "#4A7729") { // Default to a darker green
    ctx.save();
    ctx.strokeStyle = stemColor;
    // Scale stem width slightly with its length, ensuring a minimum width
    ctx.lineWidth = Math.max(2.5, 6 * Math.min(1, length / 100)) ;

    // Sway calculations, also scaled by length to make longer stems sway more naturally
    const tipSwayX = 8 * Math.sin(swayAngle) * (length / 100);
    const midSwayX1 = 15 * Math.sin(swayAngle * 0.6) * (length / 100);
    const midSwayX2 = -12 * Math.sin(swayAngle * 0.8) * (length / 100);

    const flowerAttachX = baseX + tipSwayX;
    const flowerAttachY = baseY - length; // Y position of flower head (upwards from ground)

    ctx.beginPath();
    ctx.moveTo(baseX, baseY); // Start at ground
    ctx.bezierCurveTo(
        baseX + midSwayX1, baseY - length * 0.33, // control point 1
        baseX + midSwayX2, baseY - length * 0.66, // control point 2
        flowerAttachX, flowerAttachY             // end point (where flower attaches)
    );
    ctx.stroke();

    // Add leaves
    const leafColor = brightenColor(stemColor, 25);
    const leafScaleFactor = Math.max(0.4, Math.min(1.2, length / 90)); // Scale leaves with stem length, capped

    if (length > 35 * (canvas.height / 700)) { // Only add leaves if stem is reasonably long (scaled)
        // Leaf 1
        let leaf1X = baseX + (flowerAttachX - baseX) * 0.4; // Approx position along stem
        let leaf1Y = baseY - length * 0.45;
        drawLeaf(ctx, leaf1X, leaf1Y, 20 * leafScaleFactor, Math.PI / 3.5 + swayAngle * 0.5, leafColor);

        if (length > 65 * (canvas.height / 700)) { // Second leaf for longer stems
             let leaf2X = baseX + (flowerAttachX - baseX) * 0.25;
             let leaf2Y = baseY - length * 0.7;
             drawLeaf(ctx, leaf2X, leaf2Y, 18 * leafScaleFactor, -Math.PI / 3 + swayAngle * 0.7, leafColor);
        }
    }

    ctx.restore();
    return { x: flowerAttachX, y: flowerAttachY }; // Return attachment point for the flower head
}

function drawFlower(ctx, x, y, scale, rotation, color, centerColor, petals = 6) { // k parameter removed
    ctx.save();
    ctx.translate(x, y); // Flower head center
    ctx.rotate(rotation);

    const petalLength = 28 * scale;
    const petalWidth = 12 * scale;

    // Petals
    for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 / petals) * i;
        ctx.save();
        ctx.rotate(angle); // Rotate for each petal

        // Gradient for the petal (center to tip)
        const grad = ctx.createRadialGradient(0, 0, petalWidth * 0.2, 0, -petalLength*0.5, petalLength);
        grad.addColorStop(0, brightenColor(color, 30));
        grad.addColorStop(0.6, color);
        grad.addColorStop(1, brightenColor(color, -25));
        ctx.fillStyle = grad;

        ctx.shadowColor = brightenColor(color, -40);
        ctx.shadowBlur = 6;

        // Draw individual petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0); // Start at the flower center for this petal
        ctx.bezierCurveTo(
            petalWidth * 0.6, -petalLength * 0.3,  // Control point 1 (near center, wide)
            petalWidth * 0.8, -petalLength * 0.8,  // Control point 2 (mid petal, shaping)
            0, -petalLength                     // Tip of petal (y is negative, upwards)
        );
        ctx.bezierCurveTo(
            -petalWidth * 0.8, -petalLength * 0.8, // Control point 3 (mirroring CP2)
            -petalWidth * 0.6, -petalLength * 0.3,  // Control point 4 (mirroring CP1)
            0, 0                                 // Back to flower center
        );
        ctx.fill();
        ctx.restore(); // Restore rotation for this petal
    }

    // Flower Center (drawn on top of petals)
    ctx.beginPath();
    ctx.arc(0, 0, 9 * scale, 0, Math.PI * 2);
    const centerGrad = ctx.createRadialGradient(0, 0, 2 * scale, 0, 0, 9 * scale);
    centerGrad.addColorStop(0, brightenColor(centerColor, 40));
    centerGrad.addColorStop(1, centerColor);
    ctx.fillStyle = centerGrad;
    ctx.shadowColor = brightenColor(centerColor, -30);
    ctx.shadowBlur = 4;
    ctx.fill();

    ctx.restore(); // Restore original transform state
}

// At the top, after ctx declaration and before other functions:
let garden = [];
let t = 0;
// colorMensaje and mensajeActual are already global

const flowerColors = ["#e63946", "#d90429", "#ff477e", "#43aa8b", "#4361ee", "#f9c74f", "#f3722c"];
const centerColors = ["#f1c40f", "#fff", "#f9c74f", "#f3722c"];
// Make sure flowerColors and centerColors are accessible if they were defined inside the scope that's being refactored.
// They are currently global which is fine.

function setupCanvasAndGarden() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    garden.length = 0; // Clear existing flowers for re-initialization
    // t = 0; // Optionally reset animation time/phase

    const marginX = 40;
    const marginY = 20; // Adjusted marginY slightly for placement
    const numFlowers = 18;

    const usableWidth = canvas.width - 2 * marginX;
    // Adjust Y positioning: flowers were originally h/2 + marginY + random(usableHeight=120)
    // h/2 was vertical center of window. Let's try to place them relative to canvas bottom.
    // Example: canvas.height * 0.8 is 80% from top. Spread them above this.
    // Let's try to keep them somewhat centered vertically but more controlled.
    // Base Y around 60-70% of canvas height.
    // const flowerBedCenterY = canvas.height * 0.7; // Old Y calculation
    // const usableFlowerHeightSpread = canvas.height * 0.2; // Old Y calculation

    for (let i = 0; i < numFlowers; i++) {
        const x = marginX + (usableWidth / (numFlowers > 1 ? numFlowers - 1 : 1)) * i + (Math.random() - 0.5) * 20;

        const groundLineStart = canvas.height * 0.8; // Top of the first grass layer
        const groundLineEnd = canvas.height * 0.9;   // Top of the earth layer
        // Place flowers randomly between these two lines, mostly on grass
        const y = groundLineStart + Math.random() * (groundLineEnd - groundLineStart);

        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        const centerColor = centerColors[Math.floor(Math.random() * centerColors.length)];
        const scale = 0.8 + Math.random() * 0.7; // scale affects flower head size and stem length
        const swaySpeed = 0.01 + Math.random() * 0.01;
        const swayOffset = Math.random() * 10;
        const petals = 5 + Math.floor(Math.random() * 3); // Random number of petals
        // k parameter is removed from drawFlower, so no need to store it.
        garden.push({ x, y, color, centerColor, scale, swaySpeed, swayOffset, petals });
    }
}

// 1. Variable global para el mensaje
let mensajeActual = '';

// 2. Dibuja el mensaje arriba de las flores en animate()
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawChihuahua(ctx,50 , canvas.height / 2.5, 1);

  // Fondo de jardín
  dibujarFondoJardin();
  dibujarNube(80, 60, 1);
  dibujarNube(200, 40, 0.7);
  dibujarNube(350, 70, 1.1);
  dibujarNube(500, 80, 0.9);
  dibujarNube(600, 40, 0.7);
  dibujarNube(700, 70, 0.7);   
  dibujarNube(800, 80, 0.9);   
  dibujarNube(900, 50, 0.8);   
   
  // Dibuja el mensaje si existe
  if (mensajeActual) {
    ctx.font = "24px Arial";
    ctx.fillStyle = colorMensaje || "black";
    ctx.textAlign = "center";
    ctx.fillText(mensajeActual, canvas.width / 2, canvas.height / 3);
  }

  garden.forEach((flower) => {
    const sway = Math.sin(t * flower.swaySpeed + flower.swayOffset) * 0.18;

    // Scale stem length with canvas height, relative to a reference design height (e.g., 700px)
    // and also incorporate the flower's individual scale property.
    let baseStemLength = 60; // Base length for an average flower before scaling
    let individualScaleFactor = flower.scale * 0.8 + 0.4; // Apply flower.scale (0.8-1.5) to vary length more
    let scaledStemLength = baseStemLength * individualScaleFactor;
    // Ensure stem length is responsive to canvas height, but don't let them get too tiny or huge
    const stemLength = Math.max(20, scaledStemLength * (canvas.height / 700));

    // flower.x is horizontal position on ground, flower.y is ground level Y for this flower's stem base
    const flowerAttachPoint = drawStem(ctx, flower.x, flower.y, stemLength, sway, "#4A7729"); // Using a fixed dark green for stems

    // Pass the number of petals from the flower object if it exists, otherwise default in drawFlower
    let petalCount = flower.petals || 6;
    drawFlower(ctx, flowerAttachPoint.x, flowerAttachPoint.y, flower.scale, sway, flower.color, flower.centerColor, petalCount);
  });

  t += 1;
  requestAnimationFrame(animate);
}

// Initial setup:
setupCanvasAndGarden();
animate(); // Start animation loop

// Resize handler:
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setupCanvasAndGarden();
        // The animate loop will automatically pick up changes, no need to restart it
    }, 250); // Debounce for 250ms
});

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
    const skyTopColor = "#5DADE2"; // A slightly richer blue for top
    const skyBottomColor = "#A9CCE3"; // Lighter blue for horizon
    const grassTopColor = "#82E0AA"; // Lighter green
    const grassBottomColor = "#2ECC71"; // Darker green
    const earthColor = "#A0522D"; // Brown earth

    const skyHeight = canvas.height * 0.70;
    const grassHeight = canvas.height * 0.20;
    const earthHeight = canvas.height * 0.10;

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, skyHeight);
    skyGrad.addColorStop(0, skyTopColor);
    skyGrad.addColorStop(1, skyBottomColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, skyHeight);

    // Grass Gradient (subtle vertical gradient)
    const grassStartY = skyHeight;
    const grassGrad = ctx.createLinearGradient(0, grassStartY, 0, grassStartY + grassHeight);
    grassGrad.addColorStop(0, grassTopColor);
    grassGrad.addColorStop(1, grassBottomColor);
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, grassStartY, canvas.width, grassHeight);
    
    // Earth
    const earthStartY = skyHeight + grassHeight;
    ctx.fillStyle = earthColor;
    ctx.fillRect(0, earthStartY, canvas.width, earthHeight);

    // Optional: arbustos simples sobre el césped (adjust Y positions)
    // Adjusted Y position to be on the new grass area, slightly above the earth line.
    const bushBaseY = skyHeight + grassHeight * 0.8; // Place them in the lower part of the grass
    for (let i = 0; i < canvas.width; i += 120) {
        ctx.beginPath();
        // Make bushes slightly smaller and vary size a bit more
        const bushSize1 = 20 + Math.random() * 10;
        const bushSize2 = 15 + Math.random() * 8;
        const bushSize3 = 10 + Math.random() * 6;
        ctx.arc(i + 40, bushBaseY, bushSize1, Math.PI, 2 * Math.PI);
        ctx.arc(i + 70, bushBaseY, bushSize2, Math.PI, 2 * Math.PI);
        ctx.arc(i + 100, bushBaseY, bushSize3, Math.PI, 2 * Math.PI);
        ctx.fillStyle = '#27AE60'; // A slightly darker, more saturated green for bushes
        ctx.fill();
    }
}

function dibujarNube(baseX, baseY, baseScale) {
    const numPuffs = 4 + Math.floor(Math.random() * 3); // Each cloud has 4 to 6 puffs
    const cloudPuffs = [];

    // Generate puff properties relative to baseX, baseY for this specific cloud instance
    for (let i = 0; i < numPuffs; i++) {
        // Adjust random offsets to be smaller for a more coherent cloud shape
        const offsetX = (Math.random() - 0.5) * 50 * baseScale;
        const offsetY = (Math.random() - 0.5) * 20 * baseScale;
        const radius = (15 + Math.random() * 15) * baseScale; // Puffs of varying sizes
        cloudPuffs.push({ x: baseX + offsetX, y: baseY + offsetY, r: radius });
    }

    // Main cloud body (lighter, more transparent)
    // ctx.beginPath(); // Combined into the corrected order section
    // cloudPuffs.forEach(puff => {
    //     ctx.moveTo(puff.x + puff.r, puff.y); // moveTo to start of arc for each circle
    //     ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
    // });
    // ctx.fillStyle = "rgba(255, 255, 255, 0.75)"; // Main cloud color: white, fairly transparent
    // ctx.fill();

    // Subtle darker base for a hint of volume (optional, can be adjusted)
    // This will be drawn under the main puffs for a softer shadow.
    // We can achieve this by drawing slightly darker, more transparent puffs first, offset downwards.

    // Re-draw with a slightly more opaque center if desired, or keep as is.
    // For simplicity, the current single fill creates a soft, merged look.

    // If we want a more defined "shadow" or base, we could do another loop:
    // ctx.beginPath(); // Combined into the corrected order section
    // cloudPuffs.forEach(puff => {
        // Draw slightly larger, darker, more transparent puffs offset downwards for a base/shadow
    //     ctx.moveTo(puff.x + puff.r * 1.1, puff.y + 5 * baseScale);
    //     ctx.arc(puff.x, puff.y + 5 * baseScale, puff.r * 1.1, 0, Math.PI * 2);
    // });
    // ctx.fillStyle = "rgba(220, 220, 235, 0.15)"; // Very light greyish-blue, very transparent for base
    // ctx.fill();

    // Then redraw the main white puffs on top (as done above)
    // To ensure correct layering, let's draw shadow first, then main puffs.

    // Corrected order for layering:
    ctx.save(); // Save context state

    // 1. Shadow/Base layer (darker, offset)
    ctx.beginPath();
    cloudPuffs.forEach(puff => {
        const shadowX = puff.x + 2 * baseScale; // Slight horizontal offset for shadow
        const shadowY = puff.y + 4 * baseScale; // Offset downwards
        const shadowR = puff.r * 1.05; // Slightly larger
        ctx.moveTo(shadowX + shadowR, shadowY);
        ctx.arc(shadowX, shadowY, shadowR, 0, Math.PI * 2);
    });
    // A very light, slightly cool grey for the shadow, and very transparent
    ctx.fillStyle = "rgba(180, 180, 200, 0.25)";
    ctx.fill();

    // 2. Main cloud puffs (whiter, on top)
    ctx.beginPath();
    cloudPuffs.forEach(puff => {
        ctx.moveTo(puff.x + puff.r, puff.y);
        ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
    });
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)"; // Main cloud: white, more opaque than shadow
    ctx.fill();

    ctx.restore(); // Restore context state (if globalAlpha or other things were changed)
}

function colorAleatorio() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

function drawChihuahua(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Cuerpo (café oscuro)
  ctx.fillStyle = "#6b4f27";
  ctx.beginPath();
  ctx.ellipse(0, 40, 35, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cabeza (negro)
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.ellipse(0, -10, 30, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Oreja izquierda (negro)
  ctx.beginPath();
  ctx.moveTo(-18, -35);
  ctx.lineTo(-38, -65);
  ctx.lineTo(-10, -25);
  ctx.closePath();
  ctx.fill();

  // Oreja derecha (negro)
  ctx.beginPath();
  ctx.moveTo(18, -35);
  ctx.lineTo(38, -65);
  ctx.lineTo(10, -25);
  ctx.closePath();
  ctx.fill();

  // Hocico (café claro)
  ctx.fillStyle = "#a67c52";
  ctx.beginPath();
  ctx.ellipse(0, 10, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nariz (negro)
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(0, 15, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ojo izquierdo (blanco y negro)
  ctx.beginPath();
  ctx.arc(-10, -5, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-10, -5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();

  // Ojo derecho (blanco y negro)
  ctx.beginPath();
  ctx.arc(10, -5, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10, -5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();

  // Cola (café oscuro)
  ctx.strokeStyle = "#6b4f27";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(30, 60);
  ctx.quadraticCurveTo(60, 70, 40, 30);
  ctx.stroke();

  ctx.restore();
}


