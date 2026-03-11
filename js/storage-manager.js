// 本地存储管理模块 - 用于记录已完成的单词和错题本（与用户关联）
class StorageManager {
    constructor() {
        this.baseProgressKey = 'italian_vocabulary_progress';
        this.baseWrongWordsKey = 'italian_vocabulary_wrong_words';
    }

    // 获取当前用户的存储键
    getStorageKey(baseKey) {
        if (typeof userManager !== 'undefined' && userManager.isLoggedIn()) {
            const username = userManager.getCurrentUser();
            return `${baseKey}_${username}`;
        }
        // 如果没有登录，返回null（不应该发生）
        console.warn('尝试访问存储，但用户未登录');
        return null;
    }

    // 获取所有等级的进度数据
    getAllProgress() {
        const storageKey = this.getStorageKey(this.baseProgressKey);
        if (!storageKey) return this.getDefaultProgress();
        
        try {
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : this.getDefaultProgress();
        } catch (error) {
            console.error('读取进度数据失败:', error);
            return this.getDefaultProgress();
        }
    }

    // 获取默认进度结构
    getDefaultProgress() {
        return {
            'A1': [],
            'A2': [],
            'B1': [],
            'B2': []
        };
    }

    // 获取指定等级的已完成单词列表
    getCompletedWords(level) {
        const allProgress = this.getAllProgress();
        return allProgress[level] || [];
    }

    // 标记单词为已完成
    async markWordCompleted(level, word) {
        try {
            const allProgress = this.getAllProgress();
            if (!allProgress[level]) {
                allProgress[level] = [];
            }
            
            // 如果单词不在列表中，则添加
            if (!allProgress[level].includes(word)) {
                allProgress[level].push(word);
                const storageKey = this.getStorageKey(this.baseProgressKey);
                if (storageKey) {
                    localStorage.setItem(storageKey, JSON.stringify(allProgress));
                    
                    // 如果配置了Supabase云端同步，自动同步到云端
                    if (typeof supabaseStorageManager !== 'undefined' && supabaseStorageManager.isConfigured()) {
                        try {
                            await supabaseStorageManager.syncAllDataToCloud();
                        } catch (error) {
                            console.warn('云端同步失败（进度已保存到本地）:', error);
                        }
                    }
                    
                    // 如果启用了GitHub云端同步，自动同步到云端
                    if (typeof cloudStorageManager !== 'undefined' && cloudStorageManager.isCloudSyncEnabled()) {
                        try {
                            await cloudStorageManager.syncToCloud();
                        } catch (error) {
                            console.warn('云端同步失败（进度已保存到本地）:', error);
                        }
                    }
                }
            }
            return true;
        } catch (error) {
            console.error('保存进度失败:', error);
            return false;
        }
    }

