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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  Utensils,
  FileBarChart,
  Bed,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for reports
const REPORTS_DATA = {
  recentReports: [
    {
      id: "r1",
      title: "Monthly Occupancy Report",
      type: "Occupancy",
      generatedOn: "12 Oct 2024",
      generatedBy: "Jane Staff",
    },
    {
      id: "r2",
      title: "Payment Collection Report",
      type: "Financial",
      generatedOn: "10 Oct 2024",
      generatedBy: "Jane Staff",
    },
    {
      id: "r3",
      title: "Meal Attendance Report",
      type: "Mess",
      generatedOn: "8 Oct 2024",
      generatedBy: "Jane Staff",
    },
    {
      id: "r4",
      title: "Complaint Resolution Report",
      type: "Complaints",
      generatedOn: "5 Oct 2024",
      generatedBy: "Jane Staff",
    },
    {
      id: "r5",
      title: "Inventory Status Report",
      type: "Inventory",
      generatedOn: "1 Oct 2024",
      generatedBy: "Jane Staff",
    },
  ],
  reportTemplates: [
    {
      id: "t1",
      title: "Occupancy Report",
      description: "Generate a report on hostel room occupancy status",
      icon: Bed,
    },
    {
      id: "t2",
      title: "Financial Report",
      description: "Generate a report on fee collection and pending payments",
      icon: DollarSign,
    },
    {
      id: "t3",
      title: "Mess Report",
      description: "Generate a report on meal attendance and food expenses",
      icon: Utensils,
    },
    {
      id: "t4",
      title: "Complaint Report",
      description: "Generate a report on complaints and resolution status",
      icon: FileText,
    },
    {
      id: "t5",
      title: "Inventory Report",
      description: "Generate a report on inventory status and usage",
      icon: ShoppingCart,
    },
    {
      id: "t6",
      title: "Student Report",
      description: "Generate a report on student demographics and statistics",
      icon: Users,
    },
  ],
  stats: {
    totalReports: 42,
    generatedThisMonth: 15,
    scheduledReports: 3,
  },
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportsData, setReportsData] = useState(REPORTS_DATA);
  const [reportPeriod, setReportPeriod] = useState("month");

  // Only staff can access this page
  if (user?.role !== "staff") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <FileBarChart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground mb-4">
          You don't have permission to access this page.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and manage hostel management reports
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportsData.stats.totalReports}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Generated This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportsData.stats.generatedThisMonth}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportsData.stats.scheduledReports}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>
                    Reports generated in the past
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={reportPeriod} onValueChange={setReportPeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reportsData.recentReports.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Generated On</TableHead>
                      <TableHead>Generated By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData.recentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.title}
                        </TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.generatedOn}</TableCell>
                        <TableCell>{report.generatedBy}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Download</span>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/reports/${report.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No reports found for the selected period.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex justify-end w-full">
                <Button asChild variant="outline">
                  <Link href="/dashboard/reports/history">
                    View All Reports
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>
                Select a report template to generate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reportsData.reportTemplates.map((template) => (
                  <Card key={template.id} className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <template.icon className="mr-2 h-5 w-5" />
                        {template.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link
                          href={`/dashboard/reports/generate/${template.id}`}
                        >
                          Generate
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Set up automatic report generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Monthly Occupancy Report</h3>
                      <p className="text-sm text-muted-foreground">
                        Generated on the 1st of every month
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">
                        Weekly Meal Attendance Report
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generated every Monday at 9 AM
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Monthly Financial Report</h3>
                      <p className="text-sm text-muted-foreground">
                        Generated on the last day of every month
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard/reports/schedule">
                  Schedule New Report
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
