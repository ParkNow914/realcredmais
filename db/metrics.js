import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.CHAT_DB_PATH || path.join(__dirname, '..', 'data', 'chat_metrics.db');

// Ensure data directory
import fs from 'fs';
try {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
} catch (e) {
  console.warn('Could not create data directory', e.message);
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    estimated_cost_usd REAL,
    ip TEXT,
    user_agent TEXT,
    streaming INTEGER DEFAULT 0
  )
`);

export function insertMetric({ timestamp, model, prompt_tokens, completion_tokens, estimated_cost_usd, ip, userAgent, streaming = 0 }) {
  const stmt = db.prepare(`INSERT INTO chat_metrics (timestamp, model, prompt_tokens, completion_tokens, estimated_cost_usd, ip, user_agent, streaming)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(timestamp, model, prompt_tokens || 0, completion_tokens || 0, estimated_cost_usd || 0, ip || '', userAgent || '', streaming ? 1 : 0);
}

export function getMetrics(limit = 200) {
  const stmt = db.prepare('SELECT * FROM chat_metrics ORDER BY id DESC LIMIT ?');
  return stmt.all(limit);
}