    // 批量标记单词为已完成
    async markWordsCompleted(level, words) {
        try {
            const allProgress = this.getAllProgress();
            if (!allProgress[level]) {
                allProgress[level] = [];
            }
            
            words.forEach(word => {
                if (!allProgress[level].includes(word)) {
                    allProgress[level].push(word);
                }
            });
            
            const storageKey = this.getStorageKey(this.baseProgressKey);
            if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify(allProgress));
                
                    // 如果配置了Supabase云端同步，自动同步到云端
                    if (typeof supabaseStorageManager !== 'undefined' && supabaseStorageManager.isConfigured()) {
                        try {
                            await supabaseStorageManager.syncAllDataToCloud();
                        } catch (error) {
                            console.warn('云端同步失败（进度已保存到本地）:', error);
                        }
                    }
                    
                    // 如果启用了GitHub云端同步，自动同步到云端
                    if (typeof cloudStorageManager !== 'undefined' && cloudStorageManager.isCloudSyncEnabled()) {
                        try {
                            await cloudStorageManager.syncToCloud();
                        } catch (error) {
                            console.warn('云端同步失败（进度已保存到本地）:', error);
                        }
                    }
            }
            return true;
        } catch (error) {
            console.error('批量保存进度失败:', error);
            return false;
        }
    }

    // 检查单词是否已完成
    isWordCompleted(level, word) {
        const completedWords = this.getCompletedWords(level);
        return completedWords.includes(word);
    }

    // 获取指定等级的完成统计
    getProgressStats(level) {
        const completedWords = this.getCompletedWords(level);
        return {
            completed: completedWords.length,
            completedWords: completedWords
        };
    }

    // 清除指定等级的进度
    clearProgress(level) {
        try {
            const allProgress = this.getAllProgress();
            allProgress[level] = [];
            const storageKey = this.getStorageKey(this.baseProgressKey);
            if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify(allProgress));
            }
            return true;
        } catch (error) {
            console.error('清除进度失败:', error);
            return false;
        }
    }

    // 清除所有进度
    clearAllProgress() {
        try {
            const storageKey = this.getStorageKey(this.baseProgressKey);
            if (storageKey) {
                localStorage.removeItem(storageKey);
            }
            return true;
        } catch (error) {
            console.error('清除所有进度失败:', error);
            return false;
        }
    }

    // ========== 错题本相关方法 ==========

    // 获取所有等级的错题本数据
    getAllWrongWords() {
        const storageKey = this.getStorageKey(this.baseWrongWordsKey);
        if (!storageKey) return this.getDefaultWrongWords();
        
        try {
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : this.getDefaultWrongWords();
        } catch (error) {
            console.error('读取错题本数据失败:', error);
            return this.getDefaultWrongWords();
        }
    }

    // 获取默认错题本结构
    getDefaultWrongWords() {
        return {
            'A1': [],
            'A2': [],
            'B1': [],
            'B2': []
        };
    }

    // 获取指定等级的错题本列表
    getWrongWords(level) {
        const allWrongWords = this.getAllWrongWords();
        return allWrongWords[level] || [];
    }

    // 添加单词到错题本（若已存在则只保留一条，添加时间视为最新：移到列表末尾）
    async addWrongWord(level, word) {
        try {
            const allWrongWords = this.getAllWrongWords();
            if (!allWrongWords[level]) {
                allWrongWords[level] = [];
            }
            const list = allWrongWords[level];
            const idx = list.indexOf(word);
            if (idx > -1) {
                list.splice(idx, 1);
            }
            list.push(word);
            const storageKey = this.getStorageKey(this.baseWrongWordsKey);
            if (storageKey) {
                    localStorage.setItem(storageKey, JSON.stringify(allWrongWords));

                    // 如果配置了Supabase云端同步，自动同步到云端
                    if (typeof supabaseStorageManager !== 'undefined' && supabaseStorageManager.isConfigured()) {
                        try {
                            await supabaseStorageManager.syncAllDataToCloud();
                        } catch (error) {
                            console.warn('云端同步失败（错题本已保存到本地）:', error);
                        }
                    }

                    // 如果启用了GitHub云端同步，自动同步到云端
                    if (typeof cloudStorageManager !== 'undefined' && cloudStorageManager.isCloudSyncEnabled()) {
                        try {
                            await cloudStorageManager.syncToCloud();
                        } catch (error) {
                            console.warn('云端同步失败（错题本已保存到本地）:', error);
                        }
                    }
                }
            return true;
        } catch (error) {
            console.error('添加错题失败:', error);
            return false;
        }
    }

    // 从错题本移除单词
    async removeWrongWord(level, word) {
        try {
            const allWrongWords = this.getAllWrongWords();
            if (!allWrongWords[level]) {
                return true;
            }
            
            const index = allWrongWords[level].indexOf(word);
            if (index > -1) {
                allWrongWords[level].splice(index, 1);
                const storageKey = this.getStorageKey(this.baseWrongWordsKey);
                if (storageKey) {
                    localStorage.setItem(storageKey, JSON.stringify(allWrongWords));
                    
                    // 如果配置了Supabase云端同步，自动同步到云端
                    if (typeof supabaseStorageManager !== 'undefined' && supabaseStorageManager.isConfigured()) {
                        try {
                            await supabaseStorageManager.syncAllDataToCloud();
                        } catch (error) {
                            console.warn('云端同步失败（错题本已保存到本地）:', error);
                        }
                    }
                    
                    // 如果启用了GitHub云端同步，自动同步到云端
                    if (typeof cloudStorageManager !== 'undefined' && cloudStorageManager.isCloudSyncEnabled()) {
                        try {
                            await cloudStorageManager.syncToCloud();
                        } catch (error) {
                            console.warn('云端同步失败（错题本已保存到本地）:', error);
                        }
                    }
                }
            }
            return true;
        } catch (error) {
            console.error('移除错题失败:', error);
            return false;
        }
    }

    // 检查单词是否在错题本中
    isWrongWord(level, word) {
        const wrongWords = this.getWrongWords(level);
        return wrongWords.includes(word);
    }

    // 获取指定等级的错题本统计
    getWrongWordsStats(level) {
        const wrongWords = this.getWrongWords(level);
        return {
            count: wrongWords.length,
            words: wrongWords
        };
    }

    // 清除指定等级的错题本
    clearWrongWords(level) {
        try {
            const allWrongWords = this.getAllWrongWords();
            allWrongWords[level] = [];
            const storageKey = this.getStorageKey(this.baseWrongWordsKey);
            if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify(allWrongWords));
            }
            return true;
        } catch (error) {
            console.error('清除错题本失败:', error);
            return false;
        }
    }

    // 清除所有错题本
    clearAllWrongWords() {
        try {
            const storageKey = this.getStorageKey(this.baseWrongWordsKey);
            if (storageKey) {
                localStorage.removeItem(storageKey);
            }
            return true;
        } catch (error) {
            console.error('清除所有错题本失败:', error);
            return false;
        }
    }
}

// 创建全局实例
const storageManager = new StorageManager();