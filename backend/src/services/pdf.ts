import pdf from 'pdf-parse';

/**
 * Extracts text content from a PDF buffer
 *
 * @param buffer - PDF file buffer from multer
 * @returns Extracted text content
 * @throws Error if PDF parsing fails
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);

    // data.text contains all the text extracted from the PDF
    const text = data.text.trim();

    if (!text || text.length < 50) {
      throw new Error('PDF appears to be empty or contains too little text');
    }

    console.log(`✓ Extracted ${text.length} characters from PDF (${data.numpages} pages)`);

    return text;

  } catch (error) {
    if (error instanceof Error) {
      console.error('PDF extraction failed:', error.message);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Validates that a file is a PDF
 *
 * @param mimetype - File mimetype from multer
 * @param filename - Original filename
 * @returns true if file appears to be a PDF
 */
export function isPDF(mimetype: string, filename: string): boolean {
  return (
    mimetype === 'application/pdf' ||
    filename.toLowerCase().endsWith('.pdf')
  );
}
