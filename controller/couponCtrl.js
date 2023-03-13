const Coupon = require("../models/couponModel");
const validateMongodbId = require("../utils/validateMongodbId");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
    try {
        const createCoupon = await Coupon.create(req.body);
        res.json(createCoupon)
    } catch (error) {
        throw new Error(error)
    };
});
const getAllCoupon = asyncHandler(async (req, res) => {
    try {
        const getAllCoupon = await Coupon.find();
        res.json(getAllCoupon)
    } catch (error) {
        throw new Error(error)
    };
});
const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteCoupon = await Coupon.findByIdAndDelete(id);
        res.json(deleteCoupon)
    } catch (error) {
        throw new Error(error)
    };
});
const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateCoupon)
    } catch (error) {
        throw new Error(error)
    };
});

module.exports = { createCoupon, getAllCoupon, deleteCoupon, updateCoupon };