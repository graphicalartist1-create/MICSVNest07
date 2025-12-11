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
  description: string;
  keywords: string[];
}

// Sample keywords for different image types
const keywordSamples = {
  nature: ["landscape", "nature", "mountain", "forest", "wildlife", "scenic", "natural", "outdoor", "environment", "beauty"],
  people: ["portrait", "people", "person", "family", "group", "lifestyle", "human", "face", "expression", "emotion"],
  business: ["business", "professional", "corporate", "office", "team", "meeting", "work", "success", "finance", "growth"],
  technology: ["technology", "digital", "computer", "tech", "innovation", "internet", "software", "modern", "device", "smart"],
  food: ["food", "cuisine", "recipe", "cooking", "meal", "dish", "fresh", "healthy", "delicious", "ingredient"],
  travel: ["travel", "destination", "adventure", "journey", "vacation", "tourism", "explore", "world", "discovery", "wanderlust"],
  abstract: ["abstract", "modern", "artistic", "creative", "design", "pattern", "texture", "color", "contemporary", "minimalist"],
  product: ["product", "item", "goods", "merchandise", "commercial", "retail", "brand", "quality", "design", "professional"],
};

function generateTitle(filename: string, settings: GenerationSettings): string {
  // Extract filename without extension
  let baseName = filename.replace(/\.[^/.]+$/, "");
  
  // Clean up filename
  let title = baseName
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // Truncate to specified length
  if (title.length > settings.titleLength) {
    title = title.substring(0, settings.titleLength).trim();
  }

  return title;
}

function generateDescription(filename: string, settings: GenerationSettings): string {
  const baseName = filename.replace(/\.[^/.]+$/, "");

  const description = `Professional image featuring ${baseName.replace(/[-_]/g, " ").toLowerCase()}. Optimized for stock photo platforms.`;
  
  return description.substring(0, settings.descriptionLength);
}

function generateKeywords(filename: string, settings: GenerationSettings): string[] {
  const baseName = filename.replace(/\.[^/.]+$/, "").toLowerCase();
  const words = baseName.split(/[-_\s]/);
  
  const keywords: Set<string> = new Set();

  // Add base words from filename
  words.forEach((word) => {
    if (word.length > 2) {
      keywords.add(word);
    }
  });

  // Add image type as keyword
  if (settings.imageType !== "none") {
    keywords.add(settings.imageType);
  }

  // Add relevant sample keywords based on image type
  const sampleKeywords = keywordSamples[settings.imageType as keyof typeof keywordSamples] || keywordSamples.abstract;
  sampleKeywords.forEach((keyword) => {
    if (keywords.size < settings.keywordsCount) {
      keywords.add(keyword);
    }
  });

  // Convert to array and limit to specified count
  const keywordArray = Array.from(keywords).slice(0, settings.keywordsCount);
  
  // If we need more keywords, generate some
  while (keywordArray.length < settings.keywordsCount) {
    const randomSample = sampleKeywords[Math.floor(Math.random() * sampleKeywords.length)];
    if (!keywordArray.includes(randomSample)) {
      keywordArray.push(randomSample);
    }
  }

  return keywordArray;
}

export async function generateMetadata(
  file: File,
  settings: GenerationSettings
): Promise<GeneratedMetadata> {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      const title = generateTitle(file.name, settings);
      const description = generateDescription(file.name, settings);
      const keywords = generateKeywords(file.name, settings);

      resolve({
        title,
        description,
        keywords,
      });
    }, 300);
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
