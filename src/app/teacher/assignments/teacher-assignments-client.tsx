"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Award,
  Users,
  ArrowRight,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateAssignmentDialog } from "@/components/dashboard/create-assignment-dialog";

interface ClassOption {
  id: string;
  name: string;
}

interface TeacherAssignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string;
  maxMarks: number;
  classId: string;
  class: {
    id: string;
    name: string;
    joinCode: string;
  };
  submissionCount: number;
  status: "ACTIVE" | "DUE" | "CLOSED";
}

interface TeacherAssignmentsClientProps {
  classes: ClassOption[];
  assignments: TeacherAssignment[];
}

export function TeacherAssignmentsClient({
  classes,
  assignments,
}: TeacherAssignmentsClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight">Coursework Assignments</h1>
            <Badge variant="outline" className="text-xs font-semibold">
              {assignments.length} Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Publish assignments, monitor student submissions, and evaluate coursework.
          </p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          className="font-semibold gap-1.5 shadow-xs shrink-0 text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Assignment</span>
        </Button>
      </div>

      {/* Assignments List / Empty State */}
      {assignments.length === 0 ? (
        <Card className="border bg-card shadow-xs">
          <CardContent className="py-12">
            <EmptyState
              icon={FileText}
              title="No assignments yet"
              description="Create your first coursework assignment for your digital classrooms."
              actionLabel="Create Assignment"
              onAction={() => setCreateDialogOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            const formattedDate = new Date(assignment.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card
                key={assignment.id}
                className="border bg-card/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] font-medium flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-primary" />
                      <span>{assignment.class.name}</span>
                    </Badge>

                    {assignment.status === "ACTIVE" && (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                        ACTIVE
                      </Badge>
                    )}
                    {assignment.status === "DUE" && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 animate-pulse">
                        DUE SOON
                      </Badge>
                    )}
                    {assignment.status === "CLOSED" && (
                      <Badge variant="outline" className="text-[10px] border-zinc-500/40 text-muted-foreground">
                        CLOSED
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-base font-bold tracking-tight mt-2 line-clamp-1">
                    {assignment.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {assignment.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        Due: {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        Max Marks: {assignment.maxMarks}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        {assignment.submissionCount} Submission{assignment.submissionCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" asChild className="w-full text-xs font-semibold gap-1.5 hover:border-primary">
                    <Link href={`/teacher/assignments/${assignment.id}`}>
                      <span>View Submissions</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Assignment Dialog */}
      <CreateAssignmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        classes={classes}
      />
    </div>
  );
}
