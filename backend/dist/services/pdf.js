"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPDF = extractTextFromPDF;
exports.isPDF = isPDF;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
/**
 * Extracts text content from a PDF buffer
 *
 * @param buffer - PDF file buffer from multer
 * @returns Extracted text content
 * @throws Error if PDF parsing fails
 */
async function extractTextFromPDF(buffer) {
    try {
        const data = await (0, pdf_parse_1.default)(buffer);
        // data.text contains all the text extracted from the PDF
        const text = data.text.trim();
        if (!text || text.length < 50) {
            throw new Error('PDF appears to be empty or contains too little text');
        }
        console.log(`✓ Extracted ${text.length} characters from PDF (${data.numpages} pages)`);
        return text;
    }
    catch (error) {
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
function isPDF(mimetype, filename) {
    return (mimetype === 'application/pdf' ||
        filename.toLowerCase().endsWith('.pdf'));
}
