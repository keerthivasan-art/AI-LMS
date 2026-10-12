"use client";

import { useState } from "react";
import { AppUser } from "@/types";
import { CodingContest } from "@/lib/actions/contest-actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Code,
  ExternalLink,
  Calendar,
  Clock,
  Search,
  Flame,
  Radio,
  Terminal,
} from "lucide-react";

interface TeacherContestsClientProps {
  contests: CodingContest[];
  user: AppUser;
}

const PLATFORMS = ["All", "Codeforces", "LeetCode", "CodeChef", "AtCoder"];

export function TeacherContestsClient({ contests, user }: TeacherContestsClientProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = contests.filter((c) => {
    const matchesPlatform = selectedPlatform === "All" || c.platform === selectedPlatform;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.platform.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <DashboardShell user={user} title="Coding Contests Feed">
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-background border border-blue-500/20 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Competitive Programming Monitor
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Monitor active and upcoming competitive rounds. Recommend contests to your students to sharpen their algorithms and data structures competencies.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* Platform Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {PLATFORMS.map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform(platform)}
              className={`text-xs h-8 rounded-full ${
                selectedPlatform === platform
                  ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                  : "border-border/80 hover:bg-muted/30"
              }`}
            >
              {platform}
            </Button>
          ))}
        </div>

        {/* Contests Grid */}
        {filtered.length === 0 ? (
          <Card className="border-dashed border-2 py-12 text-center">
            <CardContent className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">No Contests Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No active or upcoming contests found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((contest) => {
              const start = new Date(contest.startTime);
              const isLive = contest.status === "LIVE";

              return (
                <Card
                  key={contest.id}
                  className={`flex flex-col justify-between border-2 transition-all shadow-xs ${
                    isLive
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-border/80 hover:border-blue-500/40"
                  }`}
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-400 font-semibold"
                      >
                        {contest.platform}
                      </Badge>

                      {isLive ? (
                        <Badge
                          variant="default"
                          className="text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700 animate-pulse"
                        >
                          <Radio className="h-3 w-3" />
                          <span>LIVE NOW</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>Upcoming</span>
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-base font-bold line-clamp-2">
                      {contest.name}
                    </CardTitle>

                    <CardDescription className="text-xs">
                      Official rated round on {contest.platform}.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground">
                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Start: {start.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Duration: {contest.durationMinutes} minutes</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full text-xs gap-1.5 h-9 font-semibold border-blue-500/30 hover:bg-blue-500/10"
                      >
                        <a href={contest.url} target="_blank" rel="noopener noreferrer">
                          {isLive ? (
                            <>
                              <Flame className="h-3.5 w-3.5 text-emerald-400" />
                              <span>View Live Standings</span>
                            </>
                          ) : (
                            <>
                              <span>Contest Portal</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </>
                          )}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
