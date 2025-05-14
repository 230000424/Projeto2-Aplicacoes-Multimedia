class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = "#808080";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    checkCollision(ball) {
        return (
            ball.x - ball.radius < this.x + this.width &&
            ball.x + ball.radius > this.x &&
            ball.y + ball.radius > this.y &&
            ball.y - ball.radius < this.y + this.height
        );
    }
}