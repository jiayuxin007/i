// 云端存储管理器 - 使用GitHub Gist API作为存储后端
class CloudStorageManager {
    constructor() {
        this.gistIdKey = 'italian_vocabulary_gist_id';
        this.githubTokenKey = 'italian_vocabulary_github_token';
        this.apiBase = 'https://api.github.com';
        this.gistFilename = 'italian-vocabulary-data.json';
        // GitHub OAuth App 配置（使用Device Flow）
        // 注意：在使用前，需要在GitHub上创建一个OAuth App
        // 创建地址：https://github.com/settings/developers
        // 回调URL可以填写任意值（Device Flow不需要回调URL）
        // 这是一个示例Client ID，实际使用时需要替换为你的OAuth App的Client ID
        this.oauthClientId = 'Ov23liODcgxAHYK2CgZ8'; // TODO: 替换为你的实际Client ID
        this.oauthRedirectUri = window.location.origin + window.location.pathname;
    }

    // 检查是否已配置云端同步
    isCloudSyncEnabled() {
        return !!this.getGithubToken() && !!this.getGistId();
    }

    // 获取GitHub Token
    getGithubToken() {
        try {
            return localStorage.getItem(this.githubTokenKey);
        } catch (error) {
            console.error('读取GitHub Token失败:', error);
            return null;
        }
    }

    // 保存GitHub Token
    setGithubToken(token) {
        try {
            if (token) {
                localStorage.setItem(this.githubTokenKey, token);
            } else {
                localStorage.removeItem(this.githubTokenKey);
            }
            return true;
        } catch (error) {
            console.error('保存GitHub Token失败:', error);
            return false;
        }
    }

    // 获取Gist ID
    getGistId() {
        try {
            return localStorage.getItem(this.gistIdKey);
        } catch (error) {
            console.error('读取Gist ID失败:', error);
            return null;
        }
    }

    // 保存Gist ID
    setGistId(gistId) {
        try {
            if (gistId) {
                localStorage.setItem(this.gistIdKey, gistId);
            } else {
                localStorage.removeItem(this.gistIdKey);
            }
            return true;
        } catch (error) {
            console.error('保存Gist ID失败:', error);
            return false;
        }
    }

