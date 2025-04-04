"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Megaphone,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data for notifications
const STUDENT_NOTIFICATIONS_DATA = {
  notifications: [
    {
      id: "n1",
      title: "Maintenance Notice",
      message:
        "Water supply will be interrupted from 10 AM to 2 PM tomorrow for maintenance work.",
      type: "info",
      date: "2 hours ago",
      read: false,
    },
    {
      id: "n2",
      title: "Room Inspection",
      message:
        "Monthly room inspection scheduled for tomorrow at 11 AM. Please ensure your room is clean and tidy.",
      type: "warning",
      date: "Yesterday",
      read: true,
    },
    {
      id: "n3",
      title: "Payment Reminder",
      message:
        "Your hostel fee for the next term is due on 15th January 2025. Please make the payment on time to avoid late fees.",
      type: "warning",
      date: "2 days ago",
      read: true,
    },
    {
      id: "n4",
      title: "Complaint Resolved",
      message:
        "Your complaint regarding the flickering light has been resolved. Please let us know if you face any further issues.",
      type: "success",
      date: "3 days ago",
      read: true,
    },
    {
      id: "n5",
      title: "New Mess Menu",
      message:
        "The mess menu for the next week has been updated. Check the mess notice board for details.",
      type: "info",
      date: "5 days ago",
      read: true,
    },
  ],
  announcements: [
    {
      id: "a1",
      title: "Hostel Day Celebration",
      message:
        "Annual Hostel Day will be celebrated on 25th December 2024. All students are requested to participate.",
      date: "10 Oct 2024",
    },
    {
      id: "a2",
      title: "Internet Upgrade",
      message:
        "The hostel Wi-Fi will be upgraded to higher bandwidth next week. There might be intermittent connectivity issues during the upgrade.",
      date: "8 Oct 2024",
    },
    {
      id: "a3",
      title: "New Gym Equipment",
      message:
        "New gym equipment has been installed in the hostel gym. Students can start using it from tomorrow.",
      date: "5 Oct 2024",
    },
  ],
  stats: {
    unread: 1,
    total: 5,
  },
};

const STAFF_NOTIFICATIONS_DATA = {
  notifications: [
    ...STUDENT_NOTIFICATIONS_DATA.notifications,
    {
      id: "n6",
      title: "New Complaint",
      message:
        "A new complaint has been registered by John Student regarding water leakage in room A-101.",
      type: "alert",
      date: "1 hour ago",
      read: false,
    },
    {
      id: "n7",
      title: "Inventory Low",
      message:
        "Study lamps inventory is running low. Only 5 lamps are left in stock.",
      type: "warning",
      date: "5 hours ago",
      read: false,
    },
  ],
  announcements: STUDENT_NOTIFICATIONS_DATA.announcements,
  stats: {
    unread: 3,
    total: 7,
  },
};

// Helper function to get notification icon
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "info":
      return <Info className="h-4 w-4" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4" />;
    case "alert":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

// Helper function to get notification variant
const getNotificationVariant = (type: string) => {
  switch (type) {
    case "info":
      return "default";
    case "warning":
      return "warning";
    case "success":
      return "success";
    case "alert":
      return "destructive";
    default:
      return "default";
  }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notificationsData, setNotificationsData] = useState(
    user?.role === "student"
      ? STUDENT_NOTIFICATIONS_DATA
      : STAFF_NOTIFICATIONS_DATA
  );

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notificationsData.notifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

    setNotificationsData({
      ...notificationsData,
      notifications: updatedNotifications,
      stats: { ...notificationsData.stats, unread: 0 },
    });
  };

  // Mark a single notification as read
  const markAsRead = (id: string) => {
    const updatedNotifications = notificationsData.notifications.map(
      (notification) =>
        notification.id === id ? { ...notification, read: true } : notification
    );

    const unreadCount = updatedNotifications.filter((n) => !n.read).length;

    setNotificationsData({
      ...notificationsData,
      notifications: updatedNotifications,
      stats: { ...notificationsData.stats, unread: unreadCount },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          {user?.role === "student"
            ? "Stay updated with important hostel announcements and notifications"
            : "Manage notifications and send announcements to students"}
        </p>
      </div>

      <div className="flex justify-between items-center">
        {user?.role === "staff" && (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">
                {notificationsData.stats.unread}
              </span>{" "}
              unread notifications
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
          {user?.role === "staff" && (
            <Button asChild>
              <Link href="/dashboard/notifications/send">
                Send Notification
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {notificationsData.notifications.length > 0 ? (
            notificationsData.notifications.map((notification) => (
              <Alert
                key={notification.id}
                variant={
                  getNotificationVariant(notification.type) as
                    | "default"
                    | "destructive"
                }
                className={notification.read ? "opacity-70" : ""}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <AlertTitle className="flex justify-between">
                      <span>{notification.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {notification.date}
                      </span>
                    </AlertTitle>
                    <AlertDescription>
                      <p>{notification.message}</p>
                    </AlertDescription>
                  </div>
                </div>
                {!notification.read && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  </div>
                )}
              </Alert>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6">
              <Bell className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Hostel Announcements</CardTitle>
                  <CardDescription>
                    Important announcements from hostel administration
                  </CardDescription>
                </div>
                {user?.role === "staff" && (
                  <Button asChild>
                    <Link href="/dashboard/notifications/announcement/new">
                      New Announcement
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {notificationsData.announcements.length > 0 ? (
                <div className="space-y-4">
                  {notificationsData.announcements.map((announcement) => (
                    <Card key={announcement.id} className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center">
                            <Megaphone className="mr-2 h-4 w-4" />
                            {announcement.title}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {announcement.date}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{announcement.message}</p>
                      </CardContent>
                      {user?.role === "staff" && (
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Delete
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <Megaphone className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No announcements found.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
