// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const {
    createPost,
    updatePost,
    deletePost,
    getPost,
    getAllPosts
} = require("./functions/PostFunctions");

// Import our auth middleware:
const { verifyUserRoleAndId, onlyAllowAuthorOrAdmin, onlyAllowAuthor } = require("./middleware/authMiddleware");

// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE

router.post("/", verifyUserRoleAndId, createPost);

// UPDATE

router.patch("/:id/:authorId", verifyUserRoleAndId, onlyAllowAuthor, updatePost);

// DELETE

router.delete("/:id/:authorId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, deletePost);

// READ

router.get("/:id", getPost)
router.get("/", getAllPosts)

router.get("/", getAllPosts)

// Export the router so that other files can use it:
module.exports = router;
