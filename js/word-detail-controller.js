// 单词详情页控制器
class WordDetailController {
    constructor() {
        this.word = null;
        this.level = null;
        this.wordData = null;
    }

    // 初始化
    async init() {
        // 从URL获取参数
        const urlParams = new URLSearchParams(window.location.search);
        this.word = urlParams.get('word');
        this.level = urlParams.get('level');

        if (!this.word || !this.level) {
            this.showError('缺少必要参数');
            return;
        }

        // 加载词汇数据
        const success = await vocabularyData.loadData();
        if (!success) {
            this.showError('无法加载词汇数据，请刷新页面重试');
            return;
        }

        // 查找单词数据
        const words = vocabularyData.wordsByLevel[this.level] || [];
        this.wordData = words.find(w => w.word === this.word);

        if (!this.wordData) {
            this.showError('未找到该单词');
            return;
        }

        // 显示单词详情
        await this.displayWordDetail();
    }

    // 显示单词详情
    async displayWordDetail() {
        const container = document.getElementById('wordContent');

        // 获取中文翻译（按意大利语单词翻译）
        const chineseTranslation = await translationHelper.getChineseTranslation(this.wordData.word);

        // 获取词性翻译
        const posTranslation = vocabularyData.getPosTranslation(this.wordData.pos);

        // 生成YouTube搜索链接
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(this.wordData.word + ' italiano')}`;

        // 生成HTML
        let html = `
            <div class="word-section">
                <div class="word-title">${this.wordData.word}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">英文释义</div>
                <div class="detail-content">${this.wordData.english_translation}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">中文释义</div>
                <div class="detail-content">${chineseTranslation || '翻译中...'}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">词性</div>
                <div class="detail-content"><strong>${posTranslation}</strong> (${this.wordData.pos})</div>
            </div>
        `;

        // 例句
        if (this.wordData.example_sentence_native) {
            html += `
                <div class="detail-item">
                    <div class="detail-label">例句</div>
                    <div class="example-sentence">${this.wordData.example_sentence_native}</div>
                </div>
            `;
        }

        // 英文例句
        if (this.wordData.example_sentence_english) {
            html += `
                <div class="detail-item">
                    <div class="detail-label">例句（英文）</div>
                    <div class="detail-content">${this.wordData.example_sentence_english}</div>
                </div>
            `;
        }

        // YouTube链接
        html += `
            <div class="detail-item">
                <div class="detail-label">视频讲解</div>
                <a href="${youtubeUrl}" target="_blank" class="youtube-link">在YouTube上查看讲解视频</a>
            </div>
        `;

        container.innerHTML = html;

        // 如果中文翻译还在加载，异步更新
        if (!chineseTranslation) {
            const chinese = await translationHelper.getChineseTranslation(this.wordData.word);
            if (chinese) {
                const chineseElement = container.querySelector('.detail-item:nth-child(3) .detail-content');
                if (chineseElement) {
                    chineseElement.textContent = chinese;
                }
            }
        }
    }

    // 显示错误
    showError(message) {
        const container = document.getElementById('wordContent');
        container.innerHTML = `<div class="error">${message}</div>`;
    }
}

// 创建全局实例
const wordDetailController = new WordDetailController();

// 返回函数
function goBack() {
    // 检查返回目标
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    const returnTo = urlParams.get('returnTo'); // 来源页面：all-words 或 wrong-words
    
    if (level && returnTo === 'wrong-words') {
        // 从错题本进入，返回到错题本
        window.location.href = `wrong-words.html?level=${level}`;
    } else if (level && returnTo === 'all-words') {
        // 从全部单词进入，返回到全部单词
        window.location.href = `all-words.html?level=${level}`;
    } else if (level) {
        // 默认返回到全部单词页（兼容旧链接）
        window.location.href = `all-words.html?level=${level}`;
    } else {
        window.history.back();
    }
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wordDetailController.init());
} else {
    wordDetailController.init();
}
