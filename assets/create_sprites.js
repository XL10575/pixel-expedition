// 像素艺术素材生成器
// 使用Canvas API生成像素风格的游戏素材

// NES调色板风格颜色
const COLORS = {
    // 基础色
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    GRAY_DARK: '#404040',
    GRAY_MID: '#808080',
    GRAY_LIGHT: '#C0C0C0',
    
    // 玩家飞船色彩
    SHIP_BLUE: '#4A90A4',
    SHIP_LIGHT_BLUE: '#85C1D9',
    SHIP_DARK_BLUE: '#2C5F7E',
    
    // 敌人色彩
    ENEMY_RED: '#CC2936',
    ENEMY_DARK_RED: '#A11D2A',
    ENEMY_LIGHT_RED: '#E85A4F',
    
    // 陨石色彩
    ROCK_BROWN: '#5D4E37',
    ROCK_LIGHT_BROWN: '#8B7355',
    ROCK_DARK_BROWN: '#3E2F23',
    
    // 效果色彩
    BULLET_YELLOW: '#FFD23F',
    BULLET_WHITE: '#FFFFFF',
    EXPLOSION_ORANGE: '#FF6B35',
    EXPLOSION_RED: '#F7931E',
    SHIELD_CYAN: '#4ECDC4',
    
    // 背景色彩
    SPACE_BLUE: '#0D1B2A',
    STAR_WHITE: '#FFFFFF',
    NEBULA_PURPLE: '#415A77',
    NEBULA_PINK: '#778DA9'
};

// 创建Canvas元素用于生成图像
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
}

// 绘制像素
function drawPixel(ctx, x, y, color, size = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
}

// 保存Canvas为PNG文件
function saveCanvasAsPNG(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 1. 生成玩家飞船 (32x32)
function createPlayerShip() {
    const { canvas, ctx } = createCanvas(32, 32);
    const pixels = [
        '................................',
        '................................',
        '................................',
        '...............xx...............',
        '..............xxxx..............',
        '.............xxxxxx.............',
        '............xxxxxxxx............',
        '...........xxxxxxxxxx...........',
        '..........xxxxxxxxxxxx..........',
        '.........xxxxxxxxxxxxxx.........',
        '........xxxxxxxxxxxxxxxx........',
        '.......xxxxxxxxxxxxxxxxxx.......',
        '......xxxxxxxxxxxxxxxxxxxx......',
        '.....xxxxxxxxxxxxxxxxxxxxxx.....',
        '....xxxxxxxxxxxxxxxxxxxxxxxx....',
        '...xxxxxxxxxxxxxxxxxxxxxxxxxx...',
        '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..',
        '.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        '.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
        '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..',
        '...xxxxxxxxxxxxxxxxxxxxxxxxxx...',
        '....xxxxxxxxxxxxxxxxxxxxxxxx....',
        '.....xxxxxxxxxxxxxxxxxxxxxx.....',
        '......xxxxxxxxxxxxxxxxxxxx......',
        '.......xxxxxxxxxxxxxxxxxx.......',
        '........xxxxxxxxxxxxxxxx........',
        '.........xxxxxxxxxxxxxx.........',
        '..........xxxxxxxxxxxx..........',
        '...........xxxxxxxxxx...........',
        '................................'
    ];
    
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            const char = pixels[y][x];
            if (char === 'x') {
                if (y < 16) {
                    drawPixel(ctx, x, y, COLORS.SHIP_LIGHT_BLUE);
                } else if (y < 24) {
                    drawPixel(ctx, x, y, COLORS.SHIP_BLUE);
                } else {
                    drawPixel(ctx, x, y, COLORS.SHIP_DARK_BLUE);
                }
            }
        }
    }
    
    // 添加驾驶舱
    drawPixel(ctx, 15, 8, COLORS.WHITE);
    drawPixel(ctx, 16, 8, COLORS.WHITE);
    drawPixel(ctx, 15, 9, COLORS.GRAY_LIGHT);
    drawPixel(ctx, 16, 9, COLORS.GRAY_LIGHT);
    
    return canvas;
}

