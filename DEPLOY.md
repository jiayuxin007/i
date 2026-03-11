# 部署指南

## GitHub Pages 部署步骤

### 1. 准备GitHub仓库

1. 在GitHub上创建新仓库（或使用现有仓库）
2. 仓库名称建议：`italian-vocabulary` 或 `italian-word-practice`

### 2. 初始化Git仓库（如果还没有）

```bash
cd italian-vocabulary
git init
git add .
git commit -m "Initial commit: Italian vocabulary practice system"
```

### 3. 连接到GitHub仓库

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

### 4. 启用GitHub Pages

1. 进入GitHub仓库页面
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 部分：
   - 选择分支：`main`
   - 选择文件夹：`/ (root)`
5. 点击 **Save**（保存）

### 5. 访问你的网站

- GitHub会提供URL：`https://<username>.github.io/<repo-name>`
- 通常需要等待1-5分钟才能生效
- 如果显示404，等待几分钟后刷新

## 本地开发

### 方法一：使用Python（推荐）

```bash
# Python 3
python3 -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000
```

然后访问：http://localhost:8000

### 方法二：使用Node.js

```bash
# 安装 http-server（全局）
npm install -g http-server

# 运行
http-server -p 8000
```

### 方法三：使用VS Code Live Server

1. 安装 "Live Server" 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

## 注意事项

### ⚠️ 重要提示

1. **GitHub Pages会自动提供HTTPS**，这很好，因为：
   - 可以正常使用localStorage
   - 可以正常访问外部API（如Google Translate）

2. **数据存储**：
   - 所有数据存储在用户的浏览器localStorage中
   - 不同用户的数据完全独立
   - 清除浏览器数据会丢失所有进度

3. **API配置**：
   - 当前LLM API使用fallback方法（从同等级单词随机选择）
   - 如需使用真实API，需要在 `js/llm-api.js` 中配置密钥
   - **注意**：不要将API密钥提交到GitHub！

4. **文件大小**：
   - `italian.json` 文件可能较大
   - GitHub Pages有文件大小限制（100MB）
   - 如果文件太大，考虑压缩或使用CDN

## 更新部署

每次更新代码后：

```bash
git add .
git commit -m "Update: 描述你的更改"
git push origin main
```

GitHub Pages会自动重新部署，通常需要1-2分钟。

## 自定义域名（可选）

如果你想使用自定义域名：

1. 在仓库Settings > Pages中设置Custom domain
2. 在域名DNS中添加CNAME记录指向GitHub Pages
3. 参考GitHub官方文档：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## 故障排除

### 问题：页面显示404

- 等待几分钟后刷新
- 检查仓库Settings > Pages配置是否正确
- 确保 `index.html` 在根目录

### 问题：数据加载失败

- 确保使用HTTPS访问（GitHub Pages自动提供）
- 检查浏览器控制台错误信息
- 确保 `italian.json` 文件路径正确

### 问题：样式或功能不正常

- 清除浏览器缓存
- 检查浏览器控制台是否有JavaScript错误
- 确保所有文件都已正确上传到GitHub
