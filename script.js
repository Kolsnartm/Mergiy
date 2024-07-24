// Звуки
const backgroundMusic = new Howl({
  src: ['Birds.wav'],
  loop: true,
  volume: 0.5,
});

const boostSound = new Howl({
  src: ['Boost.wav'],
  volume: 0.8,
});

const coinSound = new Howl({
  src: ['Coin.wav'],
});

const endSound = new Howl({
  src: ['End.wav'],
});

// Елементи DOM
const gameOverScreen = document.getElementById('gameOverScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameStartScreen = document.getElementById('gameStartScreen');
const startButton = document.getElementById('startButton');
const soundButton = document.getElementById('soundButton');
const finalScore = document.getElementById('finalScore');
const finalTime = document.getElementById('finalTime');
const restartButton = document.getElementById('restartButton');
const resumeButton = document.getElementById('resumeButton');

// Налаштування канвасу
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Змінні гри
const MAX_PARTICLES = 30;
let soundOn = true;
let gamePaused = false;
let gameStarted = false;
let gameOver = false;
let score = 0;
let startTime;
let elapsedTime = 0;
let baseGameSpeed = 1;
let gameSpeed = baseGameSpeed;
let lastSuperMushroomTime = 0;
let speedBeforeSuperMushroom = 0;

// Гравці
const hitruk = {
  x: canvas.width / 4,
  y: canvas.height / 2,
  size: 51,
  originalSize: 51,
  velocity: 0,
  gravity: 0.6,
  jump: -13,
  isInvincible: false,
  invincibilityTime: 0,
  scoreMultiplier: 1,
};

let particles = [];
let collectibles = [];
let obstacles = [];

// Фон
const background = {
  img: new Image(),
  speed: 0.2,
  x: 0,
};
background.img.src = 'Background.jpeg';

// Трава
const grassImg = new Image();
grassImg.src = 'grass.png';

// Чарівник
const charWizardImg = new Image();
charWizardImg.src = 'elements/charWizard.png';

let grassOffset = 0;
let grassSpeed = 2;

// Супергриб
const superMushroomImg = new Image();
superMushroomImg.src = 'Supermushroom.png';

// Зібрані предмети
const mushroomImages = [
  'elements/M1.png',
  'elements/M2.png',
  'elements/M3.png',
  'elements/M4.png',
  'elements/M5.png',
  'elements/M6.png',
  'elements/M7.png',
  'elements/M8.png',
].map((name) => {
  const img = new Image();
  img.src = name;
  return img;
});

// Завантажуємо зображення перешкод
const obstacleImages = [
  'elements/O1.png',
  'elements/O2.png',
  'elements/O3.png',
  'elements/O4.png',
].map((imagePath) => {
  const img = new Image();
  img.src = imagePath;
  return img;
});

// Анімація
let initialAnimationDuration = canvas.style.animationDuration;

// Зображення для інтерфейсу
const scoreImg = new Image();
scoreImg.src = 'elements/Ui2.png';

const timeImg = new Image();
timeImg.src = 'elements/Ui1.png';

const soundOnImg = new Image();
soundOnImg.src = 'elements/S1.png';

const soundOffImg = new Image();
soundOffImg.src = 'elements/S2.png';

// Функції малювання
function drawBackground() {
  const imgAspectRatio = background.img.width / background.img.height;
  const canvasAspectRatio = canvas.width / canvas.height;

  let drawWidth, drawHeight;

  if (canvasAspectRatio > imgAspectRatio) {
    drawWidth = canvas.width;
    drawHeight = canvas.width / imgAspectRatio;
  } else {
    drawHeight = canvas.height;
    drawWidth = canvas.height * imgAspectRatio;
  }

  background.x -= background.speed * gameSpeed;

  if (background.x <= -drawWidth) {
    background.x = 0;
  }

  const drawY = (canvas.height - drawHeight) / 2;

  ctx.drawImage(background.img, background.x, drawY, drawWidth, drawHeight);
  ctx.drawImage(
    background.img,
    background.x + drawWidth,
    drawY,
    drawWidth,
    drawHeight
  );
}

function drawEmoji(emoji, x, y, size) {
  ctx.font = `${size}px Arial`;
  ctx.fillText(emoji, x, y);
}

function drawCollectible(img, x, y, size) {
  ctx.drawImage(img, x, y, size, size);
}

// Функції оновлення
function updateGrass() {
  grassOffset -= grassSpeed * gameSpeed;

  if (grassOffset <= -1648) {
    grassOffset = 0;
  }
}

function drawMovingGrass() {
  const grassHeight = Math.round(canvas.height * 0.25);
  const y = canvas.height - grassHeight;

  const repetitions = Math.ceil(canvas.width / 1648) + 1;

  for (let i = 0; i < repetitions; i++) {
    ctx.drawImage(
      grassImg,
      grassOffset + i * 1648,
      y,
      1648,
      grassHeight
    );
  }
}

// Функції створення об'єктів
function createObstacle() {
  const randomImageIndex = Math.floor(Math.random() * obstacleImages.length);

  obstacles.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 190) + 50,
    image: obstacleImages[randomImageIndex],
    size: 69,
    falling: false,
    fallSpeed: 0,
  });
}

