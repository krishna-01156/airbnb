const Wishlist = require('../models/wishlist.js');
const Listing = require('../models/listing.js');

module.exports.addToWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { name, wishlistId } = req.body;
        const userId = req.user._id;

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        let wishlist;

        if (wishlistId) {
            // ➤ Add to existing wishlist
            wishlist = await Wishlist.findOne({ _id: wishlistId, user: userId });
            if (!wishlist) {
                return res.status(404).json({ error: "Wishlist not found" });
            }
        } else if (name) {
            // ➤ Create a new wishlist
            wishlist = new Wishlist({
                user: userId,
                name,
                listings: []
            });
        } else {
            return res.status(400).json({ error: "Missing wishlist name or ID" });
        }

        // ➤ Add listing to wishlist if not already there
        if (!wishlist.listings.includes(listing._id)) {
            wishlist.listings.push(listing._id);
        }

        await wishlist.save();

        // ➤ Return JSON if fetch was used
        if (req.headers.accept.includes('application/json')) {
            return res.status(200).json({ success: true, wishlistId: wishlist._id });
        }

        // ➤ Fallback redirect
        req.flash("success", "Added to wishlist!");
        res.redirect("/listings");

    } catch (err) {
        console.error("Error adding to wishlist:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.getUserWishlists = async (req, res) => {
    try {
        const wishlists = await Wishlist.find({ user: req.user._id });
        res.status(200).json(wishlists);
    } catch (err) {
        console.error("Error fetching user wishlists:", err);
        res.status(500).json({ error: "Failed to fetch wishlists" });
    }
};

module.exports.viewWishlists = async (req, res) => {
    try {
        const wishlists = await Wishlist.find({ user: req.user._id }).populate("listings");
        // Manually flag listings as wishlisted for view logic
        for (let wishlist of wishlists) {
            for (let listing of wishlist.listings) {
                listing.isWishlisted = true;
            }
        }
        res.render("wishlists/index", { wishlists });
    } catch (err) {
        console.error("Error rendering wishlists:", err);
        req.flash("error", "Something went wrong loading wishlists.");
        res.redirect("/listings");
    }
};

module.exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const listingId = req.params.listingId;

        await Wishlist.updateMany(
            { user: userId },
            { $pull: { listings: listingId } }
        );

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error removing from wishlist:", err);
        return res.status(500).json({ error: "Failed to remove from wishlist" });
    }
};
