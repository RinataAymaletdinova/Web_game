class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        
        this.setCanvasSize();
        
        this.input = new InputHandler();
        
        // Состояния игры
        this.gameState = 'menu';
        this.currentLevel = 1;
        
        // Игровые объекты
        this.level = null;
        this.player = null;
        
        // Статистика
        this.score = 0;
        this.flagsCollected = 0;
        this.totalFlags = 5;
        this.totalTime = 0;
        this.levelStartTime = 0;
        this.isRunning = false;
        this.debug = false;
        
        this.lastTime = 0;
        
        // Камера
        this.camera = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
        
        // Элементы UI
        this.scoreElement = document.getElementById('score');
        this.flowersElement = document.getElementById('flowers');
        this.timerElement = document.getElementById('timer');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // Создаем UI элементы
        this.createMenuElements();
        
        this.setupEventListeners();
        this.setupResizeHandler();
        
        // Начинаем с меню
        this.showMainMenu();
    }
    
    createMenuElements() {
        // Главное меню с памяткой
        this.menuElement = document.createElement('div');
        this.menuElement.id = 'mainMenu';
        this.menuElement.className = 'game-screen';
        this.menuElement.innerHTML = `
            <div class="menu-content">
                <h1>ПЛАТФОРМЕР</h1>
                
                <div class="menu-main">
                    <div class="menu-buttons">
                        <button class="menu-button" id="startLevel1">Уровень 1</button>
                        <button class="menu-button" id="startLevel2">Уровень 2</button>
                    </div>
                    
                    <div class="quick-guide">
                        <div class="guide-section">
                            <h3>🎮 Быстрое управление</h3>
                            <div class="quick-controls">
                                <div class="quick-control">
                                    <span class="key">← → / A D</span>
                                    <span class="action">Движение</span>
                                </div>
                                <div class="quick-control">
                                    <span class="key">Пробел / W / ↑</span>
                                    <span class="action">Прыжок</span>
                                </div>
                                <div class="quick-control">
                                    <span class="key">Shift / Ctrl / X</span>
                                    <span class="action">Атака</span>
                                </div>
                                <div class="quick-control">
                                    <span class="key">ESC</span>
                                    <span class="action">Меню</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="guide-section">
                            <h3>🎯 Основные правила</h3>
                            <div class="quick-rules">
                                <div class="rule">• Собери 5 флагов</div>
                                <div class="rule">• Дойди до выхода</div>
                                <div class="rule">• Избегай врагов</div>
                                <div class="rule">• Остерегайся лавы</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Меню проигрыша
        this.gameOverElement.innerHTML = '';
        this.gameOverElement.className = 'hidden';
        this.gameOverElement.id = 'gameOver';
        this.gameOverElement.innerHTML = `
            <div class="popup-content">
                <h2>ИГРА ОКОНЧЕНА</h2>
                <p>Ваш счет: <span id="finalScore">0</span></p>
                <div class="popup-buttons">
                    <button class="popup-button" id="restartButtonGameOver">Начать заново</button>
                    <button class="popup-button" id="backToMenuGameOver">Меню</button>
                </div>
            </div>
        `;

        // Меню победы
        this.levelCompleteElement = document.createElement('div');
        this.levelCompleteElement.id = 'levelComplete';
        this.levelCompleteElement.className = 'hidden';
        this.levelCompleteElement.innerHTML = `
            <div class="popup-content">
                <h2>УРОВЕНЬ ПРОЙДЕН!</h2>
                <div class="stats" id="levelStats">
                    <div class="stat-item">Счет: <span id="completeScore">0</span></div>
                    <div class="stat-item">Время уровня: <span id="completeTime">0</span>с</div>
                    <div class="stat-item">Флаги: <span id="completeFlags">0</span>/5</div>
                </div>
                <div class="popup-buttons">
                    <button class="popup-button" id="restartLevelComplete">Начать заново</button>
                    <button class="popup-button" id="backToMenuComplete">Меню</button>
                    <button class="popup-button" id="continueButton">Продолжить</button>
                </div>
            </div>
        `;

        // Полное управление
        this.controlsElement = document.createElement('div');
        this.controlsElement.id = 'controls';
        this.controlsElement.className = 'game-screen hidden';
        this.controlsElement.innerHTML = `
            <div class="screen-content">
                <h2>🎮 Полное управление</h2>
                <div class="controls-list">
                    <div class="control-item">
                        <span class="control-description">Движение влево</span>
                        <span class="control-key">← или A</span>
                    </div>
                    <div class="control-item">
                        <span class="control-description">Движение вправо</span>
                        <span class="control-key">→ или D</span>
                    </div>
                    <div class="control-item">
                        <span class="control-description">Прыжок</span>
                        <span class="control-key">Пробел, W или ↑</span>
                    </div>
                    <div class="control-item">
                        <span class="control-description">Атака</span>
                        <span class="control-key">Shift, Ctrl или X</span>
                    </div>
                    <div class="control-item">
                        <span class="control-description">Режим отладки</span>
                        <span class="control-key">F1</span>
                    </div>
                    <div class="control-item">
                        <span class="control-description">Пауза/В меню</span>
                        <span class="control-key">ESC</span>
                    </div>
                    <div class="control-item">
                        <span class="control-description">Перезапуск уровня</span>
                        <span class="control-key">R</span>
                    </div>
                </div>
                <button class="back-button" id="backFromControls">← Назад в меню</button>
            </div>
        `;

        // Полные правила
        this.rulesElement = document.createElement('div');
        this.rulesElement.id = 'rules';
        this.rulesElement.className = 'game-screen hidden';
        this.rulesElement.innerHTML = `
            <div class="screen-content">
                <h2>📋 Полные правила игры</h2>
                <div class="rules-list">
                    <div class="rule-item">🎯 <strong>Цель игры:</strong> Соберите все 5 флагов на уровне и дойдите до выхода</div>
                    <div class="rule-item">⚔️ <strong>Враги:</strong> Избегайте скелетов или атакуйте их. 3 удара - и враг погибает</div>
                    <div class="rule-item">🕳️ <strong>Опасности:</strong> Не падайте в пропасти и избегайте лавы - это мгновенная смерть</div>
                    <div class="rule-item">💧 <strong>Слизни:</strong> На уровне 2 сверху падают слизни - уворачивайтесь от них!</div>
                    <div class="rule-item">⏱️ <strong>Время:</strong> Чем быстрее пройдете уровень - тем больше бонусных очков</div>
                    <div class="rule-item">🏆 <strong>Очки:</strong> +50 очков за каждый флаг, +100 очков за каждого врага</div>
                    <div class="rule-item">🚩 <strong>Флаги:</strong> Без всех 5 флагов выход не активируется</div>
                </div>
                <button class="back-button" id="backFromRules">← Назад в меню</button>
            </div>
        `;

        document.body.appendChild(this.menuElement);
        document.body.appendChild(this.levelCompleteElement);
        document.body.appendChild(this.controlsElement);
        document.body.appendChild(this.rulesElement);
    }
    
    // ... остальные методы без изменений ...
    
    showControls() {
        this.hideAllScreens();
        this.controlsElement.classList.remove('hidden');
    }
    
    showRules() {
        this.hideAllScreens();
        this.rulesElement.classList.remove('hidden');
    }
    
    showMainMenu() {
        this.gameState = 'menu';
        this.isRunning = false;
        this.hideAllScreens();
        this.menuElement.classList.remove('hidden');
    }
    
    setCanvasSize() {
        const targetWidth = 1080;
        const targetHeight = 600;
        
        const maxWidth = window.innerWidth - 40;
        const scale = Math.min(maxWidth / targetWidth, 1);
        
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
        this.canvas.style.width = `${targetWidth * scale}px`;
        this.canvas.style.height = `${targetHeight * scale}px`;
        
        this.width = targetWidth;
        this.height = targetHeight;
        
        if (this.camera) {
            this.camera.width = this.width;
            this.camera.height = this.height;
        }
    }
    
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.setCanvasSize();
        });
    }
    
    setupEventListeners() {
        // Меню события
        document.addEventListener('click', (e) => {
            switch (e.target.id) {
                case 'startLevel1':
                    this.startLevel(1);
                    break;
                case 'startLevel2':
                    this.startLevel(2);
                    break;
                case 'showControls':
                    this.showControls();
                    break;
                case 'showRules':
                    this.showRules();
                    break;
                case 'backFromControls':
                case 'backFromRules':
                    this.showMainMenu();
                    break;
                case 'restartButtonGameOver':
                    this.restartCurrentLevel();
                    break;
                case 'backToMenuGameOver':
                    this.showMainMenu();
                    break;
                case 'restartLevelComplete':
                    this.restartCurrentLevel();
                    break;
                case 'backToMenuComplete':
                    this.showMainMenu();
                    break;
                case 'continueButton':
                    this.nextLevel();
                    break;
            }
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.debug = !this.debug;
            }
            
            // ESC для возврата в меню
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.showMainMenu();
            }
        });
    }
    
    showMainMenu() {
        this.gameState = 'menu';
        this.isRunning = false;
        this.hideAllScreens();
        this.menuElement.classList.remove('hidden');
    }
    
    hideAllScreens() {
        this.canvas.style.display = 'none';
        const uiElement = document.getElementById('ui');
        if (uiElement) uiElement.style.display = 'none';
        
        const screens = [
            this.menuElement,
            this.levelCompleteElement,
            this.controlsElement,
            this.rulesElement,
            this.gameOverElement
        ];
        
        screens.forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });
    }
    
    showControls() {
        this.hideAllScreens();
        this.controlsElement.classList.remove('hidden');
    }
    
    showRules() {
        this.hideAllScreens();
        this.rulesElement.classList.remove('hidden');
    }
    
    startLevel(levelNumber) {
        // Полностью останавливаем предыдущую игру
        this.isRunning = false;
        
        this.currentLevel = levelNumber;
        this.gameState = 'playing';
        this.hideAllScreens();
        this.canvas.style.display = 'block';
        const uiElement = document.getElementById('ui');
        if (uiElement) uiElement.style.display = 'block';
        
        // Сбрасываем статистику уровня
        this.score = 0;
        this.flagsCollected = 0;
        this.totalFlags = 5;
        this.totalTime = 0; // СБРАСЫВАЕМ ВРЕМЯ
        this.levelStartTime = performance.now();
        
        // Создаем уровень и игрока
        this.level = new Level(this, levelNumber);
        this.player = new Player(this);
        
        // Сбрасываем камеру
        this.camera = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
        
        this.isRunning = true;
        this.lastTime = performance.now(); // Сбрасываем время
        this.start();
    }
    
    start() {
        if (this.isRunning) {
            this.lastTime = performance.now(); // Сбрасываем время при старте
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        if (this.isRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.player.update(deltaTime);
        this.level.update(deltaTime);
        this.updateCamera();
        
        // Обновляем общее время ТОЛЬКО когда игра активна
        this.totalTime += deltaTime / 1000;
        
        this.updateUI();
    }
    
    updateCamera() {
        if (!this.player || !this.level) return;
        
        this.camera.x = this.player.x - this.width / 2;
        this.camera.y = this.player.y - this.height / 2;
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.level.width - this.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.level.height - this.height));
    }
    
    render() {
        this.context.clearRect(0, 0, this.width, this.height);
        
        if (this.gameState === 'playing' && this.level && this.player) {
            this.context.save();
            this.context.translate(-this.camera.x, -this.camera.y);
            
            this.level.draw(this.context);
            this.player.draw(this.context);
            
            this.context.restore();
        }
        
        this.drawUI();
    }
    
    drawUI() {
        this.updateUI();
    }
    
    updateUI() {
        if (this.gameState === 'playing') {
            if (this.scoreElement) this.scoreElement.textContent = `Очки: ${this.score}`;
            if (this.flowersElement) this.flowersElement.textContent = `Флаги: ${this.flagsCollected}/${this.totalFlags}`;
            if (this.timerElement) this.timerElement.textContent = `Время: ${Math.floor(this.totalTime)}с`;
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.isRunning = false;
        this.hideAllScreens();
        if (this.finalScoreElement) this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    restartCurrentLevel() {
        this.startLevel(this.currentLevel);
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    collectFlag() {
        this.flagsCollected++;
        this.addScore(50);
        this.updateUI();
    }
    
    completeLevel() {
        // Проверяем, собраны ли все флаги
        if (this.flagsCollected < this.totalFlags) {
            console.log('Нужно собрать все флаги!');
            return;
        }
        
        this.gameState = 'levelComplete';
        this.isRunning = false;
        
        // Показываем экран завершения уровня
        this.showLevelComplete();
    }
    
    showLevelComplete() {
        const levelTime = this.totalTime; // Используем общее время уровня
        
        // Обновляем статистику
        const completeScore = document.getElementById('completeScore');
        const completeTime = document.getElementById('completeTime');
        const completeFlags = document.getElementById('completeFlags');
        
        if (completeScore) completeScore.textContent = this.score;
        if (completeTime) completeTime.textContent = Math.floor(levelTime);
        if (completeFlags) completeFlags.textContent = `${this.flagsCollected}/${this.totalFlags}`;
        
        this.hideAllScreens();
        this.levelCompleteElement.classList.remove('hidden');
    }
    
    nextLevel() {
        if (this.currentLevel === 1) {
            this.startLevel(2);
        } else {
            this.showMainMenu();
        }
    }
}