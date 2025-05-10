import { Request, Response } from "express";
import mongoose from "mongoose";
import Meal from "../models/meal.model";
import MealPlan from "../models/mealPlan.model";
import StudentMealPlan from "../models/studentMealPlan.model";
import MealOrder from "../models/MealOrder.model";
import MealAttendance from "../models/meallAttendance.model";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

// Define interface for meal document
interface IMeal {
  _id: mongoose.Types.ObjectId;
  name: string;
}

// @desc    Get all meals
// @route   GET /api/meals
// @access  Public
export const getMeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const meals = await Meal.find();



    console.log(meals)

    res.json(meals);
  } catch (error: any) {
    console.error("Get meals error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get meal by ID
// @route   GET /api/meals/:id
// @access  Public
export const getMealById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      res.status(404).json({ message: "Meal not found" });
      return;
    }

    res.json(meal);
  } catch (error: any) {
    console.error("Get meal by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Create new meal
// @route   POST /api/meals
// @access  Private/Staff
export const createMeal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
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
    } = req.body;

    // Create meal
    const meal = await Meal.create({
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
  } catch (error: any) {
    console.error("Create meal error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private/Staff
export const updateMeal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
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
    } = req.body;

    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      res.status(404).json({ message: "Meal not found" });
      return;
    }

    // Update meal
    meal = await Meal.findByIdAndUpdate(
      req.params.id,
      {
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
      },
      { new: true }
    );

    res.json(meal);
  } catch (error: any) {
    console.error("Update meal error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private/Staff
export const deleteMeal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      res.status(404).json({ message: "Meal not found" });
      return;
    }

    // Check if meal is used in any meal plans
    const mealPlansUsingMeal = await MealPlan.find({
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
    const pendingOrders = await MealOrder.find({
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
    await Meal.findByIdAndDelete(req.params.id);

    res.json({ message: "Meal removed" });
  } catch (error: any) {
    console.error("Delete meal error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get all meal plans
// @route   GET /api/meal-plans
// @access  Public
export const getMealPlans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const mealPlans = await MealPlan.find();
    res.json(mealPlans);
  } catch (error: any) {
    console.error("Get meal plans error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get meal plan by ID
// @route   GET /api/meal-plans/:id
// @access  Public
export const getMealPlanById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      res.status(404).json({ message: "Meal plan not found" });
      return;
    }

    res.json(mealPlan);
  } catch (error: any) {
    console.error("Get meal plan by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Create new meal plan
// @route   POST /api/meal-plans
// @access  Private/Staff
export const createMealPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, meals, daysAvailable, price } = req.body;

    console.log(req.body);

    // Validate that all meals exist
    const breakfastIds = Array.isArray(meals.breakfast) ? meals.breakfast : [meals.breakfast];
    const lunchIds = Array.isArray(meals.lunch) ? meals.lunch : [meals.lunch];
    const dinnerIds = Array.isArray(meals.dinner) ? meals.dinner : [meals.dinner];
    
    // Check if all breakfast meals exist
    for (const id of breakfastIds) {
      const mealExists = await Meal.findById(id);
      if (!mealExists) {
        res.status(404).json({ message: `Breakfast meal with ID ${id} not found` });
        return;
      }
    }
    
    // Check if all lunch meals exist
    for (const id of lunchIds) {
      const mealExists = await Meal.findById(id);
      if (!mealExists) {
        res.status(404).json({ message: `Lunch meal with ID ${id} not found` });
        return;
      }
    }
    
    // Check if all dinner meals exist
    for (const id of dinnerIds) {
      const mealExists = await Meal.findById(id);
      if (!mealExists) {
        res.status(404).json({ message: `Dinner meal with ID ${id} not found` });
        return;
      }
    }

    // Create new meal plan
    const newMealPlan = new MealPlan({
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

    const savedMealPlan = await newMealPlan.save();
    res.status(201).json(savedMealPlan);
  } catch (error: any) {
    console.warn(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private/Staff
export const updateMealPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, meals, daysAvailable, price } = req.body;

    let mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      res.status(404).json({ message: "Meal plan not found" });
      return;
    }

    // Validate that the meals exist if they are being updated
    if (meals) {
      const breakfastExists = await Meal.findById(meals.breakfast);
      const lunchExists = await Meal.findById(meals.lunch);
      const dinnerExists = await Meal.findById(meals.dinner);

      if (!breakfastExists || !lunchExists || !dinnerExists) {
        res.status(400).json({ message: "One or more meals do not exist" });
        return;
      }
    }

    // Update meal plan
    mealPlan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        meals,
        daysAvailable,
        price,
      },
      { new: true }
    );

    res.json(mealPlan);
  } catch (error: any) {
    console.error("Update meal plan error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Delete meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private/Staff
export const deleteMealPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      res.status(404).json({ message: "Meal plan not found" });
      return;
    }

    // Check if meal plan has active subscriptions
    const activeSubscriptions = await StudentMealPlan.find({
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
    await MealPlan.findByIdAndDelete(req.params.id);

    res.json({ message: "Meal plan removed" });
  } catch (error: any) {
    console.error("Delete meal plan error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get student's meal plan
// @route   GET /api/students/:id/meal-plan
// @access  Private
export const getStudentMealPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.params.id;

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Get active meal plan subscription
    const subscription = await StudentMealPlan.findOne({
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
  } catch (error: any) {
    console.error("Get student meal plan error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Subscribe to meal plan
// @route   POST /api/students/meal-plan
// @access  Private
export const subscribeMealPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId, mealPlanId, startDate, endDate, specialRequests } =
      req.body;

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Check if meal plan exists
    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      res.status(404).json({ message: "Meal plan not found" });
      return;
    }

    // Check if student already has an active meal plan
    const existingPlan = await StudentMealPlan.findOne({
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
    const subscription = await StudentMealPlan.create({
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
  } catch (error: any) {
    console.error("Subscribe meal plan error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Cancel meal plan subscription
// @route   DELETE /api/students/meal-plan/:id
// @access  Private
export const cancelMealPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const subscription = await StudentMealPlan.findById(req.params.id);

    if (!subscription) {
      res.status(404).json({ message: "Subscription not found" });
      return;
    }

    // Check if user is authorized (either staff or the student who owns the subscription)
    if (
      req.user?.role !== "staff" &&
      req.user?._id.toString() !== subscription.studentId.id.toString()
    ) {
      res
        .status(403)
        .json({ message: "Not authorized to cancel this subscription" });
      return;
    }

    // Update end date to now
    subscription.endDate = new Date();
    await subscription.save();

    res.json({ message: "Meal plan subscription cancelled" });
  } catch (error: any) {
    console.error("Cancel meal plan error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Order individual meal
// @route   POST /api/meals/order
// @access  Private
export const orderMeal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { mealId, date, time, specialRequests } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Check if meal exists
    const meal = await Meal.findById(mealId);
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
    const order = await MealOrder.create({
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
  } catch (error: any) {
    console.error("Order meal error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get student's meal orders
// @route   GET /api/students/:id/meal-orders
// @access  Private
export const getStudentMealOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.params.id;

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Check if user is authorized (either staff or the student themselves)
    if (req.user?.role !== "staff" && req.user?._id.toString() !== studentId) {
      res.status(403).json({ message: "Not authorized to view these orders" });
      return;
    }

    // Get meal orders
    const orders = await MealOrder.find({
      "studentId.id": studentId,
    }).sort({ date: -1 });

    res.json(orders);
  } catch (error: any) {
    console.error("Get student meal orders error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get meal attendance
// @route   GET /api/meals/attendance
// @access  Private/Staff
export const getMealAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { date, mealType } = req.query;

    let query: any = {};
    console.log("here");
    if (date) {
      const queryDate = new Date(date as string);
      query.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999)),
      };
    }

    if (mealType) {
      query.mealType = mealType;
    }

    const attendance = await MealAttendance.find(query)
      .populate("studentId.id", "name email studentId")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error: any) {
    console.error("Get meal attendance error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Record meal attendance
// @route   POST /api/meals/attendance
// @access  Private/Staff
export const recordMealAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId, mealType, date } = req.body;

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Check if attendance already recorded
    const attendanceDate = date ? new Date(date) : new Date();
    const existingAttendance = await MealAttendance.findOne({
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
    const attendance = await MealAttendance.create({
      studentId: {
        id: studentId,
        ref: "User",
      },
      mealType,
      date: attendanceDate,
    });

    res.status(201).json(attendance);
  } catch (error: any) {
    console.error("Record meal attendance error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get dietary requests
// @route   GET /api/meals/dietary-requests
// @access  Private/Staff
export const getDietaryRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get dietary requests from student meal plans
    const dietaryRequests = await StudentMealPlan.find({
      $or: [{ specialRequests: { $exists: true, $ne: "" } }],
    })
      .populate("studentId.id", "name email studentId roomNumber")
      .sort({ createdAt: -1 });

    // Format the response
    const formattedRequests = dietaryRequests.map((request) => {
      const student = request.studentId.id as any; // Cast to any to access populated fields
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
  } catch (error: any) {
    console.error("Get dietary requests error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get meal statistics
// @route   GET /api/meals/stats
// @access  Private/Staff
export const getMealStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Define interface for meal document
    interface IMeal {
      _id: mongoose.Types.ObjectId;
      name: string;
    }

    // Get all meals
    const meals = (await Meal.find()) as IMeal[];

    // Get all meal orders
    const mealOrders = await MealOrder.find().populate("mealId.id");

    // Calculate most popular meal
    const mealPopularity: Record<string, number> = {};
    mealOrders.forEach((order) => {
      const mealId = (order.mealId.id as any)._id.toString();
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
    const mostPopularMeal =
      meals.find((m) => m._id.toString() === mostPopularMealId)?.name ||
      "Unknown";
    const leastPopularMeal =
      meals.find((m) => m._id.toString() === leastPopularMealId)?.name ||
      "Unknown";

    // Count dietary preferences
    const vegetarianCount = await User.countDocuments({
      dietaryPreferences: "vegetarian",
    });
    const veganCount = await User.countDocuments({
      dietaryPreferences: "vegan",
    });
    const nonVegetarianCount = await User.countDocuments({
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
  } catch (error: any) {
    console.error("Get meal stats error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
