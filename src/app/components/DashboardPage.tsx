import { Link } from "react-router";
import { FileText, Calendar, Clock, Download, Eye } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface Document {
  id: string;
  name: string;
  uploadDate: string;
  status: "completed" | "processing" | "failed";
  deadline?: string;
  importance: "high" | "medium" | "low";
}

const DUMMY_DOCUMENTS: Document[] = [
  {
    id: "1",
    name: "Anwaltsbrief_2023.pdf",
    uploadDate: "2023-06-01",
    status: "completed",
    deadline: "2023-06-30",
    importance: "high",
  },
  {
    id: "2",
    name: "Mietvertrag_Kuendigung.pdf",
    uploadDate: "2023-05-15",
    status: "completed",
    deadline: "2023-07-15",
    importance: "medium",
  },
  {
    id: "3",
    name: "Rechnung_Anwalt.pdf",
    uploadDate: "2023-05-10",
    status: "completed",
    importance: "low",
  },
  {
    id: "4",
    name: "Vertragsunterlagen.pdf",
    uploadDate: "2023-05-05",
    status: "processing",
    importance: "medium",
  },
];

export function DashboardPage() {
  const getStatusBadge = (status: Document["status"]) => {
    const config = {
      completed: { label: "Fertig", variant: "default" as const },
      processing: { label: "Wird verarbeitet", variant: "secondary" as const },
      failed: { label: "Fehler", variant: "destructive" as const },
    };
    return config[status];
  };

  const getImportanceBadge = (importance: Document["importance"]) => {
    const config = {
      high: { label: "Wichtig", variant: "destructive" as const },
      medium: { label: "Mittel", variant: "default" as const },
      low: { label: "Info", variant: "secondary" as const },
    };
    return config[importance];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const isDeadlineSoon = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil >= 0;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium">Meine Dokumente</h1>
          <p className="text-muted-foreground">
            Übersicht aller hochgeladenen und analysierten Dokumente
          </p>
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
          <p className="text-3xl font-medium">{DUMMY_DOCUMENTS.length}</p>
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
            {DUMMY_DOCUMENTS.filter((d) => d.status === "processing").length}
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
            {DUMMY_DOCUMENTS.filter((d) => isDeadlineSoon(d.deadline)).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Dokumente</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Alle Dokumente</h2>

        <div className="space-y-3">
          {DUMMY_DOCUMENTS.map((doc) => {
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
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                          <Badge variant={importanceBadge.variant}>
                            {importanceBadge.label}
                          </Badge>
                          {deadlineSoon && (
                            <Badge variant="destructive" className="animate-pulse">
                              Frist läuft bald ab
                            </Badge>
                          )}
                        </div>
                      </div>

                      {doc.status === "completed" && (
                        <div className="flex gap-2 shrink-0">
                          <Link to={`/ergebnis/${doc.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="size-4 mr-2" />
                              Ansehen
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <Download className="size-4" />
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
      </div>
    </div>
  );
}
