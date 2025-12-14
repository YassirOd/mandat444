
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Non autorisé." });
  }
  next();
}

module.exports = { requireAuth };