    // 创建新的Gist
    async createGist(data) {
        const token = this.getGithubToken();
        if (!token) {
            return { success: false, message: '未配置GitHub Token' };
        }

        try {
            const response = await fetch(`${this.apiBase}/gists`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: 'Italian Vocabulary Practice Data',
                    public: false,
                    files: {
                        [this.gistFilename]: {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.setGistId(result.id);
                return { success: true, gistId: result.id, message: '云端存储创建成功' };
            } else {
                return { 
                    success: false, 
                    message: result.message || '创建云端存储失败',
                    details: result
                };
            }
        } catch (error) {
            console.error('创建Gist失败:', error);
            return { success: false, message: '网络错误，请检查网络连接' };
        }
    }

    // 更新Gist
    async updateGist(data) {
        const token = this.getGithubToken();
        const gistId = this.getGistId();

        if (!token || !gistId) {
            return { success: false, message: '未配置云端同步' };
        }

        try {
            const response = await fetch(`${this.apiBase}/gists/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: 'Italian Vocabulary Practice Data',
                    files: {
                        [this.gistFilename]: {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });

            const result = await response.json();

            if (response.ok) {
                return { success: true, message: '云端同步成功' };
            } else {
                return { 
                    success: false, 
                    message: result.message || '云端同步失败',
                    details: result
                };
            }
        } catch (error) {
            console.error('更新Gist失败:', error);
            return { success: false, message: '网络错误，请检查网络连接' };
        }
    }

    // 获取Gist数据
    async getGist() {
        const token = this.getGithubToken();
        const gistId = this.getGistId();

        if (!token || !gistId) {
            return { success: false, message: '未配置云端同步' };
        }

        try {
            const response = await fetch(`${this.apiBase}/gists/${gistId}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                const file = result.files[this.gistFilename];
                if (file && file.content) {
                    const data = JSON.parse(file.content);
                    return { success: true, data: data };
                } else {
                    return { success: false, message: '云端数据格式错误' };
                }
            } else {
                return { 
                    success: false, 
                    message: result.message || '获取云端数据失败',
                    details: result
                };
            }
        } catch (error) {
            console.error('获取Gist失败:', error);
            return { success: false, message: '网络错误，请检查网络连接' };
        }
    }

    // 同步所有数据到云端
    async syncToCloud() {
        if (!this.isCloudSyncEnabled()) {
            return { success: false, message: '云端同步未启用' };
        }

        try {
            // 收集所有需要同步的数据
            const allData = {
                users: userManager.getAllUsers(),
                currentUser: userManager.getCurrentUser(),
                userProgress: {},
                userWrongWords: {}
            };

            // 获取当前用户的所有数据
            const username = userManager.getCurrentUser();
            if (username) {
                // 获取所有用户的进度和错题本数据
                const users = userManager.getAllUsers();
                for (const user in users) {
                    // 临时切换用户以获取其数据
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
            }

            const gistId = this.getGistId();
            let result;
            if (gistId) {
                result = await this.updateGist(allData);
            } else {
                result = await this.createGist(allData);
            }

            return result;
        } catch (error) {
            console.error('同步到云端失败:', error);
            return { success: false, message: '同步失败: ' + error.message };
        }
    }

    // 从云端同步数据
    async syncFromCloud() {
        if (!this.isCloudSyncEnabled()) {
            return { success: false, message: '云端同步未启用' };
        }

        try {
            const result = await this.getGist();
            if (!result.success) {
                return result;
            }

            const data = result.data;

            // 恢复用户数据
            if (data.users) {
                await userManager.saveAllUsers(data.users);
            }

            // 恢复当前用户
            if (data.currentUser) {
                await userManager.setCurrentUser(data.currentUser);
            }

            // 恢复进度数据
            if (data.userProgress) {
                for (const user in data.userProgress) {
                    const progressKey = `italian_vocabulary_progress_${user}`;
                    localStorage.setItem(progressKey, JSON.stringify(data.userProgress[user]));
                }
            }

            // 恢复错题本数据
            if (data.userWrongWords) {
                for (const user in data.userWrongWords) {
                    const wrongWordsKey = `italian_vocabulary_wrong_words_${user}`;
                    localStorage.setItem(wrongWordsKey, JSON.stringify(data.userWrongWords[user]));
                }
            }

            return { success: true, message: '云端同步成功' };
        } catch (error) {
            console.error('从云端同步失败:', error);
            return { success: false, message: '同步失败: ' + error.message };
        }
    }

    // 清除云端同步配置
    clearCloudSync() {
        this.setGithubToken(null);
        this.setGistId(null);
        return true;
    }

    // 使用GitHub OAuth启动授权流程
    startOAuthFlow() {
        const state = Math.random().toString(36).substring(7);
        sessionStorage.setItem('github_oauth_state', state);
        
        const scopes = 'gist';
        const redirectUri = encodeURIComponent(this.oauthRedirectUri);
        const clientId = this.oauthClientId;
        
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;
        
        window.location.href = authUrl;
    }

    // 处理OAuth回调（从URL参数中获取token）
    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const savedState = sessionStorage.getItem('github_oauth_state');
        
        // 清除URL中的参数
        if (code || state) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // 验证state
        if (state && state !== savedState) {
            console.error('OAuth state验证失败');
            return false;
        }
        
        sessionStorage.removeItem('github_oauth_state');
        
        // 如果有code，我们需要用code换取token
        // 但是由于这是纯前端应用，我们不能安全地存储Client Secret
        // 所以我们需要使用一个简单的代理服务，或者使用Device Flow
        
        // 实际上，GitHub的隐式授权流程（Implicit Grant）已经被弃用了
        // 我们需要使用Device Flow或者创建一个简单的后端代理
        
        // 临时方案：提示用户使用Token方式
        return false;
    }

    // 使用GitHub Device Flow（更适合纯前端应用）
    async startDeviceFlow() {
        try {
            // Step 1: 请求设备代码
            const response = await fetch('https://github.com/login/device/code', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: this.oauthClientId,
                    scope: 'gist'
                })
            });

            const deviceData = await response.json();
            
            if (deviceData.error) {
                return { success: false, message: deviceData.error_description || '启动授权失败' };
            }

            // 显示用户代码和验证URL
            return {
                success: true,
                userCode: deviceData.user_code,
                verificationUri: deviceData.verification_uri,
                deviceCode: deviceData.device_code,
                expiresIn: deviceData.expires_in,
                interval: deviceData.interval
            };
        } catch (error) {
            console.error('启动Device Flow失败:', error);
            return { success: false, message: '启动授权失败: ' + error.message };
        }
    }

    // 轮询获取token（Device Flow）
    async pollForToken(deviceCode, interval = 5) {
        return new Promise((resolve) => {
            const poll = async () => {
                try {
                    const response = await fetch('https://github.com/login/oauth/access_token', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            client_id: this.oauthClientId,
                            device_code: deviceCode,
                            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                        })
                    });

                    const tokenData = await response.json();

                    if (tokenData.access_token) {
                        resolve({ success: true, token: tokenData.access_token });
                    } else if (tokenData.error === 'authorization_pending') {
                        // 继续轮询
                        setTimeout(poll, interval * 1000);
                    } else if (tokenData.error === 'slow_down') {
                        // 减慢轮询速度
                        setTimeout(poll, (interval + 5) * 1000);
                    } else {
                        resolve({ success: false, message: tokenData.error_description || '授权失败' });
                    }
                } catch (error) {
                    resolve({ success: false, message: '获取token失败: ' + error.message });
                }
            };

            poll();
        });
    }
}

// 创建全局实例
const cloudStorageManager = new CloudStorageManager();
