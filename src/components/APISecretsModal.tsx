import { useState } from "react";
import { X, Copy, Check, ExternalLink, Sparkles, Zap, Cpu, Route, Bolt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface APISecretsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const APISecretsModal = ({ open, onOpenChange }: APISecretsModalProps) => {
  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "mistral" | "openai" | "openrouter" | "groq">("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [mistralKey, setMistralKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [grokKey, setGrokKey] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const providers = [
    { id: "gemini", name: "Google Gemini", badge: "Paid & Free", color: "bg-cyan-500", icon: Sparkles },
    { id: "mistral", name: "Mistral AI", badge: "Paid", color: "bg-orange-500", icon: Zap },
    { id: "openai", name: "OpenAI", badge: "Paid", color: "bg-orange-500", icon: Cpu },
    { id: "openrouter", name: "OpenRouter", badge: "Paid & Free", color: "bg-orange-500", icon: Route },
    { id: "groq", name: "Groq", badge: "Free", color: "bg-green-500", icon: Bolt },
  ];

  const currentProvider = providers.find(p => p.id === selectedProvider);
  const keyValue = 
    selectedProvider === "gemini" ? geminiKey :
    selectedProvider === "mistral" ? mistralKey :
    selectedProvider === "openai" ? openaiKey :
    selectedProvider === "openrouter" ? openrouterKey :
    grokKey;

  const setKeyValue = (value: string) => {
    switch (selectedProvider) {
      case "gemini": setGeminiKey(value); break;
      case "mistral": setMistralKey(value); break;
      case "openai": setOpenaiKey(value); break;
      case "openrouter": setOpenrouterKey(value); break;
      case "groq": setGrokKey(value); break;
    }
  };

  const storedKeys = [
    { provider: "gemini", key: geminiKey },
    { provider: "mistral", key: mistralKey },
    { provider: "openai", key: openaiKey },
    { provider: "openrouter", key: openrouterKey },
    { provider: "groq", key: grokKey },
  ].filter(k => k.key);

  const copyToClipboard = (key: string, provider: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(provider);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "gemini": return "Google Gemini";
      case "mistral": return "Mistral AI";
      case "openai": return "OpenAI";
      case "openrouter": return "OpenRouter";
      case "groq": return "Groq";
      default: return provider;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-bold text-foreground">API Secrets Management</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-foreground" />
          </button>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-6">
          Manage your AI provider API keys. Keys are stored locally and securely.
        </div>

        {/* Provider Selection */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4">Select AI Provider</h3>
          <div className="flex flex-wrap gap-3">
            {providers.map((provider) => {
              const IconComponent = provider.icon;
              return (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id as any)}
                  className={`relative px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedProvider === provider.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium text-foreground">{provider.name}</span>
                  </div>
                  <span className={`absolute -top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${provider.color}`}>
                    {provider.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Configuration */}
          <div className="border border-border rounded-lg p-6 bg-secondary/30">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {currentProvider?.name} Configuration
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedProvider === "gemini" && "Google's advanced AI model for text and image analysis"}
              {selectedProvider === "mistral" && "Mistral AI's powerful language models"}
              {selectedProvider === "openai" && "OpenAI's GPT models for advanced AI tasks"}
              {selectedProvider === "openrouter" && "Access multiple AI models through OpenRouter"}
              {selectedProvider === "groq" && "Fast inference with Groq's LPU technology"}
            </p>

            {selectedProvider === "gemini" && (
              <>
                <label className="text-sm font-medium text-foreground mb-3 block">Select Model</label>
                <Select defaultValue="gemini-2.5-flash-lite">
                  <SelectTrigger className="bg-background border border-border mb-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite Preview</SelectItem>
                    <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
                <div className="bg-primary/10 border border-primary/30 rounded p-2 mb-6">
                  <p className="text-xs text-primary">ℹ️ This model supports image analysis</p>
                </div>
              </>
            )}

            <label className="text-sm font-medium text-foreground mb-3 block">
              {selectedProvider === "gemini" ? "Google Gemini API Keys" : `${currentProvider?.name} API Keys`}
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              {selectedProvider === "gemini" && 'Gemini API keys should start with "Alza"'}
              {selectedProvider !== "gemini" && `Enter your ${currentProvider?.name} API key`}
            </p>

            <div className="flex gap-2">
              <Input
                type="password"
                placeholder={`Enter ${selectedProvider === "gemini" ? "Gemini" : currentProvider?.name} API key`}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                className="bg-background border border-border flex-1"
              />
              <Button
                variant="default"
                size="icon"
                className="bg-cyan-600 hover:bg-cyan-700"
                title={`Get ${currentProvider?.name} API Key`}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <a 
              href={
                selectedProvider === "gemini" ? "https://aistudio.google.com/apikey" :
                selectedProvider === "mistral" ? "https://console.mistral.ai/api-keys" :
                selectedProvider === "openai" ? "https://platform.openai.com/api-keys" :
                selectedProvider === "openrouter" ? "https://openrouter.ai/keys" :
                "https://console.groq.com/keys"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-sm mt-3 flex items-center gap-1"
            >
              Get {currentProvider?.name} API Key
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Right: Stored Keys */}
          <div className="border border-border rounded-lg p-6 bg-secondary/30">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Stored Keys <span className="text-muted-foreground text-sm font-normal">({storedKeys.length})</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Manage your stored API keys for {currentProvider?.name}
            </p>

            {storedKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <p className="text-muted-foreground mb-2">No API keys stored yet.</p>
                <p className="text-sm text-muted-foreground">
                  Add a key using the form on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {storedKeys.map((item) => (
                  <div key={item.provider} className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {getProviderName(item.provider)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.key, item.provider)}
                        className="gap-2"
                      >
                        {copiedKey === item.provider ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {item.key.substring(0, 20)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default APISecretsModal;
