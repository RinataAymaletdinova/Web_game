class Collision {
    static checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    static checkPlatformCollision(player, platform) {
        // Проверяем столкновение с платформой снизу
        if (player.velocityY > 0 &&
            player.y + player.height <= platform.y + 10 &&
            player.y + player.height + player.velocityY >= platform.y &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isGrounded = true;
            return true;
        }
        
        // Проверяем столкновение с платформой сверху
        if (player.velocityY < 0 &&
            player.y >= platform.y + platform.height - 10 &&
            player.y + player.velocityY <= platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            
            player.y = platform.y + platform.height;
            player.velocityY = 0;
            return true;
        }
        
        // Проверяем столкновение с боков
        if (player.velocityX !== 0 &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height) {
            
            // Слева
            if (player.velocityX > 0 &&
                player.x + player.width <= platform.x &&
                player.x + player.width + player.velocityX >= platform.x) {
                
                player.x = platform.x - player.width;
                return true;
            }
            
            // Справа
            if (player.velocityX < 0 &&
                player.x >= platform.x + platform.width &&
                player.x + player.velocityX <= platform.x + platform.width) {
                
                player.x = platform.x + platform.width;
                return true;
            }
        }
        
        return false;
    }
    
    static getAttackHitbox(player) {
        const hitboxWidth = 30;
        const hitboxHeight = 20;
        
        if (player.facing === 'right') {
            return {
                x: player.x + player.width,
                y: player.y + player.height / 3,
                width: hitboxWidth,
                height: hitboxHeight
            };
        } else {
            return {
                x: player.x - hitboxWidth,
                y: player.y + player.height / 3,
                width: hitboxWidth,
                height: hitboxHeight
            };
        }
    }
}