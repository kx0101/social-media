const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const cors = require("cors")

// Initiating app
const app = express();
app.use(cors());

// Setting .env
dotenv.config();

// Connecting to Cluster
mongoose.connect(process.env.MONGO_URL, () => {
    console.log("Connected to MongoDB Cluster");
});

// Middleware
app.use(express.json()); //bodyParser for POST requests
app.use(helmet());
app.use(morgan("common"));

// Routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

// Server's port
app.listen(3000, () => {
    console.log("Server opened at port 3000")
});