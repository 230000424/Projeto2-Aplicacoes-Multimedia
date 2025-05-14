const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const buttonsCanvas = document.getElementById("buttonsCanvas");
const buttonsCtx = buttonsCanvas.getContext("2d");

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

// Overtime
let inOvertime = false;

// Nivel 
let gameState = "lobby";
let currentLevel = 1;
let obstacles = [];

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
    buttonsCtx.fillText("Modo 1: Jogo clássico sem obstáculos.", 20, 100);
    buttonsCtx.fillText("Modo 2: Jogo com obstáculos no campo.", 20, 130);


    // Desenha os botão de nível 1
    buttonsCtx.fillStyle = "#00d8ff";
    buttonsCtx.fillRect(250, 200, 75, 40); // Botão desenhado
    buttonsCtx.fillStyle = "#000";
    buttonsCtx.font = "20px Arial";
    buttonsCtx.fillText("Clássico", 30, 45);

    // Desenha os botão de nível 2
    buttonsCtx.fillStyle = "#00d8ff";
    buttonsCtx.fillRect(450, 200, 75, 40); // Botão desenhado
    buttonsCtx.fillStyle = "#000";
    buttonsCtx.font = "20px Arial";
    buttonsCtx.fillText("Barreiras", 120, 45);
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawNet();
    drawScore();
    drawTimer();
    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);

    // Desenhar obstáculos do 2 nivel
    if (currentLevel === 2) {
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].draw(ctx);
        }
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
        } else {
            ctx.fillText("Empate!", canvasWidth / 2, canvasHeight / 2 - 5);
        }

        // Desenha o botão de reiniciar
        ctx.fillStyle = "#00d8ff";
        ctx.fillRect(300, 270, 200, 50); // Botão desenhado
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText("Reiniciar", 400, 300);
    }
}

function setupLevel(level) {
    if (level === 2) {
        obstacles = [
            new Obstacle(200, 100, 10, 150),
            new Obstacle(500, 200, 10, 150)
        ];

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

    // Colisão com paddles
    if (ball.checkCollision(leftPaddle)) {
        ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
        ball.reflect(leftPaddle);
    } else if (ball.checkCollision(rightPaddle)) {
        ball.x = rightPaddle.x - ball.radius;
        ball.reflect(rightPaddle);
    }

    // Colisão com obstáculos so no nivel 2
    if (currentLevel === 2) {
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            if (obstacle.checkCollision(ball)) {
                if (ball.x + ball.radius > obstacle.x &&
                    ball.x - ball.radius < obstacle.x + obstacle.width
                ) {
                    ball.speedX *= -1
                }

                if (ball.y + ball.radius > obstacle.y &&
                    ball.y - ball.radius < obstacle.y + obstacle.height
                ) {
                    ball.speedY *= -1
                }
            }
        }
    }

    // Pontuação
    if (ball.x - ball.radius < 0) {
        rightScore++;
        if (inOvertime && rightScore !== leftScore) {
            gameOver = true;
        } else {
            ball.reset(1);
        }
    } else if (ball.x + ball.radius > canvasWidth) {
        leftScore++;
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

function gameLoop() {
    if (gameState === "lobby") {
        canvas.style.display = "none";
        drawLobby();
    } else if(gameState === "playing") {
        canvas.style.display = "block";
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}   

function keyDownHandler(e) {
    if (gameOver) return;
    switch (e.key) {
        case "w":
        case "W":
            upPressedP1 = true;
            break;
        case "s":
        case "S":
            downPressedP1 = true;
            break;
        case "ArrowUp":
            upPressedP2 = true;
            break;
        case "ArrowDown":
            downPressedP2 = true;
            break;
    }
}

function keyUpHandler(e) {
    if (gameOver) return;
    switch (e.key) {
        case "w":
        case "W":
            upPressedP1 = false;
            break;
        case "s":
        case "S":
            downPressedP1 = false;
            break;
        case "ArrowUp":
            upPressedP2 = false;
            break;
        case "ArrowDown":
            downPressedP2 = false;
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
            gameOver = false;
            ball.reset(Math.random() > 0.5 ? 1 : -1);
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
    if (mouseX >= 20 && mouseX <= 90 && mouseY >= 20 && mouseY <= 60) {
        buttonsCanvas.style.display = "none";
        currentLevel = 1;
        timeLimit = 45;
        startTime = performance.now();
        ball.reset(Math.random() > 0.5 ? 1 : -1);
        setupLevel(currentLevel);
        gameState = "playing";
        leftScore = 0;
        rightScore = 0;
    }

    // Verificar se clicou no botao 2
    if (mouseX >= 110 && mouseX <= 180 && mouseY >= 20 && mouseY <= 60) {
        buttonsCanvas.style.display = "none";
        currentLevel = 2;
        timeLimit = 45;
        startTime = performance.now();
        ball.reset(Math.random() > 0.5 ? 1 : -1);
        setupLevel(currentLevel);
        gameState = "playing";
        leftScore = 0;
        rightScore = 0;
    }
});
