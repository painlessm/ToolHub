const express = require('express');
const router = express.Router();

// SVG icon helpers
const icons = {
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  encode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  dev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
};

const tools = [
  { slug: 'json-formatter', name: 'JSON 格式化', desc: '格式化、压缩、验证 JSON 数据', icon: icons.text, cat: 'text' },
  { slug: 'regex-tester', name: '正则测试器', desc: '实时正则表达式测试与匹配', icon: icons.text, cat: 'text' },
  { slug: 'base64', name: 'Base64 编解码', desc: 'Base64 编码与解码转换', icon: icons.encode, cat: 'text' },
  { slug: 'word-counter', name: '字数统计', desc: '字符、单词、行数统计', icon: icons.text, cat: 'text' },
  { slug: 'url-encode', name: 'URL 编解码', desc: 'URL 编码与解码', icon: icons.encode, cat: 'encode' },
  { slug: 'md5-sha', name: 'MD5 / SHA 哈希', desc: 'MD5、SHA1、SHA256 哈希生成', icon: icons.encode, cat: 'encode' },
  { slug: 'unicode', name: 'Unicode 转换', desc: 'Unicode 与中文互转', icon: icons.encode, cat: 'encode' },
  { slug: 'timestamp', name: '时间戳转换', desc: 'Unix 时间戳与日期互转', icon: icons.dev, cat: 'dev' },
  { slug: 'color-picker', name: '颜色选择器', desc: '拾色、HEX/RGB/HSL 格式转换', icon: icons.dev, cat: 'dev' },
  { slug: 'ip-lookup', name: 'IP 查询', desc: '查询 IP 地址归属地信息', icon: icons.dev, cat: 'dev' },
  { slug: 'image-compress', name: '图片压缩', desc: '在线压缩 PNG/JPEG/WebP', icon: icons.image, cat: 'image' },
  { slug: 'image-to-base64', name: '图片转 Base64', desc: '将图片转换为 Base64 字符串', icon: icons.image, cat: 'image' },
  { slug: 'pdf-merge', name: 'PDF 合并', desc: '多个 PDF 文件合并为一个', icon: icons.pdf, cat: 'pdf' },
  { slug: 'code-runner', name: '在线代码运行器', desc: '在线运行 C / C++ / Python 代码', icon: icons.dev, cat: 'dev' },
];

const categories = [
  { id: 'text', name: '文本处理', icon: icons.text },
  { id: 'encode', name: '编码转换', icon: icons.encode },
  { id: 'image', name: '图片处理', icon: icons.image },
  { id: 'pdf', name: 'PDF 工具', icon: icons.pdf },
  { id: 'dev', name: '开发工具', icon: icons.dev },
];

router.get('/', (req, res) => {
  res.render('index', { title: 'ToolHub - 在线工具箱', tools, categories });
});

module.exports = router;
