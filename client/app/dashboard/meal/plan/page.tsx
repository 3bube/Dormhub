"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/app/context/AuthContext";
import mealService from "@/services/MealService";

// MealPlanManagementPage component
export default function MealPlanManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    daysAvailable: [] as string[],
    meals: {
      breakfast: [] as string[],
      lunch: [] as string[],
      dinner: [] as string[],
    },
  });

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch meal plans
        const plansData = await mealService.getAllMealPlans();
        setMealPlans(plansData);

        // Fetch meals for selection
        const mealsData = await mealService.getAllMeals();
        setMeals(mealsData);
      } catch (error) {
        console.error("Error fetching meal plan data:", error);
        toast.error("Failed to load meal plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? parseFloat(value) : value,
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const daysAvailable = prev.daysAvailable.includes(day)
        ? prev.daysAvailable.filter((d) => d !== day)
        : [...prev.daysAvailable, day];
      return { ...prev, daysAvailable };
    });
  };

  const handleMealSelection = (mealType: "breakfast" | "lunch" | "dinner", mealId: string) => {
    setFormData((prev) => {
      const meals = { ...prev.meals };
      if (meals[mealType].includes(mealId)) {
        meals[mealType] = meals[mealType].filter((id) => id !== mealId);
      } else {
        meals[mealType] = [...meals[mealType], mealId];
      }
      return { ...prev, meals };
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      daysAvailable: [],
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
      },
    });
    setSelectedPlan(null);
  };

  const loadPlanForEditing = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price || 0,
      daysAvailable: plan.daysAvailable || [],
      meals: {
        breakfast: plan.meals?.breakfast || [],
        lunch: plan.meals?.lunch || [],
        dinner: plan.meals?.dinner || [],
      },
    });
    setShowEditDialog(true);
  };

  const validateFormData = () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast.error("Please fill in all required fields");
      return false;
    }
    
    if (formData.daysAvailable.length === 0) {
      toast.error("Please select at least one day");
      return false;
    }
    
    if (formData.meals.breakfast.length === 0 || 
        formData.meals.lunch.length === 0 || 
        formData.meals.dinner.length === 0) {
      toast.error("Please select at least one meal for each meal type");
      return false;
    }

    return true;
  };

  const handleCreatePlan = async () => {
    if (!validateFormData()) {
      return;
    }

    setIsCreating(true);
    try {
      const mealPlanData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        daysAvailable: formData.daysAvailable,
        meals: {
          breakfast: formData.meals.breakfast,
          lunch: formData.meals.lunch,
          dinner: formData.meals.dinner,
        },
      };

      console.log("Creating meal plan with data:", mealPlanData);
      await mealService.createMealPlan(mealPlanData);
      toast.success("Meal plan created successfully");
      setShowCreateDialog(false);
      resetForm();
      
      // Refresh meal plans
      const plansData = await mealService.getAllMealPlans();
      setMealPlans(plansData);
    } catch (error) {
      console.error("Error creating meal plan:", error);
      toast.error("Failed to create meal plan. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!validateFormData() || !selectedPlan) {
      return;
    }

    setIsCreating(true);
    try {
      const mealPlanData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        daysAvailable: formData.daysAvailable,
        meals: {
          breakfast: formData.meals.breakfast,
          lunch: formData.meals.lunch,
          dinner: formData.meals.dinner,
        },
      };

      console.log("Updating meal plan with data:", mealPlanData);
      await mealService.updateMealPlan(selectedPlan._id, mealPlanData);
      toast.success("Meal plan updated successfully");
      setShowEditDialog(false);
      resetForm();
      
      // Refresh meal plans
      const plansData = await mealService.getAllMealPlans();
      setMealPlans(plansData);
    } catch (error) {
      console.error("Error updating meal plan:", error);
      toast.error("Failed to update meal plan. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    
    setIsDeleting(true);
    try {
      await mealService.deleteMealPlan(selectedPlan._id);
      toast.success("Meal plan deleted successfully");
      setShowDeleteDialog(false);
      
      // Refresh meal plans
      const plansData = await mealService.getAllMealPlans();
      setMealPlans(plansData);
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      toast.error("Failed to delete meal plan. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading meal plans...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch the latest information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Plan Management</h1>
          <p className="text-muted-foreground">
            Create and manage meal plans for students
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Meal Plan
          </Button>
          <Link href="/dashboard/meal">
            <Button variant="outline">Back to Meals</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Meal Plans</CardTitle>
          <CardDescription>
            View and manage all available meal plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mealPlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No meal plans found</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Meal Plan
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Days Available</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mealPlans.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>${plan.price}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.daysAvailable.map((day: string) => (
                          <Badge key={day} variant="outline">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPlanForEditing(plan)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Meal Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Meal Plan</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new meal plan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter plan name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter plan description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Days Available</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={formData.daysAvailable.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={`day-${day}`} className="capitalize">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Label>Meals</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Breakfast</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {meals
                      .filter((meal) => meal.type === "breakfast")
                      .map((meal) => (
                        <div key={meal._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`breakfast-${meal._id}`}
                            checked={formData.meals.breakfast.includes(meal._id)}
                            onCheckedChange={() => handleMealSelection("breakfast", meal._id)}
                          />
                          <Label htmlFor={`breakfast-${meal._id}`}>{meal.name}</Label>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Lunch</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {meals
                      .filter((meal) => meal.type === "lunch")
                      .map((meal) => (
                        <div key={meal._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lunch-${meal._id}`}
                            checked={formData.meals.lunch.includes(meal._id)}
                            onCheckedChange={() => handleMealSelection("lunch", meal._id)}
                          />
                          <Label htmlFor={`lunch-${meal._id}`}>{meal.name}</Label>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dinner</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {meals
                      .filter((meal) => meal.type === "dinner")
                      .map((meal) => (
                        <div key={meal._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dinner-${meal._id}`}
                            checked={formData.meals.dinner.includes(meal._id)}
                            onCheckedChange={() => handleMealSelection("dinner", meal._id)}
                          />
                          <Label htmlFor={`dinner-${meal._id}`}>{meal.name}</Label>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the meal plan "{selectedPlan?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meal Plan Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meal Plan</DialogTitle>
            <DialogDescription>
              Update the details of this meal plan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter plan name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter plan description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Days Available</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <div key={`edit-day-${day}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-day-${day}`}
                      checked={formData.daysAvailable.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={`edit-day-${day}`} className="capitalize">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Label>Meals</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Breakfast</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {meals
                      .filter((meal) => meal.type === "breakfast")
                      .map((meal) => (
                        <div key={`edit-breakfast-${meal._id}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-breakfast-${meal._id}`}
                            checked={formData.meals.breakfast.includes(meal._id)}
                            onCheckedChange={() => handleMealSelection("breakfast", meal._id)}
                          />
                          <Label htmlFor={`edit-breakfast-${meal._id}`}>{meal.name}</Label>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Lunch</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {meals
                      .filter((meal) => meal.type === "lunch")
                      .map((meal) => (
                        <div key={`edit-lunch-${meal._id}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-lunch-${meal._id}`}
                            checked={formData.meals.lunch.includes(meal._id)}
                            onCheckedChange={() => handleMealSelection("lunch", meal._id)}
                          />
                          <Label htmlFor={`edit-lunch-${meal._id}`}>{meal.name}</Label>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dinner</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {meals
                      .filter((meal) => meal.type === "dinner")
                      .map((meal) => (
                        <div key={`edit-dinner-${meal._id}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-dinner-${meal._id}`}
                            checked={formData.meals.dinner.includes(meal._id)}
                            onCheckedChange={() => handleMealSelection("dinner", meal._id)}
                          />
                          <Label htmlFor={`edit-dinner-${meal._id}`}>{meal.name}</Label>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
