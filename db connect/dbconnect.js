const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected successfully to ${process.env.MONGO_URI}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Exit the process with failure
    }
};
module.exports = connectDB;