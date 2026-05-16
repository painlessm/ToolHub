const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 工具页路由
const toolTemplates = {
  'json-formatter': 'tools/json-formatter',
  'regex-tester': 'tools/regex-tester',
  'base64': 'tools/base64',
  'word-counter': 'tools/word-counter',
  'url-encode': 'tools/url-encode',
  'md5-sha': 'tools/md5-sha',
  'unicode': 'tools/unicode',
  'timestamp': 'tools/timestamp',
  'color-picker': 'tools/color-picker',
  'ip-lookup': 'tools/ip-lookup',
  'image-compress': 'tools/image-compress',
  'image-to-base64': 'tools/image-to-base64',
  'pdf-merge': 'tools/pdf-merge',
  'code-runner': 'tools/code-runner',
};

router.get('/:slug', (req, res) => {
  const template = toolTemplates[req.params.slug];
  if (!template) return res.redirect('/');
  res.render(template, { title: getTitle(req.params.slug), slug: req.params.slug });
});

// IP 查询 API
router.get('/api/ip-lookup', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket.remoteAddress?.replace(/^::ffff:/, '');
    const queryIp = req.query.ip || clientIp;

    // 跳过保留地址的远程查询
    if (['::1', '127.0.0.1', 'localhost'].includes(queryIp)) {
      return res.json({ success: false, error: '本地地址不支持查询，请输入公网 IP' });
    }

    // 主源: ip-api.com
    let geo = null;
    try {
      const resp = await require('axios').get(`http://ip-api.com/json/${queryIp}?lang=zh-CN`, { timeout: 3000 });
      if (resp.data && resp.data.status === 'success') geo = resp.data;
    } catch (_) {}

    // 备用源: ipapi.co
    if (!geo) {
      try {
        const resp = await require('axios').get(`https://ipapi.co/${queryIp}/json/`, { timeout: 5000 });
        if (resp.data && !resp.data.error) {
          geo = {
            query: resp.data.ip,
            country: resp.data.country_name,
            regionName: resp.data.region,
            city: resp.data.city,
            isp: resp.data.org,
            org: resp.data.org,
            timezone: resp.data.timezone,
            lat: resp.data.latitude,
            lon: resp.data.longitude,
            status: 'success',
          };
        }
      } catch (_) {}
    }

    if (!geo || geo.status !== 'success') {
      return res.json({ success: false, error: '查询服务暂不可用，请稍后重试' });
    }

    res.json({
      success: true,
      ip: geo.query,
      country: geo.country || geo.country_name,
      region: geo.regionName || geo.region,
      city: geo.city,
      isp: geo.isp || geo.org,
      org: geo.org || geo.isp,
      timezone: geo.timezone,
      lat: geo.lat || geo.latitude,
      lon: geo.lon || geo.longitude,
    });
  } catch (e) {
    res.json({ success: false, error: '查询服务暂不可用，请稍后重试' });
  }
});

// JSON 格式化 API
router.post('/api/json-format', (req, res) => {
  const { input, action } = req.body;
  try {
    const obj = JSON.parse(input);
    if (action === 'minify') {
      res.json({ success: true, output: JSON.stringify(obj) });
    } else {
      res.json({ success: true, output: JSON.stringify(obj, null, 2) });
    }
  } catch (e) {
    res.json({ success: false, error: 'JSON 格式无效: ' + e.message });
  }
});

