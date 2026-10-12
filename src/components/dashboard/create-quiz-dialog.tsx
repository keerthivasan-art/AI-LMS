"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, Sparkles, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createQuiz } from "@/lib/actions/quiz-actions";

interface ClassOption {
  id: string;
  name: string;
}

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
  defaultClassId?: string;
}

export function CreateQuizDialog({
  open,
  onOpenChange,
  classes,
  defaultClassId,
}: CreateQuizDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState(defaultClassId || (classes[0]?.id || ""));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a quiz title.");
      return;
    }
    if (!classId) {
      toast.error("Please select a classroom.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createQuiz({
          title: title.trim(),
          description: description.trim() || undefined,
          classId,
        });

        toast.success("Draft quiz created! Add questions and publish when ready.");
        setTitle("");
        setDescription("");
        onOpenChange(false);
        router.push(`/teacher/quizzes/${res.quiz.id}`);
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to create quiz.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              Quiz Builder
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold">Create New Quiz</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Set up a quiz title and classroom. You can add MCQ questions in the next step.
          </DialogDescription>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs mt-2">
            <div className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span className="text-[11px] font-medium">Want to generate questions with AI?</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              asChild
              className="h-6 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 px-2"
            >
              <Link href="/teacher/quizzes/generate" onClick={() => onOpenChange(false)}>
                AI Quiz &rarr;
              </Link>
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Quiz Title */}
          <div className="space-y-1.5">
            <Label htmlFor="quizTitle" className="text-xs font-semibold text-slate-200">
              Quiz Title <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="quizTitle"
              placeholder="e.g. Data Structures Basic Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              className="text-xs h-9 bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
              maxLength={100}
              required
            />
          </div>

          {/* Select Class */}
          <div className="space-y-1.5">
            <Label htmlFor="quizClass" className="text-xs font-semibold text-slate-200">
              Classroom <span className="text-rose-400">*</span>
            </Label>
            {classes.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                You need to create a classroom first before creating quizzes.
              </p>
            ) : (
              <select
                id="quizClass"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={isPending}
                className="w-full text-xs h-9 px-3 rounded-md border border-slate-700 bg-slate-800/90 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-slate-900 text-slate-100">
                    {cls.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="quizDesc" className="text-xs font-semibold text-slate-200">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="quizDesc"
              placeholder="e.g. Basic test on arrays, stacks, queues and searching algorithms."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="text-xs h-9 bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
              maxLength={200}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || classes.length === 0}
              className="text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Quiz & Add Questions</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
