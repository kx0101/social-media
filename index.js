const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const dirPath = path.join(__dirname, 'public/images');

// Initiating app
const app = express();
app.use(cors());

// Setting .env
dotenv.config();

// Connecting to Cluster
mongoose.connect(process.env.MONGO_URL, () => {
    console.log("Connected to MongoDB Cluster");
});

app.use("/public/images", express.static(path.join(dirPath)))

// Middleware
app.use(express.json()); //bodyParser for POST requests
app.use(helmet());
app.use(morgan("common"));  

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        const d = new Date();
        let minutes = d.getMinutes();
        cb(null, minutes + file.originalname)
    }
})

const upload = multer({storage});
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("File uploaded successfully.")
    } catch (error) {
        console.log(error);
    }
});

// Routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

// Server's port
app.listen(3000, () => {
    console.log("Server opened at port 3000")
});