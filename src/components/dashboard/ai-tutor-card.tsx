import * as React from "react";
import Link from "next/link";
import { Brain, Sparkles, MessageSquare, HelpCircle, BookOpen, FileQuestion, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AiTutorCard() {
  return (
    <Card className="border bg-gradient-to-br from-indigo-500/10 via-card to-card relative overflow-hidden shadow-xs border-indigo-500/20">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Brain className="h-32 w-32 text-indigo-500" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 border-indigo-500/40 text-indigo-400 bg-indigo-500/10 font-semibold gap-1">
            <Sparkles className="h-3 w-3" />
            <span>24/7 Interactive AI</span>
          </Badge>
          <Badge variant="secondary" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Active Online
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2">
          <CardTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-400" />
            <span>24/7 AI Tutor & Assistant</span>
          </CardTitle>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold gap-1 rounded-xl shadow-md shadow-indigo-600/30" asChild>
            <Link href="/student/ai-tutor">
              <span>Launch Tutor Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <CardDescription className="text-xs max-w-lg leading-relaxed mt-1">
          Your personal AI mentor for step-by-step problem solving, code debugging, quiz generation, and concept mastery.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Button variant="outline" size="sm" asChild className="h-9 justify-start text-xs gap-2 bg-background/80 hover:bg-indigo-500/10 hover:border-indigo-500/40">
            <Link href="/student/ai-tutor">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              <span className="truncate">Socratic Tutor</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9 justify-start text-xs gap-2 bg-background/80 hover:bg-indigo-500/10 hover:border-indigo-500/40">
            <Link href="/student/ai-tutor">
              <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
              <span className="truncate">Generate Quiz</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9 justify-start text-xs gap-2 bg-background/80 hover:bg-indigo-500/10 hover:border-indigo-500/40">
            <Link href="/student/ai-tutor">
              <BookOpen className="h-3.5 w-3.5 text-sky-400" />
              <span className="truncate">Explain Topic</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9 justify-start text-xs gap-2 bg-background/80 hover:bg-indigo-500/10 hover:border-indigo-500/40">
            <Link href="/student/ai-tutor">
              <FileQuestion className="h-3.5 w-3.5 text-amber-400" />
              <span className="truncate">Code Debugger</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
