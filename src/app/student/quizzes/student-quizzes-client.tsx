"use client";

import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";

interface StudentQuizItem {
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
  questionCount: number;
  totalMarks: number;
  attempt: {
    id: string;
    score: number;
    totalMarks: number;
    submittedAt: Date | string;
  } | null;
  status: "AVAILABLE" | "COMPLETED";
}

interface StudentQuizzesClientProps {
  quizzes: StudentQuizItem[];
}

export function StudentQuizzesClient({
  quizzes,
}: StudentQuizzesClientProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-card border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight">Available Class Quizzes</h1>
            <Badge variant="outline" className="text-xs font-semibold">
              {quizzes.length} Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Test your knowledge with multiple-choice quizzes published by your instructors.
          </p>
        </div>
      </div>

      {/* Quizzes Grid / Empty State */}
      {quizzes.length === 0 ? (
        <Card className="border bg-card shadow-xs">
          <CardContent className="py-12">
            <EmptyState
              icon={HelpCircle}
              title="You have no quizzes available."
              description="Published assessments from your joined classrooms will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isCompleted = quiz.status === "COMPLETED";
            const percentage = quiz.attempt
              ? Math.round((quiz.attempt.score / (quiz.attempt.totalMarks || 1)) * 100)
              : null;

            return (
              <Card
                key={quiz.id}
                className="border bg-card/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] font-medium flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-primary" />
                      <span>{quiz.class.name}</span>
                    </Badge>

                    {isCompleted ? (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>COMPLETED ({percentage}%)</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold">
                        AVAILABLE
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-base font-bold tracking-tight mt-2 line-clamp-1">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {quiz.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        Instructor: {quiz.class.teacher.name || quiz.class.teacher.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" />
                        {quiz.questionCount} Question{quiz.questionCount !== 1 ? "s" : ""} ({quiz.totalMarks} Pts)
                      </span>

                      {quiz.attempt && (
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          Score: {quiz.attempt.score} / {quiz.attempt.totalMarks}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button size="sm" variant="outline" asChild className="w-full text-xs font-semibold gap-1.5 hover:border-primary">
                    <Link href={`/student/quizzes/${quiz.id}`}>
                      <span>{isCompleted ? "View Result" : "Start Quiz"}</span>
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
