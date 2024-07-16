const express = require('express');
const isloggedin = require('../middlewears/isLoggedIn');
const userController = require("../controllers/authcontroller");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

const router = express.Router();

router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error, loggedin: false });
});

router.get("/users/register", function (req, res) {
  let error = req.flash("error");
  res.render("register", { error, loggedin: false });
});

router.get('/forgot-password', (req, res) => {
  let error = req.flash("error");
  res.render('forgot-password', { error, loggedin: false });
});

router.post('/forgot-password', userController.forgotPassword);

router.get('/reset-password', (req, res) => {
    const { resetToken } = req.params;
    res.render('reset-password', { resetToken });
});

router.post('/reset-password/:token', userController.resetPassword);

router.get("/shop", isloggedin, async (req, res) => {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render('shop', { products, success });
});

router.get("/cart", isloggedin, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email }).populate("cart");
  const bill = Number(user.cart[0].price) + 20 - Number(user.cart[0].discount);
  res.render('cart', { user, bill });
});

router.get("/addtocart/:productid", isloggedin, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  user.cart.push(req.params.productid);
  await user.save();
  req.flash("success", "Added to Cart");
  res.redirect("/shop");
});

router.get("/logout", isloggedin, async (req, res) => {
  req.logout();
  res.render("shop");
});

module.exports = router;
