const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Tamanhos
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;
const ballRadius = 8;
const ballSpeed = 2;

// Cronometro
let timeLimit = 5; // segundos
let startTime = null;
let gameOver = false;

// Overtime
let inOvertime = false;

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

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawNet();
    drawScore();
    drawTimer();
    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ball.draw(ctx);
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
    update();
    draw();
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
