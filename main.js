const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const buttonsCanvas = document.getElementById("buttonsCanvas");
const buttonsCtx = buttonsCanvas.getContext("2d");

const povCanvas = document.getElementById("povCanvas");
const povCtx = povCanvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Tamanhos
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;
const ballRadius = 8;
const ballSpeed = 2;

// Cronometro
let timeLimit = 45; // segundos
let startTime = null;
let gameOver = false;

// POV
let povActive = false;

// Overtime
let inOvertime = false;

// Sprite Sheet
const goalSprite = new Image();
goalSprite.src = "assets/Goal.png";
let goalEffect = null;

// Nivel 
let gameState = "lobby";
let currentLevel;
let obstacles = [];
let map = [
    [
        new Obstacle(200, 100, 10, 150),
        new Obstacle(400, 300, 10, 150),
        new Obstacle(600, 150, 10, 150)
    ],
    [
        new Obstacle(160, 120, 10, 150),
        new Obstacle(600, 200, 10, 150),
        new Obstacle(350, 250, 10, 150)
    ],
    [
        new Obstacle(100, 80, 10, 150),
        new Obstacle(700, 220, 10, 150),
        new Obstacle(400, 50, 10, 100)
    ],
    [
        new Obstacle(150, 100, 10, 150),
        new Obstacle(650, 250, 10, 150),
        new Obstacle(300, 400, 10, 80)
    ],
    [
        new Obstacle(250, 50, 10, 100),
        new Obstacle(550, 350, 10, 100),
        new Obstacle(400, 100, 10, 80)
    ]
];

// Instanciar objetos
const leftPaddle = new Paddle(10, canvasHeight / 2 - paddleHeight / 2, paddleWidth, paddleHeight, paddleSpeed);
const rightPaddle = new Paddle(canvasWidth - paddleWidth - 10, canvasHeight / 2 - paddleHeight / 2, paddleWidth, paddleHeight, paddleSpeed);
const ball = new Ball(canvasWidth / 2, canvasHeight / 2, ballRadius, ballSpeed, ballSpeed, canvasWidth, canvasHeight);

let leftScore = 0;
let rightScore = 0;

let upPressedP1 = false;
let downPressedP1 = false;
let upPressedP2 = false;
let downPressedP2 = false;

function init() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawNet();
    drawScore();
    drawTimer();
    drawPov();
    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);

    // Desenhar obstáculos do 2 nivel
    if (currentLevel === 2) {
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].draw(ctx);
        }
    }

    if (goalEffect && goalEffect.active) {
        goalEffect.update();
        goalEffect.draw(ctx);
    }

    if (gameOver) {
        // Desenha a tela de fim de jogo
        ctx.fillStyle = "#00d8ff";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Fim do Jogo!", canvasWidth / 2, canvasHeight / 2 - 40);

        // Desenha a pontuação final
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px Arial";
        if (leftScore > rightScore) {
            ctx.fillText("Jogador 1!", canvasWidth / 2, canvasHeight / 2 - 5);
        } else if (rightScore > leftScore) {
            ctx.fillText("Jogador 2!", canvasWidth / 2, canvasHeight / 2 - 5);
        }

        // Desenha o botão de reiniciar
        ctx.fillStyle = "#00d8ff";
        ctx.fillRect(300, 270, 200, 50); // Botão desenhado
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText("Reiniciar", 400, 300);

        // Desenha o botão de voltar ao lobby
        ctx.fillStyle = "#00d8ff";
        ctx.fillRect(300, 340, 200, 50); // Botão desenhado
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText("Voltar ao Lobby", 400, 370);
    }
}

function setupLevel(level) {
    if (level === 2) {
        const randomIndex = Math.floor(Math.random() * map.length);
        console.log("Mapa escolhido:", randomIndex, map[randomIndex]);
        obstacles = [];
        for (let i = 0; i < map[randomIndex].length; i++) {
            const obstacle = map[randomIndex][i];
            obstacles.push(new Obstacle(obstacle.x, obstacle.y, obstacle.width, obstacle.height));
        }
    } else {
        obstacles = [];
    }
}

