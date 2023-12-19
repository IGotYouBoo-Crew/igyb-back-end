// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const {
    createEvent,
    getAllEvents,
    getEventById,
    updateEventById,
    deleteEventById
} = require("./functions/EventFunctions");

// Import our auth middleware:
const { verifyUserRoleAndId, onlyAllowAuthorOrAdmin } = require("./middleware/authMiddleware");

// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE

router.post("/", verifyUserRoleAndId, createEvent);

// UPDATE

router.patch("/:id/:authorId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, updateEventById);

// DELETE

router.delete("/:id/:authorId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, deleteEventById);

// READ

router.get("/:id", getEventById)
router.get("/", getAllEvents)


// Export the router so that other files can use it:
module.exports = router;