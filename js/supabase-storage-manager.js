// Supabase云端存储管理器 - 无需用户注册GitHub账号
class SupabaseStorageManager {
    constructor() {
        // Supabase配置 - 需要替换为你的项目配置
        // 获取方式：https://supabase.com -> 创建项目 -> Settings -> API
        this.supabaseUrl = 'https://kceflofawunwfrvfuwsv.supabase.co'; // 例如：https://xxxxx.supabase.co
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZWZsb2Zhd3Vud2ZydmZ1d3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjA1NjMsImV4cCI6MjA4NDQ5NjU2M30.REA2g4CEV7VMSbJ2d9HS0hL7_TxD30Dy_wZltIJPEtI'; // 匿名公钥，可以在浏览器中使用
        
        // 存储键名
        this.tableName = 'user_data'; // Supabase表名
    }

    // 检查是否已配置
    isConfigured() {
        return this.supabaseUrl !== 'YOUR_SUPABASE_URL' && 
               this.supabaseKey !== 'YOUR_SUPABASE_ANON_KEY' &&
               this.supabaseUrl.length > 0 && 
               this.supabaseKey.length > 0;
    }

    // 同步用户数据到云端（使用 UPSERT）
    async syncUserDataToCloud(username, userData) {
        if (!this.isConfigured()) {
            return { success: false, message: '云端同步未配置' };
        }

        try {
            const url = `${this.supabaseUrl}/rest/v1/${this.tableName}`;
            console.log('📡 发送请求到:', url);
            
            // 使用 UPSERT (INSERT ... ON CONFLICT UPDATE)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    username: username,
                    data: userData,
                    updated_at: new Date().toISOString()
                })
            });

            console.log('📥 响应状态:', response.status, response.statusText);

            if (response.ok || response.status === 201 || response.status === 204) {
                console.log('✅ 数据同步成功');
                return { success: true, message: '云端同步成功' };
            } else {
                // 如果记录已存在，尝试更新
                if (response.status === 409) {
                    console.log('⚠️ 记录已存在，尝试更新...');
                    return await this.updateUserDataInCloud(username, userData);
                }
                const errorText = await response.text();
                console.error('❌ 同步失败，响应内容:', errorText);
                let errorMessage = '云端同步失败';
                try {
                    const error = JSON.parse(errorText);
                    errorMessage = error.message || error.message_hint || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                return { success: false, message: errorMessage, status: response.status };
            }
        } catch (error) {
            console.error('❌ 网络错误:', error);
            return { success: false, message: '网络错误，请检查网络连接: ' + error.message };
        }
    }

    // 更新用户数据
    async updateUserDataInCloud(username, userData) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/${this.tableName}?username=eq.${encodeURIComponent(username)}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: userData,
                        updated_at: new Date().toISOString()
                    })
                }
            );

            if (response.ok || response.status === 204) {
                return { success: true, message: '云端同步成功' };
            } else {
                const errorText = await response.text();
                let errorMessage = '更新云端数据失败';
                try {
                    const error = JSON.parse(errorText);
                    errorMessage = error.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                return { success: false, message: errorMessage };
            }
        } catch (error) {
            console.error('更新云端数据失败:', error);
            return { success: false, message: '网络错误，请检查网络连接' };
        }
    }

    // 从云端获取用户数据
    async getUserDataFromCloud(username) {
        if (!this.isConfigured()) {
            return { success: false, message: '云端同步未配置' };
        }

        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/${this.tableName}?username=eq.${encodeURIComponent(username)}&select=*`,
                {
                    method: 'GET',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    return { success: true, data: data[0].data };
                } else {
                    return { success: false, message: '云端没有找到该用户的数据' };
                }
            } else {
                const error = await response.json();
                return { success: false, message: error.message || '获取云端数据失败' };
            }
        } catch (error) {
            console.error('获取云端数据失败:', error);
            return { success: false, message: '网络错误，请检查网络连接' };
        }
    }

    // 同步所有数据到云端（包括所有用户）
    async syncAllDataToCloud() {
        console.log('🔄 开始同步数据到云端...');
        console.log('📋 配置状态:', this.isConfigured());
        
        if (!this.isConfigured()) {
            console.error('❌ 云端同步未配置！');
            return { success: false, message: '云端同步未配置' };
        }

        try {
            const allUsers = userManager.getAllUsers();
            console.log('👥 用户数量:', Object.keys(allUsers).length);
            
            const allData = {
                users: allUsers,
                userProgress: {},
                userWrongWords: {}
            };

            // 收集所有用户的进度和错题本
            for (const user in allUsers) {
                const progressKey = `italian_vocabulary_progress_${user}`;
                const wrongWordsKey = `italian_vocabulary_wrong_words_${user}`;
                
                const progressData = localStorage.getItem(progressKey);
                const wrongWordsData = localStorage.getItem(wrongWordsKey);
                
                if (progressData) {
                    allData.userProgress[user] = JSON.parse(progressData);
                }
                if (wrongWordsData) {
                    allData.userWrongWords[user] = JSON.parse(wrongWordsData);
                }
            }

            console.log('📦 准备同步的数据:', {
                users: Object.keys(allData.users).length,
                progress: Object.keys(allData.userProgress).length,
                wrongWords: Object.keys(allData.userWrongWords).length
            });

            // 同步到云端（使用特殊用户名 '_all_users_' 存储所有数据）
            const result = await this.syncUserDataToCloud('_all_users_', allData);
            
            if (result.success) {
                console.log('✅ 云端同步成功！');
            } else {
                console.error('❌ 云端同步失败:', result.message);
            }
            
            return result;
        } catch (error) {
            console.error('❌ 同步所有数据失败:', error);
            return { success: false, message: '同步失败: ' + error.message };
        }
    }

    // 从云端恢复所有数据
    async restoreAllDataFromCloud() {
        console.log('📥 开始从云端恢复数据...');
        
        if (!this.isConfigured()) {
            console.error('❌ 云端同步未配置');
            return { success: false, message: '云端同步未配置' };
        }

        try {
            const result = await this.getUserDataFromCloud('_all_users_');
            if (!result.success) {
                console.error('❌ 获取云端数据失败:', result.message);
                return result;
            }

            const data = result.data;
            console.log('📦 获取到的云端数据:', {
                users: Object.keys(data.users || {}).length,
                progress: Object.keys(data.userProgress || {}).length,
                wrongWords: Object.keys(data.userWrongWords || {}).length
            });

            // 恢复用户数据（使用云端数据，因为云端是最新的）
            if (data.users) {
                const localUsers = userManager.getAllUsers();
                const cloudUsers = data.users;
                
                // 合并策略：云端优先，但保留本地新注册的用户（如果本地有而云端没有）
                const mergedUsers = { ...cloudUsers };
                for (const user in localUsers) {
                    if (!cloudUsers[user]) {
                        // 本地有但云端没有的用户，保留本地数据
                        mergedUsers[user] = localUsers[user];
                        console.log(`📝 保留本地新用户: ${user}`);
                    }
                }
                
                await userManager.saveAllUsers(mergedUsers);
                console.log('✅ 用户数据已恢复');
                console.log(`   云端用户数: ${Object.keys(cloudUsers).length}`);
                console.log(`   本地用户数: ${Object.keys(localUsers).length}`);
                console.log(`   合并后用户数: ${Object.keys(mergedUsers).length}`);
            }

            // 恢复进度数据（完全覆盖本地）
            if (data.userProgress) {
                let restoredCount = 0;
                for (const user in data.userProgress) {
                    const progressKey = `italian_vocabulary_progress_${user}`;
                    localStorage.setItem(progressKey, JSON.stringify(data.userProgress[user]));
                    restoredCount++;
                }
                console.log(`✅ 已恢复 ${restoredCount} 个用户的学习进度`);
            }

            // 恢复错题本数据（完全覆盖本地）
            if (data.userWrongWords) {
                let restoredCount = 0;
                for (const user in data.userWrongWords) {
                    const wrongWordsKey = `italian_vocabulary_wrong_words_${user}`;
                    localStorage.setItem(wrongWordsKey, JSON.stringify(data.userWrongWords[user]));
                    restoredCount++;
                }
                console.log(`✅ 已恢复 ${restoredCount} 个用户的错题本`);
            }

            console.log('✅ 云端数据恢复成功！');
            return { success: true, message: '云端数据恢复成功' };
        } catch (error) {
            console.error('❌ 恢复云端数据失败:', error);
            return { success: false, message: '恢复失败: ' + error.message };
        }
    }
}

// 创建全局实例
const supabaseStorageManager = new SupabaseStorageManager();
