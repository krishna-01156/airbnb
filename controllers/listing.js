const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const { location, category } = req.query;
    let listings = [];

    if (location) {
        const searchWords = location.trim().split(/\s+/);
        const searchConditions = searchWords.map(word => ({
            $or: [
                { location: { $regex: word, $options: 'i' } },
                { country: { $regex: word, $options: 'i' } }
            ]
        }));

        listings = await Listing.find({ $and: searchConditions });

    } else if (category) {
        listings = await Listing.find({ category });
    } else {
        listings = await Listing.find({});
    }

    const Wishlist = require("../models/wishlist");

    let wishlistedIds = [];
    let userWishlists = [];

    if (req.isAuthenticated()) {
        const wishlists = await Wishlist.find({ user: req.user._id });
        wishlistedIds = wishlists.flatMap(w => w.listings.map(id => id.toString()));
        userWishlists = wishlists;
    }

    const listingsWithStatus = listings.map(listing => {
        return {
            ...listing._doc,
            isWishlisted: wishlistedIds.includes(listing._id.toString())
        };
    });

    res.render("listings/index", {
        listings: listingsWithStatus,
        userWishlists,
        category: req.query.category || null
    });
};

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    }).populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    const url = req.file.path;
    const filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditform = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
