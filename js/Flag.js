class Flag {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.isCollected = false;
        
        // Анимация флага
        this.animations = {
            idle: { frames: 4, currentFrame: 0, frameTimer: 0, frameInterval: 200 }
        };
        
        this.sprites = {
            idle: []
        };
        
        this.loadSprites();
    }
    
    async loadSprites() {
        try {
            const img = await this.loadImage('assets/images/Flag.png');
            const frameWidth = img.width / 4; // Предполагаем 4 кадра
            const frameHeight = img.height;
            
            for (let i = 0; i < 4; i++) {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                const ctx = canvas.getContext('2d');
                
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(
                    img,
                    i * frameWidth, 0, frameWidth, frameHeight,
                    0, 0, this.width, this.height
                );
                
                this.sprites.idle.push(canvas);
            }
            console.log('Flag sprites loaded successfully');
        } catch (error) {
            console.error('Error loading flag sprites:', error);
        }
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    update(deltaTime) {
        if (this.isCollected) return;
        
        this.handleAnimation(deltaTime);
        this.checkCollision();
    }
    
    handleAnimation(deltaTime) {
        const animation = this.animations.idle;
        
        if (this.sprites.idle.length === 0) return;
        
        animation.frameTimer += deltaTime;
        if (animation.frameTimer > animation.frameInterval) {
            animation.frameTimer = 0;
            animation.currentFrame = (animation.currentFrame + 1) % animation.frames;
        }
    }
    
    checkCollision() {
        if (this.isCollected) return;
        
        const playerHitbox = this.game.player.getHitbox ? this.game.player.getHitbox() : this.game.player;
        
        if (Collision.checkCollision(playerHitbox, this)) {
            this.collect();
        }
    }
    
    collect() {
        this.isCollected = true;
        this.game.collectFlag();
    }
    
    draw(context) {
        if (this.isCollected || this.sprites.idle.length === 0) return;
        
        const animation = this.animations.idle;
        const sprite = this.sprites.idle[animation.currentFrame];
        
        context.drawImage(sprite, this.x, this.y, this.width, this.height);
        
        if (this.game.debug) {
            context.strokeStyle = 'green';
            context.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}