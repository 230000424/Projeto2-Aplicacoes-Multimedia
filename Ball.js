class Ball {
    constructor(x, y, radius, speedX, speedY, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.initialSpeed = Math.sqrt(speedX ** 2 + speedY ** 2);
    }

    reset(direction = 1) {
        this.x = this.canvasWidth / 2;
        this.y = this.canvasHeight / 2;
        this.speedX = direction * this.initialSpeed;
        this.speedY = (Math.random() > 0.5 ? 1 : -1) * this.initialSpeed;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Collision with top and bottom walls
        if (this.y - this.radius < 0 || this.y + this.radius > this.canvasHeight) {
            this.speedY = -this.speedY;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "#00d8ff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    increaseSpeed(maxSpeed = 12) {
        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
        const newSpeed = Math.min(maxSpeed, speed + 0.4);
        const angle = Math.atan2(this.speedY, this.speedX);
        this.speedX = newSpeed * Math.cos(angle);
        this.speedY = newSpeed * Math.sin(angle);
    }

    checkCollision(paddle) {
        return (
            this.x - this.radius < paddle.x + paddle.width &&
            this.x + this.radius > paddle.x &&
            this.y + this.radius > paddle.y &&
            this.y - this.radius < paddle.y + paddle.height
        );
    }

    reflect(paddle) {
        const paddleCenter = paddle.y + paddle.height / 2;
        const distance = this.y - paddleCenter;
        const normalized = distance / (paddle.height / 2);
        const maxAngle = Math.PI / 4;
        const angle = normalized * maxAngle;

        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
        const direction = this.speedX > 0 ? -1 : 1;
        this.speedX = direction * speed * Math.cos(angle);
        this.speedY = speed * Math.sin(angle);
        this.increaseSpeed();
    }
}
