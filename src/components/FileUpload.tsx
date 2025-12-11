import { useState, useCallback } from "react";
import { Upload, Trash2, Sparkles, Download, LogIn, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FilePreview {
  file: File;
  preview: string;
}

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onGenerate: () => void;
  onExport: () => void;
  onClearResults?: () => void;
  isGenerating: boolean;
  isSignedIn?: boolean;
}

const fileTypes = ["Images", "Videos", "SVG", "EPS"] as const;

const FileUpload = ({ files, onFilesChange, onGenerate, onExport, onClearResults, isGenerating, isSignedIn = false }: FileUploadProps) => {
  const [activeType, setActiveType] = useState<typeof fileTypes[number]>("Images");
  const [isDragging, setIsDragging] = useState(false);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);

  // Create image previews
  const createPreviews = (newFiles: File[]) => {
    newFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews((prev) => [
            ...prev,
            {
              file,
              preview: e.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Image previews removed per user request. We keep only file list state via props.

  // Function to detect duplicate file names
  const getDuplicateFiles = () => {
    const fileNames = files.map(f => f.name);
    const duplicates = new Set<string>();
    const seen = new Set<string>();

    fileNames.forEach(name => {
      if (seen.has(name)) {
        duplicates.add(name);
      }
      seen.add(name);
    });

    return Array.from(duplicates);
  };

  const duplicates = getDuplicateFiles();
  const hasDuplicates = duplicates.length > 0;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles = [...files, ...droppedFiles];
    onFilesChange(newFiles);
    createPreviews(droppedFiles);
  }, [onFilesChange, files, isSignedIn]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn || !e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...files, ...selectedFiles];
    onFilesChange(newFiles);
    createPreviews(selectedFiles);
  }, [onFilesChange, files, isSignedIn]);

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const clearAll = () => {
    onFilesChange([]);
    setFilePreviews([]);
    if (onClearResults) {
      onClearResults();
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Upload Files</h2>
      </div>

      {/* Sign In Alert */}
      {!isSignedIn && (
        <div className="px-4 pt-4">
          <Alert className="bg-primary/10 border-primary/30">
            <LogIn className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <span className="font-medium">Sign In Required</span>
              <br />
              <span className="text-sm opacity-80">Please sign in with Google to upload files and use generation features.</span>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Upload Area */}
      <div className="p-4 flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div
            onDragOver={isSignedIn ? handleDragOver : undefined}
            onDragLeave={isSignedIn ? handleDragLeave : undefined}
            onDrop={isSignedIn ? handleDrop : undefined}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all h-full min-h-[300px] flex flex-col items-center justify-center ${
              !isSignedIn
                ? "border-muted-foreground/30 bg-muted/30 opacity-50 cursor-not-allowed"
                : isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            
            {/* File Type Tabs */}
            <div className="flex gap-2 mb-4">
              {fileTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeType === type
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <p className="text-foreground mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports common image, video, SVG, and EPS formats. Max 500 files.
            </p>

            <input
              type="file"
              multiple
              accept="image/*,video/*,.svg,.eps"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild className="cursor-pointer">
                <span>Select Files</span>
              </Button>
            </label>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-4">
              Uploaded Files ({files.length})
            </h3>

            {/* File Summary Bar */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-primary">
                <span className="font-medium">{files.length} file(s)</span> ready for metadata | Total: <span className="font-medium">{(files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(1)} MB</span>
              </p>
            </div>

            {/* Duplicate Warning */}
            {hasDuplicates && (
              <Alert className="mb-4 bg-destructive/10 border-destructive/30">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <span className="font-medium">Duplicate Files Found!</span>
                  <br />
                  <span className="text-sm opacity-90">
                    The following filenames appear more than once: <strong>{duplicates.join(", ")}</strong>
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* File Previews Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              {filePreviews.map((item, index) => (
                <div key={`${item.file.name}-${index}`} className="relative group">
                  <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                    {item.preview && (
                      <img
                        src={item.preview}
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1.5 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Remove file"
                  >
                    <X className="h-4 w-4 text-destructive-foreground" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-2 truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              ))}
            </div>

            {/* Add More Files */}
            {filePreviews.length > 0 && (
              <div className="pt-4 border-t border-border">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.svg,.eps"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload-more"
                />
                <label htmlFor="file-upload-more">
                  <Button variant="outline" asChild className="cursor-pointer gap-2 w-full">
                    <span>
                      <Upload className="h-4 w-4" />
                      Add More Files
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Old Grid Layout - keeping as fallback */}
        {files.length > 0 && filePreviews.length === 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative group">
                  <div className={`relative w-full min-h-[64px] bg-secondary rounded-lg overflow-hidden border-2 flex items-center justify-between px-3 py-2 transition-colors ${
                    duplicates.includes(file.name)
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-border"
                  }`}>
                    <div className="flex-1">
                      <div className="text-sm text-foreground break-words">{file.name}</div>
                      {duplicates.includes(file.name) && (
                        <div className="text-xs text-destructive mt-1 font-medium">🔔 Duplicate</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-destructive-foreground" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add More Files */}
            <div className="pt-4 border-t border-border">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.svg,.eps"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-more-fallback"
              />
              <label htmlFor="file-upload-more-fallback">
                <Button variant="outline" asChild className="cursor-pointer gap-2 w-full">
                  <span>
                    <Upload className="h-4 w-4" />
                    Add More Files
                  </span>
                </Button>
              </label>
            </div>
          </>
        )}
      </div>

      {/* API Warning */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>No Google Gemini API keys. Add keys in settings.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>No Google Gemini API keys. Add keys in settings.</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearAll} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
          <Button 
            variant="outline" 
            onClick={onGenerate} 
            disabled={files.length === 0 || isGenerating}
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : `Generate All (${files.length})`}
          </Button>
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
