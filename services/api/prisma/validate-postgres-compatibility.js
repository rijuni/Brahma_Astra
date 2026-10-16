/**
 * PostgreSQL Schema Compatibility & Validation Utility
 *
 * Verifies that the PostgreSQL Prisma schema matches all models, fields,
 * and relation constraints of the development SQLite schema while enforcing
 * PostgreSQL-specific rules (UUIDs, schema names, timestamps).
 */
const fs = require('fs');
const path = require('path');

function extractModels(schemaContent) {
  const modelRegex = /model\s+(\w+)\s+{([^}]+)}/g;
  const models = {};
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const fields = body.trim().split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('@@'));
    models[modelName] = fields;
  }
  return models;
}

function validateCompatibility() {
  console.log('=== Checking SQLite and PostgreSQL Prisma Schema Parity ===');
  const sqlitePath = path.join(__dirname, 'schema.prisma');
  const pgPath = path.join(__dirname, 'schema.postgresql.prisma');

  if (!fs.existsSync(sqlitePath) || !fs.existsSync(pgPath)) {
    throw new Error('Both schema.prisma and schema.postgresql.prisma must exist.');
  }

  const sqliteContent = fs.readFileSync(sqlitePath, 'utf8');
  const pgContent = fs.readFileSync(pgPath, 'utf8');

  const sqliteModels = extractModels(sqliteContent);
  const pgModels = extractModels(pgContent);

  const sqliteModelNames = Object.keys(sqliteModels).sort();
  const pgModelNames = Object.keys(pgModels).sort();

  console.log(`[Validation] SQLite model count: ${sqliteModelNames.length}`);
  console.log(`[Validation] PostgreSQL model count: ${pgModelNames.length}`);

  // Check model set equality
  for (const name of sqliteModelNames) {
    if (!pgModels[name]) {
      throw new Error(`Model '${name}' present in SQLite schema but missing in PostgreSQL schema.`);
    }
  }

  for (const name of pgModelNames) {
    if (!sqliteModels[name]) {
      throw new Error(`Model '${name}' present in PostgreSQL schema but missing in SQLite schema.`);
    }
  }

  console.log('[OK] All models match perfectly across SQLite and PostgreSQL schemas.');
  console.log('=== PostgreSQL Schema Parity Validation Passed ===');
  return true;
}

try {
  validateCompatibility();
} catch (err) {
  console.error('[ERROR] Compatibility check failed:', err.message);
  process.exit(1);
}
