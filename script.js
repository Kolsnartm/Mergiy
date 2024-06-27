const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Звуки
const backgroundMusic = new Howl({
    src: ['Birds.wav'],
    loop: true,
    volume: 0.5
});

const boostSound = new Howl({
    src: ['Boost.wav'],
    volume: 0.8
});

const coinSound = new Howl({
    src: ['Coin.wav']
});

const endSound = new Howl({
    src: ['End.wav']
});

// Елементи UI
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const finalTime = document.getElementById('finalTime');
const restartButton = document.getElementById('restartButton');

// Розміри canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Максимальна кількість частинок
const MAX_PARTICLES = 30;

// Константи гри
const hitruk = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    size: 40,
    originalSize: 40,
    velocity: 0,
    gravity: 0.5,
    jump: -10,
    isInvincible: false,
    invincibilityTime: 0,
    scoreMultiplier: 1
};

// Глобальні змінні гри
let collectibles = [];
let particles = [];
let obstacles = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let baseGameSpeed = 1;
let gameSpeed = baseGameSpeed;
let startTime;
let elapsedTime = 0;
let lastSuperMushroomTime = 0;
let speedBeforeSuperMushroom = 0;

// Фон
const background = {
    trees: [],
    houses: []
};

// Фрази
const phrases = [
    "Оце да!",
    "Малий бл*дь світи!",
    "Неймовірно!",
    "ммм",
    "а пахне як!",
    "О! Тай буде діло!!",
    "Хай буде!",
    "Та візьми тяжку",
    "По трохи, мікродозінг!",
    "Може бути",
    "Чиназес!",
    "Це було ПОТУЖНО!",
    "Смаколик!",
    "Їжовик",
    "Де ГРІНДЕР?!",
    "Підлічити",
    "Йдем скрутимось",
    "Ти шо угараєш?",
    "Та ми чучуть"
];

// Емодзі
const mushroomEmojis = ['🍄', '🌱', '🌿', '🌝', '☘️', '🍀', '🌿'];
const treeEmojis = ['🌳', '🌲'];
const houseEmojis = ['🏠', '🏘️', '🏡'];

// Зображення
const backgroundImg = new Image();
backgroundImg.src = 'Background.jpeg';

const superMushroomImg = new Image();
superMushroomImg.src = 'Supermushroom.png';

// Функції малювання
function drawEmoji(emoji, x, y, size) {
    ctx.font = `${size}px Arial`;
    ctx.fillText(emoji, x, y);
}

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 90, canvas.width, 90);

    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 90, canvas.width, 10);

    // Оптимізовано: Видалення об'єктів поза екраном після циклу
    for (let i = background.trees.length - 1; i >= 0; i--) {
        const tree = background.trees[i];
        drawEmoji(tree.emoji, tree.x, tree.y - tree.size, tree.size);
        tree.x -= tree.speed * gameSpeed;
        if (tree.x + tree.size < 0) {
            background.trees.splice(i, 1); 
        }
    }

    for (let i = background.houses.length - 1; i >= 0; i--) {
        const house = background.houses[i];
        drawEmoji(house.emoji, house.x, house.y - house.size, house.size);
        house.x -= house.speed * gameSpeed;
        if (house.x + house.size < 0) {
            background.houses.splice(i, 1); 
        }
    }
}

// Функція генерації об'єктів фону
function generateBackgroundObjects(type, emojis, maxObjects) {
    let lastX = 0;
    for (let i = 0; i < maxObjects; i++) {
        if (Math.random() < 0.3) {
            background[type].push({
                x: lastX + Math.random() * canvas.width / 3 + 100,
                y: canvas.height - 90,
                size: 50 + Math.random() * 50,
                speed: 0.5 + Math.random() * 0.5,
                emoji: emojis[Math.floor(Math.random() * emojis.length)]
            });
            lastX += background[type][background[type].length - 1].size; 
        }
    }
}

// Генерація початкових об'єктів фону
generateBackgroundObjects('trees', treeEmojis, 20);
generateBackgroundObjects('houses', houseEmojis, 5);

