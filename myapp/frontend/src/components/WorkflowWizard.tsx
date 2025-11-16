import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Phase {
  name: string;
  duration: string;
  assignee: string;
  requiredDocs: string[];
}

export function WorkflowWizard({ open, onOpenChange }: WorkflowWizardProps) {
  const [step, setStep] = useState(1);
  const [workflowData, setWorkflowData] = useState({
    name: "",
    template: "",
    location: "",
    description: "",
    priority: "medium",
    phases: [] as Phase[],
    dueDate: "",
  });
  const { toast } = useToast();

  const steps = [
    { number: 1, title: "Basic Info", description: "Workflow details" },
    { number: 2, title: "Phase Setup", description: "Configure phases" },
    { number: 3, title: "Assignments", description: "Assign participants" },
    { number: 4, title: "Review", description: "Review & submit" },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    toast({
      title: "Workflow Created!",
      description: `${workflowData.name} has been successfully created.`,
    });
    onOpenChange(false);
    // Reset form
    setStep(1);
    setWorkflowData({
      name: "",
      template: "",
      location: "",
      description: "",
      priority: "medium",
      phases: [],
      dueDate: "",
    });
  };

  const addPhase = () => {
    setWorkflowData({
      ...workflowData,
      phases: [
        ...workflowData.phases,
        { name: "", duration: "", assignee: "", requiredDocs: [] },
      ],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Workflow</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      s.number < step
                        ? "bg-success border-success text-success-foreground"
                        : s.number === step
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {s.number < step ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-xs font-medium mt-2 text-center">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                {s.number < steps.length && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      s.number < step ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Plot Survey - Adyar District"
                  value={workflowData.name}
                  onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Template *</Label>
                <Select
                  value={workflowData.template}
                  onValueChange={(value) => setWorkflowData({ ...workflowData, template: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plot-survey">Standard Plot Survey</SelectItem>
                    <SelectItem value="house-assessment">House Assessment</SelectItem>
                    <SelectItem value="land-valuation">Land Valuation</SelectItem>
                    <SelectItem value="commercial">Commercial Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Adyar, Chennai"
                  value={workflowData.location}
                  onChange={(e) => setWorkflowData({ ...workflowData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={workflowData.priority}
                  onValueChange={(value) => setWorkflowData({ ...workflowData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the workflow..."
                  value={workflowData.description}
                  onChange={(e) => setWorkflowData({ ...workflowData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Configure phases for your workflow
                </p>
                <Button onClick={addPhase} variant="outline" size="sm">
                  Add Phase
                </Button>
              </div>
              {workflowData.phases.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No phases added yet. Click "Add Phase" to create one.
                  </CardContent>
                </Card>
              ) : (
                workflowData.phases.map((phase, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Phase {index + 1}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Phase Name</Label>
                          <Input
                            placeholder="e.g., Site Inspection"
                            value={phase.name}
                            onChange={(e) => {
                              const newPhases = [...workflowData.phases];
                              newPhases[index].name = e.target.value;
                              setWorkflowData({ ...workflowData, phases: newPhases });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (days)</Label>
                          <Input
                            placeholder="e.g., 3"
                            value={phase.duration}
                            onChange={(e) => {
                              const newPhases = [...workflowData.phases];
                              newPhases[index].duration = e.target.value;
                              setWorkflowData({ ...workflowData, phases: newPhases });
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Assign participants to each phase
              </p>
              {workflowData.phases.map((phase, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{phase.name || `Phase ${index + 1}`}</h4>
                    </div>
                    <div className="space-y-2">
                      <Label>Assignee</Label>
                      <Select
                        value={phase.assignee}
                        onValueChange={(value) => {
                          const newPhases = [...workflowData.phases];
                          newPhases[index].assignee = value;
                          setWorkflowData({ ...workflowData, phases: newPhases });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineer">Engineer</SelectItem>
                          <SelectItem value="assistant-a">Assistant A</SelectItem>
                          <SelectItem value="assistant-b">Assistant B</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Workflow Name</h4>
                    <p className="text-sm text-muted-foreground">{workflowData.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Template</h4>
                    <p className="text-sm text-muted-foreground">{workflowData.template}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p className="text-sm text-muted-foreground">{workflowData.location || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Priority</h4>
                    <Badge
                      variant={
                        workflowData.priority === "high"
                          ? "destructive"
                          : workflowData.priority === "medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {workflowData.priority}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Phases</h4>
                    <p className="text-sm text-muted-foreground">{workflowData.phases.length} phases configured</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            Back
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Create Workflow</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
