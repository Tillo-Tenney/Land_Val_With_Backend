import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Upload,
  FileText,
  Search,
  X,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// 👍 IMPORT API INSTEAD OF DUMMY FILE
import { getTasks } from "@/api/tasksApi";

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  taskId: string;
}

export default function Tasks() {
  const { toast } = useToast();

  // LIVE DB TASKS
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [workflowFilter, setWorkflowFilter] = useState("all");

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // ✅ Load MySQL Tasks from API
  useEffect(() => {
    getTasks()
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        toast({
          title: "Error loading tasks",
          description: "Could not connect to the backend.",
          variant: "destructive",
        });
        setLoading(false);
      });
  }, []);

  // ⚙ Unique Workflows
  const uniqueWorkflows = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.workflow)));
  }, [tasks]);

  // 🔎 Filter Tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const matchesTab = activeTab === "all" || task.status === activeTab;

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      const matchesWorkflow =
        workflowFilter === "all" || task.workflow === workflowFilter;

      return matchesTab && matchesSearch && matchesPriority && matchesWorkflow;
    });

    return result;
  }, [tasks, activeTab, searchQuery, priorityFilter, workflowFilter]);

  // 📊 Stats from DB
  const stats = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      overdue: tasks.filter((t) => t.status === "overdue").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  const handleComplete = (taskId: string) => {
    toast({
      title: "Task Completed",
      description: `Task ${taskId} has been marked as completed.`,
    });
  };

  // 📁 Local-only file uploads (optional to move to backend later)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedTask) return;

    const newDocs: UploadedDocument[] = Array.from(files).map((file, index) => ({
      id: `doc-${Date.now()}-${index}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      uploadedAt: new Date(),
      taskId: selectedTask,
    }));

    setUploadedDocuments([...uploadedDocuments, ...newDocs]);
    toast({
      title: "Documents Uploaded",
      description: `${files.length} document(s) uploaded.`,
    });

    setIsUploadOpen(false);
  };

  const getTaskDocuments = (taskId: string) => {
    return uploadedDocuments.filter((doc) => doc.taskId === taskId);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      completed: "default",
      "in-progress": "secondary",
      pending: "outline",
      overdue: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      high: "bg-destructive/10 text-destructive",
      medium: "bg-accent/10 text-accent",
      low: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[priority] || ""}>{priority}</Badge>;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setWorkflowFilter("all");
  };

  const hasActiveFilters =
    searchQuery || priorityFilter !== "all" || workflowFilter !== "all";

  // ⏳ Loading State
  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all assigned tasks across workflows with document
            management.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
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

                <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workflows</SelectItem>
                    {uniqueWorkflows.map((workflow) => (
                      <SelectItem key={workflow} value={workflow}>
                        {workflow}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" /> Clear
                  </Button>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({stats.inProgress})
            </TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No tasks found matching your criteria.
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const taskDocs = getTaskDocuments(task.id);

                return (
                  <Card
                    key={task.id}
                    className={task.status === "overdue" ? "border-destructive/50" : ""}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Task Row */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{task.title}</h3>
                              {getStatusBadge(task.status)}
                              {getPriorityBadge(task.priority)}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {task.assignee}
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                              </div>

                              <div>Workflow: {task.workflow}</div>

                              {/* Dummy field preserved */}
                              <div>Phase: {task.phase}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {/* Upload Modal */}
                            <Dialog
                              open={isUploadOpen && selectedTask === task.id}
                              onOpenChange={(open) => {
                                setIsUploadOpen(open);
                                if (open) setSelectedTask(task.id);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="gap-2">
                                  <Upload className="h-4 w-4" /> Upload
                                </Button>
                              </DialogTrigger>

                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Upload Documents</DialogTitle>
                                  <DialogDescription>
                                    Upload files for: {task.title}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <Label>Select Files</Label>
                                  <Input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="cursor-pointer"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>

                            {task.status === "pending" && (
                              <Button size="sm" variant="outline">
                                Accept
                              </Button>
                            )}

                            {task.status !== "completed" && (
                              <Button size="sm" onClick={() => handleComplete(task.id)}>
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Uploaded Documents */}
                        {taskDocs.length > 0 && (
                          <div className="pt-4 border-t">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Documents ({taskDocs.length})
                            </p>

                            <div className="space-y-2">
                              {taskDocs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">{doc.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {doc.size} • Uploaded{" "}
                                        {format(
                                          doc.uploadedAt,
                                          "MMM dd, yyyy 'at' HH:mm"
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
