import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodbConnect.js";
import todoRoutes from "./routes/todoRoute.js";
import habitRoutes from "./routes/habit.route.js";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import cron from "node-cron";
import { markMissedDays } from "./services/habitService.js";

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://192.168.1.49:5173"], // Your frontend origin
  credentials: true, // Allow credentials (cookies)
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  exposedHeaders: ["set-cookie"], // Needed for some cookie scenarios
};

// Use CORS middleware ONLY ONCE with your options
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/todos", todoRoutes);
app.use("/api/habits", habitRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 3000;

// Schedule a cron job to run every day at 00:00
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily habit check at midnight");
    await markMissedDays();
    console.log("Daily habit check completed successfully");
  } catch (error) {
    console.error("Error in daily habit check:", error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
