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

function generateAdvancedTitle(filename: string, settings: GenerationSettings): string {
  const baseName = filename.replace(/\.[^/.]+$/, "");
  
  // Clean up filename
  let title = baseName
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

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
  return new Promise((resolve) => {
    // Simulate image analysis delay (in real app, this would call Google Vision API or similar)
    const delay = Math.random() * 800 + 300; // 300-1100ms
    
    setTimeout(() => {
      const title = generateAdvancedTitle(file.name, settings);
      const { short: shortDescription, long: longDescription } = generateAdvancedDescription(file.name, settings);
      const keywords = generateAdvancedKeywords(file.name, settings);

      resolve({
        title,
        shortDescription,
        longDescription,
        keywords,
      });
    }, delay);
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
