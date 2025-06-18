const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist");
const { isLoggedIn } = require("../middleware");

// Show all wishlists for the current user
router.get("/", isLoggedIn, wishlistController.getWishlists);

// Create a new wishlist
router.post("/create", isLoggedIn, wishlistController.createWishlist);

// Add a listing to a wishlist
router.post("/add/:listingId", isLoggedIn, wishlistController.addToWishlist);

// Remove a listing from a wishlist
router.post("/remove/:listingId", isLoggedIn, wishlistController.removeFromWishlist);

module.exports = router;
