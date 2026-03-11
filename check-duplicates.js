// 检查重复单词的脚本
// 在浏览器控制台运行，或通过Node.js运行

async function checkDuplicates() {
    try {
        const fs = require('fs');
        const path = require('path');
        
        const jsonPath = path.join(__dirname, 'source_italiano', 'italian.json');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        
        // 统计每个单词出现的等级
        const wordLevels = {};
        
        data.forEach(item => {
            const word = item.word;
            if (!wordLevels[word]) {
                wordLevels[word] = new Set();
            }
            wordLevels[word].add(item.cefr_level);
        });

        // 找出在多个等级中出现的单词
        const duplicates = [];
        Object.keys(wordLevels).forEach(word => {
            if (wordLevels[word].size > 1) {
                duplicates.push({
                    word: word,
                    levels: Array.from(wordLevels[word]).sort()
                });
            }
        });

        console.log('=== 检查结果 ===');
        console.log(`总单词数（含重复）: ${data.length}`);
        console.log(`唯一单词数: ${Object.keys(wordLevels).length}`);
        console.log(`重复单词数: ${duplicates.length}`);
        
        if (duplicates.length > 0) {
            console.log('\n重复单词列表（前20个）:');
            duplicates.slice(0, 20).forEach(item => {
                console.log(`  ${item.word}: ${item.levels.join(', ')}`);
            });
        } else {
            console.log('\n✓ 没有发现重复单词，每个单词只属于一个等级。');
        }

        // 统计各等级数量
        const levelCounts = {};
        data.forEach(item => {
            const level = item.cefr_level;
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        });
        
        console.log('\n各等级单词数:');
        Object.keys(levelCounts).sort().forEach(level => {
            console.log(`  ${level}: ${levelCounts[level]}`);
        });

        return {
            total: data.length,
            unique: Object.keys(wordLevels).length,
            duplicates: duplicates.length,
            duplicateList: duplicates,
            levelCounts: levelCounts
        };
    } catch (error) {
        console.error('错误:', error.message);
        return null;
    }
}

// 如果在Node.js环境中运行
if (typeof require !== 'undefined' && require.main === module) {
    checkDuplicates();
}

// 如果在浏览器环境中，导出函数
if (typeof window !== 'undefined') {
    window.checkDuplicates = checkDuplicates;
}
