import { preserveQuery, verifyQuerySafety } from "../dbPreservation";

// Mock the database and store modules
jest.mock("@/db", () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
  },
}));

jest.mock("@/store", () => ({
  store: {
    addDatabaseSnapshot: jest.fn(),
    getDatabaseSnapshots: jest.fn(() => []),
  },
}));

describe("Database Preservation Verification", () => {
  const { db } = require("@/db");
  const { _store } = require("@/store");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handles empty queries", async () => {
    await expect(preserveQuery("", [])).rejects.toThrow("Invalid query");
  });

  test("verifies malformed SQL", async () => {
    await expect(verifyQuerySafety("SELEC * FRM users", [])).rejects.toThrow(
      "Syntax error",
    );
  });

  test("handles missing schema version", async () => {
    db.get.mockImplementation(() => Promise.resolve(null));
    const snapshot = await preserveQuery("SELECT 1", []);
    expect(snapshot.schemaVersion).toBe("unknown");
  });

  test("validates parameterized queries", async () => {
    db.all.mockImplementation(() => Promise.resolve([{ table_name: "users" }]));
    const result = await verifyQuerySafety("SELECT * FROM users WHERE id = ?", [
      1,
    ]);
    expect(result.safe).toBe(true);
  });

  test("rejects cross-database queries", async () => {
    await expect(
      verifyQuerySafety("SELECT * FROM other_db.users", []),
    ).rejects.toThrow("Cross-database reference");
  });
});
