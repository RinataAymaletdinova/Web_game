class Enemy {
    constructor(game, x, y, patrolOffset = 0) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        
        // Хитбокс меньше визуального размера
        this.hitboxWidth = 40;
        this.hitboxHeight = 60;
        this.hitboxOffsetX = (this.width - this.hitboxWidth) / 2;
        this.hitboxOffsetY = this.height - this.hitboxHeight;
        
        this.speed = 1;
        this.velocityX = this.speed;
        this.health = 3;
        this.isAlive = true;
        
        // Анимация
        this.animations = {
            idle: { frames: 18, currentFrame: 0, frameTimer: 0, frameInterval: 100 }
        };
        
        this.sprites = {
            idle: []
        };
        
        // Флаг загрузки спрайтов
        this.spritesLoaded = false;
        
        // Патрулирование с разными параметрами для несинхронности
        this.patrolDistance = 80 + Math.random() * 40;
        this.startX = x;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.velocityX = this.speed * this.direction;
        
        // Случайное смещение анимации для несинхронности
        this.animations.idle.currentFrame = Math.floor(Math.random() * 18);
        this.animations.idle.frameTimer = Math.random() * 100;
        
        this.loadSprites();
    }
    
    async loadSprites() {
        try {
            const loadPromises = [];
            
            for (let i = 0; i < 18; i++) {
                const frameNumber = i.toString().padStart(3, '0');
                loadPromises.push(
                    this.loadSpriteFrame(`assets/images/0_Skeleton_Crusader_Idle Blinking_${frameNumber}.png`, i)
                );
            }
            
            await Promise.all(loadPromises);
            this.spritesLoaded = true;
            console.log('Enemy sprites loaded successfully');
        } catch (error) {
            console.error('Error loading enemy sprites:', error);
            // Создаем заглушку если спрайты не загрузились
            this.createFallbackSprite();
        }
    }
    
    loadSpriteFrame(src, frameIndex) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                const ctx = canvas.getContext('2d');
                
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, this.width, this.height);
                this.sprites.idle[frameIndex] = canvas;
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load enemy sprite: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            img.src = src;
        });
    }
    
    createFallbackSprite() {
        // Создаем простую заглушку для врага
        for (let i = 0; i < 18; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            const ctx = canvas.getContext('2d');
            
            // Рисуем простого врага-прямоугольник
            ctx.fillStyle = '#8B0000'; // Темно-красный
            ctx.fillRect(0, 0, this.width, this.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText('Enemy', 5, 15);
            ctx.fillText(`Frame ${i + 1}`, 5, 30);
            
            this.sprites.idle[i] = canvas;
        }
        this.spritesLoaded = true;
    }
    
    update(deltaTime) {
        if (!this.isAlive) return;
        
        this.patrol();
        this.handleAnimation(deltaTime);
        this.checkCollisions();
    }
    
    patrol() {
        this.x += this.velocityX;
        
        // Проверяем границы патрулирования
        if (this.x > this.startX + this.patrolDistance) {
            this.velocityX = -this.speed;
            this.direction = -1;
        } else if (this.x < this.startX - this.patrolDistance) {
            this.velocityX = this.speed;
            this.direction = 1;
        }
        
        // Коллизия с платформами
        this.game.level.getPlatforms().forEach(platform => {
            if (this.checkCollisionWithPlatform(platform)) {
                if (this.velocityX > 0) {
                    this.x = platform.x - this.width;
                } else {
                    this.x = platform.x + platform.width;
                }
                this.velocityX *= -1;
                this.direction *= -1;
            }
        });
    }
    
    checkCollisionWithPlatform(platform) {
        const hitbox = this.getHitbox();
        return hitbox.x < platform.x + platform.width &&
               hitbox.x + hitbox.width > platform.x &&
               hitbox.y < platform.y + platform.height &&
               hitbox.y + hitbox.height > platform.y;
    }
    
    handleAnimation(deltaTime) {
        const animation = this.animations.idle;
        
        if (!this.spritesLoaded || this.sprites.idle.length === 0) return;
        
        animation.frameTimer += deltaTime;
        if (animation.frameTimer > animation.frameInterval) {
            animation.frameTimer = 0;
            animation.currentFrame = (animation.currentFrame + 1) % animation.frames;
        }
    }
    
    checkCollisions() {
        if (!this.game.player || this.game.player.isDead) return;
        
        const playerHitbox = this.game.player.getHitbox ? this.game.player.getHitbox() : this.game.player;
        const enemyHitbox = this.getHitbox();
        
        if (Collision.checkCollision(playerHitbox, enemyHitbox) && !this.game.player.isAttacking) {
            this.game.player.die();
        }
    }
    
    getHitbox() {
        return {
            x: this.x + this.hitboxOffsetX,
            y: this.y + this.hitboxOffsetY,
            width: this.hitboxWidth,
            height: this.hitboxHeight
        };
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.isAlive = false;
        this.game.addScore(100);
    }
    
    draw(context) {
        if (!this.isAlive || !this.spritesLoaded || this.sprites.idle.length === 0) {
            // Рисуем заглушку если спрайты не загружены
            context.fillStyle = '#8B0000';
            context.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        
        const animation = this.animations.idle;
        const sprite = this.sprites.idle[animation.currentFrame];
        
        // Проверяем что спрайт валидный
        if (!sprite) {
            context.fillStyle = '#8B0000';
            context.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        
        if (this.direction === -1) {
            context.save();
            context.scale(-1, 1);
            context.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
            context.restore();
        } else {
            context.drawImage(sprite, this.x, this.y, this.width, this.height);
        }
        
        if (this.game.debug) {
            const hitbox = this.getHitbox();
            context.strokeStyle = 'red';
            context.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        }
    }
}