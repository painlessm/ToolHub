const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM ai_tools';
    const params = [];
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY is_featured DESC, votes DESC';
    const result = await pool.query(query, params);
    const catResult = await pool.query('SELECT DISTINCT category FROM ai_tools ORDER BY category');
    const categories = catResult.rows.map(r => r.category).filter(Boolean);
    res.render('ai-tools/index', { title: 'AI 工具导航', tools: result.rows, categories, currentCategory: category || '' });
  } catch (err) {
    console.error(err);
    res.render('ai-tools/index', { title: 'AI 工具导航', tools: [], categories: [], currentCategory: '' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_tools WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.redirect('/ai-tools');
    res.render('ai-tools/detail', { title: result.rows[0].name, tool: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.redirect('/ai-tools');
  }
});

module.exports = router;
