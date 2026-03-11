// 全部单词页面控制器
class AllWordsController {
    constructor() {
        this.level = null;
        this.allWords = [];
        this.filteredWords = [];
        this.currentPage = 1;
        this.pageSize = 20;
        this.sortOrder = 'az';
        this.posFilter = 'all';
        this.searchTerm = '';
    }

    // 初始化
    async init() {
        // 从URL获取等级参数
        const urlParams = new URLSearchParams(window.location.search);
        this.level = urlParams.get('level') || 'A1';

        // 更新页面标题
        document.getElementById('pageTitle').textContent = `${this.level} 全部单词`;

        // 加载词汇数据
        const success = await vocabularyData.loadData();
        if (!success) {
            document.getElementById('wordsContainer').innerHTML = 
                '<div class="no-results">无法加载词汇数据，请刷新页面重试</div>';
            return;
        }

        // 获取该等级的所有单词
        this.allWords = vocabularyData.wordsByLevel[this.level] || [];
        
        console.log(`${this.level} 等级共有 ${this.allWords.length} 个单词`);

        // 加载词性筛选选项
        this.loadPosFilter();

        // 绑定筛选条件变化事件
        document.getElementById('sortSelect').addEventListener('change', () => this.applyFilters());
        document.getElementById('posFilterSelect').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', () => {
            // 实时更新清除按钮显示
            if (typeof toggleClearButton === 'function') {
                toggleClearButton();
            }
        });

        // 初始化显示
        this.applyFilters();
    }

    // 加载词性筛选选项
    loadPosFilter() {
        const posList = vocabularyData.getPosByLevel(this.level);
        const posSelect = document.getElementById('posFilterSelect');
        
        posList.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            const translation = vocabularyData.getPosTranslation(pos);
            option.textContent = translation !== pos ? `${pos} (${translation})` : pos;
            posSelect.appendChild(option);
        });
    }

    // 应用筛选和排序
    async applyFilters() {
        // 获取筛选条件
        this.sortOrder = document.getElementById('sortSelect').value;
        this.posFilter = document.getElementById('posFilterSelect').value;
        this.searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

        // 筛选单词
        let filtered = [...this.allWords];

        // 词性筛选
        if (this.posFilter !== 'all') {
            filtered = filtered.filter(word => word.pos === this.posFilter);
        }

        // 搜索筛选（只匹配意大利语单词）
        if (this.searchTerm) {
            filtered = filtered.filter(word => 
                word.word.toLowerCase().includes(this.searchTerm)
            );
        }

        // 排序
        if (this.sortOrder === 'az') {
            filtered.sort((a, b) => a.word.localeCompare(b.word));
        } else {
            filtered.sort((a, b) => b.word.localeCompare(a.word));
        }

        this.filteredWords = filtered;
        this.currentPage = 1;

        // 显示结果
        await this.displayWords();
    }

    // 显示单词列表
    async displayWords() {
        const container = document.getElementById('wordsContainer');
        
        if (this.filteredWords.length === 0) {
            container.innerHTML = '<div class="no-results">没有找到匹配的单词</div>';
            document.getElementById('pagination').style.display = 'none';
            return;
        }

        // 计算分页
        const totalPages = Math.ceil(this.filteredWords.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredWords.length);
        const pageWords = this.filteredWords.slice(startIndex, endIndex);

        // 批量获取中文翻译（按意大利语单词翻译）
        const translations = await translationHelper.batchTranslate(
            pageWords.map(w => w.word)
        );

        // 生成表格HTML
        let tableHTML = `
            <table class="words-table">
                <thead>
                    <tr>
                        <th>意大利语单词</th>
                        <th>英文释义</th>
                        <th>中文释义</th>
                        <th>词性</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pageWords.forEach(word => {
            const chineseTranslation = translations[word.word] || '翻译中...';
            const posTranslation = vocabularyData.getPosTranslation(word.pos);

            tableHTML += `
                <tr>
                    <td>
                        <a href="word-detail.html?word=${encodeURIComponent(word.word)}&level=${this.level}&returnTo=all-words" 
                           style="color: #667eea; text-decoration: none; font-weight: bold; cursor: pointer;">
                            ${word.word}
                        </a>
                    </td>
                    <td>${word.english_translation}</td>
                    <td>${chineseTranslation}</td>
                    <td>${posTranslation} (${word.pos})</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;

        // 显示分页器
        this.displayPagination(totalPages);

        // 异步更新中文翻译（如果还在加载）
        this.updateChineseTranslations(pageWords, translations);
    }

    // 异步更新中文翻译（按意大利语单词）
    async updateChineseTranslations(pageWords, translations) {
        for (const word of pageWords) {
            if (!translations[word.word]) {
                const chinese = await translationHelper.getChineseTranslation(word.word);
                if (chinese) {
                    // 更新表格中的中文翻译
                    const rows = document.querySelectorAll('.words-table tbody tr');
                    pageWords.forEach((w, idx) => {
                        if (w.word === word.word) {
                            const cells = rows[idx].querySelectorAll('td');
                            if (cells.length >= 3) {
                                cells[2].textContent = chinese;
                            }
                        }
                    });
                }
            }
        }
    }

    // 显示分页器
    displayPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';

        let paginationHTML = '';

        // 上一页按钮
        paginationHTML += `
            <button class="page-button" onclick="allWordsController.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                上一页
            </button>
        `;

        // 页码按钮（显示当前页前后各2页）
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="page-button" onclick="allWordsController.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-info">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-button ${i === this.currentPage ? 'active' : ''}" 
                        onclick="allWordsController.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-info">...</span>`;
            }
            paginationHTML += `<button class="page-button" onclick="allWordsController.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // 下一页按钮
        paginationHTML += `
            <button class="page-button" onclick="allWordsController.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                下一页
            </button>
        `;

        // 页码输入框
        paginationHTML += `
            <span class="page-info">跳转到</span>
            <input type="number" class="page-input" id="pageInput" min="1" max="${totalPages}" 
                   value="${this.currentPage}" onkeypress="if(event.key==='Enter') allWordsController.jumpToPage()">
            <span class="page-info">页</span>
        `;

        // 页面信息
        const startIndex = (this.currentPage - 1) * this.pageSize + 1;
        const endIndex = Math.min(this.currentPage * this.pageSize, this.filteredWords.length);
        paginationHTML += `
            <span class="page-info" style="margin-left: 10px;">
                显示 ${startIndex}-${endIndex} / 共 ${this.filteredWords.length} 个单词
            </span>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // 跳转到指定页
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredWords.length / this.pageSize);
        if (page < 1 || page > totalPages) {
            return;
        }
        this.currentPage = page;
        this.displayWords();
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 通过输入框跳转
    jumpToPage() {
        const input = document.getElementById('pageInput');
        const page = parseInt(input.value);
        if (!isNaN(page) && page > 0) {
            this.goToPage(page);
        }
    }
}

// 创建全局实例
const allWordsController = new AllWordsController();

// 返回函数
function goBack() {
    // 返回到对应等级的详情页
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level') || 'A1';
    window.location.href = `${level.toLowerCase()}.html`;
}

// 应用筛选（供按钮调用）
function applyFilters() {
    allWordsController.applyFilters();
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => allWordsController.init());
} else {
    allWordsController.init();
}
