import { useState } from "react";
import { useParams, Link } from "react-router";
import { Download, ChevronDown, ChevronUp, FileText, AlertCircle, Info, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface Section {
  id: string;
  title: string;
  original: string;
  translation: string;
  explanation?: string;
  importance: "high" | "medium" | "low";
}

const DUMMY_DATA: Section[] = [
  {
    id: "1",
    title: "Betreff und Aktenzeichen",
    original: "Abmahnung wegen Urheberrechtsverletzung - AZ: 2023/1234",
    translation: "Warning letter regarding copyright infringement - Case number: 2023/1234",
    explanation: "Dies ist eine formelle Warnung bezüglich einer angeblichen Urheberrechtsverletzung. Das Aktenzeichen dient zur Identifikation des Falls.",
    importance: "high",
  },
  {
    id: "2",
    title: "Sachverhalt",
    original: "Es wird Ihnen zur Last gelegt, am 15. März 2023 urheberrechtlich geschütztes Material ohne Genehmigung verbreitet zu haben.",
    translation: "You are accused of distributing copyrighted material without permission on March 15, 2023.",
    explanation: "Der Anwalt beschreibt hier den konkreten Vorwurf. Es geht um eine angebliche Urheberrechtsverletzung an einem bestimmten Datum.",
    importance: "high",
  },
  {
    id: "3",
    title: "Forderung",
    original: "Wir fordern Sie hiermit auf, eine strafbewehrte Unterlassungserklärung abzugeben sowie Schadensersatz in Höhe von 1.500 EUR zu leisten.",
    translation: "We hereby request that you submit a cease and desist declaration with penalty clause and pay damages in the amount of 1,500 EUR.",
    explanation: "Eine 'strafbewehrte Unterlassungserklärung' ist ein rechtsverbindliches Versprechen, das Verhalten nicht zu wiederholen. Bei Verstoß droht eine Vertragsstrafe. Der Schadensersatz ist die geforderte Geldsumme.",
    importance: "high",
  },
  {
    id: "4",
    title: "Fristsetzung",
    original: "Wir setzen Ihnen eine Frist bis zum 30. Juni 2023, um der Forderung nachzukommen.",
    translation: "We set you a deadline until June 30, 2023 to comply with the demand.",
    explanation: "Dies ist die Deadline, bis zu der Sie reagieren müssen. Nach Ablauf dieser Frist können weitere rechtliche Schritte eingeleitet werden.",
    importance: "medium",
  },
];

export function ErgebnisPage() {
  const { id } = useParams();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["1", "2"]));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleDownload = () => {
    alert("PDF wird heruntergeladen... (Demo-Funktion)");
  };

  const getImportanceBadge = (importance: Section["importance"]) => {
    const config = {
      high: { label: "Wichtig", variant: "destructive" as const },
      medium: { label: "Mittel", variant: "default" as const },
      low: { label: "Info", variant: "secondary" as const },
    };
    return config[importance];
  };

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
          <p className="text-muted-foreground">
            Dokument: Anwaltsbrief_2023.pdf
          </p>
        </div>
        <Button onClick={handleDownload}>
          <Download className="size-4 mr-2" />
          PDF exportieren
        </Button>
      </div>

      <Card className="p-6 bg-card border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium mb-1">Wichtiger Hinweis</h3>
            <p className="text-sm text-muted-foreground">
              Diese Übersetzung und Analyse dient nur zu Informationszwecken. Bitte konsultieren Sie einen
              Rechtsanwalt für rechtliche Beratung. Die Frist läuft am <strong>30. Juni 2023</strong> ab.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Abschnitte des Dokuments</h2>

        {DUMMY_DATA.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const badgeConfig = getImportanceBadge(section.importance);

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
                      <Badge variant={badgeConfig.variant}>
                        {badgeConfig.label}
                      </Badge>
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
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Original (Deutsch)
                        </h4>
                      </div>
                      <p className="text-sm bg-muted/50 p-4 rounded-lg">
                        {section.original}
                      </p>
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
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span className="text-muted-foreground">
              Lesen Sie das gesamte Dokument sorgfältig durch
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span className="text-muted-foreground">
              Konsultieren Sie einen Rechtsanwalt für professionelle Beratung
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span className="text-muted-foreground">
              Beachten Sie die genannte Frist (30. Juni 2023)
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">•</span>
            <span className="text-muted-foreground">
              Bewahren Sie alle Dokumente und Beweise auf
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
