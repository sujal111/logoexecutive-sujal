const express = require("express");
const router = express.Router();
const { updateProfileController } = require("../controllers/updateProfile");
const authMiddleware = require("../middlewares/auth");

router.post("/",authMiddleware, updateProfileController);


module.exports = router;