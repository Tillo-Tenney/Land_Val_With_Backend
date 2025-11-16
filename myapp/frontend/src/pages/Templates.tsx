import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Copy, Edit, Trash2, Users } from "lucide-react";
import { templatesData } from "@/data/templatesData";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templatesData[0] | null>(null);
  const { toast } = useToast();

  const handleDuplicate = (template: typeof templatesData[0]) => {
    toast({
      title: "Template Duplicated",
      description: `${template.name} has been duplicated successfully.`,
    });
  };

  const handleEdit = (template: typeof templatesData[0]) => {
    setSelectedTemplate(template);
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Templates</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage reusable workflow templates
            </p>
          </div>
          <Button className="gap-2" onClick={() => toast({ title: "Create Template", description: "Template creation wizard coming soon" })}>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {templatesData.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    {template.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phases</p>
                    <p className="text-lg font-bold text-foreground">{template.phases}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium text-foreground">{template.avgDuration}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Used</p>
                    <p className="text-lg font-bold text-foreground">{template.usageCount}×</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Required Roles</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.requiredRoles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Copy className="h-3 w-3" />
                    Clone
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <Button className="w-full">Use Template</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{templatesData.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Templates</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {templatesData.reduce((acc, t) => acc + t.usageCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Uses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {templatesData.filter(t => t.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {(templatesData.reduce((acc, t) => acc + t.phases, 0) / templatesData.length).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Avg Phases</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
