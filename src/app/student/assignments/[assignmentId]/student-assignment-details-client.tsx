"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  GraduationCap,
  Send,
  CheckCircle2,
  Loader2,
  FileText,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { submitAssignment } from "@/lib/actions/assignment-actions";

interface StudentAssignmentDetails {
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
    content: string;
    submittedAt: Date | string;
    marks: number | null;
    feedback: string | null;
    evaluatedAt: Date | string | null;
  } | null;
  status: "NOT SUBMITTED" | "SUBMITTED" | "EVALUATED" | "OVERDUE";
}

interface StudentAssignmentDetailsClientProps {
  assignment: StudentAssignmentDetails;
}

export function StudentAssignmentDetailsClient({
  assignment,
}: StudentAssignmentDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  const formattedDueDate = new Date(assignment.dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter your submission text before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        await submitAssignment({
          assignmentId: assignment.id,
          content: content.trim(),
        });
        toast.success("Assignment submitted successfully!");
        setContent("");
        router.refresh();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to submit assignment.");
      }
    });
  };

  const isSubmitted = Boolean(assignment.submission);
  const isEvaluated = assignment.submission?.marks !== null && assignment.submission?.marks !== undefined;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild className="text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground">
        <Link href="/student/assignments">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assignments</span>
        </Link>
      </Button>

      {/* Assignment Overview Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs font-semibold flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{assignment.class.name}</span>
            </Badge>

            {assignment.status === "EVALUATED" && (
              <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Evaluated</span>
              </Badge>
            )}
            {assignment.status === "SUBMITTED" && (
              <Badge variant="outline" className="text-xs font-semibold border-blue-500/40 text-blue-600 dark:text-blue-400">
                Submitted
              </Badge>
            )}
            {assignment.status === "NOT SUBMITTED" && (
              <Badge variant="outline" className="text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400">
                Pending Submission
              </Badge>
            )}
            {assignment.status === "OVERDUE" && (
              <Badge variant="outline" className="text-xs font-semibold border-destructive/40 text-destructive">
                Overdue
              </Badge>
            )}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20 border text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                Instructor
              </span>
              <span className="font-semibold block text-foreground">
                {assignment.class.teacher.name || assignment.class.teacher.email}
              </span>
            </div>

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
                Maximum Marks
              </span>
              <span className="font-semibold block text-foreground">{assignment.maxMarks} Points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade & Feedback Results Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span>Evaluation Results & Feedback</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Instructor grading and comments on your submission.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Marks Box */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Marks Obtained</span>
              <div className="text-xl font-extrabold text-foreground">
                {isEvaluated ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {assignment.submission?.marks} / {assignment.maxMarks}
                  </span>
                ) : (
                  <span className="text-muted-foreground font-medium text-sm">Not evaluated</span>
                )}
              </div>
            </div>

            {/* Status Box */}
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">Evaluation Status</span>
              <div className="text-sm font-bold text-foreground flex items-center gap-1.5 pt-0.5">
                {isEvaluated ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Evaluated</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400">Awaiting Teacher Review</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">Not Submitted</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Box */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-1 text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              Teacher Feedback
            </span>
            <p className="text-muted-foreground leading-relaxed pt-1">
              {isEvaluated
                ? assignment.submission?.feedback || "No written feedback provided."
                : "Not available until teacher evaluates submission."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submission Area */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Your Submission</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {isSubmitted
              ? "Your submitted coursework is saved in PostgreSQL and locked for evaluation."
              : "Enter your solution text below to submit your assignment."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSubmitted ? (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Submitted on: {new Date(assignment.submission!.submittedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {assignment.submission?.content}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subContent" className="text-xs font-semibold">
                  Submission Text / Solution <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="subContent"
                  placeholder="Type or paste your assignment solution here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isPending}
                  rows={6}
                  className="w-full text-xs p-3.5 rounded-xl border border-input bg-muted/20 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary resize-y font-mono leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={isPending || !content.trim()}
                  size="sm"
                  className="text-xs font-semibold gap-1.5 shadow-xs"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Assignment</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
