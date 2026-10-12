"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { JoinClassroomDialog } from "@/components/dashboard/join-classroom-dialog";

interface StudentClassItem {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  createdAt: Date;
  teacher: {
    name: string | null;
    email: string;
  };
  _count: {
    members: number;
  };
}

interface StudentClassesClientProps {
  classes: StudentClassItem[];
}

export function StudentClassesClient({ classes }: StudentClassesClientProps) {
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Enrolled Classrooms</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Access your active courses, teacher announcements, and study materials.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2 font-semibold shadow-xs"
          onClick={() => setJoinOpen(true)}
        >
          <KeyRound className="h-4 w-4" />
          <span>Join Classroom</span>
        </Button>
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="bg-card border rounded-2xl p-8 shadow-xs">
          <EmptyState
            icon={BookOpen}
            title="No enrolled classrooms yet"
            description="Join a classroom using the 7-character code provided by your teacher to access learning materials."
            actionLabel="Join Classroom"
            onAction={() => setJoinOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="border bg-card/80 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold">
                    {cls._count.members} Enrolled
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold tracking-tight mt-2 line-clamp-1">
                  {cls.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 min-h-8">
                  {cls.description || "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="p-2.5 rounded-lg border bg-muted/20 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Teacher:
                  </span>
                  <span className="font-semibold text-foreground">{cls.teacher.name || cls.teacher.email}</span>
                </div>

                <div className="flex justify-end pt-1">
                  <Button size="sm" asChild className="h-8 text-xs gap-1.5 font-semibold w-full">
                    <Link href={`/student/classes/${cls.id}`}>
                      <span>Open Classroom</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JoinClassroomDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
}
