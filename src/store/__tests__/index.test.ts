import { store } from "../index";

describe("Store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("should register components", () => {
    const componentData = {
      originalProps: { test: true },
      styleHashes: ["hash1"],
      componentTree: "div > button",
    };

    store.registerComponent("TestComponent", componentData);
    const result = store.getComponent("TestComponent");

    expect(result).toEqual(componentData);
  });

  test("should handle database snapshots", () => {
    const snapshot = {
      query: "SELECT 1",
      parameters: [],
      schemaVersion: "1",
      timestamp: new Date().toISOString(),
    };

    store.addDatabaseSnapshot(snapshot);
    const snapshots = store.getDatabaseSnapshots();

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].query).toBe("SELECT 1");
  });
});
