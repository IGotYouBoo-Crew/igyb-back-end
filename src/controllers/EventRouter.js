// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
} = require("./functions/EventFunctions");

// Import our auth middleware:
const { verifyUserRoleAndId, onlyAllowAuthorOrAdmin, onlyAllowAuthor } = require("./middleware/authMiddleware");

// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE

router.post("/", verifyUserRoleAndId, createEvent);

// UPDATE

router.patch("/:id/:authorId", verifyUserRoleAndId, onlyAllowAuthor, updateEvent);

// DELETE

router.delete("/:id/:authorId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, deleteEvent);

// READ

router.get("/", getAllEvents)
router.get("/:id", getEventById)


// Export the router so that other files can use it:
module.exports = router;