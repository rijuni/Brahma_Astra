const fs = require('fs');
const path = require('path');
const { FilesystemSecurityGuard } = require('./edith.fs.security');
const { AppError } = require('../middleware/errorHandler');

// Prohibited SQL tokens that mutate data, alter schema, or execute administrative commands
const PROHIBITED_SQL_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'ALTER',
  'CREATE',
  'REPLACE',
  'ATTACH',
  'DETACH',
  'TRUNCATE',
  'VACUUM',
  'REINDEX',
  'EXEC',
  'EXECUTE',
  'INTO',
  'GRANT',
  'REVOKE',
  'COMMIT',
  'ROLLBACK',
  'BEGIN',
  'TRANSACTION',
  'SAVEPOINT',
  'UPSERT',
  'LOAD_EXTENSION'
];

const PROHIBITED_REGEX = new RegExp(`\\b(${PROHIBITED_SQL_KEYWORDS.join('|')})\\b`, 'i');

class SqlReadOnlyGuard {
  /**
   * Validates that an SQL statement is strictly read-only and safe to execute.
   * @param {string} sql
   * @returns {string} Cleaned, single-statement SQL query
   */
  static validateQuery(sql) {
    if (!sql || typeof sql !== 'string' || !sql.trim()) {
      throw new AppError('SQL query cannot be empty.', 400, 'EMPTY_QUERY');
    }

    const trimmed = sql.trim();

    // 1. Block multiple statements (semicolon injection)
    if (trimmed.includes(';')) {
      // Disallow semicolons completely in read-only console
      throw new AppError(
        'Multiple statements or semicolon delimiters (";") are not permitted.',
        400,
        'MULTIPLE_STATEMENTS_NOT_ALLOWED'
      );
    }

    // 2. Block SQL comments to prevent parser evasion
    if (trimmed.includes('--') || trimmed.includes('/*') || trimmed.includes('*/')) {
      throw new AppError(
        'SQL comments ("--", "/*", "*/") are not permitted in queries.',
        400,
        'COMMENTS_NOT_ALLOWED'
      );
    }

    // 3. Must begin with safe read operations: SELECT, EXPLAIN, WITH ... SELECT, or PRAGMA table_info
    const startsWithAllowed =
      /^\s*SELECT\b/i.test(trimmed) ||
      /^\s*EXPLAIN\b/i.test(trimmed) ||
      /^\s*WITH\b/i.test(trimmed) ||
      /^\s*PRAGMA\s+(table_info|table_xinfo|index_list|index_info|foreign_key_list)\s*\(/i.test(trimmed);

    if (!startsWithAllowed) {
      throw new AppError(
        'Invalid query: only read-only statements (SELECT, EXPLAIN, WITH, or table PRAGMAs) are allowed.',
        403,
        'READ_ONLY_VIOLATION'
      );
    }

    // 4. Token-level check for prohibited mutation keywords
    const prohibitedMatch = trimmed.match(PROHIBITED_REGEX);
    if (prohibitedMatch) {
      throw new AppError(
        `Forbidden SQL operation "${prohibitedMatch[0].toUpperCase()}": database explorer is strictly read-only.`,
        403,
        'READ_ONLY_VIOLATION'
      );
    }

    return trimmed;
  }

  /**
   * Sanitizes an identifier such as table or column name.
   * @param {string} identifier
   * @returns {string} Sanitized identifier
   */
  static sanitizeIdentifier(identifier) {
    if (!identifier || typeof identifier !== 'string') {
      throw new AppError('Identifier must be a non-empty string.', 400, 'INVALID_IDENTIFIER');
    }

    const trimmed = identifier.trim();
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      throw new AppError(
        `Invalid identifier name "${identifier}". Only alphanumeric characters and underscores are allowed.`,
        400,
        'INVALID_IDENTIFIER'
      );
    }

    return trimmed;
  }

  /**
   * Resolves and verifies the target SQLite database path.
   * Allows either the system dev.db or a project-internal .db / .sqlite file.
   * @param {string} canonicalRoot
   * @param {string} [customDbPath]
   * @returns {string} Canonical absolute database file path
   */
  static resolveDatabasePath(canonicalRoot, customDbPath) {
    // If not specified or requested 'default', resolve to services/api/prisma/dev.db
    if (!customDbPath || customDbPath === 'default' || customDbPath === 'system') {
      const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db');
      if (!fs.existsSync(defaultDbPath)) {
        throw new AppError(`Default database file not found at: ${defaultDbPath}`, 404, 'DB_FILE_NOT_FOUND');
      }
      return fs.realpathSync(defaultDbPath);
    }

    // Check allowed extension
    const ext = path.extname(customDbPath).toLowerCase();
    if (!['.db', '.sqlite', '.sqlite3'].includes(ext)) {
      throw new AppError('Database file must have a .db, .sqlite, or .sqlite3 extension.', 400, 'INVALID_DB_EXTENSION');
    }

    // Verify enclosure inside project canonical root
    const { absolutePath, exists } = FilesystemSecurityGuard.resolveAndVerify(canonicalRoot, customDbPath, {
      allowMissing: false,
      disallowRoot: true
    });

    if (!exists) {
      throw new AppError(`Database file not found: "${customDbPath}"`, 404, 'DB_FILE_NOT_FOUND');
    }

    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
      throw new AppError(`Specified path is not a file: "${customDbPath}"`, 400, 'INVALID_DB_PATH');
    }

    return fs.realpathSync(absolutePath);
  }
}

module.exports = {
  SqlReadOnlyGuard,
  PROHIBITED_SQL_KEYWORDS
};

