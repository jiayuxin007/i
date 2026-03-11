// 大语言模型API调用模块 - 用于生成易混淆选项
class LLMAPI {
    constructor() {
        // 可以配置不同的API提供商
        // 默认使用OpenAI，也可以切换到其他API
        this.apiProvider = 'openai'; // 'openai', 'anthropic', 'custom'
        this.apiKey = null; // 需要用户配置
    }

    // 设置API密钥
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // 是否已配置 AIGC（可用于翻译等）
    isConfigured() {
        return !!this.apiKey;
    }

    /**
     * 使用大模型将意大利语翻译为简体中文（AIGC 翻译）
     * @param {string} italianText - 意大利语单词或短语
     * @returns {Promise<string|null>} 中文释义，失败返回 null
     */
    async translateToChinese(italianText) {
        const text = (italianText || '').trim();
        if (!text || !this.apiKey) return null;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: '你是意大利语翻译助手。将用户给出的意大利语单词或短语翻译成简体中文。只输出中文译文，不要编号、不要解释、不要英文。若为多义词可给出常见释义，用顿号或分号分隔。'
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 80
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || `API ${response.status}`);
            }

            const data = await response.json();
            const chinese = (data.choices?.[0]?.message?.content || '').trim();
            return chinese || null;
        } catch (error) {
            console.warn('AIGC 翻译失败:', error.message);
            return null;
        }
    }

    // 生成易混淆选项
    async generateDistractors(italianWord, correctTranslation, wordLevel = 'A1', wordPos = 'noun') {
        try {
            // 如果没有配置API key，使用备用方案
            if (!this.apiKey) {
                return await this.generateDistractorsFallback(italianWord, correctTranslation, wordLevel);
            }

            // 使用OpenAI API
            if (this.apiProvider === 'openai') {
                return await this.generateWithOpenAI(italianWord, correctTranslation, wordLevel, wordPos);
            }

            // 其他API提供商可以在这里添加
            return await this.generateDistractorsFallback(italianWord, correctTranslation, wordLevel);
        } catch (error) {
            console.error('生成易混淆选项失败，使用备用方案:', error);
            return await this.generateDistractorsFallback(italianWord, correctTranslation, wordLevel);
        }
    }

    // 使用OpenAI API生成
    async generateWithOpenAI(italianWord, correctTranslation, wordLevel, wordPos) {
        const prompt = `你是一个意大利语学习助手。请为一个意大利语单词生成3个易混淆的翻译选项（使用英文）。

意大利语单词：${italianWord}
正确翻译：${correctTranslation}
单词等级：${wordLevel}
词性：${wordPos}

要求：
1. 生成3个易混淆的英文翻译选项
2. 这些选项应该与正确答案在意思上相似或容易混淆
3. 但必须是错误的翻译
4. 只返回3个选项，用换行符分隔，不要编号，不要其他说明
5. 每个选项应该是单个单词或短语

示例格式：
apple
fruit
red`;

        const OPENAI_TIMEOUT_MS = 15000;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个专业的意大利语学习助手，擅长生成易混淆的翻译选项。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.8,
                    max_tokens: 100
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const choices = data.choices[0].message.content.trim().split('\n').filter(line => line.trim());
            
            // 确保返回3个选项
            const distractors = choices.slice(0, 3);
            while (distractors.length < 3) {
                distractors.push('选项' + (distractors.length + 1));
            }

            return distractors;
        } catch (error) {
            console.error('OpenAI API调用失败:', error);
            throw error;
        }
    }

    // 备用方案：从词汇库中随机选择
    async generateDistractorsFallback(italianWord, correctTranslation, wordLevel = 'A1') {
        try {
            // 等待词汇数据加载
            if (!vocabularyData.data || !vocabularyData.wordsByLevel[wordLevel]) {
                if (!vocabularyData.data) {
                    await vocabularyData.loadData();
                }
            }

            // 从同等级的其他单词中随机选择3个作为干扰项
            const allWords = vocabularyData.wordsByLevel[wordLevel] || [];
            
            // 排除当前单词和正确答案，提取翻译
            const candidates = allWords
                .filter(w => {
                    // 排除当前单词
                    if (w.word === italianWord) return false;
                    // 排除正确答案
                    if (w.english_translation === correctTranslation) return false;
                    // 确保有翻译
                    return w.english_translation && w.english_translation.trim();
                })
                .map(w => {
                    // 处理可能包含分号的翻译（如 "am;are"），取第一个
                    const translation = w.english_translation.split(';')[0].trim();
                    return translation;
                })
                .filter((v, i, a) => a.indexOf(v) === i && v !== correctTranslation); // 去重并排除正确答案

            // 随机选择3个
            const distractors = [];
            const used = new Set();
            
            // 打乱候选列表
            const shuffled = [...candidates].sort(() => Math.random() - 0.5);
            
            for (const candidate of shuffled) {
                if (distractors.length >= 3) break;
                if (!used.has(candidate) && candidate !== correctTranslation) {
                    distractors.push(candidate);
                    used.add(candidate);
                }
            }

            // 如果不够3个，用占位符填充
            while (distractors.length < 3) {
                distractors.push('Option ' + (distractors.length + 1));
            }

            return distractors.slice(0, 3);
        } catch (error) {
            console.error('生成备用选项失败:', error);
            // 最后的备用方案
            return ['Option 1', 'Option 2', 'Option 3'];
        }
    }
}

// 创建全局实例
const llmAPI = new LLMAPI();

// 尝试从localStorage读取API key（如果用户之前配置过）
try {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
        llmAPI.setApiKey(savedApiKey);
    }
} catch (e) {
    console.log('无法读取保存的API key');
}