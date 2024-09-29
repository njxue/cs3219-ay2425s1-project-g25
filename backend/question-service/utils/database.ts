import mongoose from "mongoose";

export const connectToDatabase = async () => {
    const url = process.env.MONGODB_URL;
    const options = {};

    if (!url) {
        throw new Error('Invalid/Missing environment variable: "MONGODB_URL"');
    }

    try {
        await mongoose.connect(url, options);
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB: ", error);
    }
};
