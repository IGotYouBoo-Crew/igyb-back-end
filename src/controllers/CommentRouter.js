// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const { 
    createComment,
    updateComment,
    deleteComment 
} = require("./functions/CommentFunctions");

// Import our auth middleware:
const { verifyUserRoleAndId, onlyAllowAuthorOrAdmin } = require("./middleware/authMiddleware");

// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE
router.post("/", verifyUserRoleAndId, createComment)

// UPDATE
router.patch("/:id/:authorId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, updateComment)


// DELETE
router.delete("/:id/:authorId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, deleteComment);


// READ



// Export the router so that other files can use it:
module.exports = router;
