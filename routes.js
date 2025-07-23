const express = require("express");
const router = express.Router();
const auth = require('./middleware/auth');

const controller = require("./controllers/controller");
// router.get("/:network/tokens", controller.getTokens);
// router.get("/:network/token/:token/:owner", controller.getToken);

module.exports = router;
