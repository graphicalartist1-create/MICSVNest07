import { useState, useEffect } from "react";
import Header from "@/components/Header";
import GenerationControls from "@/components/GenerationControls";
import FileUpload from "@/components/FileUpload";
import ResultsPanel from "@/components/ResultsPanel";
import GenerationProgress from "@/components/GenerationProgress";
import HowToUseButton from "@/components/HowToUseButton";

interface GenerationSettings {
  titleLength: number;
  descriptionLength: number;
  keywordsCount: number;
  imageType: string;
  prefix: boolean;
  suffix: boolean;
  negativeTitle: boolean;
  negativeKeywords: boolean;
  prefixText: string;
  suffixText: string;
  negativeTitleText: string;
  negativeKeywordsText: string;
  platform: string;
  // Prompt tab settings
  whiteBackground: boolean;
  cameraParameters: boolean;
  promptImageType: string;
  promptCharacterLength: number;
  promptPrefix: boolean;
  promptSuffix: boolean;
  negativePromptWords: boolean;
  promptPrefixText: string;
  promptSuffixText: string;
  negativePromptWordsText: string;
}

interface Result {
  id: string;
  filename: string;
  title: string;
  description: string;
  keywords: string[];
}

const Index = () => {
  const [settings, setSettings] = useState<GenerationSettings>({
    titleLength: 70,
    descriptionLength: 150,
    keywordsCount: 30,
    imageType: "none",
    prefix: false,
    suffix: false,
    negativeTitle: false,
    negativeKeywords: false,
    prefixText: "",
    suffixText: "",
    negativeTitleText: "",
    negativeKeywordsText: "",
    platform: "shutterstock",
    // Prompt tab settings
    whiteBackground: false,
    cameraParameters: false,
    promptImageType: "none",
    promptCharacterLength: 600,
    promptPrefix: false,
    promptSuffix: false,
    negativePromptWords: false,
    promptPrefixText: "",
    promptSuffixText: "",
    negativePromptWordsText: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [processedFiles, setProcessedFiles] = useState(0);
  const [generationTimer, setGenerationTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is signed in
    const userProfile = localStorage.getItem("userProfile");
    setIsSignedIn(!!userProfile);

    // Listen for storage changes
    const handleStorageChange = () => {
      const profile = localStorage.getItem("userProfile");
      setIsSignedIn(!!profile);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleGenerate = () => {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    setProgress(0);
    setProcessedFiles(0);
    setCurrentFile("");
    
    const newResults: Result[] = [];
    let currentIndex = 0;
    let isCancelled = false;
    
    const processNextFile = () => {
      if (isCancelled || currentIndex >= files.length) {
        setResults(newResults);
        setIsGenerating(false);
        setProgress(100);
        return;
      }
      
      const file = files[currentIndex];
      setCurrentFile(file.name);
      
      // Simulate processing each file
      const processingTime = 800 + Math.random() * 600; // 800-1400ms per file
      const timer = setTimeout(() => {
        if (isCancelled) {
          setIsGenerating(false);
          return;
        }

        newResults.push({
          id: `${Date.now()}-${currentIndex}`,
          filename: file.name,
          title: `Generated title for ${file.name}`,
          description: `AI-generated description for the image ${file.name}. This would contain relevant metadata for stock photo platforms.`,
          keywords: ["stock", "photo", "image", "digital", "creative", "design", "professional", "high-quality"],
        });
        
        currentIndex++;
        setProcessedFiles(currentIndex);
        const newProgress = Math.min(95, (currentIndex / files.length) * 95);
        setProgress(newProgress);
        
        processNextFile();
      }, processingTime);
      
      setGenerationTimer(timer);
    };
    
    processNextFile();
  };

  const handleCancelGeneration = () => {
    if (generationTimer) {
      clearTimeout(generationTimer);
    }
    setIsGenerating(false);
    setProgress(0);
    setProcessedFiles(0);
    setCurrentFile("");
    setResults([]);
  };

  const handleClearResults = () => {
    setResults([]);
    setProgress(0);
  };

  const handleExport = () => {
    if (results.length === 0) return;

    const csvContent = [
      ["Filename", "Title", "Description", "Keywords"].join(","),
      ...results.map((r) =>
        [
          r.filename,
          `"${r.title}"`,
          `"${r.description}"`,
          `"${r.keywords.join(", ")}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "csvnest-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-background">
      <Header />
      
      <main className="p-6 pb-0">
        <div className="flex gap-6 max-w-[1800px] mx-auto">
          {/* Left Sidebar - Generation Controls */}
          <aside className="w-[480px] flex-shrink-0">
            <GenerationControls settings={settings} onSettingsChange={setSettings} />
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              onGenerate={handleGenerate}
              onExport={handleExport}
              onClearResults={handleClearResults}
              isGenerating={isGenerating}
              isSignedIn={isSignedIn}
            />
            
            <ResultsPanel results={results} />
          </div>
        </div>
      </main>

      <HowToUseButton />
      
      {/* Generation Progress Bar */}
      <GenerationProgress
        isVisible={isGenerating}
        progress={progress}
        currentFile={currentFile}
        totalFiles={files.length}
        processedFiles={processedFiles}
        onCancel={handleCancelGeneration}
      />
    </div>
  );
};

export default Index;
