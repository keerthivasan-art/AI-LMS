"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateQuizDialog } from "@/components/dashboard/create-quiz-dialog";

interface ClassOption {
  id: string;
  name: string;
}

interface TeacherQuiz {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  class: {
    id: string;
    name: string;
    joinCode: string;
  };
  questionCount: number;
  attemptCount: number;
  createdAt: Date | string;
}

interface TeacherQuizzesClientProps {
  classes: ClassOption[];
  quizzes: TeacherQuiz[];
}

export function TeacherQuizzesClient({
  classes,
  quizzes,
}: TeacherQuizzesClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight">MCQ Quizzes & Assessments</h1>
            <Badge variant="outline" className="text-xs font-semibold">
              {quizzes.length} Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Build multiple-choice quizzes, set correct options, and view automated student results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="sm"
            variant="outline"
            className="font-semibold gap-1.5 shadow-xs shrink-0 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Manually</span>
          </Button>

          <Button
            asChild
            size="sm"
            className="font-semibold gap-1.5 shadow-xs shrink-0 text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white"
          >
            <Link href="/teacher/quizzes/generate">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Generate Quiz with AI</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Quizzes List / Empty State */}
      {quizzes.length === 0 ? (
        <Card className="border bg-card shadow-xs">
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base">No quizzes yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create your first multiple-choice quiz manually or generate one instantly from documents with AI.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="text-xs font-semibold gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Manually</span>
              </Button>
              <Button
                size="sm"
                asChild
                className="text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Link href="/teacher/quizzes/generate">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Generate with AI</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const createdDate = new Date(quiz.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

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

                    {quiz.published ? (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                        PUBLISHED
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold">
                        DRAFT
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
                        <HelpCircle className="h-3.5 w-3.5 text-primary" />
                        {quiz.questionCount} Question{quiz.questionCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        {quiz.attemptCount} Attempt{quiz.attemptCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground pt-0.5">
                      Created: {createdDate}
                    </div>
                  </div>

                  <Button size="sm" variant="outline" asChild className="w-full text-xs font-semibold gap-1.5 hover:border-primary">
                    <Link href={`/teacher/quizzes/${quiz.id}`}>
                      <span>{quiz.published ? "View Quiz & Results" : "Edit & Publish Quiz"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Quiz Dialog */}
      <CreateQuizDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        classes={classes}
      />
    </div>
  );
}
