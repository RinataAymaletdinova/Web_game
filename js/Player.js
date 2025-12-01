class Player {
    constructor(game) {
        this.game = game;
        this.width = 70;
        this.height = 90;
        this.x = 100;
        this.y = 300;
        
        // Физика
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 3;
        this.jumpForce = 18;
        this.gravity = 0.6;
        this.isGrounded = false;
        
        // Состояния
        this.state = 'idle';
        this.facing = 'right';
        this.isAttacking = false;
        this.isDead = false;
        this.attackCooldown = false;
        
        // Анимации
        this.animations = {
            idle: { frames: 4, currentFrame: 0, frameTimer: 0, frameInterval: 150 },
            running: { frames: 6, currentFrame: 0, frameTimer: 0, frameInterval: 100 },
            jumping: { frames: 8, currentFrame: 0, frameTimer: 0, frameInterval: 80 },
            attacking: { frames: 6, currentFrame: 0, frameTimer: 0, frameInterval: 70 },
            dead: { frames: 3, currentFrame: 0, frameTimer: 0, frameInterval: 200 }
        };
        
        this.sprites = {
            idle: [],
            running: [],
            jumping: [],
            attacking: [],
            dead: []
        };
        
        this.previousState = 'idle';
        this.spritesLoaded = false;
        
        this.loadSprites();
    }
    
    async loadSprites() {
        try {
            await Promise.all([
                this.loadSpriteSheet('idle', 'assets/images/Idle.png', 4),
                this.loadSpriteSheet('running', 'assets/images/Run.png', 6),
                this.loadSpriteSheet('jumping', 'assets/images/Jump.png', 8),
                this.loadSpriteSheet('attacking', 'assets/images/Attack2.png', 6),
                this.loadSpriteSheet('dead', 'assets/images/Death.png', 3)
            ]);
            this.spritesLoaded = true;
            console.log('All player sprites loaded successfully');
        } catch (error) {
            console.error('Error loading player sprites:', error);
            this.createFallbackSprites();
        }
    }
    
    createFallbackSprites() {
        // Создаем заглушки для всех состояний
        const states = ['idle', 'running', 'jumping', 'attacking', 'dead'];
        const colors = {
            idle: 'lightblue',
            running: 'blue', 
            jumping: 'green',
            attacking: 'red',
            dead: 'gray'
        };
        
        states.forEach(state => {
            const frameCount = this.animations[state].frames;
            for (let i = 0; i < frameCount; i++) {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = colors[state];
                ctx.fillRect(0, 0, this.width, this.height);
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(`${state} ${i + 1}`, 5, 15);
                
                this.sprites[state].push(canvas);
            }
        });
        this.spritesLoaded = true;
    }
    
    loadSpriteSheet(state, imagePath, frameCount) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const frameWidth = img.width / frameCount;
                const frameHeight = img.height;
                
                for (let i = 0; i < frameCount; i++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    const ctx = canvas.getContext('2d');
                    
                    // Улучшенное масштабирование спрайтов
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(
                        img,
                        i * frameWidth, 0, frameWidth, frameHeight,
                        0, 0, this.width, this.height
                    );
                    
                    this.sprites[state].push(canvas);
                }
                resolve();
            };
            img.onerror = reject;
            img.src = imagePath;
        });
    }
    
    update(deltaTime) {
        if (this.isDead) {
            this.handleAnimation('dead', deltaTime);
            return; // Продолжаем обновлять анимацию смерти, но не физику
        }
        
        this.handleInput();
        this.applyPhysics();
        this.handleCollisions();
        this.handleAnimation(this.state, deltaTime);
        this.checkBoundaries();
        this.checkAttackHit();
        this.checkLevelComplete();
    }
    
    checkLevelComplete() {
        if (this.game.level.exit && Collision.checkCollision(this, this.game.level.exit)) {
            this.game.completeLevel();
        }
    }
    
    handleInput() {
        if (this.isAttacking) return;
        
        // Движение влево/вправо
        if (this.game.input.isKeyPressed('ArrowLeft') || this.game.input.isKeyPressed('a')) {
            this.velocityX = -this.speed;
            this.facing = 'left';
            if (this.isGrounded) this.state = 'running';
        } else if (this.game.input.isKeyPressed('ArrowRight') || this.game.input.isKeyPressed('d')) {
            this.velocityX = this.speed;
            this.facing = 'right';
            if (this.isGrounded) this.state = 'running';
        } else {
            this.velocityX = 0;
            if (this.isGrounded && !this.isAttacking) this.state = 'idle';
        }
        
        // Прыжок
        if ((this.game.input.isKeyPressed(' ') || this.game.input.isKeyPressed('w') || 
             this.game.input.isKeyPressed('ArrowUp')) && this.isGrounded && !this.isAttacking) {
            this.velocityY = -this.jumpForce;
            this.isGrounded = false;
            this.state = 'jumping';
        }
        
        // Атака
        if ((this.game.input.isKeyPressed('Shift') || this.game.input.isKeyPressed('Control') || 
             this.game.input.isKeyPressed('x')) && !this.isAttacking && !this.attackCooldown) {
            this.attack();
        }
    }
    
    attack() {
        this.isAttacking = true;
        this.state = 'attacking';
        this.animations.attacking.currentFrame = 0;
        this.velocityX = 0;
        
        this.attackCooldown = true;
        setTimeout(() => {
            this.attackCooldown = false;
        }, 500);
        
        setTimeout(() => {
            this.isAttacking = false;
            if (this.isGrounded) {
                this.state = 'idle';
            } else {
                this.state = 'jumping';
            }
        }, this.animations.attacking.frames * this.animations.attacking.frameInterval);
    }
    
    applyPhysics() {
        // Гравитация
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
            if (!this.isAttacking && this.state !== 'jumping') {
                this.state = 'jumping';
            }
        }
        
        // Обновление позиции
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    
    handleCollisions() {
        this.isGrounded = false;
        
        this.game.level.getPlatforms().forEach(platform => {
            Collision.checkPlatformCollision(this, platform);
        });
    }
    
    checkAttackHit() {
        if (!this.isAttacking || this.animations.attacking.currentFrame < 2) return;
        
        const attackHitbox = Collision.getAttackHitbox(this);
        
        this.game.level.enemies.forEach(enemy => {
            if (enemy.isAlive && Collision.checkCollision(attackHitbox, enemy)) {
                enemy.takeDamage(1);
            }
        });
        
        if (this.game.debug) {
            const context = this.game.context;
            context.fillStyle = 'rgba(255, 0, 0, 0.3)';
            context.fillRect(attackHitbox.x, attackHitbox.y, attackHitbox.width, attackHitbox.height);
        }
    }
    
    handleAnimation(animationType, deltaTime) {
        const animation = this.animations[animationType];
        
        if (this.sprites[animationType].length === 0) return;
        
        // Сбрасываем анимацию при смене состояния
        if (this.previousState !== animationType) {
            animation.currentFrame = 0;
            animation.frameTimer = 0;
            this.previousState = animationType;
        }
        
        animation.frameTimer += deltaTime;
        if (animation.frameTimer > animation.frameInterval) {
            animation.frameTimer = 0;
            animation.currentFrame = (animation.currentFrame + 1) % animation.frames;
        }
    }
    
    checkBoundaries() {
        
        if (this.y > this.game.height + 200) {
            this.die();
        }
    }
    
    die() {
        this.isDead = true;
        this.state = 'dead';
        this.velocityX = 0;
        this.velocityY = 0;
        
        setTimeout(() => {
            this.game.gameOver();
        }, 1000);
    }
    
    getHitbox() {
        // Хитбокс игрока меньше визуального размера
        const hitboxWidth = 50;
        const hitboxHeight = 70;
        const hitboxOffsetX = (this.width - hitboxWidth) / 2;
        const hitboxOffsetY = this.height - hitboxHeight;
        
        return {
            x: this.x + hitboxOffsetX,
            y: this.y + hitboxOffsetY,
            width: hitboxWidth,
            height: hitboxHeight
        };
    }
    
    draw(context) {
        const animation = this.animations[this.state];
        
        if (this.sprites[this.state].length === 0) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        
        const sprite = this.sprites[this.state][animation.currentFrame];
        
        if (this.facing === 'left') {
            context.save();
            context.scale(-1, 1);
            context.drawImage(sprite, -this.x - this.width, this.y, this.width, this.height);
            context.restore();
        } else {
            context.drawImage(sprite, this.x, this.y, this.width, this.height);
        }
        
        if (this.game.debug) {
            context.strokeStyle = 'blue';
            context.strokeRect(this.x, this.y, this.width, this.height);
            
            // Отрисовка хитбокса
            const hitbox = this.getHitbox();
            context.strokeStyle = 'cyan';
            context.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        }
    }
}