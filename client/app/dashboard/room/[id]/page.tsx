"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import roomService, { Room, Bed } from "@/services/RoomService";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmEndAllocation, setConfirmEndAllocation] = useState<
    string | null
  >(null);

  const roomId = params.id as string;

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch room details
        const roomData = await roomService.getRoomById(roomId);
        setRoom(roomData);

        // Fetch beds in the room
        const bedsData = await roomService.getBedsInRoom(roomId);
        setBeds(bedsData);
      } catch (error) {
        console.error("Error fetching room details:", error);
        setError("Failed to load room details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const handleEndAllocation = async (allocationId: string) => {
    try {
      setLoading(true);
      await roomService.endAllocation(allocationId);

      toast.message("Room allocation ended successfully.");

      // Refresh the data
      const bedsData = await roomService.getBedsInRoom(roomId);
      setBeds(bedsData);

      // Close the confirmation dialog
      setConfirmEndAllocation(null);
    } catch (error) {
      console.error("Error ending allocation:", error);
      toast.message("Failed to end room allocation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Room not found"}</CardDescription>
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

  // Get room status badge
  const getRoomStatusBadge = (status: string) => {
    switch (status) {
      case "full":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Full
          </Badge>
        );
      case "available":
        return room.occupied > 0 ? (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Partially Occupied
          </Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800">
            <XCircle className="mr-1 h-3 w-3" />
            Vacant
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Maintenance
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Room {room.roomNumber}</h1>
          <p className="text-muted-foreground">
            Room details and occupancy information
          </p>
        </div>
        <div className="flex space-x-2">
          {user?.role === "staff" && (
            <>
              <Button asChild variant="outline">
                <Link href={`/dashboard/room/maintenance?roomId=${room.id}`}>
                  Request Maintenance
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/room/allocate?roomId=${room.id}`}>
                  Allocate Room
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="outline">
            <Link href="/dashboard/room">Back to Rooms</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Room Number</div>
                <div className="text-sm font-medium">{room.roomNumber}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="text-sm font-medium capitalize">
                  {room.type}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Floor</div>
                <div className="text-sm font-medium">{room.floor}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Capacity</div>
                <div className="text-sm font-medium">{room.capacity} beds</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Occupancy</div>
                <div className="text-sm font-medium">
                  {room.occupied}/{room.capacity}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <div>{getRoomStatusBadge(room.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              Features and facilities available in this room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {room.amenities.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="justify-center py-1.5"
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Bed Allocation</CardTitle>
          <CardDescription>
            Current occupants and bed availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bed Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Occupant</TableHead>
                {user?.role === "staff" && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {beds.map((bed) => (
                <TableRow key={bed._id}>
                  <TableCell className="font-medium">
                    Bed {bed.bedNumber}
                  </TableCell>
                  <TableCell>
                    {bed.isOccupied ? (
                      <Badge className="bg-green-100 text-green-800">
                        Occupied
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Available
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {bed.isOccupied ? bed.occupantName : "—"}
                  </TableCell>
                  {user?.role === "staff" && (
                    <TableCell className="text-right">
                      {bed.isOccupied ? (
                        <Dialog
                          open={confirmEndAllocation === bed._id}
                          onOpenChange={(open) => {
                            if (!open) setConfirmEndAllocation(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmEndAllocation(bed._id)}
                            >
                              End Allocation
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm End Allocation</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to end the allocation for{" "}
                                {bed.occupantName}? This will mark the bed as
                                available.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setConfirmEndAllocation(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleEndAllocation(
                                    typeof bed.occupiedBy === "object"
                                      ? bed.occupiedBy.id
                                      : bed.occupiedBy || ""
                                  )
                                }
                                disabled={loading}
                              >
                                {loading && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                End Allocation
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/room/allocate?roomId=${room.id}&bedId=${bed._id}`}
                          >
                            Allocate
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {user?.role === "staff" && (
        <Tabs defaultValue="maintenance" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
            <TabsTrigger value="allocation">Allocation History</TabsTrigger>
          </TabsList>
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
                <CardDescription>
                  Past maintenance requests for this room
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground">
                  <p>No maintenance history available.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="allocation">
            <Card>
              <CardHeader>
                <CardTitle>Allocation History</CardTitle>
                <CardDescription>
                  Past allocations for this room
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground">
                  <p>No allocation history available.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
