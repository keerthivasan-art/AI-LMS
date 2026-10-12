"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, Loader2, Plus } from "lucide-react";
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
import { createAssignment } from "@/lib/actions/assignment-actions";

interface ClassOption {
  id: string;
  name: string;
}

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
  defaultClassId?: string;
}

export function CreateAssignmentDialog({
  open,
  onOpenChange,
  classes,
  defaultClassId,
}: CreateAssignmentDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState(defaultClassId || (classes[0]?.id || ""));
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState("10");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an assignment title.");
      return;
    }
    if (!classId) {
      toast.error("Please select a classroom.");
      return;
    }
    if (!dueDate) {
      toast.error("Please select a valid due date.");
      return;
    }
    const marksNum = parseInt(maxMarks, 10);
    if (isNaN(marksNum) || marksNum < 1) {
      toast.error("Maximum marks must be at least 1.");
      return;
    }

    startTransition(async () => {
      try {
        await createAssignment({
          title: title.trim(),
          description: description.trim() || undefined,
          classId,
          dueDate,
          maxMarks: marksNum,
        });

        toast.success("Assignment published successfully!");
        setTitle("");
        setDescription("");
        setDueDate("");
        setMaxMarks("10");
        onOpenChange(false);
        router.refresh();
      } catch (err: unknown) {
        const error = err as { message?: string };
        toast.error(error?.message || "Failed to create assignment.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              LMS Coursework
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold">Create Assignment</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Publish coursework, set due dates, and track student submissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Assignment Title */}
          <div className="space-y-1.5">
            <Label htmlFor="assignTitle" className="text-xs font-semibold">
              Assignment Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="assignTitle"
              placeholder="e.g. Binary Search Implementation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              className="text-xs h-9 bg-muted/20"
              maxLength={100}
              required
            />
          </div>

          {/* Select Class */}
          <div className="space-y-1.5">
            <Label htmlFor="assignClass" className="text-xs font-semibold">
              Classroom <span className="text-destructive">*</span>
            </Label>
            {classes.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                You need to create a classroom first before creating assignments.
              </p>
            ) : (
              <select
                id="assignClass"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={isPending}
                className="w-full text-xs h-9 px-3 rounded-md border border-input bg-muted/20 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                required
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="assignDesc" className="text-xs font-semibold">
              Description / Instructions <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <textarea
              id="assignDesc"
              placeholder="e.g. Implement binary search and explain its time complexity."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              className="w-full text-xs p-3 rounded-md border border-input bg-muted/20 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
              maxLength={500}
            />
          </div>

          {/* Due Date & Max Marks (2 Column Grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assignDueDate" className="text-xs font-semibold">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="assignDueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isPending}
                className="text-xs h-9 bg-muted/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assignMaxMarks" className="text-xs font-semibold">
                Max Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                id="assignMaxMarks"
                type="number"
                min={1}
                max={1000}
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                disabled={isPending}
                className="text-xs h-9 bg-muted/20"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || classes.length === 0}
              className="text-xs font-semibold gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Publish Assignment</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
