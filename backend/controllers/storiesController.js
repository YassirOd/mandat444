const { all, run } = require("../utils/db");

async function ensureStoriesTable() {
  await run(
    "CREATE TABLE IF NOT EXISTS stories (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, image_url TEXT, video_url TEXT, title TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
  );
  const cols = await all("PRAGMA table_info(stories)");
  const names = cols.map((c) => c.name);
  if (!names.includes("video_url")) {
    await run("ALTER TABLE stories ADD COLUMN video_url TEXT");
  }
}

async function listAll(req, res) {
  try {
    await ensureStoriesTable();
    const rows = await all(
      `SELECT s.*, u.username FROM stories s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des stories." });
  }
}

async function listMine(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Non autorisé." });
    }
    await ensureStoriesTable();
    const rows = await all(
      `SELECT s.*, u.username FROM stories s JOIN users u ON s.user_id = u.id WHERE s.user_id = ? ORDER BY s.created_at DESC`,
      [req.session.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des stories." });
  }
}

async function create(req, res) {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: "Non autorisé." });
    }
    const { image_url = "", video_url = "", title = "" } = req.body || {};
    if (!image_url.trim() && !video_url.trim()) {
      return res.status(400).json({ error: "image_url ou video_url requis." });
    }
    await ensureStoriesTable();
    const result = await run(
      "INSERT INTO stories (user_id, image_url, video_url, title) VALUES (?, ?, ?, ?)",
      [user.id, image_url.trim() || null, video_url.trim() || null, title.trim()]
    );
  } catch (err) {
    console.error("Erreur create story:", err);
    res.status(500).json({ error: "Erreur lors de la création de la story." });
  }
}

module.exports = { listAll, listMine, create };
