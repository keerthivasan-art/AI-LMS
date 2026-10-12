"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Classmate {
  id: string;
  createdAt: Date;
  student: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface StudentClassDetailsClientProps {
  classData: {
    id: string;
    name: string;
    description: string | null;
    joinCode: string;
    createdAt: Date;
    teacher: {
      id: string;
      name: string | null;
      email: string;
    };
    members: Classmate[];
    _count: {
      members: number;
    };
  };
}

export function StudentClassDetailsClient({ classData }: StudentClassDetailsClientProps) {
  const teacherInitials = classData.teacher.name
    ? classData.teacher.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "TC";

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/student/classes">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Enrolled Classrooms</span>
          </Link>
        </Button>
      </div>

      {/* Class Banner */}
      <Card className="border bg-card/80 shadow-xs">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 mt-1">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{classData.name}</h1>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                    Enrolled
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  {classData.description || "No description provided for this classroom."}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-muted/30 flex items-center gap-3 shrink-0 sm:min-w-64">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {teacherInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs overflow-hidden">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Instructor</span>
                <span className="font-semibold text-foreground truncate block">{classData.teacher.name || "Teacher"}</span>
                <span className="text-[11px] text-muted-foreground truncate block">{classData.teacher.email}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5 text-primary" />
              {classData._count.members} Classmate{classData._count.members !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              Joined Classroom
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Classmates List */}
      <Card className="border bg-card/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Classmates ({classData.members.length})</span>
          </CardTitle>
          <CardDescription className="text-xs">Students currently enrolled in this classroom</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {classData.members.map((item) => {
                  const initials = item.student.name
                    ? item.student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                    : "ST";
                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 font-medium flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground">{item.student.name || "Student"}</span>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                          {item.student.email}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
