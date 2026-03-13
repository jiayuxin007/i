// 测试页面控制器
class TestController {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.stats = {
            total: 0,
            correct: 0,
            wrong: 0
        };
        this.currentOptions = [];
        this.correctAnswerIndex = -1;
        this.isAnswered = false;
        this.level = null;
        this.correctChinese = null; // 当前单词正确选项的中文释义（按意大利语翻译）
        this.answeredWords = []; // 记录已作答的单词历史
        this.currentOptionsOrder = []; // 保存当前选项的排序
    }

    // 初始化测试
    async init() {
        // 从URL获取参数
        const urlParams = new URLSearchParams(window.location.search);
        this.level = urlParams.get('level');
        const order = urlParams.get('order');
        const count = urlParams.get('count');
        const pos = urlParams.get('pos');

        // 加载词汇数据
        const success = await vocabularyData.loadData();
        if (!success) {
            alert('无法加载词汇数据，请刷新页面重试');
            return;
        }

        // 获取已完成的单词列表
        const completedWords = storageManager.getCompletedWords(this.level);

        // 获取筛选后的单词列表
        this.words = vocabularyData.getWordsByLevel(this.level, {
            order: order,
            count: count,
            pos: pos,
            excludeCompleted: true,
            completedWords: completedWords
        });

        if (this.words.length === 0) {
            document.getElementById('wordDisplay').innerHTML = 
                '<div class="loading">没有可测试的单词！</div>';
            return;
        }

        // 初始化统计
        this.stats.total = this.words.length;
        this.updateStats();

        // 显示第一个单词
        await this.showCurrentWord();
    }

    // 显示当前单词
    async showCurrentWord() {
        if (this.currentIndex >= this.words.length) {
            this.showTestComplete();
            return;
        }

        const currentWord = this.words[this.currentIndex];
        
        // 检查这个单词是否已经作答过
        const answeredWordInfo = this.answeredWords.find(w => w.index === this.currentIndex);
        if (answeredWordInfo) {
            // 如果已经作答过，直接显示之前的结果
            this.showPreviousWord(answeredWordInfo);
            return;
        }

        // 如果是新单词，正常显示
        this.isAnswered = false;

        // 隐藏结果面板
        const resultPanel = document.getElementById('resultPanel');
        const nextButton = document.getElementById('nextButton');
        const prevButton = document.getElementById('prevButton');
        if (resultPanel) {
            resultPanel.classList.remove('show');
        }
        if (nextButton) {
            nextButton.style.display = 'none';
        }
        if (prevButton) {
            prevButton.style.display = 'none';
        }

        // 显示单词
        const wordDisplay = document.getElementById('wordDisplay');
        wordDisplay.innerHTML = `
            <div class="word-container">
                <div class="current-word">${currentWord.word}</div>
            </div>
        `;

        // 生成选项
        await this.generateOptions(currentWord);
    }

    // 生成选项（一个正确答案 + 三个易混淆选项）
    async generateOptions(wordData) {
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '<div class="loading">生成选项中...</div>';

        try {
            // 处理正确答案（从JSON的english_translation字段获取）
            const correctAnswer = wordData.english_translation.split(';')[0].trim();

            // 生成3个易混淆选项（英文）
            const distractors = await llmAPI.generateDistractors(
                wordData.word,
                correctAnswer,
                wordData.cefr_level,
                wordData.pos
            );

            // 合并所有选项（英文）
            const allOptions = [correctAnswer, ...distractors];

            // 为正确选项预先获取「意大利语→中文」释义（与结果区保持一致）
            this.correctChinese = await translationHelper.getChineseTranslation(wordData.word);

            // 存储选项
            this.currentOptions = allOptions;
            
            // 保存原始正确答案索引（排序前）
            const originalCorrectIndex = 0; // correctAnswer是第一个
            
            // 随机排序
            this.shuffleArray(this.currentOptions);
            
            // 找到正确答案的位置（排序后）
            this.correctAnswerIndex = this.currentOptions.indexOf(correctAnswer);
            
            // 保存排序后的选项顺序（用于恢复）
            this.currentOptionsOrder = [...this.currentOptions];

            // 显示选项按钮
            this.renderOptions();
        } catch (error) {
            console.error('生成选项失败:', error);
            optionsContainer.innerHTML = '<div class="loading">生成选项失败，请刷新重试</div>';
        }
    }

    // 渲染选项按钮
    renderOptions() {
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        this.currentOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            // 题目要求：正确选项同时展示英文和正确中文，其它选项只展示英文
            if (index === this.correctAnswerIndex && this.correctChinese) {
                button.textContent = `${option} (${this.correctChinese})`;
            } else {
                button.textContent = option;
            }
            
            button.onclick = () => this.selectOption(index);
            optionsContainer.appendChild(button);
        });
    }

    // 选择选项
    async selectOption(selectedIndex) {
        if (this.isAnswered) return;

        this.isAnswered = true;
        const buttons = document.querySelectorAll('.option-button');
        const isCorrect = selectedIndex === this.correctAnswerIndex;

        // 更新统计
        if (isCorrect) {
            this.stats.correct++;
        } else {
            this.stats.wrong++;
            // 将错题添加到错题本
            const currentWord = this.words[this.currentIndex];
            await storageManager.addWrongWord(this.level, currentWord.word);
            console.log(`已将单词 "${currentWord.word}" 添加到错题本`);
        }
        this.updateStats();

        // 标记正确答案和错误答案
        buttons[this.correctAnswerIndex].classList.add('correct');
        if (!isCorrect) {
            buttons[selectedIndex].classList.add('wrong');
        }

        // 禁用所有按钮
        buttons.forEach(btn => btn.disabled = true);

        // 标记当前单词为已完成
        const currentWord = this.words[this.currentIndex];
        await storageManager.markWordCompleted(this.level, currentWord.word);

        // 记录到历史（用于"上一个"功能）
        const historyEntry = {
            index: this.currentIndex,
            word: currentWord,
            isCorrect: isCorrect,
            selectedIndex: selectedIndex, // 记录用户选择的选项索引（排序后的位置）
            options: [...this.currentOptionsOrder], // 记录排序后的选项列表
            correctChinese: this.correctChinese, // 记录正确选项的中文释义
            correctAnswerIndex: this.correctAnswerIndex // 记录正确答案索引（排序后的位置）
        };
        
        console.log('保存到历史:', historyEntry);
        
        // 检查是否已经存在（避免重复添加）
        const existingIndex = this.answeredWords.findIndex(w => w.index === this.currentIndex);
        if (existingIndex >= 0) {
            // 如果已存在，更新它
            this.answeredWords[existingIndex] = historyEntry;
        } else {
            // 如果不存在，添加
            this.answeredWords.push(historyEntry);
        }

        // 显示结果页面
        await this.showResult(isCorrect, currentWord);
    }

    // 显示结果页面
    async showResult(isCorrect, wordData) {
        const resultPanel = document.getElementById('resultPanel');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const wordDetails = document.getElementById('wordDetails');
        const youtubeLink = document.getElementById('youtubeLink');
        const nextButton = document.getElementById('nextButton');
        const prevButton = document.getElementById('prevButton');

        // 显示/隐藏"上一个"按钮（除了第一个单词）
        if (this.answeredWords.length > 1) {
            prevButton.style.display = 'block';
        } else {
            prevButton.style.display = 'none';
        }
        
        // "下一个"按钮始终显示在右侧
        nextButton.style.display = 'block';
        
        // 确保"下一个"按钮在右侧（即使"上一个"隐藏）
        const resultButtons = document.querySelector('.result-buttons');
        if (resultButtons) {
            if (this.answeredWords.length <= 1) {
                // 第一个单词时，确保"下一个"在右侧
                resultButtons.style.justifyContent = 'flex-end';
            } else {
                // 有"上一个"按钮时，使用space-between
                resultButtons.style.justifyContent = 'space-between';
            }
        }

        // 显示对错图标和标题
        if (isCorrect) {
            resultIcon.textContent = '✓';
            resultIcon.className = 'result-icon correct';
            resultTitle.textContent = '回答正确！';
            resultTitle.className = 'result-title correct';
        } else {
            resultIcon.textContent = '✗';
            resultIcon.className = 'result-icon wrong';
            resultTitle.textContent = '回答错误';
            resultTitle.className = 'result-title wrong';
        }

        // 获取中文翻译（按意大利语单词翻译，避免英文多义词如 May→可能）
        const chineseTranslation = await translationHelper.getChineseTranslation(wordData.word);

        // 显示单词详情（英文释义、中文释义、词性放在一行）
        wordDetails.innerHTML = `
            <div class="detail-row">
                <div class="detail-item">
                    <div class="detail-label">英文释义：</div>
                    <div class="detail-value">${wordData.english_translation}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">中文释义：</div>
                    <div class="detail-value">${chineseTranslation || '翻译中...'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">词性：</div>
                    <div class="detail-value">${vocabularyData.getPosTranslation(wordData.pos)} (${wordData.pos})</div>
                </div>
            </div>
            <div class="detail-item-full">
                <div class="detail-label">例句：</div>
                <div class="detail-value">${wordData.example_sentence_native}</div>
            </div>
            <div class="detail-item-full">
                <div class="detail-label">英文例句：</div>
                <div class="detail-value">${wordData.example_sentence_english}</div>
            </div>
        `;

        // 设置YouTube链接
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(wordData.word + ' italiano')}`;
        youtubeLink.href = youtubeSearchUrl;
        youtubeLink.style.display = 'inline-block';

        // 显示结果面板和下一个按钮
        resultPanel.classList.add('show');
        nextButton.style.display = 'block';

        // 如果中文翻译还在加载，异步更新
        if (!chineseTranslation) {
            const chinese = await translationHelper.getChineseTranslation(wordData.word);
            if (chinese) {
                const chineseElement = wordDetails.querySelector('.detail-row .detail-item:nth-child(2) .detail-value');
                if (chineseElement) {
                    chineseElement.textContent = chinese;
                }
            }
        }
    }

    // 下一个单词
    nextWord() {
        // 隐藏结果面板
        const resultPanel = document.getElementById('resultPanel');
        const nextButton = document.getElementById('nextButton');
        const prevButton = document.getElementById('prevButton');
        resultPanel.classList.remove('show');
        nextButton.style.display = 'none';
        prevButton.style.display = 'none';

        // 检查下一个单词是否已经作答过
        const nextIndex = this.currentIndex + 1;
        if (nextIndex < this.words.length) {
            const nextWord = this.words[nextIndex];
            const answeredWordInfo = this.answeredWords.find(w => w.index === nextIndex);
            
            if (answeredWordInfo) {
                // 如果已经作答过，直接显示之前的结果
                this.currentIndex = nextIndex;
                this.showPreviousWord(answeredWordInfo);
                return;
            }
        }

        // 如果是新单词，正常切换
        this.currentIndex++;
        this.showCurrentWord();
    }

    // 上一个单词
    prevWord() {
        if (this.answeredWords.length === 0) {
            console.log('没有已作答的单词');
            return; // 没有已作答的单词
        }

        console.log('当前索引:', this.currentIndex);
        console.log('已作答历史:', this.answeredWords.map(w => w.index));

        // 找到当前单词在历史中的位置
        const currentWordInHistory = this.answeredWords.findIndex(w => w.index === this.currentIndex);
        
        if (currentWordInHistory === -1) {
            // 当前单词不在历史中，显示最后一个
            const prevWordInfo = this.answeredWords[this.answeredWords.length - 1];
            this.currentIndex = prevWordInfo.index;
            this.showPreviousWord(prevWordInfo);
            return;
        }
        
        if (currentWordInHistory === 0) {
            console.log('已经是第一个单词了');
            return; // 已经是第一个了
        }
        
        // 获取上一个单词
        const targetIndex = currentWordInHistory - 1;
        const prevWordInfo = this.answeredWords[targetIndex];
        
        console.log('切换到上一个单词，索引:', prevWordInfo.index);
        
        // 恢复到上一个单词的索引
        this.currentIndex = prevWordInfo.index;
        
        // 直接显示上一个单词的完整结果（包括选项和结果）
        this.showPreviousWord(prevWordInfo);
    }

    // 显示上一个单词（直接显示之前的作答结果）
    async showPreviousWord(wordInfo) {
        console.log('=== 显示之前的单词 ===');
        console.log('单词信息:', wordInfo);
        console.log('选项:', wordInfo.options);
        console.log('用户选择:', wordInfo.selectedIndex);
        console.log('正确答案索引:', wordInfo.correctAnswerIndex);
        
        const wordData = wordInfo.word;
        this.isAnswered = true;

        // 恢复选项数据（使用之前保存的排序）
        this.currentOptions = [...wordInfo.options];
        this.currentOptionsOrder = [...wordInfo.options];
        this.correctChinese = wordInfo.correctChinese || null;
        this.correctAnswerIndex = wordInfo.correctAnswerIndex;

        // 隐藏结果面板（先隐藏，等会再显示）
        const resultPanel = document.getElementById('resultPanel');
        const nextButton = document.getElementById('nextButton');
        const prevButton = document.getElementById('prevButton');
        if (resultPanel) {
            resultPanel.classList.remove('show');
        }
        if (nextButton) {
            nextButton.style.display = 'none';
        }
        if (prevButton) {
            prevButton.style.display = 'none';
        }

        // 显示单词
        const wordDisplay = document.getElementById('wordDisplay');
        wordDisplay.innerHTML = `
            <div class="word-container">
                <div class="current-word">${wordData.word}</div>
            </div>
        `;

        // 渲染选项（显示之前的作答状态）
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        this.currentOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            if (index === this.correctAnswerIndex && this.correctChinese) {
                button.textContent = `${option} (${this.correctChinese})`;
            } else {
                button.textContent = option;
            }
            
            // 标记正确答案
            if (index === this.correctAnswerIndex) {
                button.classList.add('correct');
            }
            
            // 标记用户之前选择的答案（如果是错误的）
            if (index === wordInfo.selectedIndex && index !== this.correctAnswerIndex) {
                button.classList.add('wrong');
            }
            
            button.disabled = true;
            optionsContainer.appendChild(button);
        });

        // 重新计算统计（回退到当前单词的状态）
        this.recalculateStats();

        // 显示结果
        await this.showResult(wordInfo.isCorrect, wordData);
    }

    // 重新计算统计（用于回退时）
    recalculateStats() {
        this.stats.correct = 0;
        this.stats.wrong = 0;
        
        // 只计算到当前单词为止的统计
        const currentWordInHistory = this.answeredWords.find(w => w.index === this.currentIndex);
        if (currentWordInHistory) {
            // 找到当前单词在历史中的位置
            const currentPos = this.answeredWords.findIndex(w => w.index === this.currentIndex);
            // 只计算到这个位置
            for (let i = 0; i <= currentPos; i++) {
                if (this.answeredWords[i].isCorrect) {
                    this.stats.correct++;
                } else {
                    this.stats.wrong++;
                }
            }
        } else {
            // 如果当前单词不在历史中，计算所有历史
            this.answeredWords.forEach(wordInfo => {
                if (wordInfo.isCorrect) {
                    this.stats.correct++;
                } else {
                    this.stats.wrong++;
                }
            });
        }
        
        this.updateStats();
    }

    // 更新统计显示
    updateStats() {
        document.getElementById('totalCount').textContent = this.stats.total;
        document.getElementById('correctCount').textContent = this.stats.correct;
        document.getElementById('wrongCount').textContent = this.stats.wrong;
    }


    // 打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 显示测试完成
    showTestComplete() {
        const wordDisplay = document.getElementById('wordDisplay');
        const optionsContainer = document.getElementById('optionsContainer');
        
        const accuracy = this.stats.total > 0 
            ? Math.round((this.stats.correct / this.stats.total) * 100) 
            : 0;

        wordDisplay.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="font-size: 32px; margin-bottom: 20px; color: #333;">测试完成！</h2>
                <p style="font-size: 20px; color: #666; margin-bottom: 10px;">正确率：${accuracy}%</p>
                <p style="font-size: 18px; color: #999;">正确：${this.stats.correct} / 总数：${this.stats.total}</p>
            </div>
        `;

        optionsContainer.innerHTML = `
            <button class="option-button" style="grid-column: 1 / -1; padding: 20px; font-size: 20px;" onclick="goBack()">
                返回
            </button>
        `;
    }
}

// 创建全局实例
const testController = new TestController();

// 返回函数
function goBack() {
    // 返回到对应等级的详情页
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    window.location.href = `${level.toLowerCase()}.html`;
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => testController.init());
} else {
    testController.init();
}
