require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// 视图引擎
app.set('view engine', 'ejs');
app.set('view cache', false);
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(ejsLayouts);

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// 全局变量
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// API 限流: 每 60s 最多 30 次
app.use('/tools/api', require('./middleware/rateLimit')(60000));

// 路由
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/tools', require('./routes/tools'));
app.use('/ai-tools', require('./routes/aiTools'));

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: '页面未找到' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: '服务器错误' });
});

app.listen(PORT, () => {
  console.log(`ToolHub 运行在 http://localhost:${PORT}`);
});
