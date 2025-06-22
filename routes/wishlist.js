const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist");
const { isLoggedIn } = require("../middleware");

// Show all wishlists for the current user
router.get("/", isLoggedIn, wishlistController.viewWishlists);

// // Create a new wishlist
// router.post("/create", isLoggedIn, wishlistController.createWishlist);

// Get all wishlists for the logged-in user (used for modal)
router.get("/user", isLoggedIn, wishlistController.getUserWishlists);


// Add a listing to a wishlist
router.post("/add/:listingId", isLoggedIn, wishlistController.addToWishlist);

// Remove a listing from a wishlist
router.post("/remove/:listingId", isLoggedIn, wishlistController.removeFromWishlist);

router.post("/rename/:id", isLoggedIn, wishlistController.renameWishlist);
router.post("/delete/:id", isLoggedIn, wishlistController.deleteWishlist);


module.exports = router;
