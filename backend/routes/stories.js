const express = require("express");
const { listAll, listMine, create } = require("../controllers/storiesController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", listAll);
router.get("/me", requireAuth, listMine);
router.post("/", requireAuth, create);

module.exports = router;
