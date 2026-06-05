/**
 * @file geminiAnalysis.service.ts
 * @description Service für die KI-Analyse via Google Gemini.
 * Ruft /api/analyze auf – der API Key bleibt server-seitig.
 */

import type { AnalysisResult, DocumentInput } from '@/types';

/**
 * Sends a document to the Gemini API via the /api/analyze proxy and
 * returns a structured AnalysisResult with translated sections.
 */
export async function analyzeWithGemini(
  document: DocumentInput,
  targetLanguage: string,
  targetLanguageName: string
): Promise<AnalysisResult> {
  const prompt = `
You are a legal document translator and analyzer specializing in German legal documents.

Analyze the provided German legal document (Anwaltsbrief / legal letter) and return a structured JSON response.

Target language for translation: ${targetLanguageName} (language code: ${targetLanguage})

Break the document into its logical sections. For each section:
1. Extract the original German text
2. Translate it accurately into ${targetLanguageName}
3. Explain it in plain, simple language that a non-expert can understand (write the explanation in ${targetLanguageName})
4. Assess importance: "high" for deadlines, demands, legal consequences, required actions; "medium" for context and relevant details; "low" for formalities, addresses, signatures

Return ONLY valid JSON with exactly this structure, no markdown, no extra text:
{
  "sections": [
    {
      "id": "1",
      "title": "Section title in German",
      "original": "Original German text of this section",
      "translation": "Accurate translation in ${targetLanguageName}",
      "explanation": "Plain language explanation in ${targetLanguageName}",
      "importance": "high"
    }
  ],
  "summary": "Brief overall summary of what this document is about and what actions are required, written in ${targetLanguageName}",
  "documentName": "${document.name}",
  "targetLanguage": "${targetLanguage}",
  "targetLanguageName": "${targetLanguageName}",
  "deadline": "YYYY-MM-DD if any deadline is explicitly mentioned, otherwise omit this field entirely"
}
`;

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: document.mimeType,
              data: document.data,
            }
          },
          { text: prompt }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `Analysis failed: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from analysis service');

  const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as AnalysisResult;
}
