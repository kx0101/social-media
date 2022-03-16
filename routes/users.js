// User's route
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// User Update
router.put("/:id", async (req, res) => {

    // if user's id doesn't match with this specific id
    if (req.body.userId === req.params.id || req.body.isAdmin){

        // update password but before that we encrypt it
        if(req.body.password){
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (error) {
                console.log(error);
            }
        }

        // Finding user via param's id and updating
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            });
            res.status(200).json("Account has been updated!");
        } catch (error) {
            console.log(error);
        }

    } else {
        return res.status(403).json("You can only update your own account!");
    }
})

// User Delete
router.delete("/:id", async (req, res) => {

    // if user's id doesn't match with this specific id
    if (req.body.userId === req.params.id || req.body.isAdmin){

        // Finding user via param's id and deleting
        try {
            const user = await User.findByIdAndDelete({_id: req.params.id});
            res.status(200).json("Account has been deleted successfully!");
        } catch (error) {
            console.log(error);
        }

    } else {
        return res.status(403).json("You can only delete your own account!");
    }
})

// Get a user
router.get("/:id", async (req, res) => {
    
    try {
        const user = await User.findById(req.params.id);
        // Removing the unnecessary information when the GET request happens
        // user._doc contains the whole User Object and other means everything but password and updatedAt
        const {password, updatedAt, ...other} = user._doc;
        res.status(200).json(other);
    } catch (error) {
        console.log(error);
    }
})

// Follow a user, put because we're updating a list of followers inside the user
router.put("/:id/follow", async (req, res) => {

    // is user itself that is trying to follow ?
    if(req.body.userId !== req.params.id){

        try {
            // Finding the user that is going to be followed and the user that is going
            // to follow him/her.
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            // if the current user doesn't already follow the user then we're updating
            // the followings and followers arrays.
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push: {followers: req.body.userId}});
                await currentUser.updateOne({$push: {followings: req.params.id}});
                res.status(200).json("user has been followed!");
            } else {
                res.status(403).json("You already follow this user.")
            }

        } catch (error) {
            console.log(error);
        }

    } else {
        res.status("403").json("You can't follow yourself.");
    }
});

// Unfollow a user
router.put("/:id/unfollow", async (req, res) => {

    // is user itself that is trying to follow ?
    if(req.body.userId !== req.params.id){

        try {
            // Finding the user that is going to be unfollowed and the user that is going
            // to unfollow him/her.
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            // if the current user doesn't already unfollow the user then we're updating
            // the followings and followers arrays.
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull: {followers: req.body.userId}});
                await currentUser.updateOne({$pull: {followings: req.params.id}});
                res.status(200).json("user has been unfollowed!");
            } else {
                res.status(403).json("You don't follow this user.")
            }

        } catch (error) {
            console.log(error);
        }

    } else {
        res.status("403").json("You can't unfollow yourself.");
    }
});

module.exports = router;