// 单词默写控制器
class DictationController {
    constructor(params) {
        this.level = params.level;
        this.order = params.order;
        this.count = params.count;
        this.pos = params.pos || 'all';
        this.words = [];
        this.currentIndex = 0;
        this.stats = { total: 0, correct: 0, wrong: 0 };
        this.isAnswered = false;
        this.currentMasked = '';
        this.currentWord = '';
        this.currentHiddenIndices = [];
    }

    // 返回：{ chars: 每格为字母或 null（空白）, hiddenIndices: 空白位置的下标 }
    maskWord(word) {
        if (!word || word.length === 0) return { chars: [], hiddenIndices: [] };
        const arr = word.split('');
        const len = arr.length;
        let toShow = new Set([0]);
        if (len > 2) {
            const showCount = Math.max(1, Math.floor(len * 0.45));
            const shuffled = arr.map((_, i) => i).slice(1).sort(() => Math.random() - 0.5);
            for (let k = 0; toShow.size < showCount && k < shuffled.length; k++) {
                toShow.add(shuffled[k]);
            }
        }
        const chars = arr.map((ch, i) => (toShow.has(i) ? ch : null));
        const hiddenIndices = arr.map((_, i) => i).filter(i => !toShow.has(i));
        return { chars, hiddenIndices };
    }

    async init() {
        const content = document.getElementById('dictationContent');
        const wordDisplay = document.getElementById('dictationWordDisplay');
        const success = await vocabularyData.loadData();
        if (!success) {
            if (wordDisplay) wordDisplay.style.display = 'none';
            if (content) content.innerHTML = '<div class="loading">无法加载词汇数据，请刷新重试。</div>';
            return;
        }
        // 与单词测验一致：排除本等级已完成的单词，再按顺序/数量/词性选取
        const completedWords = typeof storageManager !== 'undefined'
            ? storageManager.getCompletedWords(this.level) : [];
        this.words = vocabularyData.getWordsByLevel(this.level, {
            order: this.order,
            count: parseInt(this.count, 10) || 100,
            pos: this.pos === 'all' ? undefined : this.pos,
            excludeCompleted: true,
            completedWords: completedWords
        });
        if (this.words.length === 0) {
            if (wordDisplay) wordDisplay.style.display = 'none';
            if (content) content.innerHTML = '<div class="loading">没有可默写的单词，请调整筛选条件。</div>';
            return;
        }
        if (content) content.innerHTML = '';
        if (wordDisplay) wordDisplay.style.display = 'block';
        this.stats.total = this.words.length;
        this.updateStats();
        await this.showQuestion();
    }

    updateStats() {
        const totalEl = document.getElementById('dictationTotalCount');
        const correctEl = document.getElementById('dictationCorrectCount');
        const wrongEl = document.getElementById('dictationWrongCount');
        if (totalEl) totalEl.textContent = this.stats.total;
        if (correctEl) correctEl.textContent = this.stats.correct;
        if (wrongEl) wrongEl.textContent = this.stats.wrong;
    }