// 2. 生成骷髅头敌人 (32x32)
function createSkullEnemy() {
    const { canvas, ctx } = createCanvas(32, 32);
    const pixels = [
        '................................',
        '................................',
        '................................',
        '........xxxxxxxxxxxxxxxx........',
        '.......xxxxxxxxxxxxxxxxxx.......',
        '......xxxxxxxxxxxxxxxxxxxx......',
        '.....xxxxxxxxxxxxxxxxxxxxxx.....',
        '....xxxxxxxxxxxxxxxxxxxxxxxx....',
        '...xxxxxxxxxxxxxxxxxxxxxxxxxx...',
        '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..',
        '.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxx......xxxxxxxxxxxx......xxxx',
        'xxx........xxxxxxxx........xxx',
        'xx..........xxxxxx..........xx',
        'x............xxxx............x',
        'x............xxxx............x',
        'xx..........xxxxxx..........xx',
        'xxx........xxxxxxxx........xxx',
        'xxxx......xxxxxxxxxxxx......xxxx',
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxx......xxxxxxxxxxxx',
        'xxxxxxxxxx..........xxxxxxxxxx',
        'xxxxxxxx..............xxxxxxxx',
        'xxxxxx..................xxxxxx',
        'xxxx........................xxxx',
        'xx............................xx',
        '................................',
        '................................',
        '................................'
    ];
    
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            const char = pixels[y][x];
            if (char === 'x') {
                drawPixel(ctx, x, y, COLORS.GRAY_LIGHT);
            } else if (char === '.') {
                if (y >= 13 && y <= 20 && ((x >= 4 && x <= 11) || (x >= 20 && x <= 27))) {
                    drawPixel(ctx, x, y, COLORS.ENEMY_RED);
                } else if (y >= 22 && y <= 28 && x >= 10 && x <= 21) {
                    drawPixel(ctx, x, y, COLORS.BLACK);
                }
            }
        }
    }
    
    return canvas;
}

// 3. 生成陨石 (24x24)
function createMeteor() {
    const { canvas, ctx } = createCanvas(24, 24);
    const pixels = [
        '........................',
        '........................',
        '......xxxxxxxxxx........',
        '.....xxxxxxxxxxxx.......',
        '....xxxxxxxxxxxxxx......',
        '...xxxxxxxxxxxxxxxx.....',
        '..xxxxxxxxxxxxxxxxxx....',
        '.xxxxxxxxxxxxxxxxxxxx...',
        'xxxxxxxxxxxxxxxxxxxxxxx.',
        'xxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxxxxxxxxx',
        'xxxxxxxxxxxxxxxxxxxxxxx.',
        '.xxxxxxxxxxxxxxxxxxxx...',
        '..xxxxxxxxxxxxxxxxxx....',
        '...xxxxxxxxxxxxxxxx.....',
        '....xxxxxxxxxxxxxx......',
        '.....xxxxxxxxxxxx.......',
        '......xxxxxxxxxx........',
        '........................',
        '........................',
        '........................'
    ];
    
    for (let y = 0; y < 24; y++) {
        for (let x = 0; x < 24; x++) {
            const char = pixels[y][x];
            if (char === 'x') {
                const random = Math.sin(x * 7 + y * 11) * 0.5 + 0.5;
                if (random > 0.7) {
                    drawPixel(ctx, x, y, COLORS.ROCK_LIGHT_BROWN);
                } else if (random > 0.3) {
                    drawPixel(ctx, x, y, COLORS.ROCK_BROWN);
                } else {
                    drawPixel(ctx, x, y, COLORS.ROCK_DARK_BROWN);
                }
            }
        }
    }
    
    return canvas;
}