function createSuperMushroom() {
  collectibles.push({
    x: canvas.width,
    y: Math.random() * (canvas.height * 0.9 - 140) + 50,
    type: 'super',
    image: superMushroomImg,
    size: 70,
  });
}

// Функції перевірки
function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.size &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + obj2.size &&
    obj1.y + obj1.size > obj2.y
  );
}

// Функція оновлення гри
function update() {
  if (!gameStarted || gameOver || gamePaused) return;

  requestAnimationFrame(update);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  updateGrass();
  drawMovingGrass();

  hitruk.velocity += hitruk.gravity;
  hitruk.y += hitruk.velocity;

  if (hitruk.y + hitruk.size > canvas.height) {
    hitruk.y = canvas.height - hitruk.size;
    hitruk.velocity = 0;

    if (!hitruk.isInvincible) {
      gameOver = true;
      endSound.play();
      showGameOverScreen();
    }
  }

  ctx.drawImage(charWizardImg, hitruk.x, hitruk.y, hitruk.size, hitruk.size);

  if (hitruk.isInvincible) {
    ctx.font = '20px Arial';
    const timeText = ` : ${(elapsedTime / 1000).toFixed(2)}`;
    const timeTextWidth = ctx.measureText(timeText).width;

    const barWidth = timeTextWidth * 2;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 40;
    const barHeight = ctx.measureText('Р').width / 2;

    ctx.fillStyle = 'purple';
    const currentBarWidth = (barWidth * hitruk.invincibilityTime) / 20000;
    ctx.fillRect(
      barX + (barWidth - currentBarWidth) / 2,
      barY,
      currentBarWidth,
      barHeight
    );

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';

    if (!boostSound.playing()) {
      boostSound.play();
      backgroundMusic.pause();
    }

    if (hitruk.invincibilityTime === 20000) {
      speedBeforeSuperMushroom = gameSpeed;

      let targetGameSpeed = gameSpeed * 3;
      let transitionDuration = 500;

      let startTime = performance.now();

      function updateSpeed() {
        let timeElapsed = performance.now() - startTime;
        let progress = Math.min(timeElapsed / transitionDuration, 1);
        gameSpeed =
          speedBeforeSuperMushroom +
          (targetGameSpeed - speedBeforeSuperMushroom) * progress;
        grassSpeed = 2 * gameSpeed;

        if (progress < 1) {
          requestAnimationFrame(updateSpeed);
        }
      }

      updateSpeed();
    }

    hitruk.invincibilityTime -= 1000 / 60;

    if (hitruk.invincibilityTime <= 0) {
      hitruk.isInvincible = false;
      hitruk.size = hitruk.originalSize;
      hitruk.scoreMultiplier = 1;

      boostSound.pause();
      backgroundMusic.play();

      let transitionDuration = 500;
      let startTime = performance.now();

      function updateSpeed() {
        let timeElapsed = performance.now() - startTime;
        let progress = Math.min(timeElapsed / transitionDuration, 1);
        gameSpeed =
          speedBeforeSuperMushroom +
          (gameSpeed - speedBeforeSuperMushroom) * (1 - progress);
        grassSpeed = 2 * gameSpeed;

        if (progress < 1) {
          requestAnimationFrame(updateSpeed);
        }
      }

      updateSpeed();
    }
  }

  background.speed = gameSpeed * 0.2;
  gameSpeed += 0.0001;

  canvas.style.animationDuration = `${
    parseFloat(initialAnimationDuration) / gameSpeed
  }s`;

  if (Math.random() < 0.02 * gameSpeed) {
    const randomImageIndex = Math.floor(Math.random() * mushroomImages.length);

    collectibles.push({
      x: canvas.width,
      y: Math.random() * (canvas.height * 0.9 - 140) + 50,
      type: mushroomImages[randomImageIndex],
      size: mushroomImages[randomImageIndex] === 'elements/M5.png' ? 100 : 50,
    });
  }

  if (Math.random() < 0.005 * gameSpeed) {
    createObstacle();
  }

  if (
    elapsedTime > 30000 &&
    Date.now() - lastSuperMushroomTime > 50000
  ) {
    createSuperMushroom();
    lastSuperMushroomTime = Date.now();
  }

  for (let i = collectibles.length - 1; i >= 0; i--) {
    const collectible = collectibles[i];
    collectible.x -= 2 * gameSpeed;

    if (collectible.image) {
      ctx.drawImage(
        collectible.image,
        collectible.x,
        collectible.y,
        collectible.size,
        collectible.size
      );
    } else {
      drawCollectible(
        collectible.type,
        collectible.x,
        collectible.y,
        collectible.size
      );
    }

    if (checkCollision(hitruk, collectible)) {
      collectibles.splice(i, 1);

      if (collectible.type === 'super') {
        hitruk.isInvincible = true;
        hitruk.invincibilityTime = 20000;
        hitruk.size = hitruk.originalSize * 2;
        hitruk.scoreMultiplier = 3;
      } else {
        coinSound.play();

        if (hitruk.isInvincible) {
          score += 70;
        } else {
          score += 10;
        }

        createParticles(collectible.x, collectible.y);
      }
    }

    if (collectible.x < -collectible.size) {
      collectibles.splice(i, 1);
    }
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.x -= 3 * gameSpeed;

    if (obstacle.falling) {
      obstacle.fallSpeed += 0.5;
      obstacle.y += obstacle.fallSpeed;

      if (obstacle.y > canvas.height) {
        obstacles.splice(i, 1);
      }
    }

    ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.size, obstacle.size);

    if (obstacle.x < -obstacle.size) {
      obstacles.splice(i, 1);
    }

    if (checkCollision(hitruk, obstacle)) {
      if (hitruk.isInvincible) {
        obstacle.falling = true;
        score += 7 * hitruk.scoreMultiplier;
      } else {
        gameOver = true;
        endSound.play();
        showGameOverScreen();
      }
    }
  }

  if (particles.length > MAX_PARTICLES) {
    particles.splice(0, particles.length - MAX_PARTICLES);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.y += particle.velocity;

    particle.velocity += 0.1;
    particle.opacity -= 0.02;

    if (particle.opacity <= 0) {
      particles.splice(i, 1);
    } else {
      ctx.globalAlpha = particle.opacity;

      ctx.filter = 'brightness(150%)';

      if (particle.type === 'image') {
        ctx.drawImage(particle.image, particle.x, particle.y, 30, 30);
      }

      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    }
  }

  // Відображення рахунку
  ctx.drawImage(scoreImg, 10, 10, 30, 30);
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`: ${score}`, 45, 30);

  elapsedTime = performance.now() - startTime;

  // Відображення часу гри
  const timeText = `: ${(elapsedTime / 1000).toFixed(2)}`;
  const timeTextWidth = ctx.measureText(timeText).width;
  ctx.drawImage(timeImg, canvas.width - timeTextWidth - 45, 10, 30, 30);
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(timeText, canvas.width - timeTextWidth - 10, 30);
}

