"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import roomService, { Room, Bed } from "@/services/RoomService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form validation schema
const formSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().min(1, "Student name is required"),
  roomId: z.string().min(1, "Room is required"),
  bedId: z.string().min(1, "Bed is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z
    .date({
      required_error: "End date is required",
    })
    .optional(),
  paymentConfirmed: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function AllocateRoomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState({
    rooms: true,
    beds: false,
    submit: false,
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      studentName: "",
      roomId: "",
      bedId: "",
      startDate: new Date(),
      paymentConfirmed: false,
    },
  });

  // Watch for room selection to load beds
  const selectedRoomId = form.watch("roomId");

  // Fetch rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading((prev) => ({ ...prev, rooms: true }));
        const roomsData = await roomService.getAllRooms();
        // Filter only available rooms
        const availableRooms = roomsData.filter(
          (room) =>
            room.status !== "maintenance" && room.occupied < room.capacity
        );
        setRooms(availableRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.message("Failed to load available rooms. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, rooms: false }));
      }
    };

    fetchRooms();
  }, [toast]);

  // Fetch beds when room is selected
  useEffect(() => {
    const fetchBeds = async () => {
      if (!selectedRoomId) {
        setBeds([]);
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, beds: true }));
        const bedsData = await roomService.getBedsInRoom(selectedRoomId);
        // Filter only available beds
        const availableBeds = bedsData.filter((bed) => !bed.isOccupied);
        setBeds(availableBeds);
      } catch (error) {
        console.error("Error fetching beds:", error);
        toast.message("Failed to load available beds. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, beds: false }));
      }
    };

    fetchBeds();
  }, [selectedRoomId, toast]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user || user.role !== "staff") {
      toast.message("You don't have permission to allocate rooms.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, submit: true }));

      // Call the room allocation service
      await roomService.allocateRoom(
        values.studentId,
        values.roomId,
        values.bedId
      );

      toast.message("Room allocated successfully!");

      // Navigate back to room management
      router.push("/dashboard/room");
    } catch (error) {
      console.error("Error allocating room:", error);
      toast.message("Failed to allocate room. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Check if user is authorized
  if (user && user.role !== "staff") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
            <CardDescription>
              You don&apos; have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/room">Go Back</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Allocate Room</h1>
          <p className="text-muted-foreground">
            Assign a student to an available room
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/room">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Allocation Form</CardTitle>
          <CardDescription>
            Fill in the details to allocate a room to a student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student ID Field */}
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the student&apos;s unique ID
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Student Name Field */}
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the student&apos;s full name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Room Selection */}
                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <Select
                        disabled={loading.rooms}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {loading.rooms ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Loading rooms...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select a room" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.roomNumber} - {room.type} ({room.occupied}/
                              {room.capacity} occupied)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select an available room
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bed Selection */}
                <FormField
                  control={form.control}
                  name="bedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed</FormLabel>
                      <Select
                        disabled={!selectedRoomId || loading.beds}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {loading.beds ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Loading beds...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select a bed" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {beds.map((bed) => (
                            <SelectItem key={bed._id} value={bed._id}>
                              Bed {bed.bedNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select an available bed in the room
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the student will move in
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date (Optional) */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) =>
                              date < (form.getValues("startDate") || new Date())
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the student is expected to move out (if known)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Confirmation */}
              <FormField
                control={form.control}
                name="paymentConfirmed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Payment Confirmed</FormLabel>
                      <FormDescription>
                        Check this if the student has paid the required fees
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/room")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading.submit}>
                  {loading.submit && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Allocate Room
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
