"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Award,
  CheckCircle2,
  Loader2,
  Send,
  GraduationCap,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitQuiz } from "@/lib/actions/quiz-actions";

interface QuestionItem {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
  order: number;
}

interface StudentQuizDetails {
  id: string;
  title: string;
  description: string | null;
  class: {
    id: string;
    name: string;
    teacher: {
      name: string | null;
      email: string;
    };
  };
  questions: QuestionItem[];
  attempt: {
    id: string;
    score: number;
    totalMarks: number;
    submittedAt: Date | string;
  } | null;
  status: "AVAILABLE" | "COMPLETED";
}

interface StudentQuizDetailsClientProps {
  quiz: StudentQuizDetails;
}

export function StudentQuizDetailsClient({
  quiz,
}: StudentQuizDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Controlled form state for selected options
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});

  const totalPossibleMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);
  const isCompleted = quiz.status === "COMPLETED" || Boolean(quiz.attempt);

  const handleOptionSelect = (questionId: string, optionKey: "A" | "B" | "C" | "D") => {
    if (isCompleted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if all questions have been answered
    const unansweredCount = quiz.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      toast.error(`Please answer all questions before submitting (${unansweredCount} remaining).`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitQuiz({
          quizId: quiz.id,
          answers,
        });

        toast.success(`Quiz submitted! Score: ${res.score} / ${res.totalMarks} (${res.percentage}%)`);
        router.refresh();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to submit quiz.");
      }
    });
  };

  const percentage = quiz.attempt
    ? Math.round((quiz.attempt.score / (quiz.attempt.totalMarks || 1)) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild className="text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground">
        <Link href="/student/quizzes">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Quizzes</span>
        </Link>
      </Button>

      {/* Quiz Overview Banner */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs font-semibold flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{quiz.class.name}</span>
            </Badge>

            {isCompleted ? (
              <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Quiz Completed</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400">
                In Progress
              </Badge>
            )}
          </div>

          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              {quiz.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1 leading-relaxed">
              {quiz.description || "No special instructions provided."}
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
                {quiz.class.teacher.name || quiz.class.teacher.email}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                Total Questions
              </span>
              <span className="font-semibold block text-foreground">
                {quiz.questions.length} MCQ Question{quiz.questions.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                Total Marks
              </span>
              <span className="font-semibold block text-foreground">{totalPossibleMarks} Points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Results Persistent Card */}
      {isCompleted && quiz.attempt && (
        <Card className="border bg-gradient-to-br from-emerald-500/5 via-card to-background shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-extrabold text-foreground">Quiz Result & Score</CardTitle>
                <CardDescription className="text-xs">
                  Your response has been automatically calculated and securely saved.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-card/80 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Your Score</span>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {quiz.attempt.score} / {quiz.attempt.totalMarks}
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-card/80 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Percentage</span>
                <div className="text-2xl font-extrabold text-foreground">
                  {percentage}%
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-card/80 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Submitted On</span>
                <div className="text-xs font-bold text-foreground pt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {new Date(quiz.attempt.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Attempt Form / Questions */}
      {!isCompleted && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Answer Questions ({quiz.questions.length})</h2>
              <Badge variant="outline" className="text-xs font-semibold">
                {Object.keys(answers).length} / {quiz.questions.length} Answered
              </Badge>
            </div>

            {quiz.questions.map((q, idx) => {
              const selectedOption = answers[q.id];

              return (
                <Card key={q.id} className="border bg-card shadow-xs">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold font-mono">
                          Question {idx + 1} of {quiz.questions.length}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {q.marks} Mark{q.marks !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold tracking-tight pt-1">
                      {q.question}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-2">
                    <div className="grid grid-cols-1 gap-2.5 pt-1">
                      {[
                        { key: "A" as const, text: q.optionA },
                        { key: "B" as const, text: q.optionB },
                        { key: "C" as const, text: q.optionC },
                        { key: "D" as const, text: q.optionD },
                      ].map((opt) => {
                        const isSelected = selectedOption === opt.key;

                        return (
                          <div
                            key={opt.key}
                            onClick={() => handleOptionSelect(q.id, opt.key)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? "bg-primary/10 border-primary ring-1 ring-primary text-foreground font-semibold shadow-xs"
                                : "bg-muted/20 border-border hover:border-primary/50 text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-muted-foreground/40 text-muted-foreground"
                                }`}
                              >
                                {opt.key}
                              </div>
                              <span className="text-xs font-medium">{opt.text}</span>
                            </div>

                            {isSelected && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending || Object.keys(answers).length < quiz.questions.length}
              size="lg"
              className="w-full sm:w-auto min-w-[200px] gap-2 font-bold shadow-md h-11 text-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calculating Score...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Quiz</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
