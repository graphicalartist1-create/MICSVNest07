import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerationProgressProps {
  isVisible: boolean;
  progress: number; // 0-100
  currentFile?: string;
  totalFiles?: number;
  processedFiles?: number;
  onCancel?: () => void;
}

const GenerationProgress = ({
  isVisible,
  progress,
  currentFile,
  totalFiles = 0,
  processedFiles = 0,
  onCancel,
}: GenerationProgressProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (progress > displayProgress) {
      const timer = setTimeout(() => {
        setDisplayProgress(Math.min(progress, displayProgress + 5));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Processing files: {displayProgress}%...
            </h2>
            <p className="text-sm text-muted-foreground">
              {processedFiles} of {totalFiles} files processed
            </p>
          </div>
          {displayProgress === 100 && (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Current File */}
        {currentFile && displayProgress < 100 && (
          <div className="mb-6 p-3 bg-secondary rounded border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Processing:</p>
            <p className="text-sm text-foreground font-mono truncate">
              {currentFile}
            </p>
          </div>
        )}

        {/* Completion Message */}
        {displayProgress === 100 && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded">
            <p className="text-sm text-green-600 font-medium">
              ✓ Processing completed successfully!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {displayProgress < 100 && onCancel && (
            <Button
              variant="destructive"
              onClick={onCancel}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Stop
            </Button>
          )}
          <Button
            disabled={displayProgress < 100}
            className="gap-2"
          >
            Processing...
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenerationProgress;