// 4. 生成玩家子弹 (8x16)
function createPlayerBullet() {
    const { canvas, ctx } = createCanvas(8, 16);
    
    // 外层黄色
    drawPixel(ctx, 2, 0, COLORS.BULLET_YELLOW);
    drawPixel(ctx, 3, 0, COLORS.BULLET_YELLOW);
    drawPixel(ctx, 4, 0, COLORS.BULLET_YELLOW);
    drawPixel(ctx, 5, 0, COLORS.BULLET_YELLOW);
    
    for (let y = 1; y < 15; y++) {
        drawPixel(ctx, 1, y, COLORS.BULLET_YELLOW);
        drawPixel(ctx, 2, y, COLORS.BULLET_YELLOW);
        drawPixel(ctx, 3, y, COLORS.BULLET_YELLOW);
        drawPixel(ctx, 4, y, COLORS.BULLET_YELLOW);
        drawPixel(ctx, 5, y, COLORS.BULLET_YELLOW);
        drawPixel(ctx, 6, y, COLORS.BULLET_YELLOW);
    }
    
    drawPixel(ctx, 2, 15, COLORS.BULLET_YELLOW);
    drawPixel(ctx, 3, 15, COLORS.BULLET_YELLOW);
    drawPixel(ctx, 4, 15, COLORS.BULLET_YELLOW);
    drawPixel(ctx, 5, 15, COLORS.BULLET_YELLOW);
    
    // 内层白色光芯
    for (let y = 2; y < 14; y++) {
        drawPixel(ctx, 3, y, COLORS.BULLET_WHITE);
        drawPixel(ctx, 4, y, COLORS.BULLET_WHITE);
    }
    
    return canvas;
}

// 5. 生成敌人子弹 (8x8)
function createEnemyBullet() {
    const { canvas, ctx } = createCanvas(8, 8);
    
    // 红色圆形子弹
    const pixels = [
        '........',
        '..xxxx..',
        '.xxxxxx.',
        'xxxxxxxx',
        'xxxxxxxx',
        '.xxxxxx.',
        '..xxxx..',
        '........'
    ];
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (pixels[y][x] === 'x') {
                drawPixel(ctx, x, y, COLORS.ENEMY_RED);
            }
        }
    }
    
    return canvas;
}

// 6. 生成爆炸效果 (32x32, 4帧)
function createExplosionFrames() {
    const frames = [];
    
    for (let frame = 0; frame < 4; frame++) {
        const { canvas, ctx } = createCanvas(32, 32);
        const size = 8 + frame * 6;
        const centerX = 16;
        const centerY = 16;
        
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const noise = Math.sin(x * 3 + y * 3 + frame * 10) * 2;
                const adjustedDistance = distance + noise;
                
                if (adjustedDistance < size / 2) {
                    if (adjustedDistance < size / 4) {
                        drawPixel(ctx, x, y, COLORS.BULLET_WHITE);
                    } else if (adjustedDistance < size / 3) {
                        drawPixel(ctx, x, y, COLORS.BULLET_YELLOW);
                    } else {
                        drawPixel(ctx, x, y, COLORS.EXPLOSION_ORANGE);
                    }
                }
            }
        }
        
        frames.push(canvas);
    }
    
    return frames;
}

// 7. 生成护盾效果 (40x40)
function createShield() {
    const { canvas, ctx } = createCanvas(40, 40);
    const centerX = 20;
    const centerY = 20;
    const radius = 18;
    
    for (let y = 0; y < 40; y++) {
        for (let x = 0; x < 40; x++) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance >= radius - 2 && distance <= radius) {
                const alpha = Math.sin(x * 0.5 + y * 0.5) * 0.5 + 0.5;
                if (alpha > 0.3) {
                    drawPixel(ctx, x, y, COLORS.SHIELD_CYAN);
                }
            }
        }
    }
    
    return canvas;
}

