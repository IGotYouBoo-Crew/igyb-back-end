// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const {
    getAllPosts,
    updatePostById,
    deletePostById,
    getPostById,
    // createNewPost,
    createPost
} = require("./functions/PostFunctions");

const { verifyUserRoleAndId } = require("./middleware/authMiddleware");

// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE
// request.body must include required fields (TBD when creating posts model)
// router.post("/newPost", async (request, response) => {
//     let responseData = await createNewPost(request.body);
//     response.json({
//         data: responseData,
//     });
// });

router.post("/", verifyUserRoleAndId, createPost);


// READ

// Show all posts
router.get("/", async (request, response) => {
    let responseData = {};
    responseData = await getAllPosts();
    response.json({
        data: responseData,
    });
});

// shows a post's data which matches a specified title
router.get("/:postId", async (request, response) => {
    let responseData = {};

    responseData = await getPostById(request.params.postId);

    response.json({
        data: responseData,
    });
});

// UPDATE
// Updates the post properties provided in the request.body according to the postId
router.patch("/:postId", async (request, response) => {
    let updatedPost = await updatePostById(request.params.postId, request.body);
    response.json({
        message: updatedPost,
    });
});

// DELETE
// Deletes a post with matching _id value
router.delete("/:postId", async (request, response) => {
    let deletedPost = await deletePostById(request.params.postId);
    let confirmation = `deleting post: ${deletedPost.title}`;
    response.json({
        message: confirmation,
    });
});

// Export the router so that other files can use it:
module.exports = router;
