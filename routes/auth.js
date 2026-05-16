const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/login', { title: '登录', error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.render('auth/login', { title: '登录', error: '邮箱或密码错误' });
    }
    req.session.user = { id: user.id, email: user.email, plan: user.plan };
    const redirect = req.query.redirect || '/dashboard';
    res.redirect(redirect);
  } catch (err) {
    console.error(err);
    res.render('auth/login', { title: '登录', error: '登录失败，请重试' });
  }
});

router.get('/signup', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/signup', { title: '注册', error: null });
});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.render('auth/signup', { title: '注册', error: '密码至少 6 位' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.render('auth/signup', { title: '注册', error: '该邮箱已被注册' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, plan',
      [email, hash]
    );
    const user = result.rows[0];
    req.session.user = { id: user.id, email: user.email, plan: user.plan };
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/signup', { title: '注册', error: '注册失败，请重试' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/dashboard', require('../middleware/auth'), (req, res) => {
  res.render('auth/dashboard', { title: '仪表板' });
});

module.exports = router;