// 图片压缩 API
router.post('/api/image-compress', require('multer')({ dest: '/tmp/', limits: { fileSize: 10 * 1024 * 1024 } }).single('image'), async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, error: '请上传图片' });
    const sharp = require('sharp');
    const quality = parseInt(req.body.quality) || 80;
    const format = req.body.format || req.file.mimetype.split('/')[1] || 'jpeg';
    const ext = format === 'jpeg' ? 'jpg' : format;
    const outPath = `/tmp/compressed_${Date.now()}.${ext}`;
    await sharp(req.file.path)
      .toFormat(format, { quality })
      .toFile(outPath);
    const data = fs.readFileSync(outPath);
    const base64 = data.toString('base64');
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(outPath);
    res.json({
      success: true,
      originalSize: req.file.size,
      compressedSize: data.length,
      dataUrl: `data:image/${format};base64,${base64}`,
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// 图片转 Base64 API
router.post('/api/image-to-base64', require('multer')({ dest: '/tmp/', limits: { fileSize: 10 * 1024 * 1024 } }).single('image'), async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, error: '请上传图片' });
    const data = fs.readFileSync(req.file.path);
    const base64 = data.toString('base64');
    const mime = req.file.mimetype;
    fs.unlinkSync(req.file.path);
    res.json({ success: true, dataUrl: `data:${mime};base64,${base64}`, size: data.length });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// PDF 合并 API
router.post('/api/pdf-merge', require('multer')({ dest: '/tmp/', limits: { fileSize: 50 * 1024 * 1024 } }).array('pdfs', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) return res.json({ success: false, error: '请至少上传 2 个 PDF 文件' });
    const { PDFDocument } = require('pdf-lib');
    const merged = await PDFDocument.create();
    for (const file of req.files) {
      const data = fs.readFileSync(file.path);
      const doc = await PDFDocument.load(data);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
      fs.unlinkSync(file.path);
    }
    const pdfBytes = await merged.save();
    const base64 = Buffer.from(pdfBytes).toString('base64');
    res.json({ success: true, dataUrl: 'data:application/pdf;base64,' + base64, filename: 'merged.pdf' });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// 在线代码运行器
router.post('/api/code-run', async (req, res) => {
  const { language, code, stdin } = req.body;
  if (!code || !language) return res.json({ success: false, error: '请提供代码和语言' });

  const allowed = ['c', 'cpp', 'python'];
  if (!allowed.includes(language)) return res.json({ success: false, error: '不支持的语言' });
  if (code.length > 50000) return res.json({ success: false, error: '代码超过 50000 字符限制' });

  const { execSync } = require('child_process');
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const dir = `/tmp/code_${id}`;
  fs.mkdirSync(dir);

  const input = (stdin || '').slice(0, 10000);

  try {
    let output = '';
    if (language === 'python') {
      fs.writeFileSync(`${dir}/main.py`, code);
      try {
        output = execSync(`timeout 5 python3 ${dir}/main.py`, {
          timeout: 6000, maxBuffer: 1024 * 512, encoding: 'utf-8', input,
        });
      } catch (e) { output = (e.stdout || '') + (e.stderr || '') || e.message; }
    } else if (language === 'c') {
      fs.writeFileSync(`${dir}/main.c`, code);
      try {
        execSync(`timeout 5 gcc -O2 -o ${dir}/main ${dir}/main.c 2>&1`, {
          timeout: 6000, maxBuffer: 1024 * 256, encoding: 'utf-8',
        });
        try {
          output = execSync(`timeout 3 ${dir}/main`, {
            timeout: 4000, maxBuffer: 1024 * 512, encoding: 'utf-8', input,
          });
        } catch (e) { output = (e.stdout || '') + (e.stderr || '') || e.message; }
      } catch (e) { output = (e.stdout || '') + (e.stderr || '') || e.message; }
    } else if (language === 'cpp') {
      fs.writeFileSync(`${dir}/main.cpp`, code);
      try {
        execSync(`timeout 5 g++ -O2 -o ${dir}/main ${dir}/main.cpp 2>&1`, {
          timeout: 6000, maxBuffer: 1024 * 256, encoding: 'utf-8',
        });
        try {
          output = execSync(`timeout 3 ${dir}/main`, {
            timeout: 4000, maxBuffer: 1024 * 512, encoding: 'utf-8', input,
          });
        } catch (e) { output = (e.stdout || '') + (e.stderr || '') || e.message; }
      } catch (e) { output = (e.stdout || '') + (e.stderr || '') || e.message; }
    }
    res.json({ success: true, output: output.slice(0, 100000) });
  } catch (e) {
    res.json({ success: false, error: '运行异常: ' + e.message });
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
  }
});

function getTitle(slug) {
  const titles = {
    'json-formatter': 'JSON 格式化 - 在线 JSON 美化压缩',
    'regex-tester': '正则表达式测试 - 在线正则匹配',
    'base64': 'Base64 编解码 - 在线 Base64 加解密',
    'word-counter': '字数统计 - 在线字符计数',
    'url-encode': 'URL 编解码 - 在线 URL 加解密',
    'md5-sha': 'MD5/SHA 哈希 - 在线哈希生成',
    'unicode': 'Unicode 转换 - 中文 Unicode 互转',
    'timestamp': '时间戳转换 - Unix 时间戳在线转换',
    'color-picker': '颜色选择器 - HEX RGB HSL 转换',
    'ip-lookup': 'IP 查询 - 你的 IP 地址归属地',
    'image-compress': '图片压缩 - 在线 PNG JPEG 压缩',
    'image-to-base64': '图片转 Base64 - 在线图片编码',
    'pdf-merge': 'PDF 合并 - 多个 PDF 在线合并',
    'code-runner': '在线代码运行器 - 在线运行 C C++ Python',
  };
  return titles[slug] || 'ToolHub';
}

module.exports = router;
