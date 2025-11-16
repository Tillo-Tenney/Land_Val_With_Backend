// =============================================
// UPDATED WORKFLOW WIZARD (Mysql Integrated)
// =============================================
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

// ⬇️ NEW — API import
import { createWorkflow } from "@/api/workflowsApi";

interface WorkflowWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** NEW — so dashboard can update immediately */
  onWorkflowCreated?: (workflow: any) => void;
}

interface Phase {
  name: string;
  duration: string;
  assignee: string;
  requiredDocs: string[];
}

export function WorkflowWizard({ open, onOpenChange, onWorkflowCreated }: WorkflowWizardProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  const [workflowData, setWorkflowData] = useState({
    name: "",
    template: "",
    location: "",
    description: "",
    priority: "medium",
    phases: [] as Phase[],
    dueDate: "",
  });

  const steps = [
    { number: 1, title: "Basic Info", description: "Workflow details" },
    { number: 2, title: "Phase Setup", description: "Configure phases" },
    { number: 3, title: "Assignments", description: "Assign participants" },
    { number: 4, title: "Review", description: "Review & submit" },
  ];

  const handleNext = () => step < 4 && setStep(step + 1);
  const handleBack = () => step > 1 && setStep(step - 1);

  // =============================================
  // 🚀 FINAL CREATE WORKFLOW → MYSQL BACKEND
  // =============================================
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Generate Workflow ID (similar to your existing DB format)
      const newId = `WF-${Date.now()}`;

      const payload = {
        id: newId,
        name: workflowData.name,
        template: workflowData.template,
        status: "in-progress",
        progress: 0,
        currentPhase: workflowData.phases[0]?.name || "Not Started",
        assignee: workflowData.phases[0]?.assignee || "",
        startDate: new Date().toISOString().slice(0, 10),
        dueDate: workflowData.dueDate || null,
        priority: workflowData.priority,
        location: workflowData.location,
        description: workflowData.description,
        phases: workflowData.phases,
      };

      // ⬇️ Call backend API
      const saved = await createWorkflow(payload);

      // ⬇️ Optimistic UI update to dashboard
      onWorkflowCreated?.(saved);

      toast({
        title: "Workflow Created!",
        description: `"${workflowData.name}" has been successfully added.`,
      });

      // Reset & close modal
      setWorkflowData({
        name: "",
        template: "",
        location: "",
        description: "",
        priority: "medium",
        phases: [],
        dueDate: "",
      });
      setStep(1);
      onOpenChange(false);

    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save workflow to server.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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

        {/* Steps Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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
                </div>
                {s.number < steps.length && (
                  <div className={`h-0.5 flex-1 mx-2 ${s.number < step ? "bg-success" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
        </div>

        {/* -------------------- STEP CONTENT ---------------------- */}
        <div className="space-y-4">
          {/* STEP 1 — DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Workflow Name *</Label>
                <Input
                  placeholder="e.g., Plot Survey - Adyar District"
                  value={workflowData.name}
                  onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Template *</Label>
                <Select
                  value={workflowData.template}
                  onValueChange={(value) => setWorkflowData({ ...workflowData, template: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Plot Survey">Standard Plot Survey</SelectItem>
                    <SelectItem value="House Assessment">House Assessment</SelectItem>
                    <SelectItem value="Land Valuation">Land Valuation</SelectItem>
                    <SelectItem value="Commercial Assessment">Commercial Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Adyar, Chennai"
                  value={workflowData.location}
                  onChange={(e) => setWorkflowData({ ...workflowData, location: e.target.value })}
                />
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={workflowData.priority}
                  onValueChange={(value) => setWorkflowData({ ...workflowData, priority: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief workflow description..."
                  value={workflowData.description}
                  onChange={(e) => setWorkflowData({ ...workflowData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={workflowData.dueDate}
                  onChange={(e) => setWorkflowData({ ...workflowData, dueDate: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — PHASES */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Define workflow phases</p>
                <Button variant="outline" size="sm" onClick={addPhase}>Add Phase</Button>
              </div>

              {workflowData.phases.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No phases yet.</CardContent></Card>
              ) : (
                workflowData.phases.map((phase, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6 space-y-3">
                      <Badge variant="outline">Phase {idx + 1}</Badge>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Phase Name</Label>
                          <Input
                            value={phase.name}
                            placeholder="e.g., Site Inspection"
                            onChange={(e) => {
                              const arr = [...workflowData.phases];
                              arr[idx].name = e.target.value;
                              setWorkflowData({ ...workflowData, phases: arr });
                            }}
                          />
                        </div>

                        <div>
                          <Label>Duration (days)</Label>
                          <Input
                            value={phase.duration}
                            placeholder="3"
                            onChange={(e) => {
                              const arr = [...workflowData.phases];
                              arr[idx].duration = e.target.value;
                              setWorkflowData({ ...workflowData, phases: arr });
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

          {/* STEP 3 — ASSIGNMENTS */}
          {step === 3 && (
            <div className="space-y-4">
              {workflowData.phases.map((phase, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6 space-y-3">
                    <h4 className="font-medium">{phase.name || `Phase ${idx + 1}`}</h4>

                    <Label>Assignee</Label>
                    <Select
                      value={phase.assignee}
                      onValueChange={(v) => {
                        const arr = [...workflowData.phases];
                        arr[idx].assignee = v;
                        setWorkflowData({ ...workflowData, phases: arr });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineer">Engineer</SelectItem>
                        <SelectItem value="Assistant A">Assistant A</SelectItem>
                        <SelectItem value="Assistant B">Assistant B</SelectItem>
                        <SelectItem value="Client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* STEP 4 — REVIEW */}
          {step === 4 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div><h4 className="font-medium">Workflow Name</h4><p>{workflowData.name}</p></div>
                  <div><h4 className="font-medium">Template</h4><p>{workflowData.template}</p></div>
                  <div><h4 className="font-medium">Location</h4><p>{workflowData.location}</p></div>

                  <div>
                    <h4 className="font-medium">Priority</h4>
                    <Badge>{workflowData.priority}</Badge>
                  </div>

                  <div><h4 className="font-medium">Phases</h4><p>{workflowData.phases.length} total</p></div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>Back</Button>

          {step < 4 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Create Workflow"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
