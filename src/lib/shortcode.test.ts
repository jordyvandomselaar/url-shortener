import { describe, it, expect } from 'vitest';
import { generateShortCode, isValidShortCode } from './shortcode.js';

describe('shortcode', () => {
  describe('generateShortCode', () => {
    it('should generate a 6 character code', () => {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
    });

    it('should only contain valid characters', () => {
      const code = generateShortCode();
      const validChars = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz]+$/;
      expect(code).toMatch(validChars);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode());
      }
      // Should generate mostly unique codes
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe('isValidShortCode', () => {
    it('should return true for valid codes', () => {
      expect(isValidShortCode('abc123')).toBe(true);
      expect(isValidShortCode('XYZ789')).toBe(true);
      expect(isValidShortCode('AbCdEf')).toBe(true);
    });

    it('should return false for invalid lengths', () => {
      expect(isValidShortCode('abc')).toBe(false);
      expect(isValidShortCode('abcdefg')).toBe(false);
      expect(isValidShortCode('')).toBe(false);
    });

    it('should return false for invalid characters', () => {
      expect(isValidShortCode('abc0ef')).toBe(false); // Contains 0
      expect(isValidShortCode('abcOef')).toBe(false); // Contains O
      expect(isValidShortCode('abcIef')).toBe(false); // Contains I
      expect(isValidShortCode('abclef')).toBe(false); // Contains l
      expect(isValidShortCode('abc-ef')).toBe(false); // Contains -
    });
  });
});
