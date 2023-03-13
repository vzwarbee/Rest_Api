const User = require("../models/userModel")
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongodbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");


const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        // tạo mới người dùng

        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error("User Already Exist");
    };
});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });

    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateToken = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true,
            }
        );
        res.cookie("refreshToken", refreshToken,
            {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

// làm mới token | handler refresh token

const handlerRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;

    if (!cookie?.refreshToken) throw new Error("No refresh token");

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (!user) throw new Error("No refresh token parser in database or Not!!")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) throw new Error("There is something Wrong refresh token");

        const accessToken = generateRefreshToken(user?.id);
        res.json({ accessToken })
    })

})


// user logout

const logout = asyncHandler(async (req, res) => {

    const cookie = req.cookies;

    if (!cookie?.refreshToken) throw new Error("No refresh token");

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken",
            {
                httpOnly: true,
                secure: true,
            });
        res.sendStatus(204);
    };
    await User.findOneAndUpdate(refreshToken,
        {
            refreshToken: "",
        });
    res.clearCookie("refreshToken",
        {
            httpOnly: true,
            secure: true,
        });
    res.sendStatus(204);
})

// update user 

const updatedUser = asyncHandler(async (req, res) => {
    // console.log(req.user);/
    const { _id } = req.user;
    validateMongodbId(_id);

    try {
        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            },
            {
                new: true,
            });
        res.json(updateUser);
    } catch (error) {
        throw new Error(error)
    }
});

// lấy tất cả người dùng

const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error(error)
    }
});


// lấy user bằng id 

const getAUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getAUser = await User.findById(id);
        res.json({
            getAUser,
        });
    } catch (error) {
        throw new Error(error);
    }
})

// delete user by id 

const deleteAUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteAUser = await User.findByIdAndDelete(id);
        res.json({
            deleteAUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        res.json(block)
    } catch (error) {
        throw new Error(error)
    }
});
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: false,
            }
        );
        res.json(unblock)
    } catch (error) {
        throw new Error(error)
    }
});


const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatePassword = await user.save();
        res.json(updatePassword)
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Book Shop send your reset password.<a style="color:red;" href='https://localhost:8686/api/user/reset-password/${token}'>Click Reset Password</a>`;
        const data = {
            to: email,
            text: "Hello!!",
            subject: "Forgot password",
            htm: resetURL,
        };
        sendEmail(data);
        res.json(token)

    } catch (error) {
        throw new Error(error)
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token expired, please try again.");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user)
});

module.exports = { createUser, loginUserCtrl, getAllUser, getAUser, deleteAUser, updatedUser, blockUser, unblockUser, handlerRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword };