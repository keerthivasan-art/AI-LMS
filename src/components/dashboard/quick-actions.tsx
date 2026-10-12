import * as React from "react";
import Link from "next/link";
import { Plus, FileText, HelpCircle, Megaphone, KeyRound, Brain, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  role?: "TEACHER" | "STUDENT" | null;
  onCreateClassroom?: () => void;
  onJoinClassroom?: () => void;
}

export function QuickActions({ role = "TEACHER", onCreateClassroom, onJoinClassroom }: QuickActionsProps) {
  if (role === "STUDENT") {
    return (
      <Card className="border bg-card/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
          <CardDescription className="text-xs">Frequent student workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {onJoinClassroom && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50"
              onClick={onJoinClassroom}
            >
              <KeyRound className="h-3.5 w-3.5 text-primary" />
              <span>Join Classroom</span>
            </Button>
          )}

          <Button variant="outline" asChild className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50">
            <Link href="/student/assignments">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              <span>View & Submit Assignments</span>
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50">
            <Link href="/student/quizzes">
              <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
              <span>Practice Quizzes</span>
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50">
            <Link href="/student/ai-tutor">
              <Brain className="h-3.5 w-3.5 text-indigo-400" />
              <span>Ask AI Tutor</span>
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50">
            <Link href="/student/hackathons">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Explore Hackathons</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border bg-card/80 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
        <CardDescription className="text-xs">Frequent educator workflows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {onCreateClassroom && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50"
            onClick={onCreateClassroom}
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span>Create Classroom</span>
          </Button>
        )}

        <Button variant="outline" asChild className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50">
          <Link href="/teacher/assignments">
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>Assignments & Submissions</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50">
          <Link href="/teacher/quizzes">
            <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
            <span>Quizzes & AI Generator</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50">
          <Link href="/teacher/notifications">
            <Megaphone className="h-3.5 w-3.5 text-rose-400" />
            <span>Post Announcement</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="w-full justify-start gap-2 h-9 text-xs hover:border-primary/50">
          <Link href="/teacher/hackathons">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Publish Hackathon</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
