"use client";

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface BlockingOverlayProps {
  isVisible: boolean;
}

export function BlockingOverlay({ isVisible }: BlockingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center p-4 rounded-lg
                 data-[state=open]:animate-in data-[state=closed]:animate-out 
                 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-state={isVisible ? "open" : "closed"}
    >
      <Card className="bg-background/95 backdrop-blur-sm max-w-sm text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            Content Warning
          </CardTitle>
          <CardDescription className="text-accent-foreground pt-2">
            Potentially harmful content detected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The content is blocked until the triggering text is removed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
