"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";

interface StudentAssignmentItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string;
  maxMarks: number;
  class: {
    id: string;
    name: string;
    teacher: {
      name: string | null;
      email: string;
    };
  };
  submission: {
    id: string;
    submittedAt: Date | string;
    marks: number | null;
    feedback: string | null;
  } | null;
  status: "NOT SUBMITTED" | "SUBMITTED" | "EVALUATED" | "OVERDUE";
}

interface StudentAssignmentsClientProps {
  assignments: StudentAssignmentItem[];
}

export function StudentAssignmentsClient({
  assignments,
}: StudentAssignmentsClientProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-card border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight">Enrolled Class Coursework</h1>
            <Badge variant="outline" className="text-xs font-semibold">
              {assignments.length} Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            View coursework assigned by your instructors, submit answers, and track your grades.
          </p>
        </div>
      </div>

      {/* Assignments List / Empty State */}
      {assignments.length === 0 ? (
        <Card className="border bg-card shadow-xs">
          <CardContent className="py-12">
            <EmptyState
              icon={FileText}
              title="You have no assignments yet."
              description="Coursework assigned by teachers in your joined classrooms will appear here."
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

                    {assignment.status === "EVALUATED" && (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                        EVALUATED
                      </Badge>
                    )}
                    {assignment.status === "SUBMITTED" && (
                      <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-600 dark:text-blue-400 font-semibold">
                        SUBMITTED
                      </Badge>
                    )}
                    {assignment.status === "NOT SUBMITTED" && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold">
                        PENDING
                      </Badge>
                    )}
                    {assignment.status === "OVERDUE" && (
                      <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive font-semibold">
                        OVERDUE
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
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        Instructor: {assignment.class.teacher.name || assignment.class.teacher.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        Due: {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        Max Marks: {assignment.maxMarks}
                      </span>

                      {assignment.submission?.marks !== null && assignment.submission?.marks !== undefined ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Grade: {assignment.submission.marks} / {assignment.maxMarks}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <Button size="sm" variant="outline" asChild className="w-full text-xs font-semibold gap-1.5 hover:border-primary">
                    <Link href={`/student/assignments/${assignment.id}`}>
                      <span>
                        {assignment.status === "EVALUATED"
                          ? "View Grade & Feedback"
                          : assignment.status === "SUBMITTED"
                          ? "View Submission"
                          : "Open Assignment"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