    async showQuestion() {
        this.isAnswered = false;
        const wordData = this.words[this.currentIndex];
        const { chars, hiddenIndices } = this.maskWord(wordData.word);
        this.currentWord = wordData.word;
        this.currentHiddenIndices = hiddenIndices;

        const chinese = await translationHelper.getChineseTranslation(wordData.word);

        const wordDisplay = document.getElementById('dictationWordDisplay');
        const resultPanel = document.getElementById('dictationResultPanel');
        const nextBtn = document.getElementById('dictationNextButton');
        const prevBtn = document.getElementById('dictationPrevButton');

        if (resultPanel) resultPanel.classList.remove('show');
        if (nextBtn) nextBtn.style.display = 'none';
        if (prevBtn) prevBtn.style.display = this.currentIndex > 0 ? 'block' : 'none';

        const partialHtml = chars.map((ch, i) => {
            if (ch !== null) {
                return '<span class="dictation-char-show">' + ch + '</span>';
            }
            return '<input type="text" maxlength="1" class="dictation-char-input" autocomplete="off">';
        }).join('');

        if (wordDisplay) {
            wordDisplay.innerHTML = `
                <div class="dictation-meanings">
                    <div class="dictation-meaning-row">
                        <span class="dictation-meaning-label">英文释义：</span>
                        <span class="dictation-meaning-value">${wordData.english_translation}</span>
                    </div>
                    <div class="dictation-meaning-row">
                        <span class="dictation-meaning-label">中文释义：</span>
                        <span class="dictation-meaning-value">${chinese || '翻译中...'}</span>
                    </div>
                </div>
                <div class="dictation-partial-word">${partialHtml}</div>
                <div class="dictation-confirm-row">
                    <button type="button" class="dictation-confirm-btn">确定</button>
                </div>
            `;
            this.bindInlineInputs(wordDisplay);
            const btn = wordDisplay.querySelector('.dictation-confirm-btn');
            if (btn) {
                btn.disabled = false;
                btn.onclick = () => this.submitAnswer();
            }
        }
    }

