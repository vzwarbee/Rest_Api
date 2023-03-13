const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");


const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error)
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateBlog);
    } catch (error) {
        throw new Error(error)
    }
});

const getABlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getBlog = await Blog.findById(id).populate("likes").populate("dislikes")
        const updateView = await Blog.findByIdAndUpdate(
            id,
            {
                $inc: { numViews: 1 },
            },
            {
                new: true,
            }
        )
        res.json(getBlog);
    } catch (error) {
        throw new Error(error)
    }
});

const getAllBlog = asyncHandler(async (req, res) => {
    try {
        const getAllBlog = await Blog.find();
        res.json(getAllBlog);
    } catch (error) {
        throw new Error(error)
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json(deleteBlog);
    } catch (error) {
        throw new Error(error)
    }
});

const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId);

    // find blog muon like
    const blog = await Blog.findById(blogId);
    // find user login
    const loginUserId = req?.user?._id;
    // find neu user like the blog
    const isLiked = blog?.isLiked;
    // find neu user dislike the blog

    const alReadyDisliked = blog?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alReadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisliked: false,
            },
            {
                new: true,
            }
        );
        res.json(blog);
    };
    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            {
                new: true,
            }
        );
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $push: { likes: loginUserId },
                isLiked: true,
            },
            {
                new: true,
            }
        );
        res.json(blog);
    }
});

const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId);

    // find blog muon like
    const blog = await Blog.findById(blogId);
    // find user login
    const loginUserId = req?.user?._id;
    // find neu user like the blog
    const isDisliked = blog?.isDisliked;
    // find neu user dislike the blog

    const alReadyLiked = blog?.likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alReadyLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            {
                new: true,
            }
        );
        res.json(blog);
    };
    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisliked: false,
            },
            {
                new: true,
            }
        );
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $push: { dislikes: loginUserId },
                isDisliked: true,
            },
            {
                new: true,
            }
        );
        res.json(blog);
    }
})



module.exports = { createBlog, updateBlog, getABlog, getAllBlog, deleteBlog, likeBlog, dislikeBlog }
