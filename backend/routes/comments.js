
const express = require("express");
const { getComments, addComment } = require("../controllers/commentsController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:photo_id", getComments);
router.post("/", requireAuth, addComment);

module.exports = router;
