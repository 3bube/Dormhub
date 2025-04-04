"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define form validation schema for general settings
const generalSettingsSchema = z.object({
  hostelName: z.string().min(2, "Hostel name must be at least 2 characters"),
  hostelAddress: z.string().min(5, "Address must be at least 5 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  wardenName: z.string().min(2, "Warden name must be at least 2 characters"),
});

// Define form validation schema for notification settings
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  complaintUpdates: z.boolean(),
  paymentReminders: z.boolean(),
  maintenanceAlerts: z.boolean(),
  announcementNotifications: z.boolean(),
});

// Define form validation schema for system settings
const systemSettingsSchema = z.object({
  defaultLanguage: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  timezone: z.string(),
});

// Define form validation schema for privacy settings
const privacySettingsSchema = z.object({
  showProfile: z.boolean(),
  showContactInfo: z.boolean(),
  allowDataCollection: z.boolean(),
  receiveMarketingEmails: z.boolean(),
});

export default function SettingsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  // Initialize general settings form
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      hostelName: "University Hostel",
      hostelAddress: "123 University Road, City, State, 12345",
      contactEmail: "hostel@university.edu",
      contactPhone: "+1 (123) 456-7890",
      wardenName: "Dr. John Smith",
    },
  });

  // Initialize notification settings form
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      complaintUpdates: true,
      paymentReminders: true,
      maintenanceAlerts: true,
      announcementNotifications: true,
    },
  });

  // Initialize system settings form
  const systemForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      defaultLanguage: "English",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24-hour",
      timezone: "UTC+00:00",
    },
  });

  // Initialize privacy settings form
  const privacyForm = useForm<z.infer<typeof privacySettingsSchema>>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      showProfile: true,
      showContactInfo: false,
      allowDataCollection: true,
      receiveMarketingEmails: false,
    },
  });

  // Handle general settings form submission
  const onGeneralSubmit = async (
    values: z.infer<typeof generalSettingsSchema>
  ) => {
    setIsUpdating(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.message("Settings updated", {
        description: "General settings have been updated successfully.",
      });
    } catch (error) {
      toast.message("Error", {
        description:
          "An error occurred while updating settings. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle notification settings form submission
  const onNotificationSubmit = async (
    values: z.infer<typeof notificationSettingsSchema>
  ) => {
    setIsUpdating(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.message("Settings updated", {
        description: "Notification settings have been updated successfully.",
      });
    } catch (error) {
      toast.message("Error", {
        description:
          "An error occurred while updating settings. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle system settings form submission
  const onSystemSubmit = async (
    values: z.infer<typeof systemSettingsSchema>
  ) => {
    setIsUpdating(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.message("Settings updated", {
        description: "System settings have been updated successfully.",
      });
    } catch (error) {
      toast.message("Error", {
        description:
          "An error occurred while updating settings. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle privacy settings form submission
  const onPrivacySubmit = async (
    values: z.infer<typeof privacySettingsSchema>
  ) => {
    setIsUpdating(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.message("Settings updated", {
        description: "Privacy settings have been updated successfully.",
      });
    } catch (error) {
      toast.message("Error", {
        description:
          "An error occurred while updating settings. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Only staff can access all settings
  const isStaff = user?.role === "staff";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your {isStaff ? "hostel" : "account"} settings and preferences
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isStaff && <TabsTrigger value="system">System</TabsTrigger>}
          {!isStaff && <TabsTrigger value="privacy">Privacy</TabsTrigger>}
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                {isStaff
                  ? "Manage hostel information and contact details"
                  : "View hostel information and contact details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form
                  onSubmit={generalForm.handleSubmit(onGeneralSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={generalForm.control}
                    name="hostelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hostel Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isStaff} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={generalForm.control}
                    name="hostelAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hostel Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} disabled={!isStaff} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isStaff} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generalForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isStaff} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={generalForm.control}
                    name="wardenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warden Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isStaff} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isStaff && (
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Notification Channels
                    </h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Email Notifications
                              </FormLabel>
                              <FormDescription>
                                Receive notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                SMS Notifications
                              </FormLabel>
                              <FormDescription>
                                Receive notifications via SMS
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="complaintUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Complaint Updates
                              </FormLabel>
                              <FormDescription>
                                Receive updates on your complaints
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="paymentReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Payment Reminders
                              </FormLabel>
                              <FormDescription>
                                Receive reminders for upcoming payments
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="maintenanceAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Maintenance Alerts
                              </FormLabel>
                              <FormDescription>
                                Receive alerts about maintenance work
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="announcementNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Announcements
                              </FormLabel>
                              <FormDescription>
                                Receive hostel announcements and news
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {isStaff && (
          <TabsContent value="system" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings for the hostel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...systemForm}>
                  <form
                    onSubmit={systemForm.handleSubmit(onSystemSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={systemForm.control}
                      name="defaultLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                              <SelectItem value="Chinese">Chinese</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The default language for the hostel management
                            system
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a date format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">
                                DD/MM/YYYY
                              </SelectItem>
                              <SelectItem value="MM/DD/YYYY">
                                MM/DD/YYYY
                              </SelectItem>
                              <SelectItem value="YYYY-MM-DD">
                                YYYY-MM-DD
                              </SelectItem>
                              <SelectItem value="DD-MMM-YYYY">
                                DD-MMM-YYYY
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The format in which dates will be displayed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="timeFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Format</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="12-hour">
                                12-hour (AM/PM)
                              </SelectItem>
                              <SelectItem value="24-hour">24-hour</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The format in which times will be displayed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={systemForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UTC-12:00">
                                UTC-12:00
                              </SelectItem>
                              <SelectItem value="UTC-11:00">
                                UTC-11:00
                              </SelectItem>
                              <SelectItem value="UTC-10:00">
                                UTC-10:00
                              </SelectItem>
                              <SelectItem value="UTC-09:00">
                                UTC-09:00
                              </SelectItem>
                              <SelectItem value="UTC-08:00">
                                UTC-08:00 (PST)
                              </SelectItem>
                              <SelectItem value="UTC-07:00">
                                UTC-07:00 (MST)
                              </SelectItem>
                              <SelectItem value="UTC-06:00">
                                UTC-06:00 (CST)
                              </SelectItem>
                              <SelectItem value="UTC-05:00">
                                UTC-05:00 (EST)
                              </SelectItem>
                              <SelectItem value="UTC-04:00">
                                UTC-04:00
                              </SelectItem>
                              <SelectItem value="UTC-03:00">
                                UTC-03:00
                              </SelectItem>
                              <SelectItem value="UTC-02:00">
                                UTC-02:00
                              </SelectItem>
                              <SelectItem value="UTC-01:00">
                                UTC-01:00
                              </SelectItem>
                              <SelectItem value="UTC+00:00">
                                UTC+00:00 (GMT)
                              </SelectItem>
                              <SelectItem value="UTC+01:00">
                                UTC+01:00 (CET)
                              </SelectItem>
                              <SelectItem value="UTC+02:00">
                                UTC+02:00
                              </SelectItem>
                              <SelectItem value="UTC+03:00">
                                UTC+03:00
                              </SelectItem>
                              <SelectItem value="UTC+04:00">
                                UTC+04:00
                              </SelectItem>
                              <SelectItem value="UTC+05:00">
                                UTC+05:00
                              </SelectItem>
                              <SelectItem value="UTC+05:30">
                                UTC+05:30 (IST)
                              </SelectItem>
                              <SelectItem value="UTC+06:00">
                                UTC+06:00
                              </SelectItem>
                              <SelectItem value="UTC+07:00">
                                UTC+07:00
                              </SelectItem>
                              <SelectItem value="UTC+08:00">
                                UTC+08:00
                              </SelectItem>
                              <SelectItem value="UTC+09:00">
                                UTC+09:00 (JST)
                              </SelectItem>
                              <SelectItem value="UTC+10:00">
                                UTC+10:00
                              </SelectItem>
                              <SelectItem value="UTC+11:00">
                                UTC+11:00
                              </SelectItem>
                              <SelectItem value="UTC+12:00">
                                UTC+12:00
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The timezone for the hostel management system
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {!isStaff && (
          <TabsContent value="privacy" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage your privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...privacyForm}>
                  <form
                    onSubmit={privacyForm.handleSubmit(onPrivacySubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Profile Visibility
                      </h3>
                      <div className="space-y-4">
                        <FormField
                          control={privacyForm.control}
                          name="showProfile"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Show Profile
                                </FormLabel>
                                <FormDescription>
                                  Allow other students to see your profile
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={privacyForm.control}
                          name="showContactInfo"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Show Contact Information
                                </FormLabel>
                                <FormDescription>
                                  Allow other students to see your contact
                                  information
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Data Usage</h3>
                      <div className="space-y-4">
                        <FormField
                          control={privacyForm.control}
                          name="allowDataCollection"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Allow Data Collection
                                </FormLabel>
                                <FormDescription>
                                  Allow the hostel to collect usage data to
                                  improve services
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={privacyForm.control}
                          name="receiveMarketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Receive Marketing Emails
                                </FormLabel>
                                <FormDescription>
                                  Receive promotional emails about hostel
                                  services and events
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
