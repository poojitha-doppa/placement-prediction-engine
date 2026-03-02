/**
 * Resume Text Extraction Service
 * Extracts text from PDF and DOCX files
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

/**
 * Extract text from PDF file using pdf-parse
 * @param filePath - Absolute path to PDF file
 * @returns Extracted text content
 */
async function extractFromPDF(filePath: string): Promise<string> {
  try {
    console.log(`📄 Extracting text from PDF: ${filePath}`);
    
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    const text = data.text.trim();
    
    if (!text || text.length < 50) {
      throw new Error('PDF appears to be empty or contains insufficient text');
    }
    
    console.log(`✅ Extracted ${text.length} characters from PDF`);
    return text;
  } catch (error: any) {
    console.error('❌ PDF extraction error:', error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file using mammoth
 * @param filePath - Absolute path to DOCX file
 * @returns Extracted text content
 */
async function extractFromDOCX(filePath: string): Promise<string> {
  try {
    console.log(`📄 Extracting text from DOCX: ${filePath}`);
    
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value.trim();
    
    if (!text || text.length < 50) {
      throw new Error('DOCX appears to be empty or contains insufficient text');
    }
    
    if (result.messages.length > 0) {
      console.warn('⚠️  DOCX extraction warnings:', result.messages);
    }
    
    console.log(`✅ Extracted ${text.length} characters from DOCX`);
    return text;
  } catch (error: any) {
    console.error('❌ DOCX extraction error:', error.message);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

/**
 * Main function to extract text from resume file
 * Automatically detects file type and uses appropriate extractor
 * @param filePath - Absolute path to resume file (PDF or DOCX)
 * @returns Extracted text content
 */
export async function extractResumeText(filePath: string): Promise<string> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    
    console.log(`🔍 Detected file type: ${ext}`);
    
    let extractedText: string;
    
    // Extract based on file type
    if (ext === '.pdf') {
      extractedText = await extractFromPDF(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
      extractedText = await extractFromDOCX(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}. Only PDF and DOCX are supported.`);
    }
    
    // Clean up the text
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
      .replace(/\t/g, ' ')  // Replace tabs with spaces
      .replace(/\s{2,}/g, ' ')  // Remove excessive spaces
      .trim();
    
    if (cleanedText.length < 100) {
      throw new Error('Extracted text is too short. Resume may be corrupted or image-based.');
    }
    
    console.log(`✅ Successfully extracted and cleaned ${cleanedText.length} characters`);
    return cleanedText;
    
  } catch (error: any) {
    console.error('❌ Resume extraction failed:', error.message);
    throw error;
  }
}

/**
 * Validate if file is a supported resume format
 * @param filename - Name of the file
 * @returns true if supported, false otherwise
 */
export function isSupportedResumeFormat(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ['.pdf', '.doc', '.docx'].includes(ext);
}

/**
 * Get file size in MB
 * @param filePath - Path to file
 * @returns File size in MB
 */
export function getFileSizeMB(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}