    bindInlineInputs(container) {
        const inputs = container.querySelectorAll('.dictation-char-input');
        const arr = Array.from(inputs);
        arr.forEach((input, i) => {
            input.value = '';
            input.disabled = false;
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitAnswer();
                    return;
                }
                if (e.key === 'Backspace' && !input.value && i > 0) {
                    arr[i - 1].focus();
                }
            };
            input.oninput = (e) => {
                const v = (e.target.value || '').toLowerCase();
                if (v.length >= 1) {
                    e.target.value = v.slice(-1);
                    if (i < arr.length - 1) arr[i + 1].focus();
                }
            };
        });
        if (arr.length > 0) arr[0].focus();
    }

    async submitAnswer() {
        if (this.isAnswered) return;
        const wordDisplay = document.getElementById('dictationWordDisplay');
        const inputs = wordDisplay ? wordDisplay.querySelectorAll('.dictation-char-input') : [];
        const btn = wordDisplay ? wordDisplay.querySelector('.dictation-confirm-btn') : null;
        if (!this.currentWord || !this.currentHiddenIndices) return;

        const result = this.currentWord.split('');
        this.currentHiddenIndices.forEach((idx, i) => {
            const val = (inputs[i] && inputs[i].value) ? inputs[i].value.trim() : '';
            result[idx] = val;
        });
        const userAnswer = result.join('').toLowerCase();
        const correctWord = (this.words[this.currentIndex].word || '').toLowerCase();
        const isCorrect = userAnswer === correctWord;

        this.isAnswered = true;
        if (isCorrect) this.stats.correct++;
        else {
            this.stats.wrong++;
            if (typeof storageManager !== 'undefined') {
                const wrongWord = this.words[this.currentIndex].word;
                storageManager.addWrongWord(this.level, wrongWord).then(() => {
                    console.log('已将单词 "' + wrongWord + '" 加入错题本（默写错误）');
                }).catch(err => console.warn('加入错题本失败:', err));
            }
        }
        this.updateStats();

        // 与单词测验一致：将当前单词计入总进度，并同步到 Supabase / GitHub 云端
        const currentWord = this.words[this.currentIndex].word;
        if (typeof storageManager !== 'undefined') {
            try {
                await storageManager.markWordCompleted(this.level, currentWord);
            } catch (err) {
                console.warn('保存进度失败:', err);
            }
        }

        inputs.forEach(inp => { inp.disabled = true; });
        if (btn) btn.disabled = true;

        await this.showResult(isCorrect, this.words[this.currentIndex]);
    }

    async showResult(isCorrect, wordData) {
        const resultPanel = document.getElementById('dictationResultPanel');
        const resultIcon = document.getElementById('dictationResultIcon');
        const resultTitle = document.getElementById('dictationResultTitle');
        const wordDetails = document.getElementById('dictationWordDetails');
        const nextBtn = document.getElementById('dictationNextButton');
        const prevBtn = document.getElementById('dictationPrevButton');

        if (resultIcon) {
            resultIcon.textContent = isCorrect ? '✓' : '✗';
            resultIcon.className = 'dictation-result-icon ' + (isCorrect ? 'correct' : 'wrong');
        }
        if (resultTitle) {
            resultTitle.textContent = isCorrect ? '回答正确！' : '回答错误';
            resultTitle.className = 'dictation-result-title ' + (isCorrect ? 'correct' : 'wrong');
        }

        const chineseTranslation = await translationHelper.getChineseTranslation(wordData.word);
        const posTranslation = vocabularyData.getPosTranslation(wordData.pos);

        if (wordDetails) {
            wordDetails.innerHTML = `
                <div class="detail-row">
                    <div class="detail-item">
                        <div class="detail-label">单词：</div>
                        <div class="detail-value">${wordData.word}</div>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-item">
                        <div class="detail-label">英文释义：</div>
                        <div class="detail-value">${wordData.english_translation}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">中文释义：</div>
                        <div class="detail-value">${chineseTranslation || '—'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">词性：</div>
                        <div class="detail-value">${posTranslation} (${wordData.pos})</div>
                    </div>
                </div>
                ${wordData.example_sentence_native ? `
                <div class="detail-item-full">
                    <div class="detail-label">例句：</div>
                    <div class="detail-value">${wordData.example_sentence_native}</div>
                </div>
                ` : ''}
                ${wordData.example_sentence_english ? `
                <div class="detail-item-full">
                    <div class="detail-label">英文例句：</div>
                    <div class="detail-value">${wordData.example_sentence_english}</div>
                </div>
                ` : ''}
            `;
        }

        const youtubeLink = document.getElementById('dictationYoutubeLink');
        if (youtubeLink) {
            youtubeLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(wordData.word + ' italiano')}`;
            youtubeLink.style.display = 'inline-block';
        }

        if (resultPanel) resultPanel.classList.add('show');
        if (nextBtn) nextBtn.style.display = 'block';
        if (prevBtn) prevBtn.style.display = this.currentIndex > 0 ? 'block' : 'none';
    }

    nextWord() {
        const resultPanel = document.getElementById('dictationResultPanel');
        const nextBtn = document.getElementById('dictationNextButton');
        const prevBtn = document.getElementById('dictationPrevButton');
        if (resultPanel) resultPanel.classList.remove('show');
        if (nextBtn) nextBtn.style.display = 'none';

        this.currentIndex++;
        if (this.currentIndex >= this.words.length) {
            this.showComplete();
            return;
        }
        this.showQuestion();
    }

    prevWord() {
        if (this.currentIndex <= 0) return;
        const resultPanel = document.getElementById('dictationResultPanel');
        const nextBtn = document.getElementById('dictationNextButton');
        resultPanel.classList.remove('show');
        nextBtn.style.display = 'none';
        this.currentIndex--;
        this.showQuestion();
    }

    showComplete() {
        const content = document.getElementById('dictationContent');
        const wordDisplay = document.getElementById('dictationWordDisplay');
        const resultPanel = document.getElementById('dictationResultPanel');
        if (wordDisplay) wordDisplay.style.display = 'none';
        if (resultPanel) resultPanel.classList.remove('show');

        const accuracy = this.stats.total > 0
            ? Math.round((this.stats.correct / this.stats.total) * 100)
            : 0;
        if (content) {
            content.style.display = 'block';
            content.innerHTML = `
                <div class="dictation-complete">
                    <h2 class="dictation-complete-title">默写完成！</h2>
                    <p class="dictation-complete-stats">正确率：${accuracy}%</p>
                    <p class="dictation-complete-detail">正确：${this.stats.correct} / 总数：${this.stats.total}</p>
                    <button type="button" class="dictation-back-btn" onclick="window.location.href='${this.level.toLowerCase()}.html'">返回等级页</button>
                </div>
            `;
        }
    }
}
