"use client";

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ContentAnalysis } from '@/ai/flows/content-check';

interface BlockingOverlayProps {
  result: ContentAnalysis | null;
  onClear: () => void;
}

export function BlockingOverlay({ result, onClear }: BlockingOverlayProps) {
  if (!result?.isObjectionable) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center p-4 rounded-lg
                 data-[state=open]:animate-in data-[state=closed]:animate-out 
                 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      data-state={result?.isObjectionable ? "open" : "closed"}
    >
      <Card className="bg-background/95 backdrop-blur-sm max-w-sm text-center shadow-2xl">
        <CardHeader className='pb-2'>
          <div className="flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <CardTitle>Content Warning</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.category !== 'Other' && result.category !== 'Safe' && (
            <Badge variant="destructive">{result.category}</Badge>
          )}
          <p className="text-sm text-muted-foreground px-4">
            {result.reason}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={onClear} variant="outline">Clear and Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
