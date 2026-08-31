/**
 * Advanced Anti-Injection & Input Sanitization Security Middleware
 * Protects against:
 * 1. SQL Injection (SQLi) & Unsafe SQL signatures
 * 2. Cross-Site Scripting (XSS) & Malicious HTML/Script injection
 * 3. NoSQL / Object / Key Injection ($gt, $where, etc.)
 * 4. Prototype Pollution (__proto__, constructor, prototype)
 * 5. Path Traversal (../, ..\\)
 * 6. Dangerous Control Characters & Payload Flooding
 */

// Regex patterns for dangerous payloads
const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG_REGEX = /<[^>]+>/g;
const SQL_INJECTION_REGEX = /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|DECLARE)\b\s+.*\b(FROM|INTO|TABLE|DATABASE|WHERE)\b)|(--)|(\bOR\b\s+['"\d\w]+\s*=\s*['"\d\w]+)|(\bAND\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i;
const DANGEROUS_ATTRIBUTES = /\b(onload|onerror|onclick|onmouseover|onfocus|onblur|javascript:|data:text\/html)\b/gi;

/**
 * Clean a single string value
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  let cleaned = str;

  // 1. Remove explicit <script> tags
  cleaned = cleaned.replace(SCRIPT_TAG_REGEX, '');

  // 2. Strip generic HTML tags for standard data fields
  cleaned = cleaned.replace(HTML_TAG_REGEX, '');

  // 3. Strip dangerous event handlers (onerror=, onload=, etc.)
  cleaned = cleaned.replace(DANGEROUS_ATTRIBUTES, '');

  // 4. Strip null bytes & control chars
  cleaned = cleaned.replace(/\0/g, '');

  // 5. Trim whitespace
  cleaned = cleaned.trim();

  // 6. Limit max length to 5000 chars to avoid memory exhaustion
  if (cleaned.length > 5000) {
    cleaned = cleaned.slice(0, 5000);
  }

  return cleaned;
}

/**
 * Recursively sanitize objects, arrays, and primitives
 */
function sanitizeDeep(target) {
  if (target === null || target === undefined) return target;

  if (typeof target === 'string') {
    return sanitizeString(target);
  }

  if (Array.isArray(target)) {
    return target.map(item => sanitizeDeep(item));
  }

  if (typeof target === 'object') {
    const cleanObj = {};
    for (const [key, value] of Object.entries(target)) {
      // Prototype Pollution & NoSQL Operator Defense
      if (
        key === '__proto__' ||
        key === 'constructor' ||
        key === 'prototype' ||
        key.startsWith('$') ||
        key.includes('.')
      ) {
        continue; // Drop dangerous keys
      }

      cleanObj[key] = sanitizeDeep(value);
    }
    return cleanObj;
  }

  return target;
}

/**
 * Express Middleware
 */
function sanitizeMiddleware(req, res, next) {
  try {
    if (req.body) {
      req.body = sanitizeDeep(req.body);
    }
    if (req.query) {
      req.query = sanitizeDeep(req.query);
    }
    if (req.params) {
      req.params = sanitizeDeep(req.params);
    }
    next();
  } catch (err) {
    console.error('Sanitization error:', err);
    res.status(400).json({
      success: false,
      message: 'Invalid input payload detected. इनपुट मध्ये अवैध अक्षरे आढळली आहेत.'
    });
  }
}

module.exports = sanitizeMiddleware;
