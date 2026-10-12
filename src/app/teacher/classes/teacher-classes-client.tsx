"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Copy, Check, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateClassroomDialog } from "@/components/dashboard/create-classroom-dialog";
import { deleteClassAction } from "@/lib/actions/class-actions";

interface TeacherClassItem {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  createdAt: Date;
  _count: {
    members: number;
  };
}

interface TeacherClassesClientProps {
  classes: TeacherClassItem[];
}

export function TeacherClassesClient({ classes }: TeacherClassesClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Class code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleDelete = async (classId: string, className: string) => {
    if (confirm(`Are you sure you want to delete "${className}"?`)) {
      const res = await deleteClassAction(classId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Classroom "${className}" deleted.`);
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Classrooms</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, manage, and monitor your active digital classrooms.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2 font-semibold shadow-xs"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Create Classroom</span>
        </Button>
      </div>

      {/* Classrooms List Grid */}
      {classes.length === 0 ? (
        <div className="bg-card border rounded-2xl p-8 shadow-xs">
          <EmptyState
            icon={BookOpen}
            title="No classrooms yet"
            description="Create your first digital classroom to start teaching and managing student rosters."
            actionLabel="+ Create Classroom"
            onAction={() => setCreateOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="border bg-card/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold tracking-wider">
                    {cls._count.members} Student{cls._count.members !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold tracking-tight mt-2 line-clamp-1">
                  {cls.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 min-h-8">
                  {cls.description || "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Join Code Box */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Join Code</span>
                    <span className="font-mono font-bold text-foreground tracking-widest text-sm">{cls.joinCode}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => handleCopyCode(cls.joinCode)}
                    title="Copy Join Code"
                  >
                    {copiedCode === cls.joinCode ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive gap-1 px-2" onClick={() => handleDelete(cls.id, cls.name)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>

                  <Button size="sm" variant="outline" asChild className="h-8 text-xs gap-1.5 font-semibold">
                    <Link href={`/teacher/classes/${cls.id}`}>
                      <span>Manage Class</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateClassroomDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
