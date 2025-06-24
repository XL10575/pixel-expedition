/**
 * 像素远征 - 游戏核心逻辑
 * Pixel Expedition Game Engine
 */

// 游戏状态常量
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    PAUSED: 'paused',
    CHALLENGE: 'challenge'
};

// 挑战方向常量
const CHALLENGE_DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

// 增益类型常量
const POWER_UP_TYPES = {
    BIG_BULLETS: 'bigBullets',
    SHIELD: 'shield',
    EXTRA_BOMB: 'extraBomb',
    RAPID_FIRE: 'rapidFire',
    COMPANION: 'companion'
};

// 玩家飞船类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 5;
        this.maxLives = 5;
        this.lives = this.maxLives;
        this.maxBombs = 3;
        this.bombs = this.maxBombs;
        
        // 射击属性
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootDelay = 100; // 毫秒
        
        // 增益状态
        this.powerUps = {
            bigBullets: { active: false, timer: 0 },
            shield: { active: false, timer: 0 },
            rapidFire: { active: false, timer: 0 },
            companion: { active: false, timer: 0 }
        };
    }
    
    update(deltaTime, keys, canvasWidth, canvasHeight) {
        // 更新射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
            }
        }
        
        // 移动控制 (WASD)
        if (keys['KeyW'] || keys['ArrowUp']) {
            this.y -= this.speed;
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            this.y += this.speed;
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.x -= this.speed;
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            this.x += this.speed;
        }
        
        // 边界限制
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
        
        // 更新增益效果计时器
        for (let powerUp in this.powerUps) {
            if (this.powerUps[powerUp].active) {
                this.powerUps[powerUp].timer -= deltaTime;
                if (this.powerUps[powerUp].timer <= 0) {
                    this.powerUps[powerUp].active = false;
                }
            }
        }
    }
    
    shoot() {
        if (this.canShoot) {
            this.canShoot = false;
            this.shootCooldown = this.powerUps.rapidFire.active ? this.shootDelay / 2 : this.shootDelay;
            
            // 创建子弹
            const bulletSize = this.powerUps.bigBullets.active ? 16 : 8;
            return new Bullet(
                this.x + this.width / 2 - bulletSize / 2,
                this.y,
                0,
                -8,
                bulletSize,
                bulletSize * 2,
                'player'
            );
        }
        return null;
    }
    
    useBomb() {
        if (this.bombs > 0) {
            this.bombs--;
            return true;
        }
        return false;
    }
    
    takeDamage() {
        if (this.powerUps.shield.active) {
            this.powerUps.shield.active = false;
            return false;
        }
        this.lives--;
        return true;
    }
    
    render(ctx, game) {
        // 绘制飞船 - 优先使用图片，否则使用默认绘制
        if (game && game.images.player_ship && game.images.player_ship.complete && !game.images.player_ship.src.includes('broken')) {
            try {
                ctx.drawImage(game.images.player_ship, this.x, this.y, this.width, this.height);
            } catch (e) {
                // 图片损坏，使用默认绘制
                this.renderDefault(ctx);
            }
        } else {
            this.renderDefault(ctx);
        }
        
        // 绘制护盾效果
        if (this.powerUps.shield.active) {
            if (game && game.images.shield && game.images.shield.complete && !game.images.shield.src.includes('broken')) {
                try {
                    // 使用护盾图片
                    const shieldSize = this.width + 16;
                    ctx.drawImage(
                        game.images.shield, 
                        this.x - 8, 
                        this.y - 8, 
                        shieldSize, 
                        shieldSize
                    );
                } catch (e) {
                    // 图片损坏，使用默认效果
                    this.renderShieldDefault(ctx);
                }
            } else {
                this.renderShieldDefault(ctx);
            }
        }
    }
    
    renderDefault(ctx) {
        // 默认飞船绘制
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制引擎光效
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 8, this.y + this.height, 4, 8);
        ctx.fillRect(this.x + 20, this.y + this.height, 4, 8);
    }
    
    renderShieldDefault(ctx) {
        // 默认护盾效果
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// 僚机类
class Companion {
    constructor(player, offset) {
        this.player = player;
        this.offset = offset; // {x: number, y: number}
        this.x = player.x + offset.x;
        this.y = player.y + offset.y;
        this.width = 20;
        this.height = 20;
        this.shootCooldown = 0;
        this.shootDelay = 200; // 僚机射击间隔
        this.active = true;
    }
    
    update(deltaTime) {
        // 跟随玩家移动
        this.x = this.player.x + this.offset.x;
        this.y = this.player.y + this.offset.y;
        
        // 更新射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
    }
    
    shoot() {
        if (this.shootCooldown <= 0) {
            this.shootCooldown = this.shootDelay;
            return new Bullet(
                this.x + this.width / 2 - 4,
                this.y,
                0,
                -6,
                8,
                16,
                'player'
            );
        }
        return null;
    }
    
    render(ctx, game) {
        // 绘制僚机 (小版本的玩家飞船)
        // 未来可以添加僚机专用图片
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 引擎光效
        ctx.fillStyle = '#88ff00';
        ctx.fillRect(this.x + 4, this.y + this.height, 3, 6);
        ctx.fillRect(this.x + 13, this.y + this.height, 3, 6);
    }
}

// 敌人基类
class Enemy {
    constructor(x, y, width, height, health, speed, scoreValue) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.scoreValue = scoreValue;
        this.active = true;
        this.lastShotTime = 0;
        this.shootDelay = 1000; // 默认射击间隔1秒
    }
    
    update(deltaTime, canvasHeight) {
        // 基础移动逻辑
        this.y += this.speed;
        
        // 超出屏幕底部则销毁（使用实际canvas高度）
        if (this.y > canvasHeight) {
            this.active = false;
        }
        
        this.lastShotTime += deltaTime;
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.active = false;
            return true; // 返回true表示敌人被摧毁
        }
        return false;
    }
    
    canShoot() {
        return this.lastShotTime >= this.shootDelay;
    }
    
    shoot() {
        // 子类实现具体射击逻辑
        this.lastShotTime = 0;
        return [];
    }
    
    render(ctx, game) {
        // 子类实现具体渲染
    }
    
    // 碰撞检测
    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// 陨石类
