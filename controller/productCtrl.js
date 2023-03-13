const Product = require("../models/productModel");
const User = require("../models/userModel")
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
    if (req.body.title) {
        req.body.slug = slugify(req.body.title)
    }
    try {
        const newProduct = await Product.create(req.body)
        res.json(newProduct)
    } catch (error) {
        throw new Error(error)
    }

});

// update product 

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.title) {
        req.body.slug = slugify(req.body.title)
    }
    try {
        const updateProduct = await Product.findByIdAndUpdate(id, req.body,
            { new: true, });
        res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }

});

// delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const deleteProduct = await Product.findByIdAndDelete(id);
        res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }

});



const getAProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (error) {
        throw new Error(error)
    }
});



const getAllProduct = async (req, res) => {

    try {

        //filter giá

        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        console.log(queryObj);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));


        //lọc category, brand

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt")
        }

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v")
        }

        // phan limit product 
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        const productCount = await Product.countDocuments();

        if (req.query.page || skip < productCount) {
            productCount;
            if (skip >= productCount) res.json(
                {
                    message: "this page dose not exist!",
                }
            )
        }


        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error)
    }
};

const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;

    try {
        const user = await User.findById(_id);
        const alreadyAdded = user.whishlist.find((id) => id.toString() === prodId);

        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(_id,
                {
                    $pull: { whishlist: prodId }
                },
                {
                    new: true,
                }
            );

            res.json(user)
        } else {
            let user = await User.findByIdAndUpdate(_id,
                {
                    $push: { whishlist: prodId }
                },
                {
                    new: true,
                }
            );

            res.json(user)
        }
    } catch (error) {
        throw new Error(error)
    }
});

const addRating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId } = req.body;

    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());

        if (alreadyRated) {

            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated }
                },
                {
                    $set: { "ratings.$.star": star },
                },
                {
                    new: true,
                }
            );
            res.json(updateRating)
            // res.json({ message: "The user can only be evaluated once and cannot be modified." });
        } else {
            const rateProduct = await Product.findByIdAndUpdate(prodId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            postedby: _id,
                        },
                    }
                },
                {
                    new: true,
                }
            );
            res.json(rateProduct)
        };
        const getAllRatings = await Product.findById(prodId);
        let totalRating = getAllRatings.ratings.length;
        let ratingsum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating)
        let final = await Product.findByIdAndUpdate(prodId,
            {
                totalRating: actualRating,

            }, { new: true })

        res.json(final)

    } catch (error) {
        throw new Error(error)
    }
})

module.exports = { createProduct, getAProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, addRating };