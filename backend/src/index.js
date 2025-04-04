"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("../config/db"));
const auth_route_1 = __importDefault(require("../routes/auth.route"));
const room_route_1 = __importDefault(require("../routes/room.route"));
const meal_route_1 = __importDefault(require("../routes/meal.route"));
const complaint_route_1 = __importDefault(require("../routes/complaint.route"));
const payment_route_1 = __importDefault(require("../routes/payment.route"));
const resource_route_1 = __importDefault(require("../routes/resource.route"));
const inventory_route_1 = __importDefault(require("../routes/inventory.route"));
const notification_route_1 = __importDefault(require("../routes/notification.route"));
const announcement_route_1 = __importDefault(require("../routes/announcement.route"));
const report_route_1 = __importDefault(require("../routes/report.route"));
const dashboard_route_1 = __importDefault(require("../routes/dashboard.route"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
// Routes
app.use("/api/auth", auth_route_1.default);
app.use("/api/rooms", room_route_1.default);
app.use("/api/meals", meal_route_1.default);
app.use("/api/complaints", complaint_route_1.default);
app.use("/api/payments", payment_route_1.default);
app.use("/api/resources", resource_route_1.default);
app.use("/api/inventory", inventory_route_1.default);
app.use("/api/notifications", notification_route_1.default);
app.use("/api/announcements", announcement_route_1.default);
app.use("/api/reports", report_route_1.default);
app.use("/api/dashboard", dashboard_route_1.default);
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.default)();
    console.log(`Server running on http://localhost:${PORT}`);
}));
