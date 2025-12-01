window.addEventListener('load', async function() {
    const canvas = document.getElementById('gameCanvas');
    
    // Показываем сообщение о загрузке
    const loadingText = document.createElement('div');
    loadingText.style.position = 'absolute';
    loadingText.style.top = '50%';
    loadingText.style.left = '50%';
    loadingText.style.transform = 'translate(-50%, -50%)';
    loadingText.style.color = 'white';
    loadingText.style.fontSize = '20px';
    loadingText.textContent = 'Загрузка игры...';
    document.body.appendChild(loadingText);
    
    try {
        const game = new Game(canvas);
        
        // Ждем немного чтобы ассеты успели начать загрузку
        await new Promise(resolve => setTimeout(resolve, 100));
        
        game.start();
        document.body.removeChild(loadingText);
    } catch (error) {
        console.error('Error starting game:', error);
        loadingText.textContent = 'Ошибка загрузки игры. Проверьте консоль.';
        loadingText.style.color = 'red';
    }
});