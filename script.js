// 粒子背景动画
class ParticleBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制粒子连线
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        // 绘制粒子
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        });
    }
    
    update() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界反弹
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // 保持在画布内
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
        });
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 导航切换功能
class NavigationManager {
    constructor() {
        this.tabs = document.querySelectorAll('.tab-item');
        this.sections = document.querySelectorAll('.work-section');
        this.init();
    }
    
    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const sectionId = tab.getAttribute('data-section');
                this.switchSection(sectionId);
            });
        });
    }
    
    switchSection(sectionId) {
        // 更新标签状态
        this.tabs.forEach(tab => {
            if (tab.getAttribute('data-section') === sectionId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // 更新内容显示
        this.sections.forEach(section => {
            if (section.id === `section-${sectionId}`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 添加新的数字标签
    addNewTab(number) {
        const navTabs = document.querySelector('.nav-tabs');
        const newTab = document.createElement('button');
        newTab.className = 'tab-item';
        newTab.setAttribute('data-section', number.toString().padStart(2, '0'));
        newTab.textContent = number.toString().padStart(2, '0');
        navTabs.appendChild(newTab);
        
        // 创建对应的内容区域
        const content = document.querySelector('.content');
        const newSection = document.createElement('section');
        newSection.className = 'work-section';
        newSection.id = `section-${number.toString().padStart(2, '0')}`;
        newSection.innerHTML = `
            <div class="work-content">
                <h2 class="work-title">Work ${number.toString().padStart(2, '0')}</h2>
                <p class="work-description">视觉作品展示区域</p>
                <div class="work-gallery">
                    <div class="work-placeholder">
                        <p>添加您的作品图片或视频</p>
                    </div>
                </div>
            </div>
        `;
        content.appendChild(newSection);
        
        // 为新标签添加事件监听
        newTab.addEventListener('click', () => {
            this.switchSection(number.toString().padStart(2, '0'));
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化粒子背景
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        new ParticleBackground(canvas);
    }
    
    // 初始化导航管理
    window.navManager = new NavigationManager();
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// 导出导航管理器供外部使用
window.addNewWork = function(number) {
    if (window.navManager) {
        window.navManager.addNewTab(number);
    }
};
