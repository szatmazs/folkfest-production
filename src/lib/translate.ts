function convertHungarianOrdinals(text: string): string {
    const romanMap: { [key: string]: string } = {
        'I.': '1st', 'II.': '2nd', 'III.': '3rd', 'IV.': '4th', 'V.': '5th',
        'VI.': '6th', 'VII.': '7th', 'VIII.': '8th', 'IX.': '9th', 'X.': '10th',
        'XI.': '11th', 'XII.': '12th', 'XIII.': '13th', 'XIV.': '14th', 'XV.': '15th'
    };

    let processed = text;
    // Replace Roman numerals with dots (only when surrounded by whitespace or start/end)
    Object.keys(romanMap).forEach(roman => {
        const regex = new RegExp(`(^|\\s)${roman}(\\s|$)`, 'g');
        processed = processed.replace(regex, `$1${romanMap[roman]}$2`);
    });

    // Replace Arabic numerals with dots ONLY when they appear as standalone ordinals
    // (preceded by space or start, followed by space, end, or punctuation — NOT inside filenames/URLs)
    processed = processed.replace(/(^|\s)(\d+)\.([ ,;:!?\n]|$)/g, (match, pre, num, post) => {
        const n = parseInt(num);
        let suffix = 'th';
        if (n % 100 < 11 || n % 100 > 13) {
            if (n % 10 === 1) suffix = 'st';
            else if (n % 10 === 2) suffix = 'nd';
            else if (n % 10 === 3) suffix = 'rd';
        }
        return `${pre}${n}${suffix}${post}`;
    });

    return processed;
}

