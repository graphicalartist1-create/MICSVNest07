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

interface GeneratedMetadata {
  title: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
}

// Object detection keywords
const objectKeywords = {
  nature: ["landscape", "nature", "mountain", "forest", "wildlife", "scenic", "natural", "outdoor", "environment", "beauty", "sunset", "sunrise", "water", "tree", "sky"],
  people: ["portrait", "people", "person", "family", "group", "lifestyle", "human", "face", "expression", "emotion", "smile", "child", "adult", "woman", "man"],
  business: ["business", "professional", "corporate", "office", "team", "meeting", "work", "success", "finance", "growth", "presentation", "conference", "workplace", "entrepreneur", "startup"],
  technology: ["technology", "digital", "computer", "tech", "innovation", "internet", "software", "modern", "device", "smart", "gadget", "electronic", "futuristic", "cyber", "data"],
  food: ["food", "cuisine", "recipe", "cooking", "meal", "dish", "fresh", "healthy", "delicious", "ingredient", "restaurant", "beverage", "dessert", "gourmet", "appetite"],
  travel: ["travel", "destination", "adventure", "journey", "vacation", "tourism", "explore", "world", "discovery", "wanderlust", "landmark", "tourist", "trip", "sightseeing", "globetrotter"],
  animal: ["animal", "pet", "dog", "cat", "wildlife", "bird", "mammal", "creature", "fauna", "wild", "zoo", "nature", "endangered", "adorable", "furry"],
  product: ["product", "item", "goods", "merchandise", "commercial", "retail", "brand", "quality", "design", "professional", "packaging", "display", "showcase", "model", "prototype"],
  abstract: ["abstract", "modern", "artistic", "creative", "design", "pattern", "texture", "color", "contemporary", "minimalist", "geometry", "shape", "composition", "visual", "aesthetic"],
};

function extractKeywordsFromFilename(filename: string): string[] {
  const baseName = filename.replace(/\.[^/.]+$/, "").toLowerCase();
  return baseName.split(/[-_\s]+/).filter(word => word.length > 2);
}