class Meteor extends Enemy {
    constructor(x, y) {
        super(x, y, 24, 24, 1, Math.random() * 2 + 1, 10);
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.rotation = 0;
    }
    
    update(deltaTime, canvasHeight) {
        super.update(deltaTime, canvasHeight);
        this.rotation += this.rotationSpeed;
    }
    
    render(ctx, game) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // 绘制陨石 - 优先使用图片
        if (game && game.images.meteor && game.images.meteor.complete) {
            ctx.drawImage(
                game.images.meteor, 
                -this.width/2, 
                -this.height/2, 
                this.width, 
                this.height
            );
        } else {
            // 默认绘制（灰色不规则形状）
            ctx.fillStyle = '#666666';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // 添加一些细节
            ctx.fillStyle = '#444444';
            ctx.fillRect(-this.width/2 + 4, -this.height/2 + 4, 8, 8);
            ctx.fillRect(-this.width/2 + 12, -this.height/2 + 8, 6, 6);
        }
        
        ctx.restore();
    }
}

// 骷髅头敌人类
class SkullEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 32, 32, 3, 0.5, 50);
        this.shootDelay = 2000; // 2秒射击一次
        this.movePattern = 0; // 移动模式
        this.originalX = x;
        this.time = 0;
    }
    
    update(deltaTime, playerX, playerY, canvasWidth, canvasHeight) {
        super.update(deltaTime, canvasHeight);
        this.time += deltaTime * 0.001; // 转换为秒
        
        // 左右摆动移动
        this.x = this.originalX + Math.sin(this.time * 2) * 50;
        
        // 边界检查（使用实际canvas宽度）
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    }
    
    shoot(playerX, playerY) {
        if (!this.canShoot()) return [];
        
        super.shoot();
        
        const bullets = [];
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height;
        
        // 随机选择弹幕模式
        const pattern = Math.floor(Math.random() * 4);
        
        switch (pattern) {
            case 0: // 直线型 - 向玩家发射
                const dx = playerX - centerX;
                const dy = playerY - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const speed = 3;
                
                bullets.push(new Bullet(
                    centerX - 4, centerY,
                    (dx / distance) * speed,
                    (dy / distance) * speed,
                    8, 8, 'enemy'
                ));
                break;
                
            case 1: // 扇形 - 3发散射
                for (let i = -1; i <= 1; i++) {
                    const angle = Math.atan2(playerY - centerY, playerX - centerX) + i * 0.3;
                    bullets.push(new Bullet(
                        centerX - 4, centerY,
                        Math.cos(angle) * 3,
                        Math.sin(angle) * 3,
                        8, 8, 'enemy'
                    ));
                }
                break;
                
            case 2: // 螺旋形 - 8方向
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + this.time;
                    bullets.push(new Bullet(
                        centerX - 4, centerY,
                        Math.cos(angle) * 2,
                        Math.sin(angle) * 2,
                        8, 8, 'enemy'
                    ));
                }
                break;
                
            case 3: // 矩阵形 - 5x3子弹墙
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 5; col++) {
                        bullets.push(new Bullet(
                            centerX - 40 + col * 20, centerY + row * 15,
                            0, 1.5,
                            6, 6, 'enemy'
                        ));
                    }
                }
                break;
        }
        
        return bullets;
    }
    
    render(ctx, game) {
        // 绘制骷髅头敌人 - 优先使用图片
        if (game && game.images.skull_enemy && game.images.skull_enemy.complete) {
            ctx.drawImage(game.images.skull_enemy, this.x, this.y, this.width, this.height);
        } else {
            // 默认绘制
            ctx.fillStyle = '#cc3333';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 绘制眼睛
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + 8, this.y + 8, 6, 6);
            ctx.fillRect(this.x + 18, this.y + 8, 6, 6);
            
            // 绘制嘴巴
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 12, this.y + 20, 8, 4);
        }
        
        // 生命值条
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
        }
    }
}

// 子弹类
class Bullet {
    constructor(x, y, vx, vy, width, height, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = width;
        this.height = height;
        this.type = type; // 'player' 或 'enemy'
        this.active = true;
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;
        
        // 检查是否超出屏幕（使用实际canvas尺寸）
        if (this.y < -this.height || this.y > canvasHeight + this.height || 
            this.x < -this.width || this.x > canvasWidth + this.width) {
            this.active = false;
        }
    }
    
