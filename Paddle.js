class Paddle {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    moveUp() {
        this.y -= this.speed;
    }

    moveDown(canvasHeight) {
        if (this.y + this.height + this.speed <= canvasHeight) {
            this.y += this.speed;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "#00d8ff";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
} 