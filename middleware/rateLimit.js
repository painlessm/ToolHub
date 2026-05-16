const rateLimit = windowMs => {
  const hits = new Map();

  // 定期清理，避免内存泄露
  setInterval(() => {
    const now = Date.now();
    for (const [key, info] of hits) {
      if (now - info.reset > windowMs * 2) hits.delete(key);
    }
  }, 60000);

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress;
    const now = Date.now();
    const info = hits.get(key);

    if (!info || now > info.reset) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }

    info.count++;
    if (info.count > 30) {
      return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    }
    next();
  };
};

module.exports = rateLimit;
