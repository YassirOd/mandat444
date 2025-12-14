
const { get, run } = require("../utils/db");

async function getLikes(req, res) {
  try {
    const { photo_id } = req.params;
    const row = await get(
      "SELECT COUNT(*) AS likes FROM likes WHERE photo_id = ?",
      [photo_id]
    );
    res.json({ likes: row ? row.likes : 0 });
  } catch (err) {
    console.error("Erreur getLikes:", err);
    res.status(500).json({ error: "Erreur lors du chargement des likes." });
  }
}

async function toggleLike(req, res) {
  try {
    const user = req.session.user;
    const { photo_id } = req.body;

    if (!user) {
      return res.status(401).json({ error: "Non autorisé." });
    }
    if (!photo_id) {
      return res.status(400).json({ error: "photo_id manquant." });
    }

    const existing = await get(
      "SELECT * FROM likes WHERE user_id = ? AND photo_id = ?",
      [user.id, photo_id]
    );

    if (existing) {
      await run(
        "DELETE FROM likes WHERE user_id = ? AND photo_id = ?",
        [user.id, photo_id]
      );
    } else {
      await run(
        "INSERT INTO likes (user_id, photo_id) VALUES (?, ?)",
        [user.id, photo_id]
      );
    }

    const row = await get(
      "SELECT COUNT(*) AS likes FROM likes WHERE photo_id = ?",
      [photo_id]
    );

    res.json({ liked: !existing, likes: row ? row.likes : 0 });
  } catch (err) {
    console.error("Erreur toggleLike:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du like." });
  }
}

module.exports = { getLikes, toggleLike };
