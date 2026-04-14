import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const sqliteFile = path.join(dbPath, 'app.db');
export const db = new Database(sqliteFile);

db.pragma('journal_mode = WAL');