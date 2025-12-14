
const express = require("express");
const { getLikes, toggleLike } = require("../controllers/likesController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:photo_id", getLikes);
router.post("/toggle", requireAuth, toggleLike);

module.exports = router;
