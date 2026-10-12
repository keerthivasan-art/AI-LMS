"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Loader2, Plus } from "lucide-react";
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
import { createClassAction } from "@/lib/actions/class-actions";

interface CreateClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClassroomDialog({ open, onOpenChange }: CreateClassroomDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a classroom name.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());

    startTransition(async () => {
      const res = await createClassAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else if (res.success && res.data) {
        const classData = res.data as { id: string; name: string; joinCode: string };
        toast.success(`Classroom created! Share join code: ${classData.joinCode}`, {
          duration: 6000,
        });
        setName("");
        setDescription("");
        onOpenChange(false);
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              Classroom Creation
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold">Create New Classroom</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Create a digital classroom and generate a unique join code for your students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="className" className="text-xs font-semibold">
              Classroom Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="className"
              placeholder="e.g. CS101: Intro to Computer Science"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="text-xs h-9 bg-muted/20"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="classDesc" className="text-xs font-semibold">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="classDesc"
              placeholder="e.g. Fundamental programming concepts and algorithms"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="text-xs h-9 bg-muted/20"
              maxLength={500}
            />
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
            <Button type="submit" size="sm" disabled={isPending} className="text-xs font-semibold gap-1.5">
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Classroom</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
