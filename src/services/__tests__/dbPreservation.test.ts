import { preserveQuery, verifyQuerySafety } from "../dbPreservation";
import { store } from "@/store";

// Mock the database module
jest.mock("@/db", () => ({
  db: {
    get: jest.fn(),
    all: jest.fn(),
  },
}));

// Mock the store module
jest.mock("@/store", () => ({
  store: {
    addDatabaseSnapshot: jest.fn(),
    getDatabaseSnapshots: jest.fn(),
  },
}));

describe("Database Preservation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should preserve queries with schema version", async () => {
    const { db } = require("@/db");
    const mockQuery = "SELECT * FROM users";
    const mockParams = [1];
    const mockVersion = "20240630000000";

    db.get.mockResolvedValue({ version: mockVersion });

    const snapshot = await preserveQuery(mockQuery, mockParams);

    expect(snapshot.query).toBe(mockQuery);
    expect(snapshot.parameters).toEqual(mockParams);
    expect(snapshot.schemaVersion).toBe(mockVersion);
    expect(store.addDatabaseSnapshot).toHaveBeenCalledWith(snapshot);
  });

  it("should reject unsafe queries", async () => {
    await expect(verifyQuerySafety("DROP TABLE users", [])).rejects.toThrow(
      "Unsafe query detected",
    );
  });

  it("should verify table existence", async () => {
    const { db } = require("@/db");
    db.all.mockResolvedValue([{ table_name: "users" }]);

    await expect(
      verifyQuerySafety("SELECT * FROM non_existent", []),
    ).rejects.toThrow("Missing table");
  });
});
