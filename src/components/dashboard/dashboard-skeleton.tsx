import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="h-24 rounded-2xl bg-muted/50 border" />

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded-lg" />
              </div>
              <div className="h-7 w-12 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border">
          <CardHeader>
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="h-32 w-full max-w-sm bg-muted/40 rounded-xl" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border">
            <CardHeader>
              <div className="h-5 w-28 bg-muted rounded" />
            </CardHeader>
            <CardContent className="h-40 bg-muted/30 rounded-lg m-4" />
          </Card>
        </div>
      </div>
    </div>
  );
}
