/**
 * Generates a valid, minimalist PDF Blob containing clean academic placeholder content.
 */
export function createStaticAcademicPdf(title: string, subject: string, pagesText: string[]): Blob {
  const contentStream = `
BT
/F1 20 Tf
50 730 Td
(${escapePdfText(title)}) Tj
/F1 12 Tf
0 -26 Td
(Subject: ${escapePdfText(subject)}  |  NoteNest Academic Archive) Tj
/F1 10 Tf
0 -36 Td
(${escapePdfText(pagesText[0] || 'Unit lecture notes, important formulas, and revision materials.')}) Tj
0 -20 Td
(Retrieved and stored seamlessly via NoteNest.) Tj
ET
`.trim();

  const streamLength = contentStream.length;

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${contentStream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000240 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;

  return new Blob([pdfString], { type: 'application/pdf' });
}

function escapePdfText(text: string): string {
  return text.replace(/[()\\]/g, '\\$&');
}
