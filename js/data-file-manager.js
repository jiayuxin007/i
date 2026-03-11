// 数据文件管理器 - 用于导出和导入用户数据
class DataFileManager {
    constructor() {
        this.filename = 'italian-vocabulary-data.json';
    }

    // 导出所有数据到JSON文件
    exportAllData() {
        try {
            const allData = {
                users: userManager.getAllUsers(),
                currentUser: userManager.getCurrentUser(),
                userProgress: {},
                userWrongWords: {},
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            // 获取所有用户的进度和错题本数据
            const users = userManager.getAllUsers();
            for (const user in users) {
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

            // 创建JSON字符串
            const jsonString = JSON.stringify(allData, null, 2);
            
            // 创建Blob对象
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.filename;
            document.body.appendChild(link);
            link.click();
            
            // 清理
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return { success: true, message: '数据导出成功' };
        } catch (error) {
            console.error('导出数据失败:', error);
            return { success: false, message: '导出数据失败: ' + error.message };
        }
    }

    // 从JSON文件导入数据
    async importData(file) {
        try {
            // 读取文件内容
            const text = await this.readFileAsText(file);
            const data = JSON.parse(text);

            // 验证数据格式
            if (!this.validateDataFormat(data)) {
                return { success: false, message: '数据格式不正确，请确保这是有效的备份文件' };
            }

            // 导入用户数据
            if (data.users) {
                // 合并用户数据（保留现有用户，添加新用户）
                const existingUsers = userManager.getAllUsers();
                const mergedUsers = { ...existingUsers, ...data.users };
                await userManager.saveAllUsers(mergedUsers);
            }

            // 导入当前用户（如果存在）
            if (data.currentUser && userManager.isUsernameExists(data.currentUser)) {
                await userManager.setCurrentUser(data.currentUser);
            }

            // 导入进度数据
            if (data.userProgress) {
                for (const user in data.userProgress) {
                    const progressKey = `italian_vocabulary_progress_${user}`;
                    localStorage.setItem(progressKey, JSON.stringify(data.userProgress[user]));
                }
            }

            // 导入错题本数据
            if (data.userWrongWords) {
                for (const user in data.userWrongWords) {
                    const wrongWordsKey = `italian_vocabulary_wrong_words_${user}`;
                    localStorage.setItem(wrongWordsKey, JSON.stringify(data.userWrongWords[user]));
                }
            }

            return { success: true, message: '数据导入成功' };
        } catch (error) {
            console.error('导入数据失败:', error);
            return { success: false, message: '导入数据失败: ' + error.message };
        }
    }

    // 读取文件为文本
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }

    // 验证数据格式
    validateDataFormat(data) {
        // 检查基本结构
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // 检查版本信息（可选）
        if (data.version) {
            // 可以在这里添加版本兼容性检查
        }

        return true;
    }

    // 自动保存数据到文件（在注册/登录时调用）
    async autoSave() {
        try {
            const result = this.exportAllData();
            if (result.success) {
                console.log('数据已自动导出');
            }
            return result;
        } catch (error) {
            console.warn('自动导出失败:', error);
            return { success: false, message: error.message };
        }
    }
}

// 创建全局实例
const dataFileManager = new DataFileManager();
