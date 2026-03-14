// 意大利语到中文翻译：统一使用 Google 翻译接口（意→中，释义更稳定）
class TranslationHelper {
    constructor() {
        // 缓存：key 为意大利语单词，value 为中文释义
        this.translationCache = {};
        // 英文→中文缓存（用于选项展示）
        this.englishToChineseCache = {};
        // 意大利语易被误译的纠正表（意→中）：月份、性别、常见音译等
        this.italianOverrides = {
            gennaio: '1月', febbraio: '2月', marzo: '3月', aprile: '4月',
            maggio: '5月', giugno: '6月', luglio: '7月', agosto: '8月',
            settembre: '9月', ottobre: '10月', novembre: '11月', dicembre: '12月',
            cugina: '表姐；表妹',
            cugino: '表哥；表弟',
            bravo: '好；能干；勇敢',
            cola: '可乐',
            acqua: '水',
            ha: '有',
            zeta:'z',
            bibita:'饮料',
            cappotto:'外套，大衣',
            abitare:'居住',
            cucinare:'做饭',
            bicchiere:'杯子',
            autunno:'秋天',
            libreria:'书店',
            foglio:'纸，页',
            rosa:'粉色的',
            leggere:'阅读',
            pulire:'清洁、打扫',
            potere:'能、可以',
            sentire:'听、感觉',
            ogni:'每个',
            papa:'爸爸',
            è:'是',
            effe:'f'
        };
    }

    /**
     * 将意大利语单词/短语翻译为中文（使用 Google 翻译 意→中）
     * @param {string} italianText - 意大利语原文
     * @returns {Promise<string|null>} 中文释义
     */
    async getChineseTranslation(italianText) {
        const mainText = (italianText || '').trim();
        if (!mainText) return null;

        const key = mainText.toLowerCase();
        if (this.italianOverrides[key]) {
            return this.italianOverrides[key];
        }

        let cached = this.translationCache[mainText];
        if (cached) {
            if (key === 'maggio' && cached === '可能') this.translationCache[mainText] = null;
            else return cached;
        }

        const fixWrongTranslation = (italian, chinese) => {
            const k = italian.toLowerCase();
            if (k === 'maggio' && (chinese === '可能' || chinese === '可以')) return '5月';
            if (k === 'acqua' && chinese === '瀑布') return '水';
            return chinese;
        };

        // 使用 Google 翻译（意→中）。在中国大陆该接口可能被墙或极慢，故设置短超时快速失败
        const TRANSLATE_TIMEOUT_MS = 8000;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=zh-CN&dt=t&q=${encodeURIComponent(mainText)}`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data && data[0] && data[0][0] && data[0][0][0]) {
                    let chinese = data[0][0][0];
                    chinese = fixWrongTranslation(mainText, chinese);
                    this.translationCache[mainText] = chinese;
                    return chinese;
                }
            }
        } catch (error) {
            console.warn('Google Translate API 失败:', error);
        }

        return null;
    }

    /**
     * 将英文翻译为中文（用于选项统一展示 英文 (中文)）
     * @param {string} englishText - 英文
     * @returns {Promise<string|null>} 中文
     */
    async getChineseFromEnglish(englishText) {
        const text = (englishText || '').trim();
        if (!text) return null;
        const key = text.toLowerCase();
        if (this.englishToChineseCache[key]) return this.englishToChineseCache[key];
        const TRANSLATE_TIMEOUT_MS = 8000;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                if (data && data[0] && data[0][0] && data[0][0][0]) {
                    const chinese = data[0][0][0];
                    this.englishToChineseCache[key] = chinese;
                    return chinese;
                }
            }
        } catch (e) {
            console.warn('Google Translate 英→中 失败:', e);
        }
        return null;
    }

    // 格式化显示：英文 (中文)，中文由意大利语翻译得到，需传入 italianWord
    async formatDisplay(englishText, italianWord) {
        const chinese = italianWord ? await this.getChineseTranslation(italianWord) : null;
        if (chinese) {
            return `${englishText} (${chinese})`;
        }
        return englishText;
    }

    /**
     * 批量获取中文翻译（按意大利语单词翻译）
     * @param {string[]} italianWords - 意大利语单词列表
     * @returns {Promise<Object>} 键为意大利语单词，值为中文
     */
    async batchTranslate(italianWords) {
        const results = {};
        const promises = [];

        for (const word of italianWords) {
            const key = (word || '').trim();
            if (!key) continue;
            if (this.translationCache[key]) {
                results[key] = this.translationCache[key];
            } else {
                promises.push(
                    this.getChineseTranslation(key).then(chinese => {
                        results[key] = chinese;
                    })
                );
            }
        }

        await Promise.all(promises);
        return results;
    }
}

// 创建全局实例
const translationHelper = new TranslationHelper();
