
const express = require("express");
const { getPhotos, addPhoto, getMyPhotos } = require("../controllers/photosController");
const { requireAuth } = require("../middleware/authMiddleware");
const { db,run } = require("../utils/db");

const router = express.Router();

router.get("/me", requireAuth, getMyPhotos);
router.get("/", getPhotos);
router.post("/", requireAuth, addPhoto);
router.delete("/:id", requireAuth, async (req, res) => {
    try{
        const user = req.session.user;
        const{id} = req.params;

        if(!user){
            return res.status(401).json({error: "Non autorisé."});
        }
        // Vérifier si la photo appartient à l'utilisateur
        const result = await run("delete from photos where id = ? and user_id = ?", [id, user.id]);

        if(result.changes === 0){
            return res.status(403).json({error: "Vous n'êtes pas autorisé à supprimer cette photo."});
        }
        res.status(200).json({message: "Photo supprimée avec succès."});
    } catch (err) {
        console.error(err, "Erreur lors de la suppression de la photo");
        res.status(500).json({error: "Erreur serveur."});
    }
});

module.exports = router;
