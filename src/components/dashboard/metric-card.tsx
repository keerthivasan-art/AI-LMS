import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("border bg-card/80 shadow-xs hover:border-primary/30 transition-colors", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between space-x-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0", iconClassName)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
