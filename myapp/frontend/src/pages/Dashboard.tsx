import { useState, useMemo, useEffect } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  GitBranch,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  FileDown,
  Eye,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import { getTasks } from "@/api/tasksApi";

export default function Dashboard() {
  const { toast } = useToast();

  // LOAD FROM API
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "createdDate">("dueDate");

  // Reports state
  const [reportType, setReportType] = useState("all-tasks");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // ---- LOAD DATA FROM BACKEND API ----
  useEffect(() => {
    getTasks()
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        toast({
          title: "Error loading tasks",
          description: "Unable to fetch tasks from server.",
          variant: "destructive",
        });
      });
  }, []);

  // ---- STATS ----
  const stats = useMemo(() => {
    const active = tasks.filter((t: any) => t.status === "in-progress").length;
    const completed = tasks.filter((t: any) => t.status === "completed").length;
    const pending = tasks.filter((t: any) => t.status === "pending").length;
    const overdue = tasks.filter((t: any) => t.status === "overdue").length;
    return { active, completed, pending, overdue };
  }, [tasks]);

  // ---- FILTER + SORT ----
  const filteredTasks = useMemo(() => {
    if (loading) return [];

    let filtered = tasks.filter((task: any) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a: any, b: any) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (a.status !== "overdue" && b.status === "overdue") return 1;

      const dateA = new Date(sortBy === "dueDate" ? a.dueDate : a.createdDate).getTime();
      const dateB = new Date(sortBy === "dueDate" ? b.dueDate : b.createdDate).getTime();

      return dateA - dateB;
    });
  }, [tasks, loading, searchQuery, statusFilter, priorityFilter, sortBy]);

  // ---- REPORT PREVIEW ----
  const getPreviewData = () => {
    let data = [...tasks];

    if (reportType === "completed") data = data.filter((t: any) => t.status === "completed");
    if (reportType === "overdue") data = data.filter((t: any) => t.status === "overdue");
    if (reportType === "pending") data = data.filter((t: any) => t.status === "pending");

    if (dateFrom) data = data.filter((t: any) => new Date(t.createdDate) >= new Date(dateFrom));
    if (dateTo) data = data.filter((t: any) => new Date(t.createdDate) <= new Date(dateTo));

    return data.slice(0, 5);
  };

  // ---- EXPORT CSV ----
  const handleExport = () => {
    const data = getPreviewData();
    const csv = [
      ["Task ID", "Title", "Workflow", "Assignee", "Status", "Priority", "Due Date", "Created Date"],
      ...data.map((t: any) => [
        t.id,
        t.title,
        t.workflow,
        t.assignee,
        t.status,
        t.priority,
        t.dueDate,
        t.createdDate,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportType}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();

    toast({
      title: "Report Exported",
      description: "Your report has been downloaded successfully.",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      "in-progress": "secondary",
      pending: "outline",
      overdue: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-destructive/10 text-destructive",
      medium: "bg-accent/10 text-accent",
      low: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[priority] || ""}>{priority}</Badge>;
  };

  const calculateAge = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Due in ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return "Due today";
    return `${diffDays}d overdue`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your tasks and reports.
          </p>
        </div>

        {/* ---- STATS ---- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active Tasks" value={stats.active} icon={<GitBranch />} trend={12} trendLabel="from last week" />
          <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 />} trend={8} trendLabel="from last week" />
          <StatCard title="Pending" value={stats.pending} icon={<Clock />} trend={-15} trendLabel="from yesterday" />
          <StatCard title="Overdue" value={stats.overdue} icon={<AlertCircle />} trend={-25} trendLabel="from last week" />
        </div>

        {/* ---- TASKS TABLE ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks Aging Table</CardTitle>
            <CardDescription>Track all tasks with aging</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="createdDate">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TABLE */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task: any) => (
                      <TableRow key={task.id} className={task.status === "overdue" ? "bg-destructive/5" : ""}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.workflow}</TableCell>
                        <TableCell>{task.assignee}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell className={task.status === "overdue" ? "text-destructive font-semibold" : ""}>
                          {calculateAge(task.dueDate)}
                        </TableCell>
                        <TableCell>{format(new Date(task.dueDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{format(new Date(task.createdDate), "MMM dd, yyyy")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ---- REPORTS ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate and export custom reports</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="configure">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="configure">Configure</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="configure" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-tasks">All Tasks</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="flex gap-2">
                      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
                    <Eye />
                    {showPreview ? "Hide" : "Show"} Preview
                  </Button>

                  <Button onClick={handleExport} className="gap-2">
                    <FileDown />
                    Export Report
                  </Button>
                </div>

                {/* PREVIEW */}
                {showPreview && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                    <p className="text-sm font-medium mb-2">
                      Preview ({getPreviewData().length} records)
                    </p>

                    <div className="text-xs text-muted-foreground space-y-1">
                      {getPreviewData().map((task: any, i: number) => (
                        <div key={i} className="flex gap-4">
                          <span className="font-mono">{task.id}</span>
                          <span className="flex-1">{task.title}</span>
                          <span>{task.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Workflow</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {getPreviewData().map((task: any) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-mono text-sm">{task.id}</TableCell>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{task.workflow}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell>{format(new Date(task.dueDate), "MMM dd, yyyy")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
