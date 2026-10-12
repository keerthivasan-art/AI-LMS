"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally without exposing details to user interface
    console.error("Application error encountered:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border bg-card/90 shadow-sm text-center">
        <CardHeader className="pb-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            We couldn&apos;t load this page.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-xs text-muted-foreground">
          Please try refreshing the page or click below to try again.
        </CardContent>

        <CardFooter className="flex justify-center pt-2">
          <Button onClick={() => reset()} size="sm" className="gap-2 font-semibold shadow-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
