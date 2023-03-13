const express = require("express");
const { createUser, loginUserCtrl, getAllUser, getAUser, deleteAUser, updatedUser, blockUser, unblockUser, handlerRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, } = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/register", createUser);
router.post("/forgot-password", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);

router.put("/password", authMiddleware, updatePassword)
router.post("/login", loginUserCtrl);
router.get("/all-users", getAllUser);
router.get("/refresh", handlerRefreshToken);
router.get("/logout", logout);
router.get("/:id", authMiddleware, isAdmin, getAUser);
router.delete("/:id", deleteAUser);
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;