    render(ctx, game) {
        if (this.type === 'player') {
            // 巨化子弹有特殊效果
            if (this.width >= 16) {
                // 巨化子弹 - 蓝白色能量弹
                ctx.fillStyle = '#00aaff';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // 内核白光
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.x + 3, this.y + 2, this.width - 6, this.height - 4);
                
                // 能量光环
                ctx.strokeStyle = '#44ddff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
                ctx.stroke();
            } else {
                // 普通子弹 - 优先使用图片
                if (game && game.images.player_bullet && game.images.player_bullet.complete && !game.images.player_bullet.src.includes('broken')) {
                    try {
                        ctx.drawImage(game.images.player_bullet, this.x, this.y, this.width, this.height);
                    } catch (e) {
                        // 默认绘制
                        ctx.fillStyle = '#ffff00';
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                        
                        // 子弹光效
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(this.x + this.width/4, this.y + this.height/4, this.width/2, this.height/2);
                    }
                } else {
                    // 默认绘制
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    
                    // 子弹光效
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(this.x + this.width/4, this.y + this.height/4, this.width/2, this.height/2);
                }
            }
        } else {
            // 敌人子弹 - 优先使用图片
            if (game && game.images.enemy_bullet && game.images.enemy_bullet.complete && !game.images.enemy_bullet.src.includes('broken')) {
                try {
                    ctx.drawImage(game.images.enemy_bullet, this.x, this.y, this.width, this.height);
                } catch (e) {
                    // 默认绘制
                    ctx.fillStyle = '#ff4444';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            } else {
                // 默认绘制
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }
    
    // 碰撞检测方法
    checkCollision(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// 爆炸效果类
class Explosion {
    constructor(x, y, size = 'normal') {
        this.x = x;
        this.y = y;
        this.size = size; // 'small', 'normal', 'large'
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameDelay = 100; // 每帧间隔100ms
        this.totalFrames = 4; // 4帧爆炸动画
        this.finished = false;
        
        // 根据大小调整尺寸
        this.scale = size === 'small' ? 0.5 : size === 'large' ? 1.5 : 1.0;
        this.width = 32 * this.scale;
        this.height = 32 * this.scale;
    }
    
    update(deltaTime) {
        this.frameTimer += deltaTime;
        
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            this.currentFrame++;
            
            if (this.currentFrame >= this.totalFrames) {
                this.finished = true;
            }
        }
    }
    
    render(ctx, game) {
        if (this.finished || this.currentFrame >= this.totalFrames) return;
        
        const frameIndex = Math.min(this.currentFrame, this.totalFrames - 1);
        const explosionImages = [
            game.images.explosion_frame_1,
            game.images.explosion_frame_2,
            game.images.explosion_frame_3,
            game.images.explosion_frame_4
        ];
        
        const img = explosionImages[frameIndex];
        
        // 优先使用图片，如果失败则使用默认绘制
        if (img && img.complete && !img.src.includes('broken')) {
            try {
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.scale(this.scale, this.scale);
                ctx.drawImage(img, -16, -16, 32, 32);
                ctx.restore();
            } catch (e) {
                this.renderDefault(ctx);
            }
        } else {
            this.renderDefault(ctx);
        }
    }
    
    renderDefault(ctx) {
        // 默认爆炸效果绘制
        const progress = this.currentFrame / this.totalFrames;
        const radius = 16 * this.scale * (1 + progress);
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 外圈 - 橙色
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 内圈 - 黄色
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 中心 - 白色
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 游戏主类
class PixelExpedition {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = GAME_STATES.MENU;
        
        // 游戏属性
        this.score = 0;
        
        // 时间控制
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // 背景滚动
        this.backgroundY = 0;
        this.backgroundSpeed = 1;
        
        // 输入状态
        this.keys = {};
        this.keysPressed = {};
        
        // 游戏对象
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.companions = []; // 僚机数组
        this.explosions = []; // 爆炸效果数组
        
        // 敌人生成计时器
        this.meteorSpawnTimer = 0;
        this.meteorSpawnDelay = 1500; // 1.5秒生成一个陨石
        this.skullSpawnTimer = 0;
        this.skullSpawnDelay = 8000; // 8秒生成一个骷髅头
        
        // 特效定时器
        this.bombFlashTimer = 0;
        
        // 反应挑战系统
        this.challengeTimer = 15000; // 15秒触发一次挑战
        this.challengeSequence = []; // 当前挑战序列
        this.challengeCurrentIndex = 0; // 当前输入位置
        this.challengeTimeLimit = 5000; // 挑战时间限制5秒
        this.challengeRemainingTime = 0; // 挑战剩余时间
        this.challengeSuccess = false; // 挑战是否成功
        this.challengeFeedbackTimer = 0; // 挑战反馈显示时间
        this.challengeFeedbackMessage = ''; // 挑战反馈消息
        
        // 图片资源管理
        this.images = {};
        this.imagesLoaded = 0;
        this.totalImages = 0;
        this.allImagesLoaded = false;
        
        // 初始化
        this.init();
    }
    
    init() {
        // 设置Canvas尺寸以适应窗口
        this.resizeCanvas();
        
        // 设置Canvas
        this.ctx.imageSmoothingEnabled = false;
        
        // 绑定事件
        this.bindEvents();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // 加载图片资源
        this.loadImages();
        
        // 开始游戏循环
        this.gameLoop();
        
        console.log('像素远征游戏初始化完成!');
    }
    
    loadImages() {
        const imageList = [
            'assets/sprites/player_ship.png',
            'assets/sprites/skull_enemy.png', 
            'assets/sprites/meteor.png',
            'assets/sprites/player_bullet.png',
            'assets/sprites/enemy_bullet.png',
            'assets/effects/shield.png',
            'assets/effects/explosion_frame_1.png',
            'assets/effects/explosion_frame_2.png',
            'assets/effects/explosion_frame_3.png',
            'assets/effects/explosion_frame_4.png',
            'assets/backgrounds/space_background.png'
        ];

        this.totalImages = imageList.length;

        imageList.forEach(src => {
            const img = new Image();
            img.onload = () => {
                this.imagesLoaded++;
                console.log(`图片加载: ${src} (${this.imagesLoaded}/${this.totalImages})`);
                if (this.imagesLoaded === this.totalImages) {
                    this.allImagesLoaded = true;
                    console.log('所有图片资源加载完成!');
                }
            };
            img.onerror = () => {
                console.warn(`图片加载失败: ${src}, 将使用默认绘制`);
                this.imagesLoaded++;
                if (this.imagesLoaded === this.totalImages) {
                    this.allImagesLoaded = true;
                }
            };
            img.src = src;
            
            // 使用文件名作为键
            const key = src.split('/').pop().split('.')[0];
            this.images[key] = img;
        });
    }
    
    resizeCanvas() {
        // 获取窗口尺寸
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 设置Canvas的实际渲染尺寸
        this.canvas.width = windowWidth;
        this.canvas.height = windowHeight;
        
        // 确保CSS尺寸匹配
        this.canvas.style.width = windowWidth + 'px';
        this.canvas.style.height = windowHeight + 'px';
        
        console.log(`Canvas调整为: ${windowWidth}x${windowHeight}`);
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            // 处理挑战状态下的方向键专用逻辑
            if (this.gameState === GAME_STATES.CHALLENGE) {
                let inputDirection = null;
                switch (e.code) {
                    case 'ArrowUp':
                        inputDirection = CHALLENGE_DIRECTIONS.UP;
                        break;
                    case 'ArrowDown':
                        inputDirection = CHALLENGE_DIRECTIONS.DOWN;
                        break;
                    case 'ArrowLeft':
                        inputDirection = CHALLENGE_DIRECTIONS.LEFT;
                        break;
                    case 'ArrowRight':
                        inputDirection = CHALLENGE_DIRECTIONS.RIGHT;
                        break;
                }
                
                if (inputDirection) {
                    this.handleChallengeInput(inputDirection);
                    e.preventDefault();
                    return; // 直接返回，不让方向键进入正常键盘处理
                }
            }
            
            // 正常的键盘处理（不包括挑战状态下的方向键）
            this.keys[e.code] = true;
            this.keysPressed[e.code] = true;
            
            // 菜单状态下任意键开始游戏
            if (this.gameState === GAME_STATES.MENU) {
                this.startGame();
            }
            
            // 游戏结束状态下任意键重新开始
            if (this.gameState === GAME_STATES.GAME_OVER) {
                this.restartGame();
            }
            
            // ESC键暂停游戏
            if (e.code === 'Escape' && this.gameState === GAME_STATES.PLAYING) {
                this.gameState = GAME_STATES.PAUSED;
            } else if (e.code === 'Escape' && this.gameState === GAME_STATES.PAUSED) {
                this.gameState = GAME_STATES.PLAYING;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // 挑战状态下的方向键不影响正常的键盘状态
            if (this.gameState === GAME_STATES.CHALLENGE && 
                ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                return;
            }
            
            this.keys[e.code] = false;
        });
        
        // 防止默认行为
        document.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    startGame() {
        this.gameState = GAME_STATES.PLAYING;
        this.score = 0;
        
        // 创建玩家
        this.player = new Player(
            this.canvas.width / 2 - 16,
            this.canvas.height - 80
        );
        
        // 清空游戏对象数组
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.companions = [];
        this.explosions = [];
        
        // 重置生成计时器
        this.meteorSpawnTimer = 0;
        this.skullSpawnTimer = 0;
        
        // 重置挑战系统
        this.challengeTimer = 15000;
        this.challengeSequence = [];
        this.challengeCurrentIndex = 0;
        this.challengeRemainingTime = 0;
        this.challengeSuccess = false;
        this.challengeFeedbackTimer = 0;
        this.challengeFeedbackMessage = '';
        
        // 重置特效
        this.bombFlashTimer = 0;
        
        // 更新页面样式
        document.body.className = 'game-playing';
        
        console.log('游戏开始!');
    }
    
    restartGame() {
        this.gameState = GAME_STATES.MENU;
        document.body.className = 'game-menu';
        console.log('返回菜单');
    }
    
    gameOver() {
        this.gameState = GAME_STATES.GAME_OVER;
        document.body.className = 'game-over';
        console.log('游戏结束! 最终分数:', this.score);
    }
    
    // 创建爆炸效果
    createExplosion(x, y, size = 'normal') {
        const explosion = new Explosion(x, y, size);
        this.explosions.push(explosion);
    }
    
    // 游戏主循环
    gameLoop(currentTime = 0) {
        // 计算时间差
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新游戏状态
        this.update();
        
        // 渲染游戏画面
        this.render();
        
        // 清除按键按下状态
        this.keysPressed = {};
        
        // 继续循环
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    

    
    update() {
        // 更新炸弹闪光效果
        if (this.bombFlashTimer > 0) {
            this.bombFlashTimer -= this.deltaTime;
        }
        
        // 更新挑战反馈计时器
        if (this.challengeFeedbackTimer > 0) {
            this.challengeFeedbackTimer -= this.deltaTime;
        }
        
        switch (this.gameState) {
            case GAME_STATES.PLAYING:
                this.updatePlaying();
                break;
            case GAME_STATES.MENU:
                this.updateMenu();
                break;
            case GAME_STATES.GAME_OVER:
                this.updateGameOver();
                break;
            case GAME_STATES.PAUSED:
                // 暂停状态不更新游戏逻辑
                break;
            case GAME_STATES.CHALLENGE:
                this.updateChallenge();
                break;
        }
    }
    
    updateMenu() {
        // 菜单状态下的背景滚动
        this.updateBackground();
    }
    
    updatePlaying() {
        // 游戏进行时的更新逻辑
        this.updateBackground();
        
        // 更新挑战计时器
        this.challengeTimer -= this.deltaTime;
        if (this.challengeTimer <= 0) {
            this.startChallenge();
        }
        
        // 更新爆炸效果
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(this.deltaTime);
            if (this.explosions[i].finished) {
                this.explosions.splice(i, 1);
            }
        }
        
        if (this.player) {
            // 更新玩家
            this.player.update(this.deltaTime, this.keys, this.canvas.width, this.canvas.height);
            
            // 处理射击
            if (this.keysPressed['Space']) {
                const bullet = this.player.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                }
            }
            
            // 处理炸弹
            if (this.keysPressed['ShiftLeft'] || this.keysPressed['ShiftRight']) {
                if (this.player.useBomb()) {
                    this.useBomb();
                }
            }
            
            // 检查玩家是否死亡
            if (this.player.lives <= 0) {
                this.gameOver();
            }
            
            // 更新子弹
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].update(this.deltaTime, this.canvas.width, this.canvas.height);
                if (!this.bullets[i].active) {
                    this.bullets.splice(i, 1);
                }
            }
            
            // 生成敌人
            this.spawnEnemies(this.deltaTime);
            
            // 更新敌人
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                if (enemy instanceof SkullEnemy) {
                    enemy.update(this.deltaTime, this.player.x + this.player.width/2, this.player.y + this.player.height/2, this.canvas.width, this.canvas.height);
                    
                    // 敌人射击
                    const newBullets = enemy.shoot(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                    this.enemyBullets.push(...newBullets);
                } else {
                    enemy.update(this.deltaTime, this.canvas.height);
                }
                
                if (!enemy.active) {
                    this.enemies.splice(i, 1);
                }
            }
            
            // 更新敌人子弹
            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                this.enemyBullets[i].update(this.deltaTime, this.canvas.width, this.canvas.height);
                if (!this.enemyBullets[i].active) {
                    this.enemyBullets.splice(i, 1);
                }
            }
            
            // 管理僚机
            this.manageCompanions();
            
            // 更新僚机
            this.companions.forEach(companion => {
                companion.update(this.deltaTime);
                
                // 僚机自动射击
                const companionBullet = companion.shoot();
                if (companionBullet) {
                    this.bullets.push(companionBullet);
                }
            });
            
            // 碰撞检测
            this.checkCollisions();
            
            // 更新游戏状态
            this.lives = this.player.lives;
            this.bombs = this.player.bombs;
            
            // 检查游戏结束条件在碰撞检测后处理
        }
    }
    