// Analyze image to extract visual characteristics
async function analyzeImage(file: File): Promise<{
  dominantColors: string[];
  brightness: "dark" | "light" | "medium";
  complexity: "simple" | "complex";
  hasText: boolean;
  estimatedSubject: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Canvas-based image analysis
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({
            dominantColors: ["blue", "gray"],
            brightness: "medium",
            complexity: "simple",
            hasText: false,
            estimatedSubject: "image",
          });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Analyze colors and brightness
        let r = 0, g = 0, b = 0, brightness = 0;
        let edgeCount = 0;
        const colorMap: { [key: string]: number } = {};

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;

          // Simple edge detection for complexity
          if (i + 4 < data.length) {
            const diff = Math.abs(data[i] - data[i + 4]) + 
                        Math.abs(data[i + 1] - data[i + 5]) + 
                        Math.abs(data[i + 2] - data[i + 6]);
            if (diff > 30) edgeCount++;
          }

          // Color categorization
          const colorName = getColorName(data[i], data[i + 1], data[i + 2]);
          colorMap[colorName] = (colorMap[colorName] || 0) + 1;
        }

        const pixelCount = data.length / 4;
        const avgR = Math.floor(r / pixelCount);
        const avgG = Math.floor(g / pixelCount);
        const avgB = Math.floor(b / pixelCount);
        const avgBrightness = Math.floor(brightness / pixelCount);
        const complexityScore = edgeCount / pixelCount;

        const dominantColors = Object.entries(colorMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([color]) => color);

        const brightnessLevel = avgBrightness > 200 ? "light" : avgBrightness > 100 ? "medium" : "dark";
        const complexity = complexityScore > 0.1 ? "complex" : "simple";

        // Estimate subject based on color and structure
        const estimatedSubject = estimateSubjectFromAnalysis(avgR, avgG, avgB, complexity);

        resolve({
          dominantColors: dominantColors.length > 0 ? dominantColors : ["unknown"],
          brightness: brightnessLevel,
          complexity,
          hasText: edgeCount > pixelCount * 0.2, // High edge density might indicate text
          estimatedSubject,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function getColorName(r: number, g: number, b: number): string {
  // Determine dominant color channel
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const gray = max - min < 30;

  if (gray) {
    return r > 200 ? "white" : r < 50 ? "black" : "gray";
  }

  if (r === max) {
    return r > 150 && g < 100 ? "red" : "orange";
  }
  if (g === max) {
    return g > 150 ? "green" : "yellow";
  }
  if (b === max) {
    return b > 150 ? "blue" : "purple";
  }
  return "gray";
}

function estimateSubjectFromAnalysis(r: number, g: number, b: number, complexity: "simple" | "complex"): string {
  // Simple heuristic to estimate what the image might contain
  if (g > r && g > b && g > 100) {
    return complexity === "complex" ? "nature" : "solid";
  }
  if (b > 100 && r < 100 && g < 100) {
    return "sky"; // Likely has sky
  }
  if (r > 150 && g > 100 && b < 100) {
    return "warm"; // Warm-toned
  }
  if (complexity === "complex") {
    return "detailed";
  }
  return "general";
}

function generateAdvancedTitle(imageName: string, analysis: {
  dominantColors: string[];
  brightness: "dark" | "light" | "medium";
  complexity: "simple" | "complex";
  hasText: boolean;
  estimatedSubject: string;
}, settings: GenerationSettings): string {
  const baseName = imageName.replace(/\.[^/.]+$/, "");
  
  // Build title from analysis
  const subjectWords = {
    nature: ["Natural Landscape", "Scenic Photography", "Nature Scene"],
    sky: ["Sky Scenery", "Outdoor View", "Sky Photography"],
    warm: ["Warm Toned Photo", "Golden Hour Scene", "Warm Photography"],
    detailed: ["Detailed Composition", "Complex Scene", "Intricate Photography"],
    solid: ["Minimalist Image", "Simple Composition", "Clean Design"],
    general: ["Professional Image", "Stock Photography", "Quality Image"],
  };

  const brightnessWords = {
    dark: "Dark",
    light: "Bright",
    medium: "Balanced",
  };

  const complexityWords = {
    complex: "Detailed",
    simple: "Minimalist",
  };

  // Generate title from analysis
  const subject = subjectWords[analysis.estimatedSubject as keyof typeof subjectWords]?.[0] || "Image";
  const brightness = brightnessWords[analysis.brightness];
  const complexityDesc = complexityWords[analysis.complexity];
  const colorDesc = analysis.dominantColors[0]?.charAt(0).toUpperCase() + (analysis.dominantColors[0]?.slice(1) || "");

  let title = `${brightness} ${complexityDesc} ${subject}`;
  
  // Add filename words if they're meaningful
  const filenameWords = baseName
    .replace(/[-_]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  if (filenameWords && filenameWords.length > 0 && filenameWords.length < 30) {
    title = `${filenameWords} - ${colorDesc} ${subject}`;
  }

  // Add prefix if enabled
  if (settings.prefix && settings.prefixText) {
    title = `${settings.prefixText} ${title}`;
  }

  // Add suffix if enabled
  if (settings.suffix && settings.suffixText) {
    title = `${title} ${settings.suffixText}`;
  }

  // Truncate to specified length
  if (title.length > settings.titleLength) {
    title = title.substring(0, settings.titleLength).trim();
  }

  return title;
}

function generateAdvancedDescription(filename: string, settings: GenerationSettings): { short: string; long: string } {
  const baseName = filename.replace(/\.[^/.]+$/, "");
  const imageTypeText = settings.imageType !== "none" ? settings.imageType : "image";

  const shortDesc = `Professional ${imageTypeText} of ${baseName.replace(/[-_]/g, " ").toLowerCase()}. High-quality and optimized for stock photo platforms.`;
  
  const longDesc = `This professional-grade ${imageTypeText} showcases ${baseName.replace(/[-_]/g, " ").toLowerCase()} with exceptional detail and clarity. Perfect for commercial use, creative projects, and professional applications on ${settings.platform}. The image is carefully optimized for various resolutions and use cases. Ideal for websites, presentations, marketing materials, and digital publications. Available with full rights and flexibility for your creative needs.`;

  return {
    short: shortDesc.substring(0, settings.descriptionLength),
    long: longDesc.substring(0, settings.descriptionLength * 2),
  };
}

function generateAdvancedKeywords(filename: string, settings: GenerationSettings): string[] {
  const filenameKeywords = extractKeywordsFromFilename(filename);
  const keywords: Set<string> = new Set(filenameKeywords);

  // Add image type keywords
  if (settings.imageType !== "none") {
    keywords.add(settings.imageType);
    const typeKeywords = objectKeywords[settings.imageType as keyof typeof objectKeywords] || objectKeywords.abstract;
    typeKeywords.forEach((kw) => keywords.add(kw));
  }

  // Add platform keywords
  keywords.add(settings.platform);
  keywords.add("stock photo");
  keywords.add("royalty free");
  keywords.add("professional");
  keywords.add("high quality");

  // Add related keywords
  keywords.add("creative");
  keywords.add("digital");
  keywords.add("image");
  keywords.add("photo");

  // Filter negative keywords if enabled
  if (settings.negativeKeywords && settings.negativeKeywordsText) {
    const negativeWords = settings.negativeKeywordsText.split(",").map((w) => w.trim().toLowerCase());
    negativeWords.forEach((word) => keywords.delete(word));
  }

  // Convert to array and limit to specified count
  let keywordArray = Array.from(keywords).slice(0, settings.keywordsCount);
  
  // Generate additional keywords if needed
  const allObjectKeywords = Object.values(objectKeywords).flat();
  while (keywordArray.length < settings.keywordsCount) {
    const randomKeyword = allObjectKeywords[Math.floor(Math.random() * allObjectKeywords.length)];
    if (!keywordArray.includes(randomKeyword)) {
      keywordArray.push(randomKeyword);
    }
  }

  return keywordArray.slice(0, settings.keywordsCount);
}

export async function generateMetadata(
  file: File,
  settings: GenerationSettings
): Promise<GeneratedMetadata> {
  // First, analyze the image
  const analysis = await analyzeImage(file);
  
  // Then generate metadata based on analysis
  return new Promise((resolve) => {
    setTimeout(() => {
      const title = generateAdvancedTitle(file.name, analysis, settings);
      const { short: shortDescription, long: longDescription } = generateAdvancedDescription(file.name, settings);
      const keywords = generateAdvancedKeywords(file.name, settings);

      resolve({
        title,
        shortDescription,
        longDescription,
        keywords,
      });
    }, 300); // Reduced delay since analysis already took time
  });
}

export async function generateMetadataForMultipleFiles(
  files: File[],
  settings: GenerationSettings
): Promise<GeneratedMetadata[]> {
  const results = await Promise.all(
    files.map((file) => generateMetadata(file, settings))
  );
  return results;
}
