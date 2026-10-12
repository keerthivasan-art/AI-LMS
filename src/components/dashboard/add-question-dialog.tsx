"use client";

import React, { useState, useTransition } from "react";
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
import { addQuizQuestion } from "@/lib/actions/quiz-actions";

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
}

export function AddQuestionDialog({
  open,
  onOpenChange,
  quizId,
}: AddQuestionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [marks, setMarks] = useState("1");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error("Please enter the question text.");
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      toast.error("Please provide all four options (A, B, C, and D).");
      return;
    }

    const marksNum = parseInt(marks, 10);
    if (isNaN(marksNum) || marksNum < 1) {
      toast.error("Marks must be at least 1.");
      return;
    }

    startTransition(async () => {
      try {
        await addQuizQuestion({
          quizId,
          question: question.trim(),
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          optionC: optionC.trim(),
          optionD: optionD.trim(),
          correctOption,
          marks: marksNum,
        });

        toast.success("Question added to quiz!");
        setQuestion("");
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        setCorrectOption("A");
        setMarks("1");
        onOpenChange(false);
        router.refresh();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to add question.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              MCQ Question Editor
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold">Add MCQ Question</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Enter question text, four options (A–D), and select the correct answer option.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Question Text */}
          <div className="space-y-1.5">
            <Label htmlFor="qText" className="text-xs font-semibold text-slate-200">
              Question Text <span className="text-rose-400">*</span>
            </Label>
            <textarea
              id="qText"
              placeholder="e.g. Which data structure follows FIFO (First-In, First-Out) principle?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isPending}
              rows={2}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          {/* Options Grid (A, B, C, D) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="optA" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span className="font-bold text-indigo-400">A:</span> Option A <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="optA"
                placeholder="Option A text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                disabled={isPending}
                className="text-xs h-8 bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="optB" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span className="font-bold text-indigo-400">B:</span> Option B <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="optB"
                placeholder="Option B text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                disabled={isPending}
                className="text-xs h-8 bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="optC" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span className="font-bold text-indigo-400">C:</span> Option C <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="optC"
                placeholder="Option C text"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                disabled={isPending}
                className="text-xs h-8 bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="optD" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span className="font-bold text-indigo-400">D:</span> Option D <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="optD"
                placeholder="Option D text"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                disabled={isPending}
                className="text-xs h-8 bg-slate-800/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Correct Option & Marks */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label htmlFor="correctOpt" className="text-xs font-semibold text-slate-200">
                Correct Option <span className="text-rose-400">*</span>
              </Label>
              <select
                id="correctOpt"
                value={correctOption}
                onChange={(e) => setCorrectOption(e.target.value as "A" | "B" | "C" | "D")}
                disabled={isPending}
                className="w-full text-xs h-8 px-2.5 rounded-md border border-slate-700 bg-slate-800/90 text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="A" className="bg-slate-900 text-slate-100">Option A</option>
                <option value="B" className="bg-slate-900 text-slate-100">Option B</option>
                <option value="C" className="bg-slate-900 text-slate-100">Option C</option>
                <option value="D" className="bg-slate-900 text-slate-100">Option D</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="qMarks" className="text-xs font-semibold text-slate-200">
                Marks <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="qMarks"
                type="number"
                min={1}
                max={100}
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                disabled={isPending}
                className="text-xs h-8 bg-slate-800/90 border-slate-700 text-slate-100 focus-visible:ring-indigo-500"
                required
              />
            </div>
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
              disabled={isPending}
              className="text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Adding Question...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Question</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
