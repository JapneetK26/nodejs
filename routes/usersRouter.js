const express = require('express');
const router = express.Router();
const isLoggedIn = require("../middlewears/isLoggedIn");
const { registerUser,
    loginUser,
    logout,
} = require("../controllers/authcontroller")


router.get("/", function (req, res) {
    res.send("hey");
});

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logout);

module.exports = router;