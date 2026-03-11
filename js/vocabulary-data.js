// 词汇数据管理模块
class VocabularyData {
    constructor() {
        this.data = null;
        this.wordsByLevel = {
            'A1': [],
            'A2': [],
            'B1': [],
            'B2': []
        };
        this.posByLevel = {
            'A1': [],
            'A2': [],
            'B1': [],
            'B2': []
        };
        
        // 词性中文翻译映射
        this.posTranslation = {
            'noun': '名词',
            'verb': '动词',
            'adjective': '形容词',
            'adverb': '副词',
            'pronoun': '代词',
            'preposition': '介词',
            'conjunction': '连词',
            'interjection': '感叹词',
            'article': '冠词',
            'determiner': '限定词',
            'numeral': '数词'
        };
    }

    // 加载JSON数据
    async loadData() {
        try {
            console.log('尝试加载JSON文件: source_italiano/italian.json');
            const response = await fetch('source_italiano/italian.json');
            
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }
            
            console.log('JSON文件加载成功，开始解析...');
            this.data = await response.json();
            console.log(`成功解析 ${this.data.length} 条数据`);
            
            this.processData();
            return true;
        } catch (error) {
            console.error('加载词汇数据失败:', error);
            console.error('错误详情:', error.message);
            return false;
        }
    }

    // 处理数据：按等级分类并提取词性
    processData() {
        // 重置数据
        this.wordsByLevel = {
            'A1': [],
            'A2': [],
            'B1': [],
            'B2': []
        };
        this.posByLevel = {
            'A1': new Set(),
            'A2': new Set(),
            'B1': new Set(),
            'B2': new Set()
        };

        // 遍历数据，按等级分类
        this.data.forEach(item => {
            const level = item.cefr_level;
            if (this.wordsByLevel.hasOwnProperty(level)) {
                // 提取所需字段
                const wordData = {
                    word: item.word,
                    cefr_level: item.cefr_level,
                    english_translation: item.english_translation,
                    example_sentence_native: item.example_sentence_native,
                    example_sentence_english: item.example_sentence_english,
                    pos: item.pos,
                    word_frequency: item.word_frequency
                };
                
                this.wordsByLevel[level].push(wordData);
                
                // 收集词性
                if (item.pos) {
                    this.posByLevel[level].add(item.pos);
                }
            }
        });

        // 将Set转换为排序数组
        Object.keys(this.posByLevel).forEach(level => {
            this.posByLevel[level] = Array.from(this.posByLevel[level]).sort();
        });

        console.log('数据加载完成:', {
            A1: this.wordsByLevel.A1.length,
            A2: this.wordsByLevel.A2.length,
            B1: this.wordsByLevel.B1.length,
            B2: this.wordsByLevel.B2.length
        });
        
        // 检查重复单词（单词是否属于多个等级）
        this.checkDuplicateWords();
        
        // 输出每个等级的词性统计
        Object.keys(this.posByLevel).forEach(level => {
            console.log(`${level} 等级词性:`, this.posByLevel[level]);
        });
    }

    // 检查是否有单词属于多个等级
    checkDuplicateWords() {
        const wordLevelMap = {};
        
        // 统计每个单词出现的等级
        this.data.forEach(item => {
            const word = item.word;
            if (!wordLevelMap[word]) {
                wordLevelMap[word] = new Set();
            }
            wordLevelMap[word].add(item.cefr_level);
        });

        // 找出在多个等级中出现的单词
        const duplicates = [];
        Object.keys(wordLevelMap).forEach(word => {
            if (wordLevelMap[word].size > 1) {
                duplicates.push({
                    word: word,
                    levels: Array.from(wordLevelMap[word]).sort()
                });
            }
        });

        if (duplicates.length > 0) {
            console.warn(`⚠ 发现 ${duplicates.length} 个单词属于多个等级:`);
            console.log('重复单词示例（前10个）:', duplicates.slice(0, 10).map(d => 
                `${d.word}: ${d.levels.join(', ')}`
            ));
        } else {
            console.log('✓ 没有发现重复单词，每个单词只属于一个等级');
        }
    }

    // 获取指定等级的单词列表
    getWordsByLevel(level, filters = {}) {
        let words = this.wordsByLevel[level] || [];
        
        // 筛选未完成的单词（如果指定了 completedWords）
        if (filters.excludeCompleted && filters.completedWords) {
            const completedSet = new Set(filters.completedWords);
            words = words.filter(w => !completedSet.has(w.word));
        }
        
        // 应用词性筛选
        if (filters.pos && filters.pos !== 'all') {
            words = words.filter(w => w.pos === filters.pos);
        }
        
        // 排序
        if (filters.order === 'sequential') {
            // 顺序：按 word_frequency 从高到低排序
            words = [...words].sort((a, b) => {
                const freqA = a.word_frequency || 0;
                const freqB = b.word_frequency || 0;
                return freqB - freqA; // 从高到低
            });
        } else if (filters.order === 'random') {
            // 乱序：随机排序
            words = [...words].sort(() => Math.random() - 0.5);
        }
        
        // 限制数量
        if (filters.count) {
            const count = parseInt(filters.count);
            words = words.slice(0, count);
        }
        
        return words;
    }

    // 获取指定等级的词性列表
    getPosByLevel(level) {
        return this.posByLevel[level] || [];
    }

    // 获取词性的中文翻译
    getPosTranslation(pos) {
        return this.posTranslation[pos] || pos;
    }

    // 获取指定等级的单词总数
    getWordCountByLevel(level) {
        return this.wordsByLevel[level] ? this.wordsByLevel[level].length : 0;
    }
}

// 创建全局实例
const vocabularyData = new VocabularyData();