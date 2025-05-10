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
exports.getMealStats = exports.getDietaryRequests = exports.recordMealAttendance = exports.getMealAttendance = exports.getStudentMealOrders = exports.orderMeal = exports.cancelMealPlan = exports.subscribeMealPlan = exports.getStudentMealPlan = exports.deleteMealPlan = exports.updateMealPlan = exports.createMealPlan = exports.getMealPlanById = exports.getMealPlans = exports.deleteMeal = exports.updateMeal = exports.createMeal = exports.getMealById = exports.getMeals = void 0;
const meal_model_1 = __importDefault(require("../models/meal.model"));
const mealPlan_model_1 = __importDefault(require("../models/mealPlan.model"));
const studentMealPlan_model_1 = __importDefault(require("../models/studentMealPlan.model"));
const MealOrder_model_1 = __importDefault(require("../models/MealOrder.model"));
const meallAttendance_model_1 = __importDefault(require("../models/meallAttendance.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// @desc    Get all meals
// @route   GET /api/meals
// @access  Public
const getMeals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meals = yield meal_model_1.default.find();
        console.log(meals);
        res.json(meals);
    }
    catch (error) {
        console.error("Get meals error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getMeals = getMeals;
// @desc    Get meal by ID
// @route   GET /api/meals/:id
// @access  Public
const getMealById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meal = yield meal_model_1.default.findById(req.params.id);
        if (!meal) {
            res.status(404).json({ message: "Meal not found" });
            return;
        }
        res.json(meal);
    }
    catch (error) {
        console.error("Get meal by ID error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getMealById = getMealById;
// @desc    Create new meal
// @route   POST /api/meals
// @access  Private/Staff
const createMeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, type, vegetarian, vegan, glutenFree, calories, available, imageUrl, price, } = req.body;
        // Create meal
        const meal = yield meal_model_1.default.create({
            name,
            description,
            type,
            vegetarian,
            vegan,
            glutenFree,
            calories,
            available: available !== undefined ? available : true,
            imageUrl,
            price,
        });
        res.status(201).json(meal);
    }
    catch (error) {
        console.error("Create meal error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.createMeal = createMeal;
// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private/Staff
const updateMeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, type, vegetarian, vegan, glutenFree, calories, available, imageUrl, price, } = req.body;
        let meal = yield meal_model_1.default.findById(req.params.id);
        if (!meal) {
            res.status(404).json({ message: "Meal not found" });
            return;
        }
        // Update meal
        meal = yield meal_model_1.default.findByIdAndUpdate(req.params.id, {
            name,
            description,
            type,
            vegetarian,
            vegan,
            glutenFree,
            calories,
            available,
            imageUrl,
            price,
        }, { new: true });
        res.json(meal);
    }
    catch (error) {
        console.error("Update meal error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.updateMeal = updateMeal;
// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private/Staff
const deleteMeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meal = yield meal_model_1.default.findById(req.params.id);
        if (!meal) {
            res.status(404).json({ message: "Meal not found" });
            return;
        }
        // Check if meal is used in any meal plans
        const mealPlansUsingMeal = yield mealPlan_model_1.default.find({
            $or: [
                { "meals.breakfast": req.params.id },
                { "meals.lunch": req.params.id },
                { "meals.dinner": req.params.id },
            ],
        });
        if (mealPlansUsingMeal.length > 0) {
            res.status(400).json({
                message: "Cannot delete meal that is used in active meal plans",
            });
            return;
        }
        // Check if meal has any pending orders
        const pendingOrders = yield MealOrder_model_1.default.find({
            "mealId.id": req.params.id,
            status: { $in: ["pending", "confirmed"] },
        });
        if (pendingOrders.length > 0) {
            res.status(400).json({
                message: "Cannot delete meal with pending orders",
            });
            return;
        }
        // Delete the meal
        yield meal_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Meal removed" });
    }
    catch (error) {
        console.error("Delete meal error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.deleteMeal = deleteMeal;
// @desc    Get all meal plans
// @route   GET /api/meal-plans
// @access  Public
const getMealPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mealPlans = yield mealPlan_model_1.default.find();
        res.json(mealPlans);
    }
    catch (error) {
        console.error("Get meal plans error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getMealPlans = getMealPlans;
// @desc    Get meal plan by ID
// @route   GET /api/meal-plans/:id
// @access  Public
const getMealPlanById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mealPlan = yield mealPlan_model_1.default.findById(req.params.id);
        if (!mealPlan) {
            res.status(404).json({ message: "Meal plan not found" });
            return;
        }
        res.json(mealPlan);
    }
    catch (error) {
        console.error("Get meal plan by ID error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getMealPlanById = getMealPlanById;
// @desc    Create new meal plan
// @route   POST /api/meal-plans
// @access  Private/Staff
const createMealPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, meals, daysAvailable, price } = req.body;
        console.log(req.body);
        // Validate that all meals exist
        const breakfastIds = Array.isArray(meals.breakfast) ? meals.breakfast : [meals.breakfast];
        const lunchIds = Array.isArray(meals.lunch) ? meals.lunch : [meals.lunch];
        const dinnerIds = Array.isArray(meals.dinner) ? meals.dinner : [meals.dinner];
        // Check if all breakfast meals exist
        for (const id of breakfastIds) {
            const mealExists = yield meal_model_1.default.findById(id);
            if (!mealExists) {
                res.status(404).json({ message: `Breakfast meal with ID ${id} not found` });
                return;
            }
        }
        // Check if all lunch meals exist
        for (const id of lunchIds) {
            const mealExists = yield meal_model_1.default.findById(id);
            if (!mealExists) {
                res.status(404).json({ message: `Lunch meal with ID ${id} not found` });
                return;
            }
        }
        // Check if all dinner meals exist
        for (const id of dinnerIds) {
            const mealExists = yield meal_model_1.default.findById(id);
            if (!mealExists) {
                res.status(404).json({ message: `Dinner meal with ID ${id} not found` });
                return;
            }
        }
        // Create new meal plan
        const newMealPlan = new mealPlan_model_1.default({
            name,
            description,
            meals: {
                breakfast: breakfastIds,
                lunch: lunchIds,
                dinner: dinnerIds,
            },
            daysAvailable,
            price,
        });
        const savedMealPlan = yield newMealPlan.save();
        res.status(201).json(savedMealPlan);
    }
    catch (error) {
        console.warn(error);
        res.status(500).json({ message: error.message });
    }
});
exports.createMealPlan = createMealPlan;
// @desc    Update meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private/Staff
const updateMealPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, meals, daysAvailable, price } = req.body;
        let mealPlan = yield mealPlan_model_1.default.findById(req.params.id);
        if (!mealPlan) {
            res.status(404).json({ message: "Meal plan not found" });
            return;
        }
        // Validate that the meals exist if they are being updated
        if (meals) {
            const breakfastExists = yield meal_model_1.default.findById(meals.breakfast);
            const lunchExists = yield meal_model_1.default.findById(meals.lunch);
            const dinnerExists = yield meal_model_1.default.findById(meals.dinner);
            if (!breakfastExists || !lunchExists || !dinnerExists) {
                res.status(400).json({ message: "One or more meals do not exist" });
                return;
            }
        }
        // Update meal plan
        mealPlan = yield mealPlan_model_1.default.findByIdAndUpdate(req.params.id, {
            name,
            description,
            meals,
            daysAvailable,
            price,
        }, { new: true });
        res.json(mealPlan);
    }
    catch (error) {
        console.error("Update meal plan error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.updateMealPlan = updateMealPlan;
// @desc    Delete meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private/Staff
const deleteMealPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mealPlan = yield mealPlan_model_1.default.findById(req.params.id);
        if (!mealPlan) {
            res.status(404).json({ message: "Meal plan not found" });
            return;
        }
        // Check if meal plan has active subscriptions
        const activeSubscriptions = yield studentMealPlan_model_1.default.find({
            "mealPlanId.id": req.params.id,
            endDate: { $gt: new Date() },
        });
        if (activeSubscriptions.length > 0) {
            res.status(400).json({
                message: "Cannot delete meal plan with active subscriptions",
            });
            return;
        }
        // Delete the meal plan
        yield mealPlan_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Meal plan removed" });
    }
    catch (error) {
        console.error("Delete meal plan error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.deleteMealPlan = deleteMealPlan;
// @desc    Get student's meal plan
// @route   GET /api/students/:id/meal-plan
// @access  Private
const getStudentMealPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = req.params.id;
        // Check if student exists
        const student = yield user_model_1.default.findOne({ _id: studentId, role: "student" });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Get active meal plan subscription
        const subscription = yield studentMealPlan_model_1.default.findOne({
            "studentId.id": studentId,
            endDate: { $gt: new Date() },
        }).populate("mealPlanId.id");
        if (!subscription) {
            res
                .status(404)
                .json({ message: "No active meal plan found for this student" });
            return;
        }
        res.json(subscription);
    }
    catch (error) {
        console.error("Get student meal plan error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getStudentMealPlan = getStudentMealPlan;
// @desc    Subscribe to meal plan
// @route   POST /api/students/meal-plan
// @access  Private
const subscribeMealPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, mealPlanId, startDate, endDate, specialRequests } = req.body;
        // Check if student exists
        const student = yield user_model_1.default.findOne({ _id: studentId, role: "student" });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Check if meal plan exists
        const mealPlan = yield mealPlan_model_1.default.findById(mealPlanId);
        if (!mealPlan) {
            res.status(404).json({ message: "Meal plan not found" });
            return;
        }
        // Check if student already has an active meal plan
        const existingPlan = yield studentMealPlan_model_1.default.findOne({
            "studentId.id": studentId,
            endDate: { $gt: new Date() },
        });
        if (existingPlan) {
            res
                .status(400)
                .json({ message: "Student already has an active meal plan" });
            return;
        }
        // Create subscription
        const subscription = yield studentMealPlan_model_1.default.create({
            studentId: {
                id: studentId,
                ref: "User",
            },
            mealPlanId: {
                id: mealPlanId,
                ref: "MealPlan",
            },
            startDate: startDate || new Date(),
            endDate: endDate,
            status: "available",
            specialRequests: specialRequests || "",
        });
        res.status(201).json(subscription);
    }
    catch (error) {
        console.error("Subscribe meal plan error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.subscribeMealPlan = subscribeMealPlan;
// @desc    Cancel meal plan subscription
// @route   DELETE /api/students/meal-plan/:id
// @access  Private
const cancelMealPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const subscription = yield studentMealPlan_model_1.default.findById(req.params.id);
        if (!subscription) {
            res.status(404).json({ message: "Subscription not found" });
            return;
        }
        // Check if user is authorized (either staff or the student who owns the subscription)
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff" &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) !== subscription.studentId.id.toString()) {
            res
                .status(403)
                .json({ message: "Not authorized to cancel this subscription" });
            return;
        }
        // Update end date to now
        subscription.endDate = new Date();
        yield subscription.save();
        res.json({ message: "Meal plan subscription cancelled" });
    }
    catch (error) {
        console.error("Cancel meal plan error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.cancelMealPlan = cancelMealPlan;
// @desc    Order individual meal
// @route   POST /api/meals/order
// @access  Private
const orderMeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mealId, date, time, specialRequests } = req.body;
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        // Check if meal exists
        const meal = yield meal_model_1.default.findById(mealId);
        if (!meal) {
            res.status(404).json({ message: "Meal not found" });
            return;
        }
        if (!meal.available) {
            res
                .status(400)
                .json({ message: "This meal is not available for ordering" });
            return;
        }
        // Create order
        const order = yield MealOrder_model_1.default.create({
            studentId: {
                id: req.user._id,
                ref: "User",
            },
            mealId: {
                id: mealId,
                ref: "Meal",
            },
            date: date || new Date(),
            time,
            status: "pending",
            specialRequests: specialRequests || "",
        });
        res.status(201).json(order);
    }
    catch (error) {
        console.error("Order meal error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.orderMeal = orderMeal;
// @desc    Get student's meal orders
// @route   GET /api/students/:id/meal-orders
// @access  Private
const getStudentMealOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const studentId = req.params.id;
        // Check if student exists
        const student = yield user_model_1.default.findOne({ _id: studentId, role: "student" });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Check if user is authorized (either staff or the student themselves)
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "staff" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) !== studentId) {
            res.status(403).json({ message: "Not authorized to view these orders" });
            return;
        }
        // Get meal orders
        const orders = yield MealOrder_model_1.default.find({
            "studentId.id": studentId,
        }).sort({ date: -1 });
        res.json(orders);
    }
    catch (error) {
        console.error("Get student meal orders error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getStudentMealOrders = getStudentMealOrders;
// @desc    Get meal attendance
// @route   GET /api/meals/attendance
// @access  Private/Staff
const getMealAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, mealType } = req.query;
        let query = {};
        console.log("here");
        if (date) {
            const queryDate = new Date(date);
            query.date = {
                $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
                $lt: new Date(queryDate.setHours(23, 59, 59, 999)),
            };
        }
        if (mealType) {
            query.mealType = mealType;
        }
        const attendance = yield meallAttendance_model_1.default.find(query)
            .populate("studentId.id", "name email studentId")
            .sort({ date: -1 });
        res.json(attendance);
    }
    catch (error) {
        console.error("Get meal attendance error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getMealAttendance = getMealAttendance;
// @desc    Record meal attendance
// @route   POST /api/meals/attendance
// @access  Private/Staff
const recordMealAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, mealType, date } = req.body;
        // Check if student exists
        const student = yield user_model_1.default.findOne({ _id: studentId, role: "student" });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        // Check if attendance already recorded
        const attendanceDate = date ? new Date(date) : new Date();
        const existingAttendance = yield meallAttendance_model_1.default.findOne({
            "studentId.id": studentId,
            mealType,
            date: {
                $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
                $lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
            },
        });
        if (existingAttendance) {
            res
                .status(400)
                .json({ message: "Attendance already recorded for this meal" });
            return;
        }
        // Record attendance
        const attendance = yield meallAttendance_model_1.default.create({
            studentId: {
                id: studentId,
                ref: "User",
            },
            mealType,
            date: attendanceDate,
        });
        res.status(201).json(attendance);
    }
    catch (error) {
        console.error("Record meal attendance error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.recordMealAttendance = recordMealAttendance;
// @desc    Get dietary requests
// @route   GET /api/meals/dietary-requests
// @access  Private/Staff
const getDietaryRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get dietary requests from student meal plans
        const dietaryRequests = yield studentMealPlan_model_1.default.find({
            $or: [{ specialRequests: { $exists: true, $ne: "" } }],
        })
            .populate("studentId.id", "name email studentId roomNumber")
            .sort({ createdAt: -1 });
        // Format the response
        const formattedRequests = dietaryRequests.map((request) => {
            const student = request.studentId.id; // Cast to any to access populated fields
            return {
                _id: request._id,
                studentName: student.name || "Unknown Student",
                studentId: student._id,
                roomNumber: student.roomNumber || "Not assigned",
                request: request.specialRequests || "",
                status: request.status,
                createdAt: request.createdAt,
            };
        });
        res.json(formattedRequests);
    }
    catch (error) {
        console.error("Get dietary requests error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getDietaryRequests = getDietaryRequests;
// @desc    Get meal statistics
// @route   GET /api/meals/stats
// @access  Private/Staff
const getMealStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Get all meals
        const meals = (yield meal_model_1.default.find());
        // Get all meal orders
        const mealOrders = yield MealOrder_model_1.default.find().populate("mealId.id");
        // Calculate most popular meal
        const mealPopularity = {};
        mealOrders.forEach((order) => {
            const mealId = order.mealId.id._id.toString();
            mealPopularity[mealId] = (mealPopularity[mealId] || 0) + 1;
        });
        let mostPopularMealId = "";
        let mostPopularCount = 0;
        let leastPopularMealId = "";
        let leastPopularCount = Infinity;
        for (const [mealId, count] of Object.entries(mealPopularity)) {
            if (count > mostPopularCount) {
                mostPopularCount = count;
                mostPopularMealId = mealId;
            }
            if (count < leastPopularCount) {
                leastPopularCount = count;
                leastPopularMealId = mealId;
            }
        }
        // Get meal names
        const mostPopularMeal = ((_a = meals.find((m) => m._id.toString() === mostPopularMealId)) === null || _a === void 0 ? void 0 : _a.name) ||
            "Unknown";
        const leastPopularMeal = ((_b = meals.find((m) => m._id.toString() === leastPopularMealId)) === null || _b === void 0 ? void 0 : _b.name) ||
            "Unknown";
        // Count dietary preferences
        const vegetarianCount = yield user_model_1.default.countDocuments({
            dietaryPreferences: "vegetarian",
        });
        const veganCount = yield user_model_1.default.countDocuments({
            dietaryPreferences: "vegan",
        });
        const nonVegetarianCount = yield user_model_1.default.countDocuments({
            $or: [
                { dietaryPreferences: { $ne: "vegetarian" } },
                { dietaryPreferences: { $ne: "vegan" } },
                { dietaryPreferences: { $exists: false } },
            ],
        });
        const stats = {
            mostPopularMeal,
            leastPopularMeal,
            specialDiets: {
                vegetarian: vegetarianCount,
                vegan: veganCount,
                nonVegetarian: nonVegetarianCount,
            },
        };
        res.json(stats);
    }
    catch (error) {
        console.error("Get meal stats error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getMealStats = getMealStats;
