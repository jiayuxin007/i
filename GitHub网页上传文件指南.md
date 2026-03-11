# GitHub 网页上传文件指南

## ✅ 完全可以！这是最简单的方法

您可以直接在 GitHub 网页上手动上传所有文件，不需要安装 Git 或使用命令行。

---

## 🚀 方法一：创建新仓库并上传文件

### 第一步：创建新仓库

1. **访问 GitHub**：https://github.com
2. **登录您的账号**
3. **点击右上角的 "+" 号** → **"New repository"**（新建仓库）
4. **填写仓库信息**：
   - **Repository name**（仓库名称）：`italian-vocabulary`
   - **Description**（描述，可选）：`意大利语单词练习系统`
   - **选择 Public**（公开）或 **Private**（私有）
   - ⚠️ **不要勾选** "Initialize this repository with a README"
5. **点击 "Create repository"**（创建仓库）

### 第二步：上传文件

创建仓库后，会看到一个上传文件的页面。如果没有看到，点击 **"uploading an existing file"**（上传现有文件）链接。

#### 上传单个文件：

1. **拖拽文件**到页面上，或者点击 **"choose your files"**（选择文件）
2. **选择文件**并上传
3. **填写提交信息**（Commit message）：例如 `Initial commit: 上传所有文件`
4. **点击 "Commit changes"**（提交更改）

#### 上传文件夹（推荐）：

⚠️ **注意**：GitHub 网页不支持直接上传文件夹，需要逐个上传文件。但您可以：

**方法 A：使用拖拽（一次性多个文件）**
1. 打开文件资源管理器（Windows 资源管理器）
2. 进入项目文件夹：`C:\Users\Jia Yuxin\italian-vocabulary`
3. **选中多个文件**（按住 Ctrl 键点击，或按 Ctrl+A 全选）
4. **拖拽到 GitHub 网页**的上传区域
5. 填写提交信息
6. 点击 "Commit changes"

**方法 B：逐个上传（如果拖拽不工作）**
- 需要逐个文件上传，比较繁琐
- 建议优先尝试方法 A

---

## 📂 推荐的上传顺序

为了避免遗漏文件，建议按照以下顺序上传：

### 第一轮：核心 HTML 文件

- `index.html`
- `login.html`
- `a1.html`
- `a2.html`
- `b1.html`
- `b2.html`
- `test.html`
- `all-words.html`
- `wrong-words.html`
- `word-detail.html`

### 第二轮：JavaScript 文件（js 文件夹）

在 GitHub 上创建 `js` 文件夹：
1. 在仓库页面，点击 **"Create new file"**（创建新文件）
2. 输入文件名：`js/文件名.js`（例如：`js/user-manager.js`）
3. 复制文件内容并粘贴
4. 提交文件

或者：
1. 先创建空文件夹：输入 `js/README.md`（创建后会生成 js 文件夹）
2. 然后逐个上传 js 文件夹中的文件

**需要上传的 JS 文件：**
- `js/user-manager.js`
- `js/storage-manager.js`
- `js/supabase-storage-manager.js`
- `js/cloud-storage-manager.js`
- `js/data-file-manager.js`
- `js/vocabulary-data.js`
- `js/test-controller.js`
- `js/all-words-controller.js`
- `js/wrong-words-controller.js`
- `js/word-detail-controller.js`
- `js/translation-helper.js`
- `js/llm-api.js`

### 第三轮：数据文件

创建 `source_italiano` 文件夹，上传：
- `source_italiano/italian.json`

### 第四轮：配置文件

- `README.md`
- `DEPLOY.md`
- `SUPABASE_SETUP.md`
- `开发者设置指南.md`
- `如何更新GitHub项目.md`
- `快速解决Git问题.md`
- `GitHub网页上传文件指南.md`（本文件）

### 第五轮：启动脚本（可选）

- `start-server.bat`
- `start-server.ps1`

---

## 🎯 快速上传方法：拖拽多文件

**最简单的方法：**

1. **打开文件资源管理器**（Windows）
2. **进入项目目录**：`C:\Users\Jia Yuxin\italian-vocabulary`
3. **全选所有文件**（按 `Ctrl+A`）
4. **拖拽到 GitHub 网页**：
   - 打开 GitHub 仓库页面
   - 点击 "uploading an existing file" 或 "Add file" → "Upload files"
   - 将文件拖拽到上传区域
5. **填写提交信息**：`Initial commit: 上传所有项目文件`
6. **点击 "Commit changes"**

**注意**：如果文件很多，可能需要分几次上传。

---

## 📝 重要提示

### 关于 Supabase 配置

**重要**：上传 `js/supabase-storage-manager.js` 前：

