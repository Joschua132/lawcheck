/**
 * @file index.ts
 * @description Zentrale Domain-Typen für LawCheck.
 * Alle Komponenten importieren Types ausschließlich von hier.
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

/** Raw file data passed to the analysis service */
export interface DocumentInput {
  name: string;
  mimeType: string;
  data: string; // base64-encoded file content
}

/** A single logical section of the analyzed document */
export interface AnalysisSection {
  id: string;
  title: string;
  original: string;
  translation: string;
  explanation?: string;
  importance: 'high' | 'medium' | 'low';
}

/** Full analysis result returned by Gemini */
export interface AnalysisResult {
  sections: AnalysisSection[];
  summary: string;
  documentName: string;
  targetLanguage: string;
  targetLanguageName: string;
  deadline?: string; // ISO date string YYYY-MM-DD
  error?: string;
}

/** Persisted record for the dashboard history (stored in localStorage) */
export interface DocumentRecord {
  id: string;
  name: string;
  uploadDate: string; // ISO date string
  status: 'completed' | 'processing' | 'failed';
  deadline?: string;
  importance: 'high' | 'medium' | 'low';
  result?: AnalysisResult;
  targetLanguage?: string;
}
