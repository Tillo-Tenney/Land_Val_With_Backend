import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tasksData } from "@/data/tasksData";
import { 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  FileDown,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Dashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "createdDate">("dueDate");
  
  // Reports state
  const [reportType, setReportType] = useState("all-tasks");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const active = tasksData.filter(t => t.status === "in-progress").length;
    const completed = tasksData.filter(t => t.status === "completed").length;
    const pending = tasksData.filter(t => t.status === "pending").length;
    const overdue = tasksData.filter(t => t.status === "overdue").length;
    return { active, completed, pending, overdue };
  }, []);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasksData.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort: overdue first, then by date
    return filtered.sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (a.status !== "overdue" && b.status === "overdue") return 1;
      
      const dateA = new Date(sortBy === "dueDate" ? a.dueDate : a.createdDate).getTime();
      const dateB = new Date(sortBy === "dueDate" ? b.dueDate : b.createdDate).getTime();
      return dateA - dateB;
    });
  }, [searchQuery, statusFilter, priorityFilter, sortBy]);

  // Get preview data for reports
  const getPreviewData = () => {
    let data = tasksData;
    
    if (reportType === "completed") {
      data = data.filter(t => t.status === "completed");
    } else if (reportType === "overdue") {
      data = data.filter(t => t.status === "overdue");
    } else if (reportType === "pending") {
      data = data.filter(t => t.status === "pending");
    }

    if (dateFrom) {
      data = data.filter(t => new Date(t.createdDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      data = data.filter(t => new Date(t.createdDate) <= new Date(dateTo));
    }

    return data.slice(0, 5);
  };

  const handleExport = () => {
    const data = getPreviewData();
    const csv = [
      ["Task ID", "Title", "Workflow", "Assignee", "Status", "Priority", "Due Date", "Created Date"],
      ...data.map(t => [t.id, t.title, t.workflow, t.assignee, t.status, t.priority, t.dueDate, t.createdDate])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your tasks and reports.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Tasks"
            value={stats.active}
            icon={<GitBranch className="h-4 w-4" />}
            trend={12}
            trendLabel="from last week"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="h-4 w-4" />}
            trend={8}
            trendLabel="from last week"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pending}
            icon={<Clock className="h-4 w-4" />}
            trend={-15}
            trendLabel="from yesterday"
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle className="h-4 w-4" />}
            trend={-25}
            trendLabel="from last week"
          />
        </div>

        {/* Tasks Aging Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tasks Aging Table</CardTitle>
                <CardDescription>Track all tasks with aging information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, workflows, or assignees..."
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
                  <SelectItem value="all">All Status</SelectItem>
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
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "dueDate" | "createdDate")}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="createdDate">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
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
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id} className={task.status === "overdue" ? "bg-destructive/5" : ""}>
                        <TableCell className="font-medium">{task.title}</TableCell>
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

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate and export custom reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="configure" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="configure">Configure</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="configure" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-tasks">All Tasks</SelectItem>
                        <SelectItem value="completed">Completed Tasks</SelectItem>
                        <SelectItem value="overdue">Overdue Tasks</SelectItem>
                        <SelectItem value="pending">Pending Tasks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="From"
                      />
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="To"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setShowPreview(!showPreview)} variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    {showPreview ? "Hide" : "Show"} Preview
                  </Button>
                  <Button onClick={handleExport} className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Export Report
                  </Button>
                </div>

                {showPreview && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                    <p className="text-sm font-medium mb-2">Preview ({getPreviewData().length} records)</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {getPreviewData().map((task, i) => (
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

              <TabsContent value="preview" className="space-y-4">
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
                      {getPreviewData().map((task) => (
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
