// 用户管理模块
class UserManager {
    constructor() {
        this.usersKey = 'italian_vocabulary_users';
        this.currentUserKey = 'italian_vocabulary_current_user';
    }

    // 获取所有用户
    getAllUsers() {
        try {
            const data = localStorage.getItem(this.usersKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('读取用户数据失败:', error);
            return {};
        }
    }

    // 保存所有用户
    async saveAllUsers(users) {
        try {
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            
            // 如果配置了Supabase云端同步，自动同步到云端
            if (typeof supabaseStorageManager !== 'undefined' && supabaseStorageManager.isConfigured()) {
                try {
                    await supabaseStorageManager.syncAllDataToCloud();
                } catch (error) {
                    console.warn('云端同步失败（用户数据已保存到本地）:', error);
                }
            }
            
            // 如果启用了GitHub云端同步，自动同步到云端
            if (typeof cloudStorageManager !== 'undefined' && cloudStorageManager.isCloudSyncEnabled()) {
                try {
                    await cloudStorageManager.syncToCloud();
                } catch (error) {
                    console.warn('云端同步失败（用户数据已保存到本地）:', error);
                }
            }
            
            return true;
        } catch (error) {
            console.error('保存用户数据失败:', error);
            return false;
        }
    }

    // 检查用户名是否存在
    isUsernameExists(username) {
        const users = this.getAllUsers();
        return users.hasOwnProperty(username);
    }

    // 注册新用户
    async register(username, password) {
        // 验证用户名
        if (!username || username.trim().length === 0) {
            return { success: false, message: '用户名不能为空' };
        }

        if (username.length < 3) {
            return { success: false, message: '用户名至少需要3个字符' };
        }

        // 检查用户名是否已存在
        if (this.isUsernameExists(username)) {
            return { success: false, message: '用户名已存在，请选择其他用户名' };
        }

        // 验证密码
        if (!password || password.length < 6) {
            return { success: false, message: '密码至少需要6个字符' };
        }

        // 保存用户（密码使用简单哈希，实际应用中应使用更安全的方法）
        const users = this.getAllUsers();
        users[username] = {
            password: this.hashPassword(password),
            createdAt: new Date().toISOString()
        };

        if (await this.saveAllUsers(users)) {
            // 自动登录
            this.setCurrentUser(username);
            return { success: true, message: '注册成功' };
        } else {
            return { success: false, message: '注册失败，请重试' };
        }
    }

    // 登录
    async login(username, password) {
        if (!username || !password) {
            return { success: false, message: '请输入用户名和密码' };
        }

        const users = this.getAllUsers();
        
        if (!users.hasOwnProperty(username)) {
            return { success: false, message: '用户名不存在' };
        }

        const hashedPassword = this.hashPassword(password);
        if (users[username].password !== hashedPassword) {
            return { success: false, message: '密码错误' };
        }

        // 设置当前用户
        await this.setCurrentUser(username);
        return { success: true, message: '登录成功' };
    }

    // 设置当前登录用户
    async setCurrentUser(username) {
        try {
            localStorage.setItem(this.currentUserKey, username);
            
            // 如果配置了Supabase云端同步，自动同步到云端
            if (typeof supabaseStorageManager !== 'undefined' && supabaseStorageManager.isConfigured()) {
                try {
                    await supabaseStorageManager.syncAllDataToCloud();
                } catch (error) {
                    console.warn('云端同步失败（当前用户已保存到本地）:', error);
                }
            }
            
            // 如果启用了GitHub云端同步，自动同步到云端
            if (typeof cloudStorageManager !== 'undefined' && cloudStorageManager.isCloudSyncEnabled()) {
                try {
                    await cloudStorageManager.syncToCloud();
                } catch (error) {
                    console.warn('云端同步失败（当前用户已保存到本地）:', error);
                }
            }
            
            return true;
        } catch (error) {
            console.error('设置当前用户失败:', error);
            return false;
        }
    }

    // 获取当前登录用户
    getCurrentUser() {
        try {
            return localStorage.getItem(this.currentUserKey);
        } catch (error) {
            console.error('获取当前用户失败:', error);
            return null;
        }
    }

    // 登出
    logout() {
        try {
            localStorage.removeItem(this.currentUserKey);
            return true;
        } catch (error) {
            console.error('登出失败:', error);
            return false;
        }
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // 简单的密码哈希（实际应用中应使用更安全的方法）
    hashPassword(password) {
        // 简单的哈希函数，仅用于演示
        // 实际应用中应使用 bcrypt 等安全方法
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    // 获取用户特定的存储键
    getUserStorageKey(baseKey) {
        const username = this.getCurrentUser();
        if (!username) {
            return null;
        }
        return `${baseKey}_${username}`;
    }
}

// 创建全局实例
const userManager = new UserManager();