function update() {
    if (gameOver) return;

    if (startTime === null) {
        startTime = performance.now();
    }

    if (upPressedP1 && leftPaddle.y > 0) leftPaddle.moveUp();
    if (downPressedP1 && leftPaddle.y + paddleHeight < canvasHeight) leftPaddle.moveDown(canvasHeight);
    if (upPressedP2 && rightPaddle.y > 0) rightPaddle.moveUp();
    if (downPressedP2 && rightPaddle.y + paddleHeight < canvasHeight) rightPaddle.moveDown(canvasHeight);

    ball.update();

    // Som quando bate nos limetes laterais do campo
    if(ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvasHeight){
        playHitSound();
    }

    // Colisão com paddles
    if (ball.checkCollision(leftPaddle)) {
        ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
        ball.reflect(leftPaddle);
        playHitSound();
    } else if (ball.checkCollision(rightPaddle)) {
        ball.x = rightPaddle.x - ball.radius;
        ball.reflect(rightPaddle);
        playHitSound();
    }

    // Colisão com obstáculos so no nivel 2
    if (currentLevel === 2) {
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            if (obstacle.checkCollision(ball)) {~
                playHitSound();

                const overlapLeft = Math.abs((ball.x + ball.radius) - obstacle.x);
                const overlapRight = Math.abs((ball.x - ball.radius) - (obstacle.x + obstacle.width));
                const overlapTop = Math.abs((ball.y + ball.radius) - obstacle.y);
                const overlapBottom = Math.abs((ball.y - ball.radius) - (obstacle.y + obstacle.height));

                // Encontra o menor overlap para decidir o lado do ricochete
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                    ball.speedX *= -1;
                } else {
                    ball.speedY *= -1;
                }
            }
        }
    }

    // Pontuação
    if (ball.x - ball.radius < 0) {
        rightScore++;
        goalEffect = new Goal(GoalState.yellow);
        playGoalSound();
        if (inOvertime && rightScore !== leftScore) {
            gameOver = true;
        } else {
            ball.reset(1);
        }
    } else if (ball.x + ball.radius > canvasWidth) {
        leftScore++;
        goalEffect = new Goal(GoalState.white);
        playGoalSound();
        if (inOvertime && leftScore !== rightScore) {
            gameOver = true;
        } else {
            ball.reset(-1);
        }
    }

    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed >= timeLimit && !inOvertime) {
        if (leftScore === rightScore) {
            inOvertime = true;
        } else {
            gameOver = true;
            return;
        }
    }
}

function drawNet() {
    ctx.fillStyle = "#004d66";
    const netWidth = 4;
    const netHeight = 20;
    const netX = canvasWidth / 2 - netWidth / 2;
    let netY = 0;
    while (netY < canvasHeight) {
        ctx.fillRect(netX, netY, netWidth, netHeight);
        netY += netHeight * 2;
    }
}

