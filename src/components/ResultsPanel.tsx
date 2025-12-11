import { useState } from "react";
import { ImageIcon, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Result {
  id: string;
  filename: string;
  title: string;
  description: string;
  keywords: string[];
}

interface ResultsPanelProps {
  results: Result[];
}

const ResultsPanel = ({ results }: ResultsPanelProps) => {
  const [selectedResult, setSelectedResult] = useState<string | null>(
    results.length > 0 ? results[0].id : null
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  if (results.length === 0) {
    return (
      <div className="text-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-primary text-lg mb-2">Your generated results will appear here.</p>
        <p className="text-muted-foreground">
          Upload some files and click "Generate All" to get started.
        </p>
      </div>
    );
  }

  const currentResult = results.find((r) => r.id === selectedResult) || results[0];

  return (
    <div className="space-y-6">
      {/* Results List */}
      <div>
        <div>
          <h3 className="font-semibold text-foreground">
            All {results.length} item processed | Total: {(results.length * 1.6).toFixed(1)} MB
          </h3>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => setSelectedResult(result.id)}
              className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors border-l-4 ${
                selectedResult === result.id
                  ? "border-l-primary bg-secondary/30"
                  : "border-l-transparent"
              }`}
            >
              <p className="text-sm text-muted-foreground mb-1">{result.filename}</p>
              <p className="font-medium text-foreground truncate">{result.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail View */}
      {currentResult && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left: Image Preview */}
            <div className="p-0 flex flex-col items-center justify-center">
              <div className="w-full aspect-square max-w-xs bg-secondary rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="h-24 w-24 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground text-center mb-2">
                {currentResult.filename}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Size: 1628.4kB → 21.0kB
              </p>
            </div>

            {/* Right: Metadata Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-primary flex items-center gap-2">
                    <span>T</span> Title
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {currentResult.title.length} characters
                  </span>
                </div>
                <textarea
                  value={currentResult.title}
                  readOnly
                  className="w-full p-3 bg-secondary border border-border rounded text-sm text-foreground resize-none"
                  rows={2}
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-primary flex items-center gap-2">
                    <span>📋</span> Description
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {currentResult.description.length} characters
                  </span>
                </div>
                <textarea
                  value={currentResult.description}
                  readOnly
                  className="w-full p-3 bg-secondary border border-border rounded text-sm text-foreground resize-none"
                  rows={4}
                />
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-primary flex items-center gap-2">
                    <span>🏷️</span> Keywords ({currentResult.keywords.length})
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentResult.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-secondary border border-border text-xs text-foreground rounded-full font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentResult.title, "Title")}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Title
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(currentResult.description, "Description")
                  }
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Description
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(currentResult.keywords.join(", "), "Keywords")
                  }
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Keywords
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 ml-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
