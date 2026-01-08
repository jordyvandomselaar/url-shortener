import { nanoid, customAlphabet } from 'nanoid';

// Use a custom alphabet that excludes ambiguous characters (0, O, I, l)
// and focuses on memorable, easy-to-type characters
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const generateId = customAlphabet(alphabet, 6);

/**
 * Generates a short, memorable code for URLs
 * @returns A 6-character short code using unambiguous characters
 */
export function generateShortCode(): string {
  return generateId();
}

/**
 * Validates if a string is a valid short code format
 * @param code - The code to validate
 * @returns true if the code matches the expected format
 */
export function isValidShortCode(code: string): boolean {
  if (code.length !== 6) {
    return false;
  }

  // Check if all characters are in our alphabet
  return code.split('').every(char => alphabet.includes(char));
}