function drawScore() {
    ctx.fillStyle = "#00d8ff";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${leftScore} : ${rightScore}`, canvasWidth / 2, 30);
}

function drawTimer() {
    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";

    if (inOvertime) {
        ctx.fillText(`Prolongamento`, canvasWidth / 2, canvasHeight - 30);
    } else {
        const remaining = Math.max(0, timeLimit - ((performance.now() - startTime) / 1000));
        ctx.fillText(`Tempo: ${remaining.toFixed(1)}s`, canvasWidth / 2, canvasHeight - 30);
    }
}

function drawPov() {
    povCtx.clearRect(0, 0, povCanvas.width, povCanvas.height);

    if (!povActive) return;

    povCtx.save();

    let offsetX = povCanvas.width / 2 - ball.x;
    let offsetY = povCanvas.height / 2 - ball.y;

    offsetX = Math.min(0, Math.max(offsetX, povCanvas.width - canvasWidth));
    offsetY = Math.min(0, Math.max(offsetY, povCanvas.height - canvasHeight));

    povCtx.translate(offsetX, offsetY);

    drawNet(povCtx);
    leftPaddle.draw(povCtx);
    rightPaddle.draw(povCtx);
    ball.draw(povCtx);

    if (currentLevel === 2) {
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].draw(povCtx);
        }
    }

    povCtx.restore();
}

function drawLobby() {
    // Limpa o canvas dos botões
    buttonsCtx.clearRect(0, 0, buttonsCanvas.width, buttonsCanvas.height);

    // Titulo
    buttonsCtx.fillStyle = "#00d8ff";
    buttonsCtx.font = "bold 36px Arial";
    buttonsCtx.textAlign = "center";
    buttonsCtx.fillText("Bem-vindo ao Gnop!", buttonsCanvas.width / 2, 50);

    // Descrição do modo de jogo
    buttonsCtx.font = "16px Arial";
    buttonsCtx.fillStyle = "#ffffff";
    buttonsCtx.textAlign = "left";
    buttonsCtx.fillText("Modo 1: Jogo clássico sem obstáculos.", 50, 180);
    buttonsCtx.fillText("Modo 2: Jogo com obstáculos no campo.", 450, 180);
    buttonsCtx.fillText("Se pressionar a tecla 'p' pode ver o pov (point of view) da bola.", 180, 350);

    // Desenha os botão de nível 1
    buttonsCtx.fillStyle = "#00d8ff";
    buttonsCtx.fillRect(150, 200, 80, 40); // Botão desenhado
    buttonsCtx.fillStyle = "#000";
    buttonsCtx.font = "20px Arial";
    buttonsCtx.fillText("Clássico", 153, 227);

    // Desenha os botão de nível 2
    buttonsCtx.fillStyle = "#00d8ff";
    buttonsCtx.fillRect(550, 200, 85, 40); // Botão desenhado
    buttonsCtx.fillStyle = "#000";
    buttonsCtx.font = "20px Arial";
    buttonsCtx.fillText("Barreiras", 553, 227);
}

function playAmbientMusic(){
    const gameMusic = document.getElementById("gameMusic");
    gameMusic.volume = 0.1;
    if(gameMusic.paused){
        gameMusic.play();
    }
}

function playGoalSound(){
    const goalSound = document.getElementById("goalSound");
    goalSound.volume = 0.2;
    goalSound.currentTime = 0; // Reinicia o som
    goalSound.play();
}

function playHitSound(){
    const hitSound = document.getElementById("hitSound");
    hitSound.volume = 0.2;
    hitSound.currentTime = 0; // Reinicia o som
    hitSound.play();
}

function gameLoop() {
    if (gameState === "lobby") {
        canvas.style.display = "none";
        povCanvas.style.display = "none";
        drawLobby();
    } else if (gameState === "playing") {
        canvas.style.display = "block";
        update();
        init();
    }
    requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
    if (gameOver) return;
    switch (e.key) {
        case "w":
        case "W":
            downPressedP1 = true;
            break;
        case "s":
        case "S":
            upPressedP1 = true;
            break;
        case "ArrowUp":
            downPressedP2 = true;
            break;
        case "ArrowDown":
            upPressedP2 = true;
            break;
    }
}

function keyUpHandler(e) {
    if (e.key === "p" && gameState === "playing") {
        povActive = !povActive;
        povCanvas.style.display = povActive ? "block" : "none";
        return;
    }

    if (gameOver) return;
    switch (e.key) {
        case "w":
        case "W":
            downPressedP1 = false;
            break;
        case "s":
        case "S":
            upPressedP1 = false;
            break;
        case "ArrowUp":
            downPressedP2 = false;
            break;
        case "ArrowDown":
            upPressedP2 = false;
            break;
    }
}

window.addEventListener("keydown", keyDownHandler);
window.addEventListener("keyup", keyUpHandler);

ball.reset(Math.random() > 0.5 ? 1 : -1);
gameLoop();

canvas.addEventListener("mousedown", function (e) {
    if (gameOver) {
        inOvertime = false;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Verifica se clicou na área do botão
        if (x >= 300 && x <= 500 && y >= 270 && y <= 320) {
            leftScore = 0;
            rightScore = 0;
            startTime = performance.now();
            setupLevel(currentLevel);
            gameOver = false;
            ball.reset(Math.random() > 0.5 ? 1 : -1);
        }

        if (x >= 300 && x <= 500 && y >= 340 && y <= 390) {
            gameState = "lobby";
            gameOver = false;
            inOvertime = false;
            buttonsCanvas.style.display = "block";
            canvas.style.display = "none";

        }

    }
});

buttonsCanvas.addEventListener("mousedown", function (e) {
    if (gameOver) return;
    if (gameState !== "lobby") return;

    const rect = buttonsCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Verificar se clicou no botao 1
    if (mouseX >= 150 && mouseX <= 230 && mouseY >= 200 && mouseY <= 240) {
        buttonsCanvas.style.display = "none";
        currentLevel = 1;
        timeLimit = 45;
        startTime = performance.now();
        ball.reset(Math.random() > 0.5 ? 1 : -1);
        setupLevel(currentLevel);
        gameState = "playing";
        leftScore = 0;
        rightScore = 0;
        playAmbientMusic();
    }

    // Verificar se clicou no botao 2
    if (mouseX >= 550 && mouseX <= 635 && mouseY >= 200 && mouseY <= 240) {
        buttonsCanvas.style.display = "none";
        currentLevel = 2;
        timeLimit = 45;
        startTime = performance.now();
        ball.reset(Math.random() > 0.5 ? 1 : -1);
        setupLevel(currentLevel);
        gameState = "playing";
        leftScore = 0;
        rightScore = 0;
        playAmbientMusic();
    }
});