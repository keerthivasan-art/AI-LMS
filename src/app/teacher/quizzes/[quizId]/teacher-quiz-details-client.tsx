"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Plus,
  Trash2,
  Send,
  Users,
  Award,
  CheckCircle2,
  Edit2,
  Loader2,
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
import { AddQuestionDialog } from "@/components/dashboard/add-question-dialog";
import {
  publishQuiz,
  deleteQuizQuestion,
  deleteQuiz,
  updateQuizQuestion,
} from "@/lib/actions/quiz-actions";

interface QuestionItem {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  marks: number;
  order: number;
}

interface AttemptItem {
  id: string;
  student: {
    id: string;
    name: string | null;
    email: string;
  };
  score: number;
  totalMarks: number;
  submittedAt: Date | string;
}

interface QuizDetails {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  class: {
    id: string;
    name: string;
    joinCode: string;
  };
  questions: QuestionItem[];
  attempts: AttemptItem[];
}

interface TeacherQuizDetailsClientProps {
  quiz: QuizDetails;
}

export function TeacherQuizDetailsClient({
  quiz,
}: TeacherQuizDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const totalPossibleMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

  const handleOpenEdit = (q: QuestionItem) => {
    setEditingQuestion({ ...q });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    startTransition(async () => {
      try {
        await updateQuizQuestion({
          questionId: editingQuestion.id,
          question: editingQuestion.question.trim(),
          optionA: editingQuestion.optionA.trim(),
          optionB: editingQuestion.optionB.trim(),
          optionC: editingQuestion.optionC.trim(),
          optionD: editingQuestion.optionD.trim(),
          correctOption: editingQuestion.correctOption as "A" | "B" | "C" | "D",
          marks: editingQuestion.marks > 0 ? editingQuestion.marks : 1,
        });
        toast.success("Question updated successfully.");
        setEditModalOpen(false);
        setEditingQuestion(null);
        router.refresh();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to update question.");
      }
    });
  };

  const handlePublish = () => {
    if (quiz.questions.length === 0) {
      toast.error("Please add at least one MCQ question before publishing.");
      return;
    }

    startTransition(async () => {
      try {
        await publishQuiz(quiz.id);
        toast.success("Quiz published successfully! Students can now take this assessment.");
        router.refresh();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to publish quiz.");
      }
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    startTransition(async () => {
      try {
        await deleteQuizQuestion(questionId);
        toast.success("Question removed.");
        router.refresh();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to delete question.");
      }
    });
  };

  const handleDeleteQuiz = () => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    startTransition(async () => {
      try {
        await deleteQuiz(quiz.id);
        toast.success("Quiz deleted.");
        router.push("/teacher/quizzes");
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to delete quiz.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/teacher/quizzes">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Quizzes</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteQuiz}
          disabled={isPending}
          className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Quiz</span>
        </Button>
      </div>

      {/* Quiz Overview Banner */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs font-semibold flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{quiz.class.name}</span>
            </Badge>

            <div className="flex items-center gap-2">
              {quiz.published ? (
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>PUBLISHED</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400">
                  DRAFT
                </Badge>
              )}
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              {quiz.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1 leading-relaxed">
              {quiz.description || "No description provided."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20 border text-xs">
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

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                Student Attempts
              </span>
              <span className="font-semibold block text-foreground">
                {quiz.attempts.length} Attempt{quiz.attempts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Action buttons bar */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              onClick={() => setAddQuestionOpen(true)}
              size="sm"
              variant="outline"
              className="text-xs font-semibold gap-1.5 hover:border-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </Button>

            {!quiz.published && (
              <Button
                onClick={handlePublish}
                disabled={isPending || quiz.questions.length === 0}
                size="sm"
                className="text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Publish Quiz</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MCQ Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Questions ({quiz.questions.length})</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and manage multiple-choice questions for this quiz.
            </p>
          </div>
        </div>

        {quiz.questions.length === 0 ? (
          <Card className="border border-dashed bg-card/50 shadow-xs">
            <CardContent className="py-10 text-center space-y-3">
              <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto opacity-60" />
              <div>
                <div className="font-bold text-sm">No questions added yet</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click &quot;Add Question&quot; to create your first multiple-choice question.
                </p>
              </div>
              <Button
                onClick={() => setAddQuestionOpen(true)}
                size="sm"
                className="text-xs font-semibold gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <Card key={q.id} className="border bg-card shadow-xs relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold font-mono">
                          Q{idx + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {q.marks} Mark{q.marks !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold tracking-tight pt-1">
                        {q.question}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(q)}
                        disabled={isPending}
                        className="h-7 w-7 text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10"
                        title="Edit Question"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(q.id)}
                        disabled={isPending}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: "A", text: q.optionA },
                      { key: "B", text: q.optionB },
                      { key: "C", text: q.optionC },
                      { key: "D", text: q.optionD },
                    ].map((opt) => {
                      const isCorrect = q.correctOption === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`p-2.5 rounded-lg border flex items-center justify-between font-medium ${
                            isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold"
                              : "bg-muted/20 border-border text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold opacity-70">{opt.key}:</span>
                            <span>{opt.text}</span>
                          </span>
                          {isCorrect && (
                            <Badge variant="default" className="text-[9px] bg-emerald-500 text-white px-1.5 py-0">
                              Correct Answer
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Student Results Table Section */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Student Results ({quiz.attempts.length})</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time automatically calculated scores for students who attempted this quiz.
          </p>
        </div>

        {quiz.attempts.length === 0 ? (
          <Card className="border bg-card shadow-xs">
            <CardContent className="py-8 text-center text-xs text-muted-foreground">
              No student has attempted this quiz yet.
            </CardContent>
          </Card>
        ) : (
          <div className="bg-card border rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quiz.attempts.map((attempt) => {
                    const percentage = Math.round((attempt.score / (attempt.totalMarks || 1)) * 100);
                    const submittedDate = new Date(attempt.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={attempt.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">
                          {attempt.student.name || "Student"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {attempt.student.email}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-foreground">
                          {attempt.score} / {attempt.totalMarks}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "outline"}
                            className="text-[10px] font-bold"
                          >
                            {percentage}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {submittedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Question Dialog */}
      <AddQuestionDialog
        open={addQuestionOpen}
        onOpenChange={setAddQuestionOpen}
        quizId={quiz.id}
      />

      {/* Edit Question Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit MCQ Question</DialogTitle>
            <DialogDescription className="text-xs">
              Update the question text, options, correct answer, or marks.
            </DialogDescription>
          </DialogHeader>

          {editingQuestion && (
            <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Question Text</Label>
                <textarea
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-indigo-400">Option A</Label>
                  <Input
                    value={editingQuestion.optionA}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, optionA: e.target.value })
                    }
                    className="text-xs h-8 bg-slate-800/90 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-indigo-400">Option B</Label>
                  <Input
                    value={editingQuestion.optionB}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, optionB: e.target.value })
                    }
                    className="text-xs h-8 bg-slate-800/90 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-indigo-400">Option C</Label>
                  <Input
                    value={editingQuestion.optionC}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, optionC: e.target.value })
                    }
                    className="text-xs h-8 bg-slate-800/90 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-indigo-400">Option D</Label>
                  <Input
                    value={editingQuestion.optionD}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, optionD: e.target.value })
                    }
                    className="text-xs h-8 bg-slate-800/90 border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Correct Option</Label>
                  <select
                    value={editingQuestion.correctOption}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctOption: e.target.value,
                      })
                    }
                    className="w-full text-xs h-8 px-2.5 rounded-md border border-slate-700 bg-slate-800/90 text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Marks</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={editingQuestion.marks}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        marks: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="text-xs h-8 bg-slate-800/90 border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isPending}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
