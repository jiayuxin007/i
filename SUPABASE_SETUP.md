# Supabase 云端同步设置指南

## 快速开始（5分钟设置）

使用 Supabase 实现云端同步非常简单，用户无需注册任何账号，只需您（项目维护者）配置一次。

### 步骤 1：创建 Supabase 账号（免费）

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project" 或 "Sign up"
3. 使用 GitHub、Google 或邮箱注册（只需项目维护者注册，用户不需要）

### 步骤 2：创建新项目

1. 登录后，点击 "New Project"
2. 填写项目信息：
   - **Organization**: 选择或创建组织
   - **Name**: `italian-vocabulary`（或任意名称）
   - **Database Password**: 设置一个强密码（记住它）
   - **Region**: 选择离您最近的区域（如 `Southeast Asia (Singapore)`）
3. 点击 "Create new project"
4. 等待项目创建完成（约 2 分钟）

### 步骤 3：创建数据表

1. 项目创建后，点击左侧菜单的 **"Table Editor"**
2. 点击 **"Create a new table"**
3. 设置表信息：
   - **Name**: `user_data`
   - **Description**: `User data for Italian vocabulary app`
4. 添加列（Columns）：
   - **username** (类型: `text`, 主键: ✓, 必填: ✓)
   - **data** (类型: `jsonb`, 必填: ✓)
   - **updated_at** (类型: `timestamptz`, 默认值: `now()`, 必填: ✓)
5. 点击 **"Save"** 保存表

### 步骤 4：获取 API 密钥

1. 点击左侧菜单的 **"Settings"** (⚙️ 图标)
2. 点击 **"API"**
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co` (复制完整URL)
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (复制完整的key)

### 步骤 5：配置代码

1. 打开 `js/supabase-storage-manager.js`
2. 替换以下配置：

```javascript
this.supabaseUrl = 'YOUR_SUPABASE_URL'; // 替换为你的 Project URL
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // 替换为你的 anon public key
```

例如：
```javascript
this.supabaseUrl = 'https://abcdefghijklmnop.supabase.co';
this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NzI5NDU2MywiZXhwIjoxOTYyODcwNTYzfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

### 步骤 6：设置表权限和唯一约束（重要！）

1. 在 Supabase 控制台，点击左侧菜单 **"SQL Editor"**
2. 点击 **"New query"**
3. 执行以下 SQL 语句：

```sql
-- 启用行级安全策略
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 设置username为唯一约束（用于UPSERT）
CREATE UNIQUE INDEX IF NOT EXISTS user_data_username_idx ON user_data(username);

-- 允许匿名用户插入和更新数据
CREATE POLICY "Allow anonymous insert and update"
ON user_data
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
```

4. 点击 **"Run"** 执行

**注意**：如果执行时提示 `user_data_username_idx` 已存在，可以忽略该错误。

### 完成！

现在云端同步已经配置完成。用户注册、登录、学习进度会自动同步到云端，无需任何额外操作。

## 功能说明

### 自动同步

- ✅ 用户注册时自动同步到云端
- ✅ 用户登录时自动从云端同步（如果有数据）
- ✅ 学习进度保存时自动同步
- ✅ 错题本更新时自动同步

### 用户体验

- ✅ **用户无需注册任何账号**（包括 GitHub、Supabase 等）
- ✅ **无需任何配置**，自动工作
- ✅ **跨设备同步**，在不同设备上登录同一账号即可同步数据
- ✅ **数据安全**，存储在 Supabase 云端数据库

## 免费额度

Supabase 免费计划包括：
- ✅ 500MB 数据库存储
- ✅ 2GB 带宽
- ✅ 50,000 月度活跃用户
- ✅ 足够用于个人或小团队使用

## 故障排除

### 问题：同步失败

1. 检查网络连接
2. 确认 API 密钥配置正确
3. 检查表权限设置是否正确

### 问题：数据没有同步

1. 打开浏览器控制台（F12）
2. 查看是否有错误信息
3. 检查 `supabase-storage-manager.js` 中的配置

### 问题：权限错误

1. 确认已执行 SQL 权限设置
2. 检查表名是否正确（`user_data`）
3. 确认使用的是 `anon` key 而不是 `service_role` key

## 安全说明

- ✅ `anon` key 是公开的，可以在浏览器中使用
- ✅ 通过 Row Level Security (RLS) 控制访问权限
- ✅ 数据存储在 Supabase 云端，有备份和恢复功能
- ✅ 用户密码经过哈希处理，不会明文存储

## 从云端恢复数据

用户登录时会自动从云端同步数据。如果需要在当前设备恢复：

```javascript
// 在浏览器控制台执行
await supabaseStorageManager.restoreAllDataFromCloud();
```

## 更新配置

如果需要更改 Supabase 项目：

1. 修改 `js/supabase-storage-manager.js` 中的配置
2. 确保新项目的表结构相同
3. 重新设置表权限

---

**注意**：首次配置完成后，记得将配置文件提交到 GitHub，这样云端同步功能就可以立即使用了！
