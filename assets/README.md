# 像素远征 - 游戏素材指南

## 📁 目录结构

```
assets/
├── sprite_generator.html    # 像素艺术生成器
├── sprites/                # 游戏精灵图
├── ui/                     # 用户界面元素
├── effects/                # 特效素材
├── backgrounds/            # 背景图片
└── README.md              # 本文件
```

## 🎨 如何生成素材

1. **打开生成器**: 双击 `sprite_generator.html` 在浏览器中打开
2. **生成素材**: 点击"生成所有素材"按钮
3. **下载文件**: 素材将自动下载到浏览器下载文件夹
4. **整理文件**: 将下载的PNG文件移动到对应子目录：

### 文件分类指南

- **sprites/** 目录:
  - `player_ship.png` - 玩家飞船 (32x32)
  - `skull_enemy.png` - 骷髅头敌人 (32x32)
  - `meteor.png` - 陨石 (24x24)
  - `player_bullet.png` - 玩家子弹 (8x16)
  - `enemy_bullet.png` - 敌人子弹 (8x8)

- **effects/** 目录:
  - `explosion_frame_1.png` - 爆炸动画第1帧 (32x32)
  - `explosion_frame_2.png` - 爆炸动画第2帧 (32x32)
  - `explosion_frame_3.png` - 爆炸动画第3帧 (32x32)
  - `explosion_frame_4.png` - 爆炸动画第4帧 (32x32)
  - `shield.png` - 护盾效果 (40x40)

- **backgrounds/** 目录:
  - `space_background.png` - 太空背景 (512x512)

## 🔧 集成到游戏代码

生成素材后，需要修改 `game.js` 文件来加载和使用这些图片：

### 1. 预加载所有图片

```javascript
class Game {
    constructor() {
        // ... 现有代码 ...
        this.images = {};
        this.imagesLoaded = 0;
        this.totalImages = 0;
        this.loadImages();
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
}
```

### 2. 修改绘制方法

将现有的形状绘制替换为图片绘制：

```javascript
// 玩家飞船绘制
draw(ctx) {
    if (this.game.images.player_ship) {
        ctx.drawImage(
            this.game.images.player_ship,
            this.x, this.y, this.width, this.height
        );
    } else {
        // 保留原有的形状绘制作为后备
        ctx.fillStyle = '#4A90A4';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 敌人绘制
draw(ctx) {
    if (this.game.images.skull_enemy) {
        ctx.drawImage(
            this.game.images.skull_enemy,
            this.x, this.y, this.width, this.height
        );
    } else {
        // 原有的骷髅头绘制
        // ...
    }
}

// 子弹绘制
draw(ctx) {
    if (this.game.images.player_bullet) {
        ctx.drawImage(
            this.game.images.player_bullet,
            this.x, this.y, this.width, this.height
        );
    } else {
        // 原有的子弹绘制
        ctx.fillStyle = '#FFD23F';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
```

### 3. 背景滚动

```javascript
drawBackground(ctx) {
    if (this.images.space_background) {
        // 使用图片背景
        const bgImg = this.images.space_background;
        const y1 = this.backgroundY % bgImg.height;
        const y2 = y1 - bgImg.height;
        
        ctx.drawImage(bgImg, 0, y1, this.canvas.width, this.canvas.height);
        ctx.drawImage(bgImg, 0, y2, this.canvas.width, this.canvas.height);
        
        this.backgroundY += 1; // 滚动速度
    } else {
        // 原有的背景绘制
        this.drawStarfield(ctx);
    }
}
```

## 🎯 素材特色

- **NES调色板风格**: 所有素材使用经典的NES游戏色彩
- **像素完美**: 每个像素都经过精心设计
- **统一风格**: 确保游戏视觉一致性
- **可缩放**: 支持任意尺寸缩放而不失真

## 🔄 自定义素材

如果需要修改素材：

1. 编辑 `sprite_generator.html` 中的对应生成函数
2. 调整颜色、尺寸或形状
3. 重新生成素材
4. 替换游戏中的文件

## 📝 注意事项

- 素材文件较小，适合网页游戏
- 使用 `image-rendering: pixelated` CSS确保像素艺术效果
- 所有素材都是程序生成，便于修改和维护
- 支持现代浏览器的PNG透明度 