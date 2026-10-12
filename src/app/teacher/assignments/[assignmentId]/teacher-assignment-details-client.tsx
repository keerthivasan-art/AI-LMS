"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  Loader2,
  UserCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { evaluateSubmission, deleteAssignment } from "@/lib/actions/assignment-actions";

interface StudentSubmission {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string | null;
    email: string;
  };
  content: string;
  submittedAt: Date | string;
  marks: number | null;
  feedback: string | null;
  evaluatedAt: Date | string | null;
}

interface AssignmentDetails {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string;
  maxMarks: number;
  class: {
    id: string;
    name: string;
    joinCode: string;
    _count: {
      members: number;
    };
  };
  submissions: StudentSubmission[];
}

interface TeacherAssignmentDetailsClientProps {
  assignment: AssignmentDetails;
}

export function TeacherAssignmentDetailsClient({
  assignment,
}: TeacherAssignmentDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Evaluation Dialog State
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [marksInput, setMarksInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const formattedDueDate = new Date(assignment.dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleOpenEvaluate = (sub: StudentSubmission) => {
    setSelectedSubmission(sub);
    setMarksInput(sub.marks !== null ? String(sub.marks) : "");
    setFeedbackInput(sub.feedback || "");
  };

  const handleEvaluateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const marksNum = parseInt(marksInput, 10);
    if (isNaN(marksNum) || marksNum < 0) {
      toast.error("Please enter a valid non-negative mark.");
      return;
    }

    if (marksNum > assignment.maxMarks) {
      toast.error(`Marks cannot exceed maximum marks (${assignment.maxMarks}).`);
      return;
    }

    startTransition(async () => {
      try {
        await evaluateSubmission({
          submissionId: selectedSubmission.id,
          marks: marksNum,
          feedback: feedbackInput.trim() || undefined,
        });

        toast.success(`Evaluated submission for ${selectedSubmission.student.name || selectedSubmission.student.email}`);
        setSelectedSubmission(null);
        router.refresh();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to evaluate submission.");
      }
    });
  };

  const handleDeleteAssignment = () => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    startTransition(async () => {
      try {
        await deleteAssignment(assignment.id);
        toast.success("Assignment deleted.");
        router.push("/teacher/assignments");
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to delete assignment.");
      }
    });
  };

  const evaluatedCount = assignment.submissions.filter((s) => s.marks !== null).length;

  return (
    <div className="space-y-6">
      {/* Back Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/teacher/assignments">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Assignments</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteAssignment}
          disabled={isPending}
          className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Assignment</span>
        </Button>
      </div>

      {/* Assignment Overview Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs font-semibold flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{assignment.class.name}</span>
            </Badge>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                Join Code: {assignment.class.joinCode}
              </Badge>
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              {assignment.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1 leading-relaxed">
              {assignment.description || "No instructions provided."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/20 border text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Due Date
              </span>
              <span className="font-semibold block text-foreground">{formattedDueDate}</span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                Max Marks
              </span>
              <span className="font-semibold block text-foreground">{assignment.maxMarks} Points</span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                Class Roster
              </span>
              <span className="font-semibold block text-foreground">
                {assignment.class._count.members} Student{assignment.class._count.members !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Evaluated
              </span>
              <span className="font-semibold block text-foreground">
                {evaluatedCount} / {assignment.submissions.length} Submissions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Student Submissions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review submitted coursework and assign marks & feedback.
            </p>
          </div>

          <Badge variant="outline" className="text-xs font-semibold">
            {assignment.submissions.length} Submissions Received
          </Badge>
        </div>

        {assignment.submissions.length === 0 ? (
          <Card className="border bg-card shadow-xs">
            <CardContent className="py-12">
              <EmptyState
                icon={FileText}
                title="No submissions received yet"
                description="When students enrolled in this classroom submit their work, it will appear here for evaluation."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignment.submissions.map((sub) => {
              const submittedDate = new Date(sub.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const isEvaluated = sub.marks !== null;

              return (
                <Card key={sub.id} className="border bg-card shadow-xs hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {(sub.student.name || sub.student.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{sub.student.name || "Student"}</div>
                          <div className="text-xs text-muted-foreground">{sub.student.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isEvaluated ? (
                          <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold gap-1">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Evaluated: {sub.marks} / {assignment.maxMarks}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400">
                            Needs Evaluation
                          </Badge>
                        )}

                        <Button
                          size="sm"
                          onClick={() => handleOpenEvaluate(sub)}
                          className="text-xs font-semibold gap-1.5 shadow-xs"
                        >
                          <span>{isEvaluated ? "Edit Evaluation" : "Evaluate"}</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Submitted on: {submittedDate}
                    </div>

                    {/* Submission Content Box */}
                    <div className="p-3.5 rounded-xl bg-muted/30 border font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {sub.content}
                    </div>

                    {/* Evaluation Details Box if Evaluated */}
                    {isEvaluated && (
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1 text-xs">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                          <span>Instructor Evaluation & Feedback</span>
                          <span>Score: {sub.marks} / {assignment.maxMarks}</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {sub.feedback || "No written feedback provided."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Evaluation Dialog */}
      <Dialog open={Boolean(selectedSubmission)} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-semibold">
                <Sparkles className="h-3 w-3 mr-1" />
                Teacher Evaluation
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold">
              Evaluate Submission
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Student: <span className="font-semibold text-foreground">{selectedSubmission?.student.name || selectedSubmission?.student.email}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEvaluateSubmit} className="space-y-4 pt-2">
            {/* Marks Input */}
            <div className="space-y-1.5">
              <Label htmlFor="evalMarks" className="text-xs font-semibold">
                Marks / Points <span className="text-destructive">*</span> (Max: {assignment.maxMarks})
              </Label>
              <Input
                id="evalMarks"
                type="number"
                min={0}
                max={assignment.maxMarks}
                placeholder={`0 - ${assignment.maxMarks}`}
                value={marksInput}
                onChange={(e) => setMarksInput(e.target.value)}
                disabled={isPending}
                className="text-xs h-9 bg-muted/20"
                required
              />
            </div>

            {/* Feedback Input */}
            <div className="space-y-1.5">
              <Label htmlFor="evalFeedback" className="text-xs font-semibold">
                Feedback <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <textarea
                id="evalFeedback"
                placeholder="e.g. Good implementation. Explain the time complexity in more detail."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                disabled={isPending}
                rows={4}
                className="w-full text-xs p-3 rounded-md border border-input bg-muted/20 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                maxLength={1000}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
                disabled={isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="text-xs font-semibold gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Evaluation</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
