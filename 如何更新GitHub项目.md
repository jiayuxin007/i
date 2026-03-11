# 如何更新 GitHub 项目

## 📋 前提条件

### 1. 安装 Git

如果您的电脑上还没有安装 Git：

**Windows 用户：**
1. 访问：https://git-scm.com/download/win
2. 下载 Git for Windows
3. 运行安装程序，全部选择默认选项即可
4. 安装完成后，重启命令行工具

**验证安装：**
打开 PowerShell 或 CMD，输入：
```bash
git --version
```
如果显示版本号（如 `git version 2.x.x`），说明安装成功。

---

## 🚀 更新 GitHub 项目的步骤

### 方法一：使用命令行（推荐）

#### 第一步：打开项目目录

1. 打开 PowerShell 或 CMD
2. 进入项目目录：
   ```bash
   cd "C:\Users\Jia Yuxin\italian-vocabulary"
   ```
   或者直接在该文件夹中右键点击，选择 **"Git Bash Here"** 或 **"Open in Terminal"**

#### 第二步：检查 Git 状态

```bash
git status
```

这会显示：
- 哪些文件被修改了（modified）
- 哪些文件是新添加的（untracked）
- 哪些文件已暂存（staged）

#### 第三步：添加文件到暂存区

**添加所有修改的文件：**
```bash
git add .
```

**或者添加特定文件：**
```bash
git add js/supabase-storage-manager.js
git add "开发者设置指南.md"
```

#### 第四步：提交更改

```bash
git commit -m "添加Supabase云端同步功能"
```

**提交信息说明：**
- `-m` 后面是提交的说明信息
- 建议使用清晰的中文或英文描述本次更改
- 例如：
  - `"添加Supabase云端同步功能"`
  - `"更新README，添加云端同步说明"`
  - `"修复用户登录bug"`

#### 第五步：推送到 GitHub

**如果这是第一次推送：**
```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

**如果已经连接过远程仓库：**
```bash
git push
```

或者：
```bash
git push origin main
```

---

## 📝 完整示例

假设您刚刚完成了 Supabase 配置，想要更新 GitHub：

```bash
# 1. 进入项目目录
cd "C:\Users\Jia Yuxin\italian-vocabulary"

# 2. 查看更改状态
git status

# 3. 添加所有更改
git add .

# 4. 提交更改
git commit -m "添加Supabase云端同步功能和详细设置指南"

# 5. 推送到GitHub
git push
```

---

## 🔄 常见操作

### 查看更改内容

在提交前，查看具体改了什么：
```bash
git diff
```

### 撤销未暂存的更改

如果改错了，想恢复文件：
```bash
git checkout -- 文件名
```

例如：
```bash
git checkout -- js/supabase-storage-manager.js
```

### 撤销已暂存的文件

```bash
git reset HEAD 文件名
```

### 查看提交历史

```bash
git log
```

按 `q` 键退出日志查看。

### 拉取远程更新

如果 GitHub 上的代码有更新（比如在网页上直接修改了），需要先拉取：
```bash
git pull
```

---

## 🆕 首次设置 Git 仓库

如果这个项目还没有初始化 Git：

### 第一步：初始化仓库

```bash
cd "C:\Users\Jia Yuxin\italian-vocabulary"
git init
```

### 第二步：配置用户信息（仅首次需要）

```bash
git config --global user.name "您的名字"
git config --global user.email "您的邮箱@example.com"
```

### 第三步：添加所有文件

```bash
git add .
```

### 第四步：首次提交

```bash
git commit -m "Initial commit: 意大利语单词练习系统"
```

### 第五步：连接 GitHub 仓库

**如果还没有创建 GitHub 仓库：**
1. 访问 https://github.com
2. 点击右上角的 "+" → "New repository"
3. 填写仓库名称（如：`italian-vocabulary`）
4. 选择 Public 或 Private
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

**连接本地仓库到 GitHub：**
```bash
git remote add origin https://github.com/您的用户名/italian-vocabulary.git
git branch -M main
git push -u origin main
```

---

## 🎯 推荐的工作流程

### 每次更新代码时：

1. **查看状态**：`git status`
2. **添加文件**：`git add .` 或 `git add 文件名`
3. **提交更改**：`git commit -m "描述信息"`
4. **推送到GitHub**：`git push`

### 每日开始工作前：

1. **拉取最新代码**：`git pull`
2. 然后开始工作

---

## ⚠️ 常见问题

### 问题1：`git push` 提示需要身份验证

**解决方法：**
1. GitHub 现在要求使用 Personal Access Token（个人访问令牌）
2. 访问：https://github.com/settings/tokens
3. 点击 "Generate new token (classic)"
4. 给 token 起个名字（如：`My Computer`）
5. 选择权限：至少勾选 `repo`
6. 点击 "Generate token"
7. **复制生成的 token**（只显示一次！）
8. 推送时，密码输入框输入这个 token

**或者使用 GitHub Desktop（更简单）：**

### 问题2：冲突（Conflict）

如果提示冲突：
```bash
# 查看冲突文件
git status