function jump() {
  if (gameStarted && !gameOver && !gamePaused) {
    hitruk.velocity = hitruk.jump;
  }
}

function startGame() {
  gameStarted = true;
  gameOver = false;

  score = 0;
  startTime = performance.now();

  backgroundMusic.play();

  gameStartScreen.style.display = 'none';
  canvas.classList.remove('blurred');

  startButton.style.display = 'none';
  soundButton.style.display = 'none';

  update();
}

function restartGame() {
  hitruk.y = canvas.height / 2;
  hitruk.velocity = 0;
  hitruk.isInvincible = false;
  hitruk.invincibilityTime = 0;
  hitruk.size = hitruk.originalSize;
  hitruk.scoreMultiplier = 1;

  score = 0;
  gameOver = false;
  gameStarted = false;
  gameSpeed = 1;
  baseGameSpeed = 1;

  collectibles.length = 0;
  obstacles.length = 0;
  particles.length = 0;

  lastSuperMushroomTime = 0;
  speedBeforeSuperMushroom = 0;

  grassOffset = 0;
  grassSpeed = 2;

  background.x = 0;

  gameOverScreen.style.display = 'none';
  canvas.classList.remove('blurred');

  canvas.style.animation = 'none';
  canvas.offsetHeight;
  canvas.style.animation = null;

  startGame();
}

function togglePause() {
  gamePaused = !gamePaused;

  if (gamePaused) {
    backgroundMusic.pause();

    pauseScreen.style.display = 'flex';
    canvas.classList.add('blurred');

    soundButton.style.display = 'block';
    updateSoundButtonImage(); 
  } else {
    backgroundMusic.play();

    pauseScreen.style.display = 'none';
    canvas.classList.remove('blurred');

    soundButton.style.display = 'none';

    requestAnimationFrame(update);
  }
}

canvas.addEventListener('touchstart', function (event) {
  event.preventDefault();

  if (!gameStarted) {
    startGame();
  } else if (gameOver) {
    //restartGame();
  } else {
    if (event.touches[0].clientY < 20 && gameStarted) {
      togglePause();
    } else {
      jump();
    }
  }
});

