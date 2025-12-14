
const { all, run } = require("../utils/db");

async function getPhotos(req, res) {
  try {
    const search = (req.query.search || "").trim();
    let rows;

    if (search) {
      rows = await all(
        `SELECT p.*,
                u.username,
                (SELECT COUNT(*) FROM comments c WHERE c.photo_id = p.id) AS comment_count
         FROM photos p
         JOIN users u ON p.user_id = u.id
         WHERE p.caption LIKE ?
         ORDER BY p.created_at DESC`,
        [`%${search}%`]
      );
    } else {
      rows = await all(
        `SELECT p.*,
                u.username,
                (SELECT COUNT(*) FROM comments c WHERE c.photo_id = p.id) AS comment_count
         FROM photos p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC`
      );
    }

    res.json(rows);
  } catch (err) {
    console.error("Erreur getPhotos:", err);
    res.status(500).json({ error: "Erreur lors du chargement des photos." });
  }
}


async function addPhoto(req, res) {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: "Non autorisé." });
    }
    const { image_path, caption } = req.body;
    if (!image_path) {
      return res.status(400).json({ error: "URL de l'image manquante." });
    }
    await run(
      "INSERT INTO photos (user_id, image_path, caption) VALUES (?, ?, ?)",
      [user.id, image_path, caption || ""]
    );
    res.json({ message: "Photo ajoutée avec succès." });
  } catch (err) {
    console.error("Erreur addPhoto:", err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la photo." });
  }
}

// Photos du profil connecté
async function getMyPhotos(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Non autorisé." });
    }
    const userId = req.session.user.id;
    const rows = await all(
      `SELECT p.*, u.username
       FROM photos p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erreur getMyPhotos:", err);
    res.status(500).json({ error: "Erreur lors du chargement des photos du profil." });
  }
}

module.exports = { getPhotos, addPhoto, getMyPhotos };
