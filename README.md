# Wilson - 个人视觉作品展示网站

一个现代化的个人作品展示网站，具有艺术感的动态背景和简洁的数字导航系统。

## 功能特性

- ✨ **艺术感动态背景**：粒子动画、渐变叠加、几何装饰
- 🎯 **数字导航系统**：使用 01、02、03 等数字标签切换作品
- 🎨 **黑色主题**：以黑色为主，配合微妙的动态元素，不会过于单调
- 📱 **响应式设计**：支持各种设备尺寸
- 🚀 **易于扩展**：可以轻松添加新的作品展示区域

## 文件结构

```
.
├── index.html      # 主页面
├── styles.css      # 样式文件
├── script.js       # JavaScript 功能
└── README.md       # 说明文档
```

## 使用方法

### 1. 添加作品

直接在 HTML 的 `work-gallery` 区域添加您的作品：

```html
<div class="work-gallery">
    <img src="your-work-1.jpg" alt="作品1">
    <img src="your-work-2.jpg" alt="作品2">
    <video src="your-work-3.mp4" controls></video>
</div>
```

### 2. 添加新的数字标签

#### 方法一：在 HTML 中添加

在 `nav-tabs` 中添加新的按钮：
```html
<button class="tab-item" data-section="04">04</button>
```

在 `content` 中添加对应的内容区域：
```html
<section class="work-section" id="section-04">
    <div class="work-content">
        <h2 class="work-title">Work 04</h2>
        <p class="work-description">描述</p>
        <div class="work-gallery">
            <!-- 您的作品 -->
        </div>
    </div>
</section>
```

#### 方法二：使用 JavaScript 函数

在浏览器控制台中执行：
```javascript
window.addNewWork(4);  // 添加 04
window.addNewWork(5);  // 添加 05
```

## 自定义样式

### 修改背景颜色

在 `styles.css` 中修改：
```css
.background {
    background: #000000;  /* 修改为您想要的颜色 */
}
```

### 调整粒子数量

在 `script.js` 中修改：
```javascript
this.particleCount = 80;  // 调整粒子数量
```

### 修改名字

在 `index.html` 中修改：
```html
<h1 class="name">Wilson</h1>  <!-- 修改为您的名字 -->
```

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 本地运行

1. 直接双击 `index.html` 打开
2. 或使用本地服务器：
   ```bash
   python -m http.server 8000
   ```
   然后访问 `http://localhost:8000`

## 部署

可以部署到：
- GitHub Pages
- Netlify
- Vercel
- 任何静态网站托管服务

## 后续开发建议

1. **图片懒加载**：如果作品很多，建议添加图片懒加载
2. **作品详情页**：点击作品可以查看大图或详情
3. **筛选功能**：可以按类型筛选作品
4. **动画效果**：为作品添加悬停动画
5. **SEO 优化**：添加 meta 标签和结构化数据
