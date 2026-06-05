import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, FileText, Loader2, CheckCircle, Languages } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const SUPPORTED_LANGUAGES = [
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

export function UploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate("/ergebnis/1");
    }, 2000);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setSelectedLanguage("");
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium text-foreground">Deutsche Anwaltsbriefe verstehen</h1>
        <p className="text-muted-foreground">
          Laden Sie Ihr Dokument hoch und erhalten Sie eine übersetzte Version mit Erklärungen
        </p>
      </div>

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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="shrink-0"
                >
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
                            <span className="text-muted-foreground text-xs">
                              ({lang.name})
                            </span>
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
                    disabled={!selectedLanguage}
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
          <div className="flex gap-3">
            <div className="rounded-full bg-primary/10 size-8 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">1</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">Dokument hochladen</h4>
              <p className="text-sm text-muted-foreground">
                Laden Sie Ihren deutschen Anwaltsbrief als PDF oder Bild hoch
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-full bg-primary/10 size-8 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">2</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">KI-Analyse</h4>
              <p className="text-sm text-muted-foreground">
                Unsere KI übersetzt den Brief und erklärt rechtliche Fachbegriffe
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-full bg-primary/10 size-8 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">3</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">Ergebnis herunterladen</h4>
              <p className="text-sm text-muted-foreground">
                Laden Sie die übersetzte Version als PDF herunter
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