export async function translateText(text: string, targetLang: string = 'en'): Promise<string> {
    if (!text || text.trim() === '') return '';
    
    // If it looks like a JSON array/object, use translateJsonBlocks instead
    const trimmed = text.trim();
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
            JSON.parse(trimmed);
            return await translateJsonBlocks(text, targetLang);
        } catch (e) {
            // Not valid JSON, fallback to normal translation
        }
    }

    let textToTranslate = text;
    if (targetLang.toLowerCase() === 'en') {
        textToTranslate = convertHungarianOrdinals(text);
    }

    // Check for DeepL API
    const deeplKey = process.env.DEEPL_API_KEY;
    console.log('[Translate] Checking DeepL API Key:', deeplKey ? 'Present (starts with ' + deeplKey.substring(0, 4) + '...)' : 'MISSING');

    if (deeplKey) {
        try {
            console.log('[Translate] Attempting DeepL translation for:', text.substring(0, 30) + '...');
            const response = await fetch('https://api-free.deepl.com/v2/translate', {
                method: 'POST',
                headers: {
                    'Authorization': `DeepL-Auth-Key ${deeplKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    text: textToTranslate,
                    source_lang: 'HU',
                    target_lang: targetLang.toUpperCase(),
                    tag_handling: 'html',
                }),
            });

            console.log('[Translate] DeepL Response Status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                const logMsg = errorText || `(Empty response body for status ${response.status})`;
                console.error('[Translate] DeepL Error Response:', logMsg);
                
                if (response.status === 429) {
                    throw new Error('DeepL API Rate Limit Exceeded (429)');
                }
                throw new Error(`DeepL API error: ${response.status} ${logMsg}`);
            }
            
            const data = await response.json();
            if (data.translations && data.translations[0]) {
                console.log('[Translate] DeepL Success!');
                return unescapeHtml(data.translations[0].text);
            }
        } catch (error) {
            console.error('DeepL Translation Error:', error);
        }
    }

    // Check for OpenAI API as fallback
    if (process.env.OPENAI_API_KEY) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a professional translator for a Cultural Association. Translate the following text to English, preserving the tone and any HTML or special formatting.' },
                        { role: 'user', content: textToTranslate }
                    ],
                    temperature: 0.3,
                }),
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return unescapeHtml(data.choices[0].message.content.trim());
            }
        } catch (error) {
            console.error('OpenAI Translation Error:', error);
        }
    }

    // If we reached here, both APIs failed or were not configured
    const errorMsg = 'No translation API configured or all translation attempts failed.';
    console.warn(`[Translate] ${errorMsg} Returning original text as fallback.`);
    return text;
}

function unescapeHtml(str: string): string {
    if (!str) return str;
    return str
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export async function translateJsonBlocks(jsonString: string, targetLang: string): Promise<string> {
    if (!jsonString || jsonString === '[]') return jsonString;
    
    let processedJson = jsonString;
    // If it looks like encoded JSON, unescape it
    if (jsonString.includes('&quot;')) {
        processedJson = unescapeHtml(jsonString);
    }

    try {
        const blocks = JSON.parse(processedJson);
        if (!Array.isArray(blocks)) return jsonString;

        console.log(`[TranslateJson] Translating ${blocks.length} blocks...`);

        const translatedBlocks = await Promise.all(blocks.map(async (block: any) => {
            const newBlock = { ...block };
            
            // Translate common text fields in blocks
            // IMPORTANT: never translate gallery/image/video blocks - their content is URLs
            if (block.content && typeof block.content === 'string' 
                && block.type !== 'image' 
                && block.type !== 'video'
                && block.type !== 'gallery') {
                newBlock.content = await translateText(block.content, targetLang);
            }
            // Preserve images array as-is (URLs must never be translated)
            if (block.images && Array.isArray(block.images)) {
                newBlock.images = block.images; // copy unchanged
            }
            if (block.title && typeof block.title === 'string') {
                newBlock.title = await translateText(block.title, targetLang);
            }
            if (block.text && typeof block.text === 'string') {
                newBlock.text = await translateText(block.text, targetLang);
            }
            if (block.buttonLabel && typeof block.buttonLabel === 'string') {
                newBlock.buttonLabel = await translateText(block.buttonLabel, targetLang);
            }

            // Handle nested items (like in lists or accordions)
            if (block.items && Array.isArray(block.items)) {
                newBlock.items = await Promise.all(block.items.map(async (item: any) => {
                    const newItem = { ...item };
                    if (item.title && typeof item.title === 'string') newItem.title = await translateText(item.title, targetLang);
                    if (item.content && typeof item.content === 'string') newItem.content = await translateText(item.content, targetLang);
                    if (item.text && typeof item.text === 'string') newItem.text = await translateText(item.text, targetLang);
                    return newItem;
                }));
            }

            return newBlock;
        }));

        return JSON.stringify(translatedBlocks);
    } catch (e) {
        console.error('[TranslateJson] Error parsing/translating blocks:', e);
        return jsonString;
    }
}

export async function translateTextWithPreservation(
    newHu: string,
    currentEn: string,
    originalHu: string,
    targetLang: string = 'en'
): Promise<string> {
    if (!newHu || newHu.trim() === '') return '';
    
    // Only apply preservation logic if it's JSON
    const trimmedNew = newHu.trim();
    const isJson = (trimmedNew.startsWith('[') && trimmedNew.endsWith(']')) || (trimmedNew.startsWith('{') && trimmedNew.endsWith('}'));
    if (!isJson) {
        return await translateText(newHu, targetLang);
    }
    
    try {
        const newBlocks = JSON.parse(newHu);
        if (!Array.isArray(newBlocks)) return await translateText(newHu, targetLang);

        let originalBlocks: any[] = [];
        try {
            const parsed = JSON.parse(originalHu || '[]');
            if (Array.isArray(parsed)) originalBlocks = parsed;
        } catch (e) {}

        let currentEnBlocks: any[] = [];
        try {
            const parsed = JSON.parse(currentEn || '[]');
            if (Array.isArray(parsed)) currentEnBlocks = parsed;
        } catch (e) {}
        
        const translatedBlocks = await Promise.all(newBlocks.map(async (block: any) => {
            // Try to find a matching block in original HU
            const origIndex = originalBlocks.findIndex((origBlock: any) => {
                if (!origBlock || origBlock.type !== block.type) return false;
                
                // Compare critical content fields to ensure the block hasn't changed in Hungarian
                const fieldsToCompare = ['content', 'title', 'text', 'buttonLabel'];
                for (const field of fieldsToCompare) {
                    if (block[field] !== origBlock[field]) return false;
                }
                
                // Compare nested items
                if (Array.isArray(block.items) || Array.isArray(origBlock.items)) {
                    if (!Array.isArray(block.items) || !Array.isArray(origBlock.items)) return false;
                    if (block.items.length !== origBlock.items.length) return false;
                    for (let i = 0; i < block.items.length; i++) {
                        for (const field of fieldsToCompare) {
                            if (block.items[i]?.[field] !== origBlock.items[i]?.[field]) return false;
                        }
                    }
                }
                
                return true;
            });
            
            // If found and there is a corresponding current EN block, preserve it
            if (origIndex !== -1 && currentEnBlocks[origIndex] && currentEnBlocks[origIndex].type === block.type) {
                console.log(`[TranslatePreservation] Preserving manual edits for block of type: ${block.type}`);
                return currentEnBlocks[origIndex];
            }
            
            // Otherwise, translate this single block
            console.log(`[TranslatePreservation] Translating new/modified block of type: ${block.type}`);
            const singleBlockArray = [block];
            const translatedSingleJson = await translateJsonBlocks(JSON.stringify(singleBlockArray), targetLang);
            const translatedSingle = JSON.parse(translatedSingleJson);
            return translatedSingle[0];
        }));
        
        return JSON.stringify(translatedBlocks);
    } catch (e) {
        console.error('[TranslatePreservation] Error merging/translating blocks:', e);
        return await translateText(newHu, targetLang);
    }
}
