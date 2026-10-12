"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Copy, Check, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StudentMember {
  id: string;
  createdAt: Date;
  student: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface TeacherClassDetailsClientProps {
  classData: {
    id: string;
    name: string;
    description: string | null;
    joinCode: string;
    createdAt: Date;
    members: StudentMember[];
    _count: {
      members: number;
    };
  };
}

export function TeacherClassDetailsClient({ classData }: TeacherClassDetailsClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classData.joinCode);
    setCopied(true);
    toast.success(`Class code ${classData.joinCode} copied!`);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/teacher/classes">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Classrooms</span>
          </Link>
        </Button>
      </div>

      {/* Class Overview Header */}
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
                  <Badge variant="outline" className="text-[10px] font-mono uppercase border-primary/30 text-primary">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  {classData.description || "No description provided for this classroom."}
                </p>
              </div>
            </div>

            {/* Join Code Display Banner */}
            <div className="p-3.5 rounded-xl border bg-muted/30 flex items-center justify-between gap-4 shrink-0 sm:min-w-64">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Class Join Code</span>
                <span className="font-mono font-extrabold text-lg tracking-widest text-primary">{classData.joinCode}</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyCode} className="gap-1.5 text-xs font-semibold h-9">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5 text-primary" />
              {classData._count.members} Enrolled Student{classData._count.members !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              Created {new Date(classData.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Students Roster */}
      <Card className="border bg-card/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Enrolled Students ({classData.members.length})</span>
          </CardTitle>
          <CardDescription className="text-xs">Roster of students currently enrolled in this classroom</CardDescription>
        </CardHeader>
        <CardContent>
          {classData.members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students have joined this classroom yet"
              description={`Share the join code "${classData.joinCode}" with your students so they can enroll.`}
              actionLabel="Copy Join Code"
              onAction={handleCopyCode}
            />
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Enrolled Date</th>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