// Функції створення ігрових об'єктів
function createObstacle() {
    obstacles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 190) + 50,
        type: ['🦅', '🦟', '🐝', '🐲', '🧟‍♀️'][Math.floor(Math.random() * 5)],
        size: 40,
        falling: false,
        fallSpeed: 0
    });
}

function createSuperMushroom() {
    collectibles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height * 0.9 - 140) + 50,
        type: 'super',
        size: 60
    });
}

// Функція перевірки зіткнень
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.size &&
           obj1.x + obj1.size > obj2.x &&
           obj1.y < obj2.y + obj2.size &&
           obj1.y + obj1.size > obj2.y;
}

// Функція оновлення гри
function update() {
    if (!gameStarted || gameOver) return;

    // Використовуємо requestAnimationFrame для плавної анімації
    requestAnimationFrame(update); 

    // Очищення canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Малювання фону
    drawBackground();

    // Оновлення позиції Хітрука
    hitruk.velocity += hitruk.gravity;
    hitruk.y += hitruk.velocity;

    // Перевірка зіткнення Хітрука з землею
    if (hitruk.y + hitruk.size > canvas.height - 90) {
        hitruk.y = canvas.height - 90 - hitruk.size;
        hitruk.velocity = 0;
        if (!hitruk.isInvincible) {
            gameOver = true;
            endSound.play();
            showGameOverScreen();
        }
    }

    // Малювання Хітрука
    drawEmoji('🧙‍♂️', hitruk.x, hitruk.y, hitruk.size);

   // Полоса Супер Гриба
    if (hitruk.isInvincible) {
        ctx.font = '20px Arial';
        const timeText = `Час: ${(elapsedTime / 1000).toFixed(2)}`;
        const timeTextWidth = ctx.measureText(timeText).width;
        const barWidth = timeTextWidth * 2; 
        const barX = (canvas.width - barWidth) / 2; 
        const barY = 40;
        const barHeight = ctx.measureText("Р").width / 2; 

        ctx.fillStyle = 'purple';
        const currentBarWidth = barWidth * (hitruk.invincibilityTime / 20000);
        ctx.fillRect(barX + (barWidth - currentBarWidth) / 2, barY, currentBarWidth, barHeight);

        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('О! Це Єжовік! 🤩', hitruk.x + hitruk.size / 2, hitruk.y - 10);

        if (!boostSound.playing()) {
            boostSound.play();
            backgroundMusic.pause();
        }

        if (hitruk.invincibilityTime === 20000) {
            speedBeforeSuperMushroom = gameSpeed;
            gameSpeed *= 3; // Збільшення швидкості в 3 рази
        }

        hitruk.invincibilityTime -= 1000 / 60;
        if (hitruk.invincibilityTime <= 0) {
            hitruk.isInvincible = false;
            hitruk.size = hitruk.originalSize;
            hitruk.scoreMultiplier = 1;
            boostSound.pause();
            backgroundMusic.play();

            gameSpeed = speedBeforeSuperMushroom; 
        }
    }

    // Прискорення гри
    gameSpeed += 0.0001; 

    // Генерація предметів
    if (Math.random() < 0.02 * gameSpeed) {
        collectibles.push({
            x: canvas.width,
            y: Math.random() * (canvas.height * 0.9 - 140) + 50,
            type: mushroomEmojis[Math.floor(Math.random() * mushroomEmojis.length)],
            size: 30,
            phrase: phrases[Math.floor(Math.random() * phrases.length)]
        });
    }

    // Генерація перешкод
    if (Math.random() < 0.005 * gameSpeed) {
        createObstacle();
    }

    // Генерація супергриба
    if (elapsedTime > 30000 && Date.now() - lastSuperMushroomTime > 50000) {
        createSuperMushroom();
        lastSuperMushroomTime = Date.now();
    }

    // Оновлення предметів
    // Оптимізовано: Видалення предметів поза екраном після циклу
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        collectible.x -= 2 * gameSpeed;

        if (collectible.type === 'super') {
            ctx.drawImage(superMushroomImg, collectible.x, collectible.y, collectible.size, collectible.size);
        } else {
            drawEmoji(collectible.type, collectible.x, collectible.y, collectible.size);
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

                createParticles(collectible.x, collectible.y, collectible.phrase);
            }
        }

        // Видалення предметів, що вийшли за межі екрана
        if (collectible.x < -collectible.size) {
            collectibles.splice(i, 1);
        }
    }

    // Оновлення перешкод
    // Оптимізовано: Видалення перешкод поза екраном після циклу
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

        drawEmoji(obstacle.type, obstacle.x, obstacle.y, obstacle.size);

        // Видалення перешкод, що вийшли за межі екрана
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

    // Обмеження кількості частинок
    if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
    }

    // Оновлення та малювання частинок
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.y += particle.velocity;
        particle.velocity += 0.1;
        particle.opacity -= 0.02;

        if (particle.opacity <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.globalAlpha = particle.opacity;
            if (particle.type === 'text') {
                ctx.fillStyle = 'black';
                ctx.font = '20px Arial';
                ctx.fillText(particle.phrase, particle.x, particle.y);
            } else {
                drawEmoji(particle.emoji, particle.x, particle.y, 20);
            }
            ctx.globalAlpha = 1;
        }
    }

    // Відображення рахунку та часу
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Рахунок: ${score}`, 10, 30);

    elapsedTime = performance.now() - startTime; // Використовуємо performance.now()

    const timeText = `Час: ${(elapsedTime / 1000).toFixed(2)}`;
    const timeTextWidth = ctx.measureText(timeText).width;
    ctx.fillText(timeText, canvas.width - timeTextWidth - 10, 30);
}

// Функції обробки подій
function jump() {
    if (gameStarted && !gameOver) {
        hitruk.velocity = hitruk.jump;
    }
}

function startGame() {
    gameStarted = true;
    startTime = performance.now(); // Використовуємо performance.now()
    backgroundMusic.play();
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
    gameOverScreen.style.display = 'none';

    startGame();
}

// Додавання слухачів подій
canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    if (!gameStarted) {
        startGame();
    } else if (gameOver) {
        //restartGame();
    } else {
        jump();
    }
});

canvas.addEventListener('click', function(event) {
   if (!gameStarted) {
        startGame();
    } else if (gameOver) {
        //restartGame();
    } else {
        jump();
    }
});

document.addEventListener('keydown', function(event) {
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

// Функція створення частинок
function createParticles(x, y, phrase = null) {
    const particleCount = Math.min(5, Math.floor(score / 10) + 3);
    for (let i = 0; i < particleCount; i++) {
        const randomAngle = Math.random() * Math.PI * 2;
        const particleSpeed = Math.random() * 3 + 1;
        particles.push({
            x: x + Math.random() * 30 - 15,
            y: y,
            velocity: -particleSpeed * Math.sin(randomAngle),
            velocityX: particleSpeed * Math.cos(randomAngle),
            opacity: 1,
            emoji: ['😀', '😃', '😄', '😁', '😆', '🤩', '🍄', '🌟', '✨'][Math.floor(Math.random() * 9)],
            type: 'emoji'
        });
    }
    if (phrase) {
        particles.push({
            x: x,
            y: y,
            velocity: -3,
            opacity: 1,
            type: 'text',
            phrase: phrase
        });
    }
}

// Функції малювання екранів
function drawStartScreen() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Натисніть, щоб почати гру', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'left';
}

function showGameOverScreen() {
    backgroundMusic.pause();
    finalScore.textContent = score;
    finalTime.textContent = (elapsedTime / 1000).toFixed(2);
    gameOverScreen.style.display = 'flex';
}

// Обробник події для кнопки перезапуску
restartButton.addEventListener('click', restartGame);

// Малювання стартового екрану
drawStartScreen();

// Реєстрація Service Worker (за потреби)
// ... 
