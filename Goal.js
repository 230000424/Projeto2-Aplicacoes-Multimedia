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
        let sx = 0;
        let sy = 0;
        const sWidth = 310;
        const sHeight = 155;

        if(this.type === "yellow"){
            sx = 0;
            sy = 3;
        }else if(this.type === "white"){
            sx = 0;
            sy = 158;
        }

        const dx = canvas.width / 2 - sWidth / 2;
        const dy = canvas.height / 2 - sHeight / 2;

        ctx.drawImage(goalSprite, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);

        ctx.restore();
    }
}