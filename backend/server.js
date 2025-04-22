import express from "express";
import mongoose from "mongoose";

const app = express();

const PORT = 3000;

// MongoDB connection 🧙‍♂️
mongoose
  .connect("mongodb://localhost:27017/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🧪 Connected to MongoDB!"))
  .catch((err) => console.error("❌ Connection error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Magic happening at http://localhost:${PORT}`);
});
