import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { Download, ChevronDown, ChevronUp, FileText, AlertCircle, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import type { AnalysisResult, AnalysisSection } from "@/types";

/** Generates a print-ready HTML document from the analysis result. */
function buildPrintableHTML(result: AnalysisResult): string {
  const sections = result.sections
    .map(
      (s) => `
      <div class="section importance-${s.importance}">
        <div class="section-header">
          <h3>${s.title}</h3>
          <span class="badge ${s.importance}">${
            s.importance === 'high' ? 'Important' : s.importance === 'medium' ? 'Medium' : 'Info'
          }</span>
        </div>
        <div class="block">
          <p class="block-label">Original (German)</p>
          <p class="block-content original">${s.original}</p>
        </div>
        <div class="block">
          <p class="block-label">Translation</p>
          <p class="block-content translation">${s.translation}</p>
        </div>
        ${s.explanation ? `<div class="block">
          <p class="block-label">Explanation</p>
          <p class="block-content explanation">${s.explanation}</p>
        </div>` : ''}
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LawCheck – ${result.documentName}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
    h1 { font-size: 1.6rem; border-bottom: 2px solid #333; padding-bottom: 8px; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 24px; }
    .summary { background: #f5f5f5; border-left: 4px solid #333; padding: 12px 16px; margin-bottom: 32px; }
    .section { margin-bottom: 28px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
    .section-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f9f9f9; border-bottom: 1px solid #ddd; }
    h3 { margin: 0; font-size: 1rem; }
    .badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
    .badge.high { background: #fee2e2; color: #991b1b; }
    .badge.medium { background: #dbeafe; color: #1e40af; }
    .badge.low { background: #f3f4f6; color: #374151; }
    .block { padding: 10px 16px; border-bottom: 1px solid #eee; }
    .block:last-child { border-bottom: none; }
    .block-label { font-size: 0.75rem; font-weight: 600; color: #666; text-transform: uppercase; margin: 0 0 4px; }
    .block-content { margin: 0; font-size: 0.9rem; line-height: 1.6; }
    .original { color: #555; }
    .translation { color: #1a1a1a; font-weight: 500; }
    .explanation { color: #374151; background: #fffbeb; padding: 8px; border-radius: 4px; }
    .disclaimer { margin-top: 40px; padding: 12px; background: #fff3cd; border-radius: 6px; font-size: 0.85rem; color: #856404; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>LawCheck – Document Analysis</h1>
  <p class="meta">Document: <strong>${result.documentName}</strong> · Translated to: <strong>${result.targetLanguageName}</strong>${result.deadline ? ` · Deadline: <strong>${result.deadline}</strong>` : ''}</p>
  <div class="summary"><strong>Summary:</strong> ${result.summary}</div>
  ${sections}
  <div class="disclaimer">⚠ This translation and analysis is for informational purposes only. Please consult a qualified lawyer for legal advice.</div>
</body>
</html>`;
}

export function ErgebnisPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result as AnalysisResult | undefined;

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(result?.sections.slice(0, 2).map((s) => s.id) ?? [])
  );

  if (!result) return null;

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSections(next);
  };

  const handleDownload = () => {
    const html = buildPrintableHTML(result);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  };

  const getImportanceBadge = (importance: AnalysisSection['importance']) => ({
    high: { label: "Wichtig", variant: "destructive" as const },
    medium: { label: "Mittel", variant: "default" as const },
    low: { label: "Info", variant: "secondary" as const },
  }[importance]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            Zurück
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium">Analyseergebnis</h1>
          <p className="text-muted-foreground">Dokument: {result.documentName}</p>
        </div>
        <Button onClick={handleDownload}>
          <Download className="size-4 mr-2" />
          PDF exportieren
        </Button>
      </div>

      {result.summary && (
        <Card className="p-6 bg-card border-primary/20">
          <div className="flex gap-3">
            <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Zusammenfassung</h3>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
              {result.deadline && (
                <p className="text-sm mt-2">
                  Frist:{" "}
                  <strong className="text-destructive">
                    {new Date(result.deadline).toLocaleDateString("de-DE")}
                  </strong>
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Abschnitte des Dokuments</h2>

        {result.sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const badge = getImportanceBadge(section.importance);

          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{section.title}</h3>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {section.translation}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="size-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="size-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 space-y-4">
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="size-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium text-muted-foreground">Original (Deutsch)</h4>
                      </div>
                      <p className="text-sm bg-muted/50 p-4 rounded-lg">{section.original}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="size-4 text-primary" />
                        <h4 className="text-sm font-medium">Übersetzung</h4>
                      </div>
                      <p className="text-sm bg-primary/5 p-4 rounded-lg border border-primary/10">
                        {section.translation}
                      </p>
                    </div>
                    {section.explanation && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="size-4 text-accent" />
                          <h4 className="text-sm font-medium">Erklärung</h4>
                        </div>
                        <p className="text-sm bg-accent/5 p-4 rounded-lg border border-accent/10">
                          {section.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-card/50">
        <h3 className="font-medium mb-4">Nächste Schritte</h3>
        <ul className="space-y-3 text-sm">
          {[
            "Lesen Sie das gesamte Dokument sorgfältig durch",
            "Konsultieren Sie einen Rechtsanwalt für professionelle Beratung",
            result.deadline ? `Beachten Sie die Frist: ${new Date(result.deadline).toLocaleDateString("de-DE")}` : "Prüfen Sie ob Fristen im Brief genannt werden",
            "Bewahren Sie alle Dokumente und Beweise auf",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-primary">•</span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
