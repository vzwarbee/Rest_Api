const express = require("express");
const ProdCategory = require("../models/prodCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId")

const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await ProdCategory.create(req.body);
        res.json(newCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updateCategory = await ProdCategory.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const deleteCategory = await ProdCategory.findByIdAndDelete(id);
        res.json(deleteCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getCategory = await ProdCategory.findById(id);
        res.json(getCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const getAllCategory = asyncHandler(async (req, res) => {

    try {
        const getAllCategory = await ProdCategory.find();
        res.json(getAllCategory);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory }