import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';
import initSqlJs, { type Database as SqlJsDatabase, type SqlValue } from 'sql.js';
import { MIGRATIONS } from './migrations';

export type Param = string | number | null | Uint8Array | boolean;
type Row = Record<string, SqlValue>;

/**
 * SQLite embarcado via sql.js (WebAssembly): sem módulos nativos, o que torna o
 * empacotamento no Windows previsível. O banco vive em memória e é gravado de
 * forma atômica (arquivo temporário + rename) ao final de cada transação.
 */
export class Database {
  private txDepth = 0;
  private dirty = false;

  private constructor(
    private readonly db: SqlJsDatabase,
    private readonly filePath: string | null,
  ) {
    this.applyPragmas();
  }

  static async open(filePath: string | null, wasmPath?: string): Promise<Database> {
    const SQL = await initSqlJs(wasmPath ? { locateFile: () => wasmPath } : undefined);
    let db: SqlJsDatabase;
    if (filePath && existsSync(filePath)) {
      // Cópia de segurança do último estado válido antes de migrar/abrir.
      copyFileSync(filePath, `${filePath}.bak`);
      db = new SQL.Database(readFileSync(filePath));
    } else {
      db = new SQL.Database();
    }
    const database = new Database(db, filePath);
    database.migrate();
    return database;
  }

  private applyPragmas(): void {
    this.db.run('PRAGMA foreign_keys = ON;');
  }

  private migrate(): void {
    this.db.run('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)');
    const applied = new Set(this.all<{ version: number }>('SELECT version FROM schema_migrations').map((r) => r.version));
    for (const m of MIGRATIONS) {
      if (applied.has(m.version)) continue;
      this.transaction(() => {
        this.db.run(m.sql);
        this.run('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)', [m.version, m.name, new Date().toISOString()]);
      });
    }
    this.persist();
  }

  get schemaVersion(): number {
    return this.get<{ v: number }>('SELECT MAX(version) AS v FROM schema_migrations')?.v ?? 0;
  }

  run(sql: string, params: Param[] = []): number {
    this.db.run(sql, params.map(norm));
    this.dirty = true;
    const changes = this.db.getRowsModified();
    if (this.txDepth === 0) this.persist();
    return changes;
  }

  all<T>(sql: string, params: Param[] = []): T[] {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params.map(norm));
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as Row as T);
      return rows;
    } finally {
      stmt.free();
    }
  }

  get<T>(sql: string, params: Param[] = []): T | undefined {
    return this.all<T>(sql, params)[0];
  }

  /** Transação aninhável (SAVEPOINT). Persiste no disco ao final da mais externa. */
  transaction<T>(fn: () => T): T {
    const name = `sp_${this.txDepth}`;
    this.db.run(`SAVEPOINT ${name}`);
    this.txDepth += 1;
    try {
      const result = fn();
      this.txDepth -= 1;
      this.db.run(`RELEASE ${name}`);
      if (this.txDepth === 0) this.persist();
      return result;
    } catch (err) {
      this.txDepth -= 1;
      this.db.run(`ROLLBACK TO ${name}`);
      this.db.run(`RELEASE ${name}`);
      throw err;
    }
  }

  persist(): void {
    if (!this.filePath || !this.dirty) return;
    mkdirSync(dirname(this.filePath), { recursive: true });
    const data = this.db.export();
    // export() reabre o banco internamente e zera PRAGMAs.
    this.applyPragmas();
    const tmp = `${this.filePath}.tmp`;
    writeFileSync(tmp, data);
    renameSync(tmp, this.filePath);
    this.dirty = false;
  }

  close(): void {
    this.persist();
    this.db.close();
  }
}

function norm(p: Param): SqlValue {
  if (typeof p === 'boolean') return p ? 1 : 0;
  return p;
}
