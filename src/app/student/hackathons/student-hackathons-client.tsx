"use client";

import { useState } from "react";
import { AppUser } from "@/types";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  ExternalLink,
  Calendar,
  MapPin,
  Building,
  Search,
  Sparkles,
  Clock,
  UserCheck,
} from "lucide-react";

interface HackathonItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  organizer: string | null;
  location: string | null;
  startDate: Date | null;
  endDate: Date | null;
  registrationDeadline: Date | null;
  teacher?: {
    name: string | null;
    email: string;
  };
}

interface StudentHackathonsClientProps {
  hackathons: HackathonItem[];
  user: AppUser;
}

export function StudentHackathonsClient({
  hackathons,
  user,
}: StudentHackathonsClientProps) {
  const [now] = useState(() => Date.now());
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = hackathons.filter((h) => {
    const q = searchQuery.toLowerCase();
    return (
      h.title.toLowerCase().includes(q) ||
      (h.organizer && h.organizer.toLowerCase().includes(q)) ||
      (h.description && h.description.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardShell user={user} title="Hackathons & Challenges">
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-background border border-amber-500/20 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Hackathons & Competitions
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Verified hackathons hand-picked and published by your instructors. Team up, build cutting-edge projects, and win awards!
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-dashed border-2 py-12 text-center">
            <CardContent className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">No Active Hackathons Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your teachers haven&apos;t published any active hackathons yet. Check back soon for new challenges!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((h) => {
              const deadline = h.registrationDeadline ? new Date(h.registrationDeadline) : null;
              const isPast = deadline ? deadline.getTime() < now : false;
              const daysLeft = deadline
                ? Math.ceil((deadline.getTime() - now) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <Card
                  key={h.id}
                  className="flex flex-col justify-between border-border/80 hover:border-amber-500/40 hover:shadow-md transition-all overflow-hidden"
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-500 gap-1 font-semibold"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Teacher Curated</span>
                      </Badge>

                      {daysLeft !== null && daysLeft > 0 ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        >
                          <Clock className="h-3 w-3" />
                          <span>{daysLeft} days left</span>
                        </Badge>
                      ) : isPast ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Registration Closed
                        </Badge>
                      ) : null}
                    </div>

                    <CardTitle className="text-base font-bold line-clamp-1">
                      {h.title}
                    </CardTitle>

                    {h.organizer && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                        <Building className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{h.organizer}</span>
                      </div>
                    )}

                    <CardDescription className="text-xs line-clamp-3">
                      {h.description || "Exciting hackathon opportunity to test your engineering and design capabilities."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground">
                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{h.location || "Online"}</span>
                      </div>

                      {deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className={isPast ? "text-destructive font-medium" : ""}>
                            Deadline: {deadline.toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {h.teacher?.name && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
                          <UserCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Recommended by Prof. {h.teacher.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        asChild
                        disabled={isPast}
                        className="w-full text-xs gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                      >
                        <a href={h.url} target="_blank" rel="noopener noreferrer">
                          <span>Register on Event Site</span>
                          <ExternalLink className="h-3.5 w-3.5" />
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
