"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Check } from "lucide-react";
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
import { joinClassAction } from "@/lib/actions/class-actions";

interface JoinClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinClassroomDialog({ open, onOpenChange }: JoinClassroomDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [joinCode, setJoinCode] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Please enter a classroom join code.");
      return;
    }

    const formData = new FormData();
    formData.append("joinCode", joinCode.trim().toUpperCase());

    startTransition(async () => {
      const res = await joinClassAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else if (res.success && res.data) {
        const classData = res.data as { id: string; name: string };
        toast.success(`Enrolled in "${classData.name}" successfully!`);
        setJoinCode("");
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
              <KeyRound className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-semibold">
              Class Enrollment
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold">Join a Classroom</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Enter the unique 7-character join code provided by your teacher.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="joinCodeInput" className="text-xs font-semibold">
              Classroom Join Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="joinCodeInput"
              placeholder="e.g. CS8K4P2"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              disabled={isPending}
              className="text-xs font-mono uppercase tracking-widest h-10 bg-muted/20 text-center font-bold text-base"
              maxLength={12}
              required
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
                  <span>Enrolling...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Join Classroom</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
