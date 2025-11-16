import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, AlertCircle, Calendar, User, Upload, FileText, Search, X } from "lucide-react";
import { tasksData } from "@/data/tasksData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  taskId: string;
}

export default function Tasks() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();

  // Get unique workflows for filter
  const uniqueWorkflows = useMemo(() => {
    return Array.from(new Set(tasksData.map(t => t.workflow)));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasksData.filter((task) => {
      const matchesTab = activeTab === "all" || task.status === activeTab;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesWorkflow = workflowFilter === "all" || task.workflow === workflowFilter;
      return matchesTab && matchesSearch && matchesPriority && matchesWorkflow;
    });
  }, [activeTab, searchQuery, priorityFilter, workflowFilter]);

  const stats = useMemo(() => {
    return {
      pending: tasksData.filter(t => t.status === "pending").length,
      inProgress: tasksData.filter(t => t.status === "in-progress").length,
      overdue: tasksData.filter(t => t.status === "overdue").length,
      completed: tasksData.filter(t => t.status === "completed").length,
    };
  }, []);

  const handleComplete = (taskId: string) => {
    toast({
      title: "Task Completed",
      description: `Task ${taskId} has been marked as completed.`,
    });
  };

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
      description: `${files.length} document(s) uploaded successfully.`,
    });
    setIsUploadOpen(false);
  };

  const getTaskDocuments = (taskId: string) => {
    return uploadedDocuments.filter(doc => doc.taskId === taskId);
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

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setWorkflowFilter("all");
  };

  const hasActiveFilters = searchQuery || priorityFilter !== "all" || workflowFilter !== "all";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all assigned tasks across workflows with document management
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <AlertCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
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
                    {uniqueWorkflows.map(workflow => (
                      <SelectItem key={workflow} value={workflow}>{workflow}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {filteredTasks.length} of {tasksData.length} tasks
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tasks ({tasksData.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No tasks found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const taskDocs = getTaskDocuments(task.id);
                return (
                  <Card key={task.id} className={task.status === "overdue" ? "border-destructive/50" : ""}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground">{task.title}</h3>
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
                              <div>Phase: {task.phase}</div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Dialog open={isUploadOpen && selectedTask === task.id} onOpenChange={(open) => {
                              setIsUploadOpen(open);
                              if (open) setSelectedTask(task.id);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Upload className="h-4 w-4" />
                                  Upload
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Upload Documents</DialogTitle>
                                  <DialogDescription>
                                    Upload documents for task: {task.title}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="file-upload">Select Files</Label>
                                    <Input
                                      id="file-upload"
                                      type="file"
                                      multiple
                                      onChange={handleFileUpload}
                                      className="cursor-pointer"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                      You can upload multiple files at once
                                    </p>
                                  </div>
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
                              {taskDocs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">{doc.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {doc.size} • Uploaded {format(doc.uploadedAt, "MMM dd, yyyy 'at' HH:mm")}
                                      </p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">View</Button>
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
