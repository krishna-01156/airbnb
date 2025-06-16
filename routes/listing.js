const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}= require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js")
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingController.index))//Index route
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));//create route to post new listing

//New route
router.get("/new",isLoggedIn,wrapAsync(listingController.renderNewForm));

router.route("/:id")
.get(wrapAsync(listingController.showListing))//show route
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))//update route
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));//delete route

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditform));

module.exports=router;