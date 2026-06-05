import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FileText, Calendar, Clock, Download, Eye, Trash2 } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import type { DocumentRecord } from "@/types";

function loadHistory(): DocumentRecord[] {
  return JSON.parse(localStorage.getItem('lawcheck_history') || '[]');
}

function removeFromHistory(id: string): DocumentRecord[] {
  const updated = loadHistory().filter((r) => r.id !== id);
  localStorage.setItem('lawcheck_history', JSON.stringify(updated));
  return updated;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(dateString));
}

function isDeadlineSoon(deadline?: string): boolean {
  if (!deadline) return false;
  const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  return daysUntil <= 7 && daysUntil >= 0;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  useEffect(() => {
    setDocuments(loadHistory());
  }, []);

  const handleDelete = (id: string) => {
    setDocuments(removeFromHistory(id));
  };

  const handleView = (doc: DocumentRecord) => {
    if (doc.result) navigate(`/ergebnis/${doc.id}`, { state: { result: doc.result, record: doc } });
  };

  const getStatusBadge = (status: DocumentRecord['status']) => ({
    completed: { label: "Fertig", variant: "default" as const },
    processing: { label: "Wird verarbeitet", variant: "secondary" as const },
    failed: { label: "Fehler", variant: "destructive" as const },
  }[status]);

  const getImportanceBadge = (importance: DocumentRecord['importance']) => ({
    high: { label: "Wichtig", variant: "destructive" as const },
    medium: { label: "Mittel", variant: "default" as const },
    low: { label: "Info", variant: "secondary" as const },
  }[importance]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium">Meine Dokumente</h1>
          <p className="text-muted-foreground">Übersicht aller hochgeladenen und analysierten Dokumente</p>
        </div>
        <Link to="/">
          <Button>
            <FileText className="size-4 mr-2" />
            Neues Dokument
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="size-5 text-primary" />
            </div>
            <h3 className="font-medium">Gesamt</h3>
          </div>
          <p className="text-3xl font-medium">{documents.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Dokumente</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Clock className="size-5 text-primary" />
            </div>
            <h3 className="font-medium">In Bearbeitung</h3>
          </div>
          <p className="text-3xl font-medium">
            {documents.filter((d) => d.status === "processing").length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Dokumente</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-destructive/10 p-2">
              <Calendar className="size-5 text-destructive" />
            </div>
            <h3 className="font-medium">Fristen bald fällig</h3>
          </div>
          <p className="text-3xl font-medium">
            {documents.filter((d) => isDeadlineSoon(d.deadline)).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Dokumente</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Alle Dokumente</h2>

        {documents.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-medium mb-2">Noch keine Dokumente</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Laden Sie Ihr erstes Dokument hoch, um es hier zu sehen.
            </p>
            <Link to="/">
              <Button>Dokument hochladen</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const statusBadge = getStatusBadge(doc.status);
              const importanceBadge = getImportanceBadge(doc.importance);
              const deadlineSoon = isDeadlineSoon(doc.deadline);

              return (
                <Card key={doc.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                      <FileText className="size-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-2 truncate">{doc.name}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                            <Badge variant={importanceBadge.variant}>{importanceBadge.label}</Badge>
                            {deadlineSoon && (
                              <Badge variant="destructive" className="animate-pulse">
                                Frist läuft bald ab
                              </Badge>
                            )}
                          </div>
                        </div>

                        {doc.status === "completed" && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={() => handleView(doc)}>
                              <Eye className="size-4 mr-2" />
                              Ansehen
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-4" />
                          <span>Hochgeladen: {formatDate(doc.uploadDate)}</span>
                        </div>
                        {doc.deadline && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-4" />
                            <span className={deadlineSoon ? "text-destructive font-medium" : ""}>
                              Frist: {formatDate(doc.deadline)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
