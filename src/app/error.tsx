'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center border-2 border-dashed rounded-lg bg-destructive/5 border-destructive/20">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-destructive/10">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Something went wrong!</h2>
      <p className="mb-6 text-muted-foreground max-w-md">
        An unexpected error occurred while loading this view. Please try again or contact support if the problem persists.
      </p>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
        <Button
          onClick={() => reset()}
          className="flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
