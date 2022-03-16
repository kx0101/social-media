const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// Create a post
router.post("/", async (req, res) => {
    
    const newPost = await new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (error) {
        console.log(error);
    }
})

// Update a post
router.put("/:id", async (req, res) => {

    try {
        // Finding post and matching the user's id with the user id that made the post
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.updateOne({$set: req.body});
            res.status(200).json("the post has been updated!");
        } else {
            res.status(403).json("you can only update your own post.");
        }

    } catch (error) {
        console.log(error); //post not found
    }
    
})

// Delete a post
router.delete("/:id", async (req, res) => {

    try {
        // Finding post and matching the user's id with the user id that made the post
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.deleteOne();
            res.status(200).json("the post has been deleted!");
        } else {
            res.status(403).json("you can only delete your own post.");
        }

    } catch (error) {
        console.log(error); //post not found
    }
    
})

// Like a post, PUT because we're updating the array Likes
router.put("/:id/like", async (req, res) => {
    
    try {
        // Finding the post and then checking if the current user has already
        // liked this specific post. If not, we're adding the user to the array of likes
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await Post.updateOne({$push: {likes: req.body.userId} })
            res.status(200).json("Post liked!");
        } else {
            // if already liked, we're removing the like
            await Post.updateOne({$pull: {likes: req.body.userId}});
            res.status(200).json("Post unliked!");
        }

    } catch (error) {
        console.log(error);
    }
});

// Get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (error) {
        console.log(error);
    }
});


// Get all posts of the user followings (timeline)
// Basically the way it works is that the user gets a timeline of all the posts
// that have been made from the people that the user follows.
router.get("/timeline/all", async (req, res) => {

    try {
        // using promises instead of await because we're having multiple promises 
        // for multiple posts 

        const currentUser = await User.findById(req.body.userId);
        // finding all posts of that specific user that is eligible to see using Promise.all because we're mapping
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map(friendId => {
                // returning all the posts that the user is eligible to see
                // inside the array friendsPosts 
                return Post.find({userId: friendId})
            })
        );
        // loading all the timeline
        res.json(userPosts.concat(...friendPosts))
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;