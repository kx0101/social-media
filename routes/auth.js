// Auth's route
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Registration
router.post("/register", async (req, res) => {

    try {
        // Generating salt and then hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user with hashed password
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        // Save user
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
    }
}) 

// Login
router.post("/login", async (req, res) => {
    try {

        const user = await User.findOne({email: req.body.email});
        
        // if no user exists
        !user && res.status(404).send("user not found")

        // Comparing password with the hashed password in DB
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json("Wrong password");

        // if login was successfull
        res.status(201).json(user);

    } catch (error) {
        console.log(error)
    }

});

module.exports = router;