const express = require("express");
const BlogCategory = require("../models/BlogCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId")

const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await BlogCategory.create(req.body);
        res.json(newCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updateCategory = await BlogCategory.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const deleteCategory = await BlogCategory.findByIdAndDelete(id);
        res.json(deleteCategory);
    } catch (error) {
        throw new Error(error);
    }
});

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getCategory = await BlogCategory.findById(id);
        res.json(getCategory);
    } catch (error) {
        throw new Error(error);
    }
});
const getAllCategory = asyncHandler(async (req, res) => {

    try {
        const getAllCategory = await BlogCategory.find();
        res.json(getAllCategory);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory }