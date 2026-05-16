module.exports = function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
};
