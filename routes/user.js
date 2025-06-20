const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController=require("../controllers/users.js");

router.route("/signup")
.get(wrapAsync(userController.renderSignupForm))
.post(wrapAsync(userController.signup));

router.route("/login")
.get(wrapAsync(userController.renderLoginForm))
.post(saveRedirectUrl, passport.authenticate("local",{ failureRedirect:'/login',failureFlash : true}),userController.login);

router.post("/logout",userController.logout);

module.exports=router;