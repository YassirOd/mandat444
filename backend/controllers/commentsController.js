
const { all, run } = require("../utils/db");

async function getComments(req, res) {
  try {
    const { photo_id } = req.params;
    const rows = await all(
      `SELECT c.*, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.photo_id = ?
       ORDER BY c.created_at ASC`,
      [photo_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erreur getComments:", err);
    res
      .status(500)
      .json({ error: "Erreur lors du chargement des commentaires." });
  }
}

async function addComment(req, res) {
  try {
    const user = req.session.user;
    const { photo_id, comment } = req.body;

    if (!user) {
      return res.status(401).json({ error: "Non autorisé." });
    }
    if (!photo_id || !comment || !comment.trim()) {
      return res
        .status(400)
        .json({ error: "Champs comment/photo_id manquants." });
    }

    await run(
      "INSERT INTO comments (user_id, photo_id, comment) VALUES (?, ?, ?)",
      [user.id, photo_id, comment.trim()]
    );
    res.json({ message: "Commentaire ajouté." });
  } catch (err) {
    console.error("Erreur addComment:", err);
    res
      .status(500)
      .json({ error: "Erreur lors de l'ajout du commentaire." });
  }
}

async function getALLPhotos(req, res) {
  try {
    const rows = await all(`
      SELECT 
        p.*,
        u.username,
        (
          SELECT COUNT(*)
          FROM comments c
          WHERE c.photo_id = p.id
        ) AS comment_count
      FROM photos p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Erreur getALLPhotos:", err);
    res.status(500).json({ error: "Erreur lors du chargement des photos." });
  }
}



module.exports = { getComments, addComment, getALLPhotos };
