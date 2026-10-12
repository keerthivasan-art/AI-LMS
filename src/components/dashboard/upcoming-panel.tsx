import * as React from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingPanelProps {
  title?: string;
  description?: string;
}

export function UpcomingPanel({
  title = "Needs Attention",
  description = "Pending reviews & deadlines",
}: UpcomingPanelProps) {
  return (
    <Card className="border bg-card/80 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-6 px-4 rounded-lg border border-dashed bg-muted/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-foreground">You&apos;re all caught up.</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">No pending reviews or deadlines require attention right now.</p>
        </div>
      </CardContent>
    </Card>
  );
}
