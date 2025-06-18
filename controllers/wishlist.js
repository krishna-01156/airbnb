const Wishlist = require('../models/wishlist.js');

const Wishlist = require("../models/wishlist");

module.exports.addToWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { name } = req.body;

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id, name });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user._id,
                name,
                listings: [listing._id]
            });
        } else {
            if (!wishlist.listings.includes(listing._id)) {
                wishlist.listings.push(listing._id);
            }
        }

        await wishlist.save();

        // If it's a fetch() request, respond with JSON
        if (req.headers.accept.includes('application/json')) {
            return res.status(200).json({ success: true, wishlistId: wishlist._id });
        }

        // Else fallback
        req.flash("success", "Added to wishlist!");
        res.redirect("/listings");

    } catch (err) {
        console.error("Error adding to wishlist:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.viewWishlists = async (req, res) => {
    const wishlists = await Wishlist.find({ user: req.user._id }).populate("listings");
    res.render("wishlists/index", { wishlists });
};
