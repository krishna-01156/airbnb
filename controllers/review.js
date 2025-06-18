const Wishlist = require("../models/wishlist");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

module.exports.addToWishlist = async (req, res) => {
    const { listingId } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    let wishlist = await Wishlist.findOne({ user: userId, name });

    if (!wishlist) {
        wishlist = new Wishlist({ name, user: userId, listings: [listingId] });
    } else {
        if (!wishlist.listings.includes(listingId)) {
            wishlist.listings.push(listingId);
        }
    }

    await wishlist.save();
    req.flash("success", "Listing added to wishlist");
    res.redirect("/listings");
};

module.exports.viewWishlists = async (req, res) => {
    const wishlists = await Wishlist.find({ user: req.user._id }).populate("listings");
    res.render("wishlists/index", { wishlists });
};