    useBomb() {
        // 炸弹效果：清屏所有敌方子弹和低级敌人
        
        // 清除所有敌方子弹
        this.enemyBullets = [];
        
        // 摧毁所有陨石，对骷髅头造成大量伤害
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy instanceof Meteor) {
                // 为每个陨石创建爆炸效果
                this.createExplosion(
                    enemy.x + enemy.width/2 - 16, 
                    enemy.y + enemy.height/2 - 16, 
                    'normal'
                );
                enemy.active = false;
                this.score += enemy.scoreValue;
            } else if (enemy instanceof SkullEnemy) {
                const destroyed = enemy.takeDamage(2); // 造成2点伤害
                if (destroyed) {
                    // 骷髅头被摧毁时的大爆炸
                    this.createExplosion(
                        enemy.x + enemy.width/2 - 16, 
                        enemy.y + enemy.height/2 - 16, 
                        'large'
                    );
                    this.score += enemy.scoreValue;
                } else {
                    // 骷髅头受伤时的小爆炸
                    this.createExplosion(
                        enemy.x + enemy.width/2 - 16, 
                        enemy.y + enemy.height/2 - 16, 
                        'small'
                    );
                }
            }
        }
        
        // 清理被摧毁的敌人
        this.enemies = this.enemies.filter(enemy => enemy.active);
        
        // 添加炸弹闪光效果
        this.bombFlashTimer = 500; // 闪光持续时间
    }
    
    spawnEnemies(deltaTime) {
        // 生成陨石
        this.meteorSpawnTimer += deltaTime;
        if (this.meteorSpawnTimer >= this.meteorSpawnDelay) {
            this.meteorSpawnTimer = 0;
            const x = Math.random() * (this.canvas.width - 24);
            const meteor = new Meteor(x, -24);
            this.enemies.push(meteor);
            
            // 随着时间推移，陨石生成速度加快
            this.meteorSpawnDelay = Math.max(500, this.meteorSpawnDelay - 10);
        }
        
        // 生成骷髅头敌人
        this.skullSpawnTimer += deltaTime;
        if (this.skullSpawnTimer >= this.skullSpawnDelay && this.score >= 100) { // 分数达到100才开始生成骷髅头
            this.skullSpawnTimer = 0;
            const x = Math.random() * (this.canvas.width - 32);
            this.enemies.push(new SkullEnemy(x, -32));
        }
    }
    
    checkCollisions() {
        if (!this.player) return;
        
        // 玩家子弹 vs 敌人
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (enemy.checkCollision(bullet)) {
                    // 命中敌人
                    bullet.active = false;
                    const destroyed = enemy.takeDamage();
                    
                    // 创建命中爆炸效果
                    this.createExplosion(
                        enemy.x + enemy.width/2 - 16, 
                        enemy.y + enemy.height/2 - 16, 
                        'small'
                    );
                    
                    if (destroyed) {
                        this.score += enemy.scoreValue;
                        // 创建摧毁爆炸效果
                        this.createExplosion(
                            enemy.x + enemy.width/2 - 16, 
                            enemy.y + enemy.height/2 - 16, 
                            enemy instanceof SkullEnemy ? 'large' : 'normal'
                        );
                    }
                    break;
                }
            }
        }
        
        // 敌人 vs 玩家
        for (let enemy of this.enemies) {
            if (enemy.checkCollision(this.player)) {
                const damaged = this.player.takeDamage();
                if (damaged) {
                    // 玩家受到伤害，创建爆炸效果
                    this.createExplosion(
                        this.player.x + this.player.width/2 - 16, 
                        this.player.y + this.player.height/2 - 16, 
                        'normal'
                    );
                }
                
                // 陨石撞击后销毁
                if (enemy instanceof Meteor) {
                    enemy.active = false;
                    // 陨石撞击玩家时的爆炸效果
                    this.createExplosion(
                        enemy.x + enemy.width/2 - 16, 
                        enemy.y + enemy.height/2 - 16, 
                        'normal'
                    );
                }
            }
        }
        
        // 敌人子弹 vs 玩家
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            if (bullet.checkCollision && bullet.checkCollision(this.player)) {
                bullet.active = false;
                const damaged = this.player.takeDamage();
                if (damaged) {
                    // 玩家被子弹击中时的爆炸效果
                    this.createExplosion(
                        this.player.x + this.player.width/2 - 16, 
                        this.player.y + this.player.height/2 - 16, 
                        'small'
                    );
                }
            }
        }
        
        // 清理无效对象
        this.bullets = this.bullets.filter(bullet => bullet.active);
        this.enemies = this.enemies.filter(enemy => enemy.active);
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active);
    }
    
    updateGameOver() {
        // 游戏结束状态的更新
        this.updateBackground();
    }
    
    updateBackground() {
        // 背景滚动
        this.backgroundY += this.backgroundSpeed;
        if (this.backgroundY >= this.canvas.height) {
            this.backgroundY = 0;
        }
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染背景
        this.renderBackground();
        
        // 根据游戏状态渲染不同内容
        switch (this.gameState) {
            case GAME_STATES.PLAYING:
                this.renderPlaying();
                break;
            case GAME_STATES.MENU:
                this.renderMenu();
                break;
            case GAME_STATES.GAME_OVER:
                this.renderGameOver();
                break;
            case GAME_STATES.PAUSED:
                this.renderPlaying(); // 先渲染游戏画面
                this.renderPaused();  // 再渲染暂停界面
                break;
            case GAME_STATES.CHALLENGE:
                this.renderPlaying(); // 先渲染游戏画面
                this.renderChallenge(); // 再渲染挑战界面
                break;
        }
        
        // 渲染炸弹闪光效果
        if (this.bombFlashTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.bombFlashTimer / 500})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    renderBackground() {
        // 渲染星空背景
        this.ctx.fillStyle = '#ffffff';
        
        // 简单的星星效果
        for (let i = 0; i < 100; i++) {
            const x = (i * 67 + this.backgroundY * 0.5) % this.canvas.width;
            const y = (i * 43 + this.backgroundY) % this.canvas.height;
            const size = (i % 3) + 1;
            
            this.ctx.fillRect(x, y, size, size);
        }
        
        // 大一点的星星
        this.ctx.fillStyle = '#aaaaff';
        for (let i = 0; i < 20; i++) {
            const x = (i * 97 + this.backgroundY * 0.3) % this.canvas.width;
            const y = (i * 73 + this.backgroundY * 1.5) % this.canvas.height;
            
            this.ctx.fillRect(x, y, 2, 2);
        }
    }
    
    renderMenu() {
        // 菜单状态下的渲染
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = 'bold 48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('像素远征', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '18px Courier New';
        this.ctx.fillText('PIXEL EXPEDITION', this.canvas.width / 2, this.canvas.height / 2 - 70);
        
        // 控制说明
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Courier New';
        this.ctx.textAlign = 'left';
        
        const controlsX = this.canvas.width / 2 - 120;
        let controlsY = this.canvas.height / 2 - 20;
        
        this.ctx.fillText('游戏控制:', controlsX, controlsY);
        controlsY += 30;
        this.ctx.fillText('WASD - 移动飞船', controlsX, controlsY);
        controlsY += 25;
        this.ctx.fillText('空格键 - 射击', controlsX, controlsY);
        controlsY += 25;
        this.ctx.fillText('Shift - 使用炸弹', controlsX, controlsY);
        controlsY += 25;
        this.ctx.fillText('方向键 - 反应挑战', controlsX, controlsY);
        controlsY += 25;
        this.ctx.fillText('ESC - 暂停游戏', controlsX, controlsY);
        
        // 游戏说明
        this.ctx.fillStyle = '#ffdd44';
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'center';
        controlsY += 40;
        this.ctx.fillText('摧毁陨石获得10分，摧毁骷髅头敌人获得50分', this.canvas.width / 2, controlsY);
        controlsY += 20;
        this.ctx.fillText('分数达到100分后开始出现骷髅头敌人', this.canvas.width / 2, controlsY);
        controlsY += 20;
        this.ctx.fillText('每15秒触发反应挑战，游戏继续进行中', this.canvas.width / 2, controlsY);
        controlsY += 20;
        this.ctx.fillText('用方向键完成挑战获得强力增益效果！', this.canvas.width / 2, controlsY);
        
        // 开始提示
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Courier New';
        this.ctx.fillText('按任意键开始游戏', this.canvas.width / 2, this.canvas.height - 80);
    }
    
    renderPlaying() {
        // 渲染游戏对象
        if (this.player) {
            this.player.render(this.ctx, this);
        }
        
        // 渲染僚机
        this.companions.forEach(companion => companion.render(this.ctx, this));
        
        // 绘制敌人
        this.enemies.forEach(enemy => {
            enemy.render(this.ctx, this);
        });
        
        // 绘制子弹
        this.bullets.forEach(bullet => {
            bullet.render(this.ctx, this);
        });
        
        // 绘制敌人子弹
        this.enemyBullets.forEach(bullet => {
            bullet.render(this.ctx, this);
        });
        
        // 绘制爆炸效果
        this.explosions.forEach(explosion => {
            explosion.render(this.ctx, this);
        });
        
        // 渲染HUD
        this.renderHUD();
        
        // 渲染挑战反馈
        this.renderChallengeFeedback();
    }
    
    renderGameOver() {
        // 游戏结束界面
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Courier New';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('按任意键重试', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    renderPaused() {
        // 半透明黑色遮罩
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 暂停文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.font = '24px Courier New';
        this.ctx.fillText('按 ESC 继续', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
    
    renderHUD() {
        if (!this.player) return;
        
        // 渲染游戏界面信息
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Courier New';
        this.ctx.textAlign = 'left';
        
        // 分数
        this.ctx.fillText(`分数: ${this.score}`, 20, 30);
        
        // 生命值 - 用心形图标显示
        this.ctx.fillText('生命: ', 20, 60);
        for (let i = 0; i < this.player.lives; i++) {
            this.ctx.fillStyle = '#ff0044';
            this.ctx.fillText('♥', 100 + i * 25, 60);
        }
        
        // 炸弹数量 - 用图标显示
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('炸弹: ', 20, 90);
        for (let i = 0; i < this.player.bombs; i++) {
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fillText('●', 100 + i * 25, 90);
        }
        
        // 如果有活跃的增益效果，显示剩余时间
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '16px Courier New';
        let yOffset = 120;
        
        for (let powerUpName in this.player.powerUps) {
            const powerUp = this.player.powerUps[powerUpName];
            if (powerUp.active) {
                const timeLeft = Math.ceil(powerUp.timer / 1000);
                let displayName = '';
                switch (powerUpName) {
                    case 'bigBullets': displayName = '巨化子弹'; break;
                    case 'shield': displayName = '能量护盾'; break;
                    case 'rapidFire': displayName = '急速射击'; break;
                    case 'companion': displayName = '僚机'; break;
                }
                this.ctx.fillText(`${displayName}: ${timeLeft}s`, 20, yOffset);
                yOffset += 20;
            }
        }
    }
    
    // 僚机管理方法
    manageCompanions() {
        if (!this.player) return;
        
        if (this.player.powerUps.companion.active) {
            // 如果僚机增益激活且还没有僚机，创建僚机
            if (this.companions.length === 0) {
                this.companions.push(new Companion(this.player, {x: -35, y: 10})); // 左僚机
                this.companions.push(new Companion(this.player, {x: 35, y: 10}));  // 右僚机
            }
        } else {
            // 如果僚机增益不活跃，清除所有僚机
            this.companions = [];
        }
    }
    
    // 在HUD中添加挑战反馈显示
    renderChallengeFeedback() {
        if (this.challengeFeedbackTimer > 0) {
            this.ctx.fillStyle = this.challengeFeedbackMessage.includes('成功') ? '#00ff00' : '#ff4444';
            this.ctx.font = 'bold 24px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.challengeFeedbackMessage, this.canvas.width / 2, 150);
        }
    }
    
    // 反应挑战系统方法
    startChallenge() {
        console.log('反应挑战开始！');
        this.gameState = GAME_STATES.CHALLENGE;
        
        // 生成随机方向序列（3-5个方向）
        const sequenceLength = Math.floor(Math.random() * 3) + 3; // 3-5个方向
        this.challengeSequence = [];
        const directions = [
            CHALLENGE_DIRECTIONS.UP,
            CHALLENGE_DIRECTIONS.DOWN,
            CHALLENGE_DIRECTIONS.LEFT,
            CHALLENGE_DIRECTIONS.RIGHT
        ];
        
        for (let i = 0; i < sequenceLength; i++) {
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            this.challengeSequence.push(randomDirection);
        }
        
        this.challengeCurrentIndex = 0;
        this.challengeRemainingTime = this.challengeTimeLimit;
        this.challengeSuccess = false;
        
        console.log('挑战序列:', this.challengeSequence);
    }
    
    updateChallenge() {
        // 在挑战状态下也继续游戏逻辑
        this.updateBackground();
        
        if (this.player) {
            // 更新玩家
            this.player.update(this.deltaTime, this.keys, this.canvas.width, this.canvas.height);
            
            // 处理射击（挑战期间仍可射击）
            if (this.keysPressed['Space']) {
                const bullet = this.player.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                }
            }
            
            // 处理炸弹（挑战期间仍可使用炸弹）
            if (this.keysPressed['ShiftLeft'] || this.keysPressed['ShiftRight']) {
                if (this.player.useBomb()) {
                    this.useBomb();
                }
            }
            
            // 检查玩家是否死亡
            if (this.player.lives <= 0) {
                this.gameOver();
                return;
            }
            
            // 更新子弹
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].update(this.deltaTime, this.canvas.width, this.canvas.height);
                if (!this.bullets[i].active) {
                    this.bullets.splice(i, 1);
                }
            }
            
            // 生成敌人（挑战期间继续生成敌人）
            this.spawnEnemies(this.deltaTime);
            
            // 更新敌人
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                if (enemy instanceof SkullEnemy) {
                    enemy.update(this.deltaTime, this.player.x + this.player.width/2, this.player.y + this.player.height/2, this.canvas.width, this.canvas.height);
                    
                    // 敌人射击
                    const newBullets = enemy.shoot(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                    this.enemyBullets.push(...newBullets);
                } else {
                    enemy.update(this.deltaTime, this.canvas.height);
                }
                
                if (!enemy.active) {
                    this.enemies.splice(i, 1);
                }
            }
            
            // 更新敌人子弹
            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                this.enemyBullets[i].update(this.deltaTime, this.canvas.width, this.canvas.height);
                if (!this.enemyBullets[i].active) {
                    this.enemyBullets.splice(i, 1);
                }
            }
            
            // 管理僚机
            this.manageCompanions();
            
            // 更新僚机
            this.companions.forEach(companion => {
                companion.update(this.deltaTime);
                
                // 僚机自动射击
                const companionBullet = companion.shoot();
                if (companionBullet) {
                    this.bullets.push(companionBullet);
                }
            });
            
            // 碰撞检测
            this.checkCollisions();
            
            // 更新游戏状态
            this.lives = this.player.lives;
            this.bombs = this.player.bombs;
        }
        
        // 更新挑战剩余时间
        this.challengeRemainingTime -= this.deltaTime;
        
        // 时间到了，挑战失败
        if (this.challengeRemainingTime <= 0) {
            this.endChallenge(false);
        }
    }
    
    handleChallengeInput(inputDirection) {
        const expectedDirection = this.challengeSequence[this.challengeCurrentIndex];
        
        if (inputDirection === expectedDirection) {
            // 输入正确
            this.challengeCurrentIndex++;
            
            // 检查是否完成整个序列
            if (this.challengeCurrentIndex >= this.challengeSequence.length) {
                this.endChallenge(true);
            }
        } else {
            // 输入错误，挑战失败
            this.endChallenge(false);
        }
    }
    
    endChallenge(success) {
        this.challengeSuccess = success;
        this.gameState = GAME_STATES.PLAYING;
        
        if (success) {
            console.log('挑战成功！获得增益效果');
            this.challengeFeedbackMessage = '挑战成功！';
            this.challengeFeedbackTimer = 2000;
            this.grantRandomPowerUp();
        } else {
            console.log('挑战失败！');
            this.challengeFeedbackMessage = '挑战失败！';
            this.challengeFeedbackTimer = 2000;
        }
        
        // 重置挑战计时器
        this.challengeTimer = 15000;
    }
    
    grantRandomPowerUp() {
        if (!this.player) return;
        
        const powerUpTypes = [
            POWER_UP_TYPES.BIG_BULLETS,
            POWER_UP_TYPES.SHIELD,
            POWER_UP_TYPES.EXTRA_BOMB,
            POWER_UP_TYPES.RAPID_FIRE,
            POWER_UP_TYPES.COMPANION
        ];
        
        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const duration = 10000; // 10秒增益时间
        
        switch (randomPowerUp) {
            case POWER_UP_TYPES.BIG_BULLETS:
                this.player.powerUps.bigBullets.active = true;
                this.player.powerUps.bigBullets.timer = duration;
                this.challengeFeedbackMessage += ' 巨化子弹';
                break;
            case POWER_UP_TYPES.SHIELD:
                this.player.powerUps.shield.active = true;
                this.player.powerUps.shield.timer = duration;
                this.challengeFeedbackMessage += ' 能量护盾';
                break;
            case POWER_UP_TYPES.EXTRA_BOMB:
                this.player.bombs = Math.min(this.player.maxBombs, this.player.bombs + 1);
                this.challengeFeedbackMessage += ' 额外炸弹';
                break;
            case POWER_UP_TYPES.RAPID_FIRE:
                this.player.powerUps.rapidFire.active = true;
                this.player.powerUps.rapidFire.timer = duration;
                this.challengeFeedbackMessage += ' 急速射击';
                break;
            case POWER_UP_TYPES.COMPANION:
                this.player.powerUps.companion.active = true;
                this.player.powerUps.companion.timer = duration;
                this.challengeFeedbackMessage += ' 僚机';
                break;
        }
    }
    
    renderChallenge() {
        // 在屏幕底部绘制挑战界面，不遮挡游戏区域
        const challengeHeight = 120;
        const challengeY = this.canvas.height - challengeHeight;
        
        // 底部半透明背景条
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, challengeY, this.canvas.width, challengeHeight);
        
        // 上边框
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(0, challengeY, this.canvas.width, 3);
        
        // 挑战标题和剩余时间在一行
        const timeLeft = Math.ceil(this.challengeRemainingTime / 1000);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 20px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('反应挑战', 20, challengeY + 25);
        
        // 剩余时间
        this.ctx.fillStyle = timeLeft <= 2 ? '#ff4444' : '#ffffff';
        this.ctx.font = '18px Courier New';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`时间: ${timeLeft}s`, this.canvas.width - 20, challengeY + 25);
        
        // 显示方向序列（紧凑布局）
        const arrowSize = 32;
        const spacing = 40;
        const totalWidth = this.challengeSequence.length * spacing - (spacing - arrowSize);
        const startX = (this.canvas.width - totalWidth) / 2;
        const arrowY = challengeY + 65;
        
        for (let i = 0; i < this.challengeSequence.length; i++) {
            const x = startX + i * spacing;
            
            // 背景框
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(x - 2, arrowY - arrowSize + 5, arrowSize + 4, arrowSize + 4);
            
            // 设置颜色
            if (i < this.challengeCurrentIndex) {
                this.ctx.fillStyle = '#00ff00'; // 已完成 - 绿色
            } else if (i === this.challengeCurrentIndex) {
                this.ctx.fillStyle = '#ffff00'; // 当前 - 黄色
                // 当前箭头闪烁效果
                const alpha = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            } else {
                this.ctx.fillStyle = '#666666'; // 未完成 - 灰色
            }
            
            // 绘制方向箭头
            this.ctx.font = `${arrowSize}px Courier New`;
            this.ctx.textAlign = 'center';
            let arrow = '';
            switch (this.challengeSequence[i]) {
                case CHALLENGE_DIRECTIONS.UP:
                    arrow = '↑';
                    break;
                case CHALLENGE_DIRECTIONS.DOWN:
                    arrow = '↓';
                    break;
                case CHALLENGE_DIRECTIONS.LEFT:
                    arrow = '←';
                    break;
                case CHALLENGE_DIRECTIONS.RIGHT:
                    arrow = '→';
                    break;
            }
            this.ctx.fillText(arrow, x + arrowSize/2, arrowY);
        }
        
        // 进度显示（简洁版）
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '14px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.challengeCurrentIndex}/${this.challengeSequence.length}`, 
                         this.canvas.width / 2, challengeY + 105);
    }
    
    // 工具方法
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
    
    isKeyJustPressed(keyCode) {
        return this.keysPressed[keyCode] || false;
    }
}

// 游戏启动
let game;

// 页面加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
    game = new PixelExpedition();
    console.log('像素远征已启动!');
}); 