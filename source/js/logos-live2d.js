class LogosLive2d {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.message = null;
    this.menu = null;
    this.isMenuOpen = false;
    this.messages = [
      "欢迎来到我的博客！",
      "我是逻各斯，罗德岛的精英干员。",
      "有什么可以帮助你的吗？",
      "今天也要加油哦！",
      "知识就是力量，阅读让生活更美好。",
      "记得多喝水，注意休息~",
      "喜欢这篇文章的话，记得点赞收藏！",
      "有问题随时可以留言讨论。"
    ];
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetEyeX = 0;
    this.targetEyeY = 0;
    this.currentEyeX = 0;
    this.currentEyeY = 0;
    
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.blinkDuration = 0;
    
    this.breathTimer = 0;
    this.breathOffset = 0;
    
    this.image = null;
    this.imageLoaded = false;
    
    this.init();
  }

  init() {
    this.createContainer();
    this.createCanvas();
    this.loadImage();
    this.createMessage();
    this.createMenu();
    this.bindEvents();
    this.startAnimation();
    this.showWelcomeMessage();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'logos-container';
    document.body.appendChild(this.container);
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'logos-canvas';
    this.canvas.width = 500;
    this.canvas.height = 700;
    this.canvas.style.cursor = 'pointer';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  loadImage() {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    
    this.image.onload = () => {
      this.imageLoaded = true;
      console.log('逻各斯立绘加载成功');
      this.draw();
    };
    
    this.image.onerror = () => {
      console.log('图片加载失败，尝试备用图片源');
      this.tryFallbackImage();
    };
    
    this.image.src = '/images/logos.png';
    
    setTimeout(() => {
      if (!this.imageLoaded) {
        this.tryFallbackImage();
      }
    }, 5000);
  }
  
  tryFallbackImage() {
    const fallbackUrls = [
      '/images/logos.png'
    ];
    
    let currentIndex = 0;
    
    const tryNext = () => {
      if (currentIndex >= fallbackUrls.length) {
        console.log('所有图片源都失败，使用占位符');
        this.imageLoaded = true;
        this.drawPlaceholderContent();
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.image = img;
        this.imageLoaded = true;
        console.log('备用图片加载成功');
        this.draw();
      };
      
      img.onerror = () => {
        currentIndex++;
        tryNext();
      };
      
      img.src = fallbackUrls[currentIndex];
    };
    
    tryNext();
  }

  createMessage() {
    this.message = document.createElement('div');
    this.message.className = 'logos-message';
    this.container.appendChild(this.message);
  }

  createMenu() {
    this.menu = document.createElement('div');
    this.menu.className = 'logos-menu';
    
    const menuItems = [
      { text: '🏠 返回首页', action: () => window.location.href = '/' },
      { text: '📚 文章归档', action: () => window.location.href = '/archives/' },
      { text: '🏷️ 标签云', action: () => window.location.href = '/tags/' },
      { text: '📂 分类', action: () => window.location.href = '/categories/' },
      { text: '💬 随机对话', action: () => this.showRandomMessage() },
      { text: '❌ 隐藏看板娘', action: () => this.hide() }
    ];

    menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'logos-menu-item';
      menuItem.textContent = item.text;
      menuItem.addEventListener('click', () => {
        item.action();
        this.toggleMenu();
      });
      this.menu.appendChild(menuItem);
    });

    this.container.appendChild(this.menu);
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateEyeTarget();
    });

    this.canvas.addEventListener('click', () => {
      if (this.isMenuOpen) {
        this.toggleMenu();
      } else {
        this.showRandomMessage();
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.toggleMenu();
    });

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && this.isMenuOpen) {
        this.toggleMenu();
      }
    });

    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (!this.isMenuOpen && !this.message.classList.contains('show')) {
          this.showRandomMessage();
        }
      }, 30000);
    };

    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('scroll', resetTimer);
    resetTimer();
  }

  updateEyeTarget() {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.35;
    
    const deltaX = this.mouseX - centerX;
    const deltaY = this.mouseY - centerY;
    
    const maxOffset = 15;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 500;
    
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    const offset = normalizedDistance * maxOffset;
    
    if (distance > 0) {
      this.targetEyeX = (deltaX / distance) * offset;
      this.targetEyeY = (deltaY / distance) * offset;
    }
  }

  startAnimation() {
    const animate = () => {
      this.update();
      this.draw();
      requestAnimationFrame(animate);
    };
    animate();
  }

  update() {
    const lerpFactor = 0.08;
    this.currentEyeX += (this.targetEyeX - this.currentEyeX) * lerpFactor;
    this.currentEyeY += (this.targetEyeY - this.currentEyeY) * lerpFactor;
    
    this.blinkTimer++;
    if (!this.isBlinking && this.blinkTimer > 180 + Math.random() * 120) {
      this.isBlinking = true;
      this.blinkDuration = 0;
    }
    
    if (this.isBlinking) {
      this.blinkDuration++;
      if (this.blinkDuration > 8) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }
    
    this.breathTimer += 0.03;
    this.breathOffset = Math.sin(this.breathTimer) * 3;
  }

  draw() {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2 + this.breathOffset);
    
    try {
      if (this.imageLoaded && this.image && this.image.complete && this.image.naturalHeight !== 0) {
        this.ctx.drawImage(
          this.image,
          -this.canvas.width / 2,
          -this.canvas.height / 2,
          this.canvas.width,
          this.canvas.height
        );
      } else {
        this.drawPlaceholderContent();
      }
    } catch (error) {
      console.log('绘制图片失败，使用占位符');
      this.drawPlaceholderContent();
    }
    
    this.drawEyes();
    
    this.ctx.restore();
  }
  
  drawPlaceholderContent() {
    const gradient = this.ctx.createLinearGradient(0, -this.canvas.height / 2, 0, this.canvas.height / 2);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(-this.canvas.width / 2, -this.canvas.height / 2, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.canvas.width - this.canvas.width / 2;
      const y = Math.random() * this.canvas.height - this.canvas.height / 2;
      const radius = Math.random() * 3 + 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.font = 'bold 48px Microsoft YaHei, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('逻各斯', 0, -120);
    
    this.ctx.font = 'bold 36px Arial, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillText('LOGOS', 0, -60);
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-100, -20);
    this.ctx.lineTo(100, -20);
    this.ctx.stroke();
    
    this.ctx.font = '20px Microsoft YaHei, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.fillText('明日方舟', 0, 20);
    
    this.ctx.font = '16px Microsoft YaHei, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.fillText('罗德岛精英干员', 0, 60);
    this.ctx.fillText('女妖王庭之主', 0, 90);
    
    this.ctx.font = 'italic 14px Arial, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fillText('哀珐尼尔', 0, 130);
    
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, 200, 40, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    this.ctx.fill();
    
    this.ctx.font = '24px Microsoft YaHei, sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillText('术师', 0, 200);
  }

  drawEyes() {
    const eyePositions = [
      { x: -30, y: -100 },
      { x: 30, y: -100 }
    ];
    
    eyePositions.forEach(eye => {
      this.ctx.save();
      
      this.ctx.beginPath();
      this.ctx.arc(eye.x, eye.y, 12, 0, Math.PI * 2);
      this.ctx.clip();
      
      this.ctx.fillStyle = '#FFD700';
      this.ctx.beginPath();
      this.ctx.arc(eye.x, eye.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      if (!this.isBlinking) {
        this.ctx.fillStyle = '#8B0000';
        this.ctx.beginPath();
        const pupilX = eye.x + this.currentEyeX;
        const pupilY = eye.y + this.currentEyeY;
        this.ctx.arc(pupilX, pupilY, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(pupilX - 2, pupilY - 2, 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.strokeStyle = '#8B0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(eye.x - 10, eye.y);
        this.ctx.lineTo(eye.x + 10, eye.y);
        this.ctx.stroke();
      }
      
      this.ctx.restore();
    });
  }

  showMessage(text, duration = 4000) {
    this.message.textContent = text;
    this.message.classList.add('show');
    
    setTimeout(() => {
      this.message.classList.remove('show');
    }, duration);
  }

  showRandomMessage() {
    const randomIndex = Math.floor(Math.random() * this.messages.length);
    this.showMessage(this.messages[randomIndex]);
  }

  showWelcomeMessage() {
    setTimeout(() => {
      const hour = new Date().getHours();
      let greeting;
      
      if (hour < 6) {
        greeting = '夜深了，注意休息哦~';
      } else if (hour < 12) {
        greeting = '早上好！新的一天开始了！';
      } else if (hour < 18) {
        greeting = '下午好！今天过得怎么样？';
      } else {
        greeting = '晚上好！欢迎来到我的博客！';
      }
      
      this.showMessage(greeting, 5000);
    }, 2000);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menu.classList.toggle('show', this.isMenuOpen);
  }

  hide() {
    this.container.style.opacity = '0';
    this.container.style.transform = 'translateY(100px)';
    
    setTimeout(() => {
      this.container.style.display = 'none';
      localStorage.setItem('logos-hidden', 'true');
    }, 300);
  }

  show() {
    this.container.style.display = 'block';
    setTimeout(() => {
      this.container.style.opacity = '1';
      this.container.style.transform = 'translateY(0)';
    }, 10);
    localStorage.removeItem('logos-hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('logos-hidden')) {
    window.logosLive2d = new LogosLive2d();
  }
});

window.showLogos = function() {
  if (window.logosLive2d) {
    window.logosLive2d.show();
  } else {
    window.logosLive2d = new LogosLive2d();
  }
};
