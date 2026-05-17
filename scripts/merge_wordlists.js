#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file1 = 'e:/ClaudeCode/verbal_test/frontend/src/data/wordlist.ts';
const file2 = 'f:/xwechat_files/wxid_wgre5q6gl86w22_471d/msg/file/2026-05/wordlist(1).txt';

function extractWords(content) {
    const words = [];
    const regex = /['"]([^'\"]+)['"]/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
        const w = m[1].trim();
        if (w.length) words.push(w);
    }
    return words;
}

function mergeAndDedup(a, b) {
    const s = new Set();
    a.concat(b).forEach(w => {
        if (!w) return;
        s.add(w.toLowerCase());
    });
    return Array.from(s).sort((x, y) => x.localeCompare(y));
}

try {
    const c1 = fs.readFileSync(file1, 'utf8');
    const c2 = fs.readFileSync(file2, 'utf8');
    const words1 = extractWords(c1);
    const words2 = extractWords(c2);

    const merged = mergeAndDedup(words1, words2);

    const perLine = 10;
    const lines = [];
    for (let i = 0; i < merged.length; i += perLine) {
        const chunk = merged.slice(i, i + perLine).map(w => `"${w.replace(/"/g, '\\"')}"`).join(', ');
        lines.push('  ' + chunk + (i + perLine < merged.length ? ',' : ''));
    }

    const header = `// Verbal Memory wordlist\n// 由脚本合并生成，来自两个词表，已按字母排序并去重\nexport const WORDLIST: readonly string[] = [\n`;
    const out = header + lines.join('\n') + '\n];\n';

    fs.writeFileSync(file1, out, 'utf8');
    console.log(`WROTE ${merged.length} unique words to ${file1}`);
} catch (err) {
    console.error(err);
    process.exit(1);
}
