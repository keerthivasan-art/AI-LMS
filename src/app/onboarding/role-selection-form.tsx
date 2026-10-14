"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { GraduationCap, BookOpen, ArrowRight, CheckCircle2, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setInitialRole } from "./actions";

function SubmitButton({ selectedRole }: { selectedRole: "TEACHER" | "STUDENT" | null }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={!selectedRole || pending}
      size="lg"
      className="w-full sm:w-auto min-w-[280px] gap-2 font-bold shadow-md transition-all h-12 text-sm cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving Role...</span>
        </>
      ) : selectedRole === "TEACHER" ? (
        <>
          <span>Continue as Teacher</span>
          <ArrowRight className="h-4 w-4" />
        </>
      ) : selectedRole === "STUDENT" ? (
        <>
          <span>Continue as Student</span>
          <ArrowRight className="h-4 w-4" />
        </>
      ) : (
        <span>Select a Role to Continue</span>
      )}
    </Button>
  );
}

interface RoleSelectionFormProps {
  initialRole?: "TEACHER" | "STUDENT" | null;
}

export function RoleSelectionForm({ initialRole = null }: RoleSelectionFormProps) {
  const [selectedRole, setSelectedRole] = useState<"TEACHER" | "STUDENT" | null>(initialRole);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedRole) {
      e.preventDefault();
      setErrorMessage("Please select either Teacher or Student to continue.");
      return;
    }
    setErrorMessage(null);
  };

  const handleKeyDown = (role: "TEACHER" | "STUDENT", e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedRole(role);
    }
  };

  return (
    <form onSubmit={handleSubmit} action={setInitialRole} className="space-y-8 text-left">
      <input type="hidden" name="role" value={selectedRole || ""} />

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teacher Role Card */}
        <Card
          role="button"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown("TEACHER", e)}
          onClick={() => setSelectedRole("TEACHER")}
          className={`group relative border-2 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
            selectedRole === "TEACHER"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
              : "border-border hover:border-primary/50 hover:bg-muted/30 shadow-xs"
          }`}
        >
          {/* Selected Indicator Badge */}
          <div className="absolute top-3 right-3">
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                selectedRole === "TEACHER"
                  ? "bg-primary text-primary-foreground scale-100 opacity-100"
                  : "border-2 border-muted-foreground/30 scale-90 opacity-40 group-hover:opacity-70"
              }`}
            >
              {selectedRole === "TEACHER" ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
            </div>
          </div>

          <CardHeader className="space-y-3 pb-3">
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                selectedRole === "TEACHER"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <GraduationCap className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">Teacher</CardTitle>
                {selectedRole === "TEACHER" && (
                  <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-primary text-primary-foreground font-semibold">
                    Selected
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="text-[10px] mt-1 font-medium">
                Instructor & Course Admin
              </Badge>
            </div>

            <CardDescription className="text-xs leading-relaxed text-muted-foreground font-normal">
              Create classrooms, manage students, assign assignments and quizzes.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${selectedRole === "TEACHER" ? "text-primary" : "text-muted-foreground/60"}`} />
                <span>Create and manage classes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${selectedRole === "TEACHER" ? "text-primary" : "text-muted-foreground/60"}`} />
                <span>Create assignments and quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${selectedRole === "TEACHER" ? "text-primary" : "text-muted-foreground/60"}`} />
                <span>Evaluate students & track analytics</span>
              </div>
            </div>

            <Button
              type="button"
              variant={selectedRole === "TEACHER" ? "default" : "outline"}
              size="sm"
              className="w-full text-xs font-semibold cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRole("TEACHER");
              }}
            >
              {selectedRole === "TEACHER" ? "✓ Teacher Selected" : "Choose Teacher"}
            </Button>
          </CardContent>
        </Card>

        {/* Student Role Card */}
        <Card
          role="button"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown("STUDENT", e)}
          onClick={() => setSelectedRole("STUDENT")}
          className={`group relative border-2 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
            selectedRole === "STUDENT"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
              : "border-border hover:border-primary/50 hover:bg-muted/30 shadow-xs"
          }`}
        >
          {/* Selected Indicator Badge */}
          <div className="absolute top-3 right-3">
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                selectedRole === "STUDENT"
                  ? "bg-primary text-primary-foreground scale-100 opacity-100"
                  : "border-2 border-muted-foreground/30 scale-90 opacity-40 group-hover:opacity-70"
              }`}
            >
              {selectedRole === "STUDENT" ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
            </div>
          </div>

          <CardHeader className="space-y-3 pb-3">
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                selectedRole === "STUDENT"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <BookOpen className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">Student</CardTitle>
                {selectedRole === "STUDENT" && (
                  <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-primary text-primary-foreground font-semibold">
                    Selected
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="text-[10px] mt-1 font-medium">
                Learner & Participant
              </Badge>
            </div>

            <CardDescription className="text-xs leading-relaxed text-muted-foreground font-normal">
              Join classrooms, complete assignments, take quizzes and track progress.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${selectedRole === "STUDENT" ? "text-primary" : "text-muted-foreground/60"}`} />
                <span>Join classes with invite code</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${selectedRole === "STUDENT" ? "text-primary" : "text-muted-foreground/60"}`} />
                <span>Submit assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${selectedRole === "STUDENT" ? "text-primary" : "text-muted-foreground/60"}`} />
                <span>Take quizzes & view learning progress</span>
              </div>
            </div>

            <Button
              type="button"
              variant={selectedRole === "STUDENT" ? "default" : "outline"}
              size="sm"
              className="w-full text-xs font-semibold cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRole("STUDENT");
              }}
            >
              {selectedRole === "STUDENT" ? "✓ Student Selected" : "Choose Student"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Continue Action Button */}
      <div className="pt-2 flex flex-col items-center gap-3">
        <SubmitButton selectedRole={selectedRole} />
      </div>
    </form>
  );
}
