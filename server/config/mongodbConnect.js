import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import expressAsyncHandler from "express-async-handler";

const connectDB = async () => {
  if (
    asyncHandler(
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    )
  ) {
    console.log("Connected to MongoDB");
  } else {
    console.log("Error");
  }
};
export default connectDB;
