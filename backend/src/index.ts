import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import connectDB from "../config/db";
import authRoutes from "../routes/auth.route";
import roomRoutes from "../routes/room.route";
import mealRoutes from "../routes/meal.route";
import complaintRoutes from "../routes/complaint.route";
import paymentRoutes from "../routes/payment.route";
import resourceRoutes from "../routes/resource.route";
import inventoryRoutes from "../routes/inventory.route";
import notificationRoutes from "../routes/notification.route";
import announcementRoutes from "../routes/announcement.route";
import reportRoutes from "../routes/report.route";
import dashboardRoutes from "../routes/dashboard.route";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
