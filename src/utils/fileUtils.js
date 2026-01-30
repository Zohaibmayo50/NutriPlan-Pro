/**
 * File Utilities
 * Handles file uploads and text extraction
 */

/**
 * Extract text from a .txt file
 * @param {File} file - The text file
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromTxt = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read text file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Extract text from a .docx file
 * Note: This is a placeholder. For production, use a library like mammoth.js
 * @param {File} file - The docx file
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromDocx = async (file) => {
  // TODO: Implement proper DOCX parsing with mammoth.js or similar
  // For now, return a placeholder message
  return `[DOCX file uploaded: ${file.name}]\n\nNote: DOCX parsing not yet implemented. Please paste the text manually or use a .txt file.`;
};

/**
 * Extract text from a file based on its type
 * @param {File} file - The uploaded file
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromFile = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Check file type
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await extractTextFromTxt(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractTextFromDocx(file);
  } else {
    throw new Error('Unsupported file type. Please upload a .txt or .docx file.');
  }
};

/**
 * Validate file for plan upload
 * @param {File} file - The file to validate
 * @returns {object} - Validation result { valid: boolean, error: string }
 */
export const validatePlanFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.txt', '.docx'];
  
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!allowedTypes.includes(file.type) && !hasValidExtension) {
    return {
      valid: false,
      error: 'Please upload a .txt or .docx file'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { valid: true, error: null };
};