// 8. 生成滚动背景 (512x512)
function createSpaceBackground() {
    const { canvas, ctx } = createCanvas(512, 512);
    
    // 深色太空背景
    ctx.fillStyle = COLORS.SPACE_BLUE;
    ctx.fillRect(0, 0, 512, 512);
    
    // 生成星星
    for (let i = 0; i < 200; i++) {
        const x = Math.floor(Math.random() * 512);
        const y = Math.floor(Math.random() * 512);
        const brightness = Math.random();
        
        if (brightness > 0.8) {
            drawPixel(ctx, x, y, COLORS.STAR_WHITE);
            drawPixel(ctx, x + 1, y, COLORS.STAR_WHITE);
            drawPixel(ctx, x, y + 1, COLORS.STAR_WHITE);
        } else if (brightness > 0.6) {
            drawPixel(ctx, x, y, COLORS.STAR_WHITE);
        } else {
            drawPixel(ctx, x, y, COLORS.GRAY_MID);
        }
    }
    
    // 添加星云效果
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * 512);
        const y = Math.floor(Math.random() * 512);
        const size = Math.floor(Math.random() * 30) + 10;
        
        for (let dy = -size; dy <= size; dy++) {
            for (let dx = -size; dx <= size; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= size) {
                    const alpha = 1 - (distance / size);
                    if (alpha > 0.1 && Math.random() > 0.7) {
                        const px = x + dx;
                        const py = y + dy;
                        if (px >= 0 && px < 512 && py >= 0 && py < 512) {
                            const existingData = ctx.getImageData(px, py, 1, 1).data;
                            if (existingData[0] === 13 && existingData[1] === 27 && existingData[2] === 42) {
                                drawPixel(ctx, px, py, COLORS.NEBULA_PURPLE);
                            }
                        }
                    }
                }
            }
        }
    }
    
    return canvas;
}

// 生成所有素材
function generateAllSprites() {
    console.log('开始生成像素艺术素材...');
    
    // 生成基础精灵
    const playerShip = createPlayerShip();
    const skullEnemy = createSkullEnemy();
    const meteor = createMeteor();
    const playerBullet = createPlayerBullet();
    const enemyBullet = createEnemyBullet();
    const shield = createShield();
    const background = createSpaceBackground();
    
    // 生成爆炸动画帧
    const explosionFrames = createExplosionFrames();
    
    // 保存文件
    saveCanvasAsPNG(playerShip, 'player_ship.png');
    saveCanvasAsPNG(skullEnemy, 'skull_enemy.png');
    saveCanvasAsPNG(meteor, 'meteor.png');
    saveCanvasAsPNG(playerBullet, 'player_bullet.png');
    saveCanvasAsPNG(enemyBullet, 'enemy_bullet.png');
    saveCanvasAsPNG(shield, 'shield.png');
    saveCanvasAsPNG(background, 'space_background.png');
    
    // 保存爆炸动画帧
    explosionFrames.forEach((frame, index) => {
        saveCanvasAsPNG(frame, `explosion_frame_${index + 1}.png`);
    });
    
    console.log('所有素材生成完成！');
}

// 创建UI按钮来生成素材
function createGeneratorUI() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 9999;
        font-family: monospace;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '像素艺术生成器';
    title.style.margin = '0 0 10px 0';
    
    const button = document.createElement('button');
    button.textContent = '生成所有素材';
    button.style.cssText = `
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-family: monospace;
    `;
    
    button.onclick = generateAllSprites;
    
    const instructions = document.createElement('p');
    instructions.innerHTML = `
        点击按钮生成素材<br>
        文件将自动下载到浏览器下载文件夹<br>
        然后手动移动到对应的assets子目录
    `;
    instructions.style.cssText = `
        font-size: 12px;
        margin: 10px 0 0 0;
        color: #ccc;
    `;
    
    container.appendChild(title);
    container.appendChild(button);
    container.appendChild(instructions);
    
    document.body.appendChild(container);
}

// 页面加载后创建UI
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createGeneratorUI);
} else {
    createGeneratorUI();
} 