# 手动解决冲突后
git add .
git commit -m "解决冲突"
git push
```

### 问题3：想撤销最后一次提交

```bash
# 撤销提交，但保留更改
git reset --soft HEAD~1

# 或者完全撤销
git reset --hard HEAD~1
```

---

## 🖥️ 方法二：使用 GitHub Desktop（更简单）

如果觉得命令行太复杂，可以使用图形界面工具：

### 安装 GitHub Desktop

1. 访问：https://desktop.github.com
2. 下载并安装 GitHub Desktop
3. 用 GitHub 账号登录

### 使用步骤

1. **打开 GitHub Desktop**
2. **添加本地仓库**：
   - File → Add Local Repository
   - 选择项目文件夹
3. **提交更改**：
   - 左侧显示更改的文件
   - 填写提交信息（左下角）
   - 点击 "Commit to main"
4. **推送到 GitHub**：
   - 点击 "Push origin" 按钮

---

## 📌 本次更新需要添加的文件

完成 Supabase 配置后，通常需要更新以下文件：

- ✅ `js/supabase-storage-manager.js` - Supabase 配置（**重要：记得替换API密钥**）
- ✅ `开发者设置指南.md` - 开发者设置文档
- ✅ `SUPABASE_SETUP.md` - 快速设置指南
- ✅ `README.md` - 更新的说明文档
- ✅ `js/user-manager.js` - 更新的用户管理代码
- ✅ `js/storage-manager.js` - 更新的存储管理代码
- ✅ `login.html` - 更新的登录页面

**注意：** `js/supabase-storage-manager.js` 中如果包含了真实的 API 密钥，建议：
1. 先测试确认功能正常
2. 提交到 GitHub（因为 `anon` key 是公开的，可以暴露）
3. 或者创建 `.gitignore` 文件来忽略敏感信息

---

## 🔒 保护敏感信息（可选）

如果不想将 API 密钥提交到 GitHub：

### 创建 .gitignore 文件

在项目根目录创建 `.gitignore` 文件：
```
# Supabase 配置（如果包含敏感信息）
js/supabase-storage-manager.js
```

但在这个项目中，由于使用的是 `anon public key`（公开密钥），可以安全地提交到 GitHub。

---

## ✅ 验证更新成功

更新后，访问您的 GitHub 仓库页面：
```
https://github.com/您的用户名/仓库名
```

应该能看到：
- ✅ 最新的提交记录
- ✅ 更新的文件
- ✅ 如果启用了 GitHub Pages，网站也会自动更新

---

**需要帮助？** 如果遇到问题，可以：
1. 查看错误信息
2. 搜索解决方案（错误信息 + GitHub）
3. 查看 Git 文档：https://git-scm.com/doc
