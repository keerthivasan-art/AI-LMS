import * as React from "react";
import { Activity, Inbox } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityList() {
  return (
    <Card className="border bg-card/80 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription className="text-xs">Latest classroom & assignment updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-6 px-4 rounded-lg border border-dashed bg-muted/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
            <Inbox className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-foreground">No recent activity</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Events and notifications will appear here in real-time.</p>
        </div>
      </CardContent>
    </Card>
  );
}
