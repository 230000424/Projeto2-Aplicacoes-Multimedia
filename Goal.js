class Goal{
    constructor(type, duration = 120){
        this.type = type;
        this.duration = duration;
        this.frame = 0;
        this.active = true;
        this.fadeIn = 30;
        this.fadeOut = 30;
    }

    update(){
        if(!this.active) return;
        this.frame++;
        if(this.frame > this.duration){
            this.active = false;
        }
    }

    draw(ctx){
        if(!this.active) return;

        let alpha = 1;
        if(this.frame < this.fadeIn){
            alpha = this.frame / this.fadeIn;
        } else if(this.frame > this.duration - this.fadeOut){
            alpha = (this.duration - this.frame) / this.fadeOut;
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        // Recorte do "GOAL" amarelo
        const sx = 0;
        const sy = 0;
        const sWidth = 200;
        const sHeight = 100;

        const dx = canvas.width / 2 - sWidth / 2;
        const dy = canvas.height / 2 - sHeight / 2;

        ctx.drawImage(goalSprite, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);

        ctx.restore();
    }
}