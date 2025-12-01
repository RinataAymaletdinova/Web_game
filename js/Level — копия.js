class Level {
    constructor(game, levelNumber = 1) {
        this.game = game;
        this.levelNumber = levelNumber;
        this.background1 = null;
        this.background2 = null;
        this.platforms = [];
        this.platformImage = null;
        this.enemies = [];
        this.slimes = []; // Новые враги - слизни
        this.flags = [];
        this.exit = null;
        this.exitImage = null;
        this.lavaZones = []; // Зоны лавы
        
        // Размеры уровня
        this.width = 3000;
        this.height = 800;
        
        this.assetsLoaded = false;
        this.slimeSpawnTimer = 0;
        
        this.loadAssets();
    }
    
    async loadAssets() {
        try {
            if (this.levelNumber === 1) {
                await Promise.all([
                    this.loadImage('assets/images/origbig.png').then(img => this.background1 = img),
                    this.loadImage('assets/images/Tile_02.png').then(img => this.platformImage = img),
                    this.loadImage('assets/images/1.png').then(img => this.exitImage = img)
                ]);
            } else {
                // Уровень 2 - другие ассеты
                await Promise.all([
                    this.loadImage('assets/images/1b.png').then(img => this.background1 = img),
                    this.loadImage('assets/images/2b.png').then(img => this.background2 = img),
                    this.loadImage('assets/images/Tile_10.png').then(img => this.platformImage = img),
                    this.loadImage('assets/images/1.png').then(img => this.exitImage = img),
                    this.loadImage('assets/images/Slime.png').then(img => this.slimeImage = img)
                ]);
            }
            
            this.createLevel();
            this.assetsLoaded = true;
            console.log(`Level ${this.levelNumber} assets loaded successfully`);
        } catch (error) {
            console.error('Error loading level assets:', error);
            this.createLevel();
            this.assetsLoaded = true;
        }
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => {
                console.warn(`Failed to load image: ${src}`);
                reject(err);
            };
            img.src = src;
        });
    }
    
    createLevel() {
        this.platforms = [];
        this.enemies = [];
        this.slimes = [];
        this.flags = [];
        this.lavaZones = [];
        
        if (this.levelNumber === 1) {
            this.createLevel1();
        } else {
            this.createLevel2();
        }
        
        this.createExit();
    }
    
    createLevel1() {
        // Земля с отверстиями
        const groundY = 700;
        const holeWidth = 3;
        const platformGroupWidth = 5;
        
        let x = 0;
        while (x < this.width) {
            for (let i = 0; i < platformGroupWidth && x < this.width; i++) {
                this.platforms.push({
                    x: x,
                    y: groundY,
                    width: 50,
                    height: 50,
                    isGround: true
                });
                x += 50;
            }
            x += holeWidth * 50;
        }
        
        // Платформы для уровня 1
        const platformConfigs = [
            { x: 100, y: 550, segments: 3 },
            { x: 300, y: 450, segments: 2 },
            { x: 500, y: 350, segments: 4 },
            { x: 800, y: 500, segments: 5 },
            { x: 1100, y: 400, segments: 3 },
            { x: 1300, y: 300, segments: 2 },
            { x: 1600, y: 450, segments: 4 },
            { x: 1900, y: 350, segments: 3 },
            { x: 2200, y: 500, segments: 6 },
            { x: 2600, y: 400, segments: 4 },
            { x: 400, y: 650, segments: 2 },
            { x: 1200, y: 650, segments: 3 },
            { x: 2000, y: 650, segments: 2 }
        ];
        
        platformConfigs.forEach(config => {
            for (let i = 0; i < config.segments; i++) {
                this.platforms.push({
                    x: config.x + i * 50,
                    y: config.y,
                    width: 50,
                    height: 50,
                    isGround: false
                });
            }
        });
        
        // Враги для уровня 1
        const enemyPositions = [
            { x: 400, y: 450 },
            { x: 600, y: 350 },
            { x: 900, y: 500 },
            { x: 1200, y: 400 },
            { x: 1700, y: 450 },
            { x: 2000, y: 350 }
        ];
        
        enemyPositions.forEach((pos, index) => {
            this.enemies.push(new Enemy(this.game, pos.x, pos.y - 80, index * 200));
        });
        
        // Флаги для уровня 1
        const flagPositions = [
            { x: 150, y: 550 },
            { x: 350, y: 450 },
            { x: 850, y: 500 },
            { x: 1650, y: 450 },
            { x: 2250, y: 500 }
        ];
        
        flagPositions.forEach(pos => {
            this.flags.push(new Flag(this.game, pos.x, pos.y - 60));
        });
    }
    
    createLevel2() {
        // Уровень 2 - совершенно другая расстановка
        
        // Лава внизу
        this.lavaZones.push({
            x: 0,
            y: 750,
            width: this.width,
            height: 50
        });
        
        // Платформы уровня 2
        const platformConfigs = [
            // Стартовая зона
            { x: 100, y: 650, segments: 4 },
            { x: 400, y: 550, segments: 3 },
            { x: 700, y: 450, segments: 2 },
            
            // Центральная зона с лавой
            { x: 1000, y: 600, segments: 2 },
            { x: 1200, y: 500, segments: 1 },
            { x: 1400, y: 400, segments: 2 },
            { x: 1700, y: 500, segments: 3 },
            
            // Сложная зона с узкими платформами
            { x: 2100, y: 650, segments: 1 },
            { x: 2200, y: 550, segments: 1 },
            { x: 2300, y: 450, segments: 1 },
            { x: 2400, y: 550, segments: 1 },
            { x: 2500, y: 650, segments: 1 },
            
            // Финальная зона
            { x: 2700, y: 600, segments: 4 }
        ];
        
        platformConfigs.forEach(config => {
            for (let i = 0; i < config.segments; i++) {
                this.platforms.push({
                    x: config.x + i * 50,
                    y: config.y,
                    width: 50,
                    height: 50,
                    isGround: false
                });
            }
        });
        
        // Зоны лавы между платформами
        const lavaConfigs = [
            { x: 500, y: 750, width: 200, height: 50 },
            { x: 1100, y: 750, width: 300, height: 50 },
            { x: 1600, y: 750, width: 200, height: 50 },
            { x: 2000, y: 750, width: 250, height: 50 }
        ];
        
        lavaConfigs.forEach(config => {
            this.lavaZones.push(config);
        });
        
        // Враги для уровня 2
        const enemyPositions = [
            { x: 450, y: 550 },
            { x: 750, y: 450 },
            { x: 1250, y: 500 },
            { x: 1750, y: 500 },
            { x: 2250, y: 550 }
        ];
        
        enemyPositions.forEach((pos, index) => {
            this.enemies.push(new Enemy(this.game, pos.x, pos.y - 80, index * 200));
        });
        
        // Флаги для уровня 2
        const flagPositions = [
            { x: 200, y: 650 },
            { x: 600, y: 550 },
            { x: 1300, y: 400 },
            { x: 1900, y: 500 },
            { x: 2400, y: 550 }
        ];
        
        flagPositions.forEach(pos => {
            this.flags.push(new Flag(this.game, pos.x, pos.y - 60));
        });
        
        this.game.totalFlags = this.flags.length;
    }
    
    createExit() {
        this.exit = {
            x: 2800,
            y: this.levelNumber === 1 ? 600 : 550,
            width: 80,
            height: 100
        };
    }
    
    spawnSlime() {
        if (this.levelNumber !== 2) return;
        
        const x = Math.random() * (this.width - 50);
        this.slimes.push(new Slime(this.game, x, -50));
    }
    
    update(deltaTime) {
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.flags.forEach(flag => flag.update(deltaTime));
        
        // Обновляем слизней
        this.slimes.forEach(slime => slime.update(deltaTime));
        
        // Спавн слизней каждые 3 секунды на уровне 2
        if (this.levelNumber === 2) {
            this.slimeSpawnTimer += deltaTime;
            if (this.slimeSpawnTimer > 3000) {
                this.spawnSlime();
                this.slimeSpawnTimer = 0;
            }
        }
        
        // Проверка столкновения с лавой
        this.checkLavaCollision();
        
        this.enemies = this.enemies.filter(enemy => enemy.isAlive);
        this.flags = this.flags.filter(flag => !flag.isCollected);
        this.slimes = this.slimes.filter(slime => slime.isActive);
    }
    
    checkLavaCollision() {
        if (!this.game.player || this.game.player.isDead) return;
        
        const playerHitbox = this.game.player.getHitbox();
        
        this.lavaZones.forEach(lava => {
            if (Collision.checkCollision(playerHitbox, lava)) {
                this.game.player.die();
            }
        });
    }
    
    draw(context) {
        // Рисуем фон
        if (this.background1) {
            context.drawImage(this.background1, 0, 0, this.width, this.height);
        }
        if (this.background2) {
            context.drawImage(this.background2, 0, 0, this.width, this.height);
        }
        
        if (!this.background1 && !this.background2) {
            context.fillStyle = this.levelNumber === 1 ? '#0f3460' : '#2d1b69';
            context.fillRect(0, 0, this.width, this.height);
        }
        
        // Рисуем лаву (уровень 2)
        if (this.levelNumber === 2) {
            this.lavaZones.forEach(lava => {
                context.fillStyle = 'rgba(255, 100, 0, 0.7)';
                context.fillRect(lava.x, lava.y, lava.width, lava.height);
                
                // Эффект лавы
                context.fillStyle = 'rgba(255, 200, 0, 0.4)';
                context.fillRect(lava.x, lava.y, lava.width, lava.height / 2);
            });
        }
        
        // Рисуем платформы
        this.platforms.forEach(platform => {
            if (this.platformImage) {
                context.drawImage(this.platformImage, platform.x, platform.y, platform.width, platform.height);
            } else {
                context.fillStyle = platform.isGround ? '#654321' : '#4a6572';
                context.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
        });
        
        this.enemies.forEach(enemy => enemy.draw(context));
        this.slimes.forEach(slime => slime.draw(context));
        this.flags.forEach(flag => flag.draw(context));
        
        if (this.exit) {
            if (this.exitImage) {
                context.drawImage(this.exitImage, this.exit.x, this.exit.y, this.exit.width, this.exit.height);
            } else {
                context.fillStyle = '#00ff00';
                context.fillRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
                context.fillStyle = 'white';
                context.font = '12px Arial';
                context.fillText('EXIT', this.exit.x + 10, this.exit.y + 30);
            }
        }
    }
    
    getPlatforms() {
        return this.platforms;
    }
}