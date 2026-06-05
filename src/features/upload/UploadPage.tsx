import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, FileText, Loader2, CheckCircle, Languages, AlertCircle, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { analyzeWithGemini } from "@/services/geminiAnalysis.service";
import { useRateLimit } from "@/hooks/useRateLimit";
import type { SupportedLanguage, DocumentRecord } from "@/types";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
];

/** Validates file size and magic bytes (PDF, JPEG, PNG). */
async function validateFile(file: File): Promise<void> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`"${file.name}" is too large (max 10 MB).`);
  }
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer).slice(0, 4);
  const isPDF = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  if (!isPDF && !isJPEG && !isPNG) {
    throw new Error("Invalid file type. Only PDF, JPG, and PNG files are accepted.");
  }
}

/** Converts a File to a base64 string (without the data: prefix). */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Saves a completed DocumentRecord to localStorage for the dashboard. */
function saveToHistory(record: DocumentRecord): void {
  const history: DocumentRecord[] = JSON.parse(localStorage.getItem('lawcheck_history') || '[]');
  const updated = [record, ...history].slice(0, 20);
  localStorage.setItem('lawcheck_history', JSON.stringify(updated));
}

export function UploadPage() {
  const navigate = useNavigate();
  const { check, isLimited } = useRateLimit();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) setUploadedFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setUploadedFile(e.target.files[0]);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setSelectedLanguage("");
    setIsAnalyzing(false);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !selectedLanguage) return;

    if (!check()) {
      setError("Too many requests. Please wait a minute and try again.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      await validateFile(uploadedFile);

      const base64 = await fileToBase64(uploadedFile);
      const mimeType = uploadedFile.type || 'application/pdf';
      const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)!;

      const result = await analyzeWithGemini(
        { name: uploadedFile.name, mimeType, data: base64 },
        selectedLanguage,
        langInfo.name
      );

      const record: DocumentRecord = {
        id: Date.now().toString(),
        name: uploadedFile.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'completed',
        deadline: result.deadline,
        importance: 'high',
        result,
        targetLanguage: selectedLanguage,
      };

      saveToHistory(record);
      navigate('/ergebnis/1', { state: { result, record } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analysis failed. Please try again.';
      setError(msg);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium text-foreground">Deutsche Anwaltsbriefe verstehen</h1>
        <p className="text-muted-foreground">
          Laden Sie Ihr Dokument hoch und erhalten Sie eine übersetzte Version mit Erklärungen
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError(null)} className="shrink-0">
            <X className="size-4" />
          </button>
        </div>
      )}

      {isLimited && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <p className="text-sm">Rate limit reached. You can analyze up to 5 documents per minute.</p>
        </div>
      )}

      <Card className="p-8 border-2 border-dashed border-border bg-card">
        {!uploadedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center py-12 transition-colors ${
              isDragging ? "bg-muted/50" : ""
            }`}
          >
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Upload className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Dokument hochladen</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie, um eine Datei auszuwählen
            </p>
            <label htmlFor="file-upload">
              <Button asChild>
                <span>Datei auswählen</span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileInput}
            />
            <p className="text-xs text-muted-foreground mt-4">
              PDF, JPG oder PNG (max. 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                <FileText className="size-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{uploadedFile.name}</h4>
                  {!isAnalyzing && (
                    <Badge variant="outline" className="shrink-0">
                      <CheckCircle className="size-3 mr-1" />
                      Bereit
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              {!isAnalyzing && (
                <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="shrink-0">
                  Entfernen
                </Button>
              )}
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="size-12 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-medium mb-2">Analysiere Dokument...</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Wir übersetzen und analysieren Ihr Dokument. Dies kann einen Moment dauern.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language-select" className="flex items-center gap-2">
                    <Languages className="size-4" />
                    Zielsprache für Übersetzung
                  </Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language-select" className="w-full">
                      <SelectValue placeholder="Sprache auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span>{lang.nativeName}</span>
                            <span className="text-muted-foreground text-xs">({lang.name})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Wählen Sie die Sprache, in die das Dokument übersetzt werden soll
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    className="flex-1"
                    disabled={!selectedLanguage || isLimited}
                  >
                    Dokument analysieren
                  </Button>
                  <Button variant="outline" onClick={handleRemoveFile}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-card/50">
        <h3 className="font-medium mb-4">Wie funktioniert es?</h3>
        <div className="space-y-4">
          {[
            { n: 1, title: "Dokument hochladen", desc: "Laden Sie Ihren deutschen Anwaltsbrief als PDF oder Bild hoch" },
            { n: 2, title: "KI-Analyse", desc: "Unsere KI übersetzt den Brief und erklärt rechtliche Fachbegriffe" },
            { n: 3, title: "Ergebnis herunterladen", desc: "Laden Sie die übersetzte Version als PDF herunter" },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-3">
              <div className="rounded-full bg-primary/10 size-8 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium text-primary">{n}</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">{title}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