1. **检查是否已配置 API 密钥**：
   - 打开 `js/supabase-storage-manager.js`
   - 检查第 6-7 行是否还是默认值：
     ```javascript
     this.supabaseUrl = 'YOUR_SUPABASE_URL';
     this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
     ```

2. **如果还是默认值**：
   - 建议先完成 Supabase 配置（参考 `开发者设置指南.md`）
   - 或者先上传未配置的文件，稍后通过 GitHub 网页编辑功能更新

3. **如果已配置**：
   - 可以直接上传（`anon` key 是公开的，可以安全提交）

### 编辑已上传的文件

如果上传后发现需要修改文件：

1. **在 GitHub 仓库页面**，点击要修改的文件
2. **点击右上角的铅笔图标** ✏️（Edit this file）
3. **修改内容**
4. **填写提交信息**
5. **点击 "Commit changes"**

---

## ✅ 验证上传是否成功

上传完成后，检查：

1. **仓库页面应该显示所有文件**
2. **文件结构应该和本地一致**：
   ```
   italian-vocabulary/
   ├── index.html
   ├── login.html
   ├── js/
   │   ├── user-manager.js
   │   └── ...
   ├── source_italiano/
   │   └── italian.json
   └── ...
   ```
3. **可以点击文件查看内容是否正确**

---

## 🔄 后续更新文件

### 更新现有文件：

1. **打开仓库页面**
2. **点击要更新的文件**
3. **点击右上角的铅笔图标** ✏️
4. **修改内容**（可以复制本地文件内容粘贴）
5. **填写提交信息**（如：`更新Supabase配置`）
6. **点击 "Commit changes"**

### 添加新文件：

1. **点击 "Add file"** → **"Create new file"**
2. **输入文件名**（如果有文件夹，输入 `文件夹名/文件名`）
3. **粘贴文件内容**
4. **填写提交信息**
5. **点击 "Commit new file"**

### 删除文件：

1. **打开文件**
2. **点击右上角的垃圾桶图标** 🗑️
3. **填写提交信息**
4. **点击 "Commit changes"**

---

## ⚠️ 注意事项

### 文件大小限制

- GitHub 单个文件限制：**100MB**
- 推荐单个文件不超过 **50MB**
- `italian.json` 如果太大，可能需要压缩或优化

### 文件数量

- 如果文件很多（超过 100 个），建议：
  1. 分批上传（每次上传一部分）
  2. 或者使用 Git（更高效）

### 中文文件名

- GitHub 支持中文文件名，但建议：
  - 文档文件可以使用中文（如 `README.md`）
  - 代码文件建议使用英文（如 `user-manager.js`）

---

## 🆚 对比：网页上传 vs Git

| 特性 | GitHub 网页上传 | Git 命令行 |
|------|----------------|-----------|
| 难度 | ⭐ 非常简单 | ⭐⭐⭐ 需要学习 |
| 速度 | ⚠️ 较慢（需要逐个操作） | ✅ 很快（批量操作） |
| 适合 | ✅ 一次性上传 | ✅ 频繁更新 |
| 需要安装 | ❌ 不需要 | ✅ 需要安装 Git |

**建议**：
- ✅ **首次上传**：使用网页上传（简单直接）
- ✅ **后续更新**：学习使用 Git 或 GitHub Desktop（更高效）

---

## 📚 下一步

上传完成后：

1. **启用 GitHub Pages**：
   - 仓库设置 → Pages
   - Source 选择 `main` 分支
   - 保存后等待几分钟
   - 访问：`https://您的用户名.github.io/italian-vocabulary`

2. **配置 Supabase**（如果还没配置）：
   - 参考 `开发者设置指南.md`
   - 更新 `js/supabase-storage-manager.js`

3. **测试网站**：
   - 访问 GitHub Pages 地址
   - 测试注册、登录、云端同步功能

---

## 💡 小技巧

### 快速复制文件内容

1. 在本地用记事本或 VS Code 打开文件
2. 全选（`Ctrl+A`）并复制（`Ctrl+C`）
3. 在 GitHub 编辑器中粘贴（`Ctrl+V`）

### 批量上传技巧

如果文件很多：
1. **先上传重要的文件**（HTML、核心 JS）
2. **测试网站是否正常运行**
3. **再上传其他文件**（文档、脚本等）

### 保留文件夹结构

在 GitHub 上创建文件夹的方法：
- 输入文件名时：`文件夹名/文件名`（会自动创建文件夹）
- 或者先上传一个文件到该文件夹

---

## ✅ 完成！

通过网页上传文件是完全可行的方法，特别适合：
- ✅ 不熟悉命令行的用户
- ✅ 一次性上传项目
- ✅ 简单的文件更新

**如果需要频繁更新，建议学习 Git**，但网页上传永远是一个可靠的备选方案！
