import fs from 'fs';
import sqlite3 from 'sqlite3';
import { z } from 'zod';

const auditLogSchema = z.object({
    email: z.string().email(),
    action: z.string(),
    timestamp: z.string(),
    hard_deleted: z.boolean(),
}).strict();

export type AuditLogEntry = z.infer<typeof auditLogSchema>;

function run(db: sqlite3.Database, sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

export async function ingestAuditLog(jsonlPath: string, dbPath: string): Promise<void> {
    const db = new sqlite3.Database(dbPath);
    await run(db, `CREATE TABLE IF NOT EXISTS audit_log (
        email TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        hard_deleted INTEGER NOT NULL CHECK (hard_deleted IN (0,1))
    )`);

    const contents = fs.readFileSync(jsonlPath, 'utf8');
    const lines = contents.split(/\r?\n/).filter((line) => line.trim().length);

    for (const line of lines) {
        const parsed: AuditLogEntry = auditLogSchema.parse(JSON.parse(line));
        await run(
            db,
            `INSERT INTO audit_log (email, action, timestamp, hard_deleted) VALUES (?,?,?,?)`,
            [
                parsed.email,
                parsed.action,
                parsed.timestamp,
                parsed.hard_deleted ? 1 : 0,
            ],
        );
    }

    db.close();
}
