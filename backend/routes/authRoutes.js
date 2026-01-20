const express = require("express");
const router = express.Router();
const { googleAuth } = require("../controller/authController");
const { githubAuth } = require("../controller/githubController");



router.post("/google", googleAuth);
router.post("/github", githubAuth);







module.exports = router;





