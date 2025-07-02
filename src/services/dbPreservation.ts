import { db } from "@/db";
import { sql } from "drizzle-orm";
import { store } from "@/store";

interface TableRow {
  table_name: string;
}

export async function preserveQuery(query: string, params: any[]) {
  try {
    // Use raw query for migrations table
    const schemaResult = await db.get<{ version: string }>(
      sql`SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1`,
    );

    const snapshot = {
      query,
      parameters: params,
      schemaVersion: schemaResult?.version || "unknown",
      timestamp: new Date().toISOString(),
    };

    store.addDatabaseSnapshot(snapshot);
    return snapshot;
  } catch (error) {
    console.error("Failed to preserve query:", error);
    throw error;
  }
}

export async function verifyQuerySafety(query: string, _params: any[]) {
  // Use raw query for schema inspection
  const tablesResult = await db.all<TableRow>(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
  );

  const unsafePatterns = [
    "DROP TABLE",
    "TRUNCATE",
    "ALTER TABLE",
    "CREATE OR REPLACE",
  ];

  if (unsafePatterns.some((p) => query.includes(p))) {
    throw new Error(`Unsafe query detected: ${query}`);
  }

  const tables = tablesResult.map((row) => row.table_name);
  const referencedTables = extractTablesFromQuery(query);

  for (const table of referencedTables) {
    if (!tables.includes(table)) {
      throw new Error(`Missing table: ${table}`);
    }
  }

  return { safe: true, tables: referencedTables };
}

function extractTablesFromQuery(query: string): string[] {
  const fromMatches = query.match(/FROM\s+([^\s,(;]+)/gi) || [];
  const joinMatches = query.match(/JOIN\s+([^\s,(;]+)/gi) || [];

  return [
    ...new Set(
      [...fromMatches, ...joinMatches].map((match) =>
        match
          .replace(/FROM\s+|JOIN\s+/gi, "")
          .replace(/["']/g, "")
          .trim(),
      ),
    ),
  ];
}
