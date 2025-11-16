import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Plus,
  FileText,
  Copy,
  Edit,
  Trash2,
  Users,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

// ✅ LOAD DATA FROM BACKEND (MySQL)
import { getTemplates } from "@/api/templatesApi";

export default function Templates() {
  const { toast } = useToast();

  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  // ⬇️ Load templates from backend on page load
  useEffect(() => {
    getTemplates()
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => {
        toast({
          title: "Error loading templates",
          description: "Could not connect to backend.",
          variant: "destructive",
        });
        setLoading(false);
      });
  }, []);

  // Clone behavior remains the same
  const handleDuplicate = (template: any) => {
    toast({
      title: "Template Duplicated",
      description: `${template.name} duplicated successfully.`,
    });
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">Loading templates...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage reusable workflow templates
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() =>
              toast({
                title: "Coming Soon",
                description: "Template creation wizard coming soon",
              })
            }
          >
            <Plus className="h-4 w-4" /> Create Template
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </div>

                  <Badge
                    variant="secondary"
                    className={template.status === "active" ? "bg-success/10 text-success" : ""}
                  >
                    {template.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Phases</p>
                    <p className="text-lg font-bold">{template.phases}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{template.avgDuration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Used</p>
                    <p className="text-lg font-bold">{template.usageCount}×</p>
                  </div>
                </div>

                {/* Required Roles */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Required Roles
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(template.requiredRoles)
                      ? template.requiredRoles
                      : JSON.parse(template.requiredRoles || "[]")
                    ).map((role: string) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="h-3 w-3" /> Clone
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-3 w-3" /> Edit
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

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{templates.length}</p>
              <p className="text-sm text-muted-foreground">Total Templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">
                {templates.reduce((acc, t) => acc + t.usageCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Uses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">
                {templates.filter((t) => t.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">
                {(
                  templates.reduce((a, t) => a + t.phases, 0) / templates.length
                ).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Phases</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}