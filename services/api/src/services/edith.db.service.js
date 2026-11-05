const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const auditService = require('./audit.service');
const edithFsService = require('./edith.fs.service');
const { SqlReadOnlyGuard } = require('./edith.db.security');
const { AppError } = require('../middleware/errorHandler');

class EdithDbService {
  /**
   * Discovers SQLite databases: system default database + any SQLite files in the project.
   */
  async getDatabases(userId, projectId) {
    const { canonicalRoot } = await edithFsService.getProjectRoot(userId, projectId);

    const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db');
    const databases = [
      {
        id: 'default',
        name: 'System Database (dev.db)',
        path: 'services/api/prisma/dev.db',
        isDefault: true,
        sizeBytes: fs.existsSync(defaultDbPath)
          ? fs.statSync(defaultDbPath).size
          : 0
      }
    ];

    // Scan project directory for .db, .sqlite, .sqlite3 files (up to depth 3)
    const findDbs = (dir, depth = 0) => {
      if (depth > 3) return;
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (err) {
        return;
      }

      for (const entry of entries) {
        if (['.git', 'node_modules', '.venv', 'venv', '__pycache__'].includes(entry.name)) continue;

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findDbs(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.db', '.sqlite', '.sqlite3'].includes(ext)) {
            const relPath = path.relative(canonicalRoot, fullPath).replace(/\\/g, '/');
            databases.push({
              id: relPath,
              name: entry.name,
              path: relPath,
              isDefault: false,
              sizeBytes: fs.statSync(fullPath).size
            });
          }
        }
      }
    };

    findDbs(canonicalRoot);

    return { databases };
  }

  /**
   * Helper to open read-only database and guarantee safe closure.
   */
  _openReadOnly(targetDbPath) {
    return new DatabaseSync(targetDbPath, { readOnly: true });
  }

  /**
   * Lists all tables and views with row counts.
   */
  async getTables(userId, projectId, databasePath) {
    const { canonicalRoot } = await edithFsService.getProjectRoot(userId, projectId);
    const resolvedPath = SqlReadOnlyGuard.resolveDatabasePath(canonicalRoot, databasePath);

    const db = this._openReadOnly(resolvedPath);
    try {
      const tablesMaster = db
        .prepare(
          "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name ASC"
        )
        .all();

      const tables = [];
      for (const tbl of tablesMaster) {
        let rowCount = 0;
        try {
          // Use bracket-quoted identifier to safely get count
          const safeName = SqlReadOnlyGuard.sanitizeIdentifier(tbl.name);
          const countResult = db.prepare(`SELECT COUNT(*) as count FROM "${safeName}"`).get();
          rowCount = countResult ? countResult.count : 0;
        } catch (e) {
          rowCount = -1;
        }

        tables.push({
          name: tbl.name,
          type: tbl.type,
          rowCount,
          sql: tbl.sql || ''
        });
      }

      return {
        database: path.basename(resolvedPath),
        tables
      };
    } finally {
      db.close();
    }
  }

  /**
   * Inspects column schema, foreign keys, and indexes for a specific table.
   */
  async getTableSchema(userId, projectId, databasePath, tableName) {
    const { canonicalRoot } = await edithFsService.getProjectRoot(userId, projectId);
    const resolvedPath = SqlReadOnlyGuard.resolveDatabasePath(canonicalRoot, databasePath);
    const safeTable = SqlReadOnlyGuard.sanitizeIdentifier(tableName);

    const db = this._openReadOnly(resolvedPath);
    try {
      const columns = db.prepare(`PRAGMA table_info("${safeTable}")`).all();
      const foreignKeys = db.prepare(`PRAGMA foreign_key_list("${safeTable}")`).all();
      const indexes = db.prepare(`PRAGMA index_list("${safeTable}")`).all();

      return {
        tableName: safeTable,
        columns: columns.map((c) => ({
          cid: c.cid,
          name: c.name,
          type: c.type,
          notnull: Boolean(c.notnull),
          defaultValue: c.dflt_value,
          pk: Boolean(c.pk)
        })),
        foreignKeys,
        indexes
      };
    } finally {
      db.close();
    }
  }

  /**
   * Retrieves paginated records for a table.
   */
  async getTableRecords(userId, projectId, databasePath, tableName, page = 1, limit = 50) {
    const { canonicalRoot } = await edithFsService.getProjectRoot(userId, projectId);
    const resolvedPath = SqlReadOnlyGuard.resolveDatabasePath(canonicalRoot, databasePath);
    const safeTable = SqlReadOnlyGuard.sanitizeIdentifier(tableName);

    const parsedLimit = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const db = this._openReadOnly(resolvedPath);
    try {
      const totalResult = db.prepare(`SELECT COUNT(*) as total FROM "${safeTable}"`).get();
      const total = totalResult ? Number(totalResult.total) : 0;
      const totalPages = Math.ceil(total / parsedLimit) || 1;

      const rows = db
        .prepare(`SELECT * FROM "${safeTable}" LIMIT ? OFFSET ?`)
        .all(parsedLimit, offset);

      // Extract column names
      let columns = [];
      if (rows.length > 0) {
        columns = Object.keys(rows[0]);
      } else {
        const schema = db.prepare(`PRAGMA table_info("${safeTable}")`).all();
        columns = schema.map((c) => c.name);
      }

      return {
        tableName: safeTable,
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
        columns,
        rows
      };
    } finally {
      db.close();
    }
  }

  /**
   * Executes a validated read-only SQL query and returns results with execution timing.
   */
  async executeQuery(userId, projectId, databasePath, sql, limit = 100) {
    const { canonicalRoot, workspace } = await edithFsService.getProjectRoot(userId, projectId);
    const resolvedPath = SqlReadOnlyGuard.resolveDatabasePath(canonicalRoot, databasePath);

    // Pre-execution read-only validation
    const validatedSql = SqlReadOnlyGuard.validateQuery(sql);
    const parsedLimit = Math.max(1, Math.min(500, parseInt(limit, 10) || 100));

    // Append limit if query doesn't specify one
    let finalSql = validatedSql;
    if (!/\bLIMIT\s+\d+/i.test(finalSql)) {
      finalSql = `${finalSql} LIMIT ${parsedLimit}`;
    }

    const db = this._openReadOnly(resolvedPath);
    try {
      const startTime = process.hrtime.bigint();
      const rows = db.prepare(finalSql).all();
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1e6;

      let columns = [];
      if (rows.length > 0) {
        columns = Object.keys(rows[0]);
      }

      await auditService.record({
        userId,
        action: 'DB_QUERY_EXECUTED',
        resourceType: 'EdithWorkspace',
        resourceId: workspace.id,
        details: {
          database: path.basename(resolvedPath),
          sql: validatedSql,
          rowCount: rows.length,
          executionTimeMs: Number(executionTimeMs.toFixed(2))
        }
      });

      return {
        query: validatedSql,
        rowCount: rows.length,
        columns,
        rows,
        executionTimeMs: Number(executionTimeMs.toFixed(2))
      };
    } finally {
      db.close();
    }
  }
}

module.exports = new EdithDbService();