canvas.addEventListener('click', function (event) {
  if (!gameStarted) {
    startGame();
  } else if (gameOver) {
    //restartGame();
  } else {
    jump();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.code === 'Space') {
    if (!gameStarted) {
      startGame();
    } else if (gameOver) {
      //restartGame();
    } else {
      jump();
    }
  }
});

function createParticles(x, y) {
  const particleCount = Math.min(5, Math.floor(score / 10) + 3);

  const imagePaths = [
    'elements/E1.png',
    'elements/E2.png',
    'elements/E3.png',
    'elements/E4.png',
    'elements/E5.png',
    'elements/E6.png'
  ];

  for (let i = 0; i < particleCount; i++) {
    const randomAngle = Math.random() * Math.PI * 2;
    const particleSpeed = Math.random() * 3 + 1;

    const randomImageIndex = Math.floor(Math.random() * imagePaths.length);

    const particleImage = new Image();
    particleImage.src = imagePaths[randomImageIndex];

    particleImage.onload = () => {
      particles.push({
        x: x + Math.random() * 30 - 15,
        y: y,
        velocity: -particleSpeed * Math.sin(randomAngle),
        velocityX: particleSpeed * Math.cos(randomAngle),
        opacity: 1,
        image: particleImage,
        type: 'image',
      });
    };
  }
}

function showGameOverScreen() {
  backgroundMusic.pause();

  finalScore.textContent = score;
  finalTime.textContent = (elapsedTime / 1000).toFixed(2);

  gameOverScreen.style.display = 'flex';
  canvas.classList.add('blurred');

  soundButton.style.display = 'block';
  updateSoundButtonImage(); 
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

// Функція для оновлення зображення кнопки звуку
function updateSoundButtonImage() {
  soundButton.innerHTML = ''; // Очищуємо попередній вміст кнопки

  if (soundOn) {
    soundOnImg.width = 40;  // Встановлюємо ширину зображення
    soundOnImg.height = 40; // Встановлюємо висоту зображення
    soundButton.appendChild(soundOnImg);
  } else {
    soundOffImg.width = 40;  // Встановлюємо ширину зображення
    soundOffImg.height = 40; // Встановлюємо висоту зображення
    soundButton.appendChild(soundOffImg);
  }
}

// Обробник події для кнопки звуку
soundButton.addEventListener('click', () => {
  soundOn = !soundOn;

  backgroundMusic.mute(!soundOn);
  boostSound.mute(!soundOn);
  coinSound.mute(!soundOn);
  endSound.mute(!soundOn);

  updateSoundButtonImage(); // Оновлюємо зображення кнопки
});

resumeButton.addEventListener('click', togglePause);

const loadingScreen = document.getElementById('loadingScreen');
const loadingProgress = document.getElementById('loadingProgress');
const loadingText = document.getElementById('loadingText');

function updateLoadingProgress(progress) {
  loadingProgress.style.width = `${progress}%`;
  loadingText.textContent = `Loading... ${progress}%`;
}

Promise.all([
  new Promise((resolve) => {
    grassImg.onload = resolve;
    updateLoadingProgress(10);
  }),
  new Promise((resolve) => {
    background.img.onload = resolve;
    updateLoadingProgress(20);
  }),
  new Promise((resolve) => {
    superMushroomImg.onload = resolve;
    updateLoadingProgress(30);
  }),
  new Promise((resolve) => {
    charWizardImg.onload = resolve;
    updateLoadingProgress(40);
  }),
  new Promise((resolve) => {
    scoreImg.onload = resolve;
    updateLoadingProgress(60);
  }),
  new Promise((resolve) => {
    timeImg.onload = resolve;
    updateLoadingProgress(80);
  }),
  ...mushroomImages.map((img) => new Promise((resolve) => {
    img.onload = resolve;
  })),
  ...obstacleImages.map((img) => new Promise((resolve) => {
    img.onload = resolve;
  })),
]).then(() => {
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    canvas.classList.add('blurred');

    showStartScreen();
  }, 500);
  updateLoadingProgress(100);
});

function showStartScreen() {
  gameStartScreen.style.display = 'block';
  startButton.style.display = 'block';
  soundButton.style.display = 'block';

  updateSoundButtonImage();

  function updateSoundButtonImage() {
  soundButton.innerHTML = ''; // Очищуємо попередній вміст кнопки

  if (soundOn) {
    soundOnImg.width = 40;  // Встановлюємо ширину зображення
    soundOnImg.height = 40; // Встановлюємо висоту зображення
    soundButton.appendChild(soundOnImg);
  } else {
    soundOffImg.width = 40;  // Встановлюємо ширину зображення
    soundOffImg.height = 40; // Встановлюємо висоту зображення
    soundButton.appendChild(soundOffImg);
  }
}
}
