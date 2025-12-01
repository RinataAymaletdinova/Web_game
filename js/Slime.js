class Slime {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speedY = 4; // Увеличил скорость
        this.isActive = true;
        
        this.image = null;
        this.loadImage();
    }
    
    async loadImage() {
        try {
            this.image = await this.loadImageFile('assets/images/Slime.png');
        } catch (error) {
            console.error('Error loading slime image:', error);
        }
    }
    
    loadImageFile(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.y += this.speedY;
        
        // Проверка выхода за пределы экрана
        if (this.y > this.game.level.height) {
            this.isActive = false;
            return;
        }
        
        this.checkPlayerCollision();
    }
    
    checkPlayerCollision() {
        if (!this.game.player || this.game.player.isDead) return;
        
        const playerHitbox = this.game.player.getHitbox();
        const slimeHitbox = this.getHitbox();
        
        if (Collision.checkCollision(playerHitbox, slimeHitbox)) {
            this.game.player.die();
        }
    }
    
    getHitbox() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
    
    draw(context) {
        if (!this.isActive) return;
        
        if (this.image) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            context.fillStyle = '#00ff00';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}