import { z } from "zod";
import { NavigationStateSchema } from "../lib/schemas";

interface ComponentRegistry {
  originalProps: Record<string, unknown>;
  styleHashes: string[];
  componentTree: string;
}

interface DatabaseSnapshot {
  query: string;
  parameters: any[];
  schemaVersion: string;
  timestamp: string;
}

interface StylePreservation {
  cssHash: string;
  variables: Record<string, string>;
}

interface UIRegistry {
  componentTree: string;
  props: Record<string, unknown>;
  styles: StylePreservation;
  position: DOMRectReadOnly;
}

type NavigationState = z.infer<typeof NavigationStateSchema>;

type Registry = Record<string, ComponentRegistry>;
type DatabaseSnapshots = DatabaseSnapshot[];

const componentRegistry: Registry = {};
const dbSnapshotsKey = "db_snapshots";
const uiStateKey = "ui_state";
const navStateKey = "nav_state";

export const store = {
  registerComponent(name: string, data: ComponentRegistry) {
    componentRegistry[name] = data;
  },

  unregisterComponent(name: string) {
    delete componentRegistry[name];
  },

  getComponent(name: string): ComponentRegistry | undefined {
    return componentRegistry[name];
  },

  addDatabaseSnapshot(snapshot: DatabaseSnapshot) {
    const snapshots = this.getDatabaseSnapshots();
    snapshots.push(snapshot);
    localStorage.setItem(dbSnapshotsKey, JSON.stringify(snapshots));
  },

  getDatabaseSnapshots(): DatabaseSnapshots {
    return JSON.parse(localStorage.getItem(dbSnapshotsKey) || "[]");
  },

  registerUISnapshot(componentId: string, data: UIRegistry) {
    const uiState = JSON.parse(localStorage.getItem(uiStateKey) || "{}");
    uiState[componentId] = data;
    localStorage.setItem(uiStateKey, JSON.stringify(uiState));
  },

  registerNavigationState(state: NavigationState) {
    localStorage.setItem(navStateKey, JSON.stringify(state));
  },

  getNavigationState(): NavigationState | null {
    const stored = localStorage.getItem(navStateKey);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);

      // Version migration for legacy state
      if (!parsed.version) {
        const migrated = {
          version: 1 as const, // Match schema's literal type
          currentRoute: parsed.path,
          routeParams: {},
          navigationHistory: parsed.breadcrumbs,
        };
        localStorage.setItem(navStateKey, JSON.stringify(migrated));
        return migrated;
      }

      return NavigationStateSchema.parse(parsed);
    } catch (error) {
      console.error("Failed to parse navigation state:", error);
      localStorage.removeItem(navStateKey);
      return null;
    }
  },

  verifyComponentChanges(name: string, newProps: Record<string, unknown>) {
    const registered = componentRegistry[name];
    if (!registered) return { isValid: false, reason: "Not registered" };

    const propDiffs = Object.keys(registered.originalProps)
      .filter((key) => registered.originalProps[key] !== newProps[key])
      .map((key) => ({ prop: key }));

    return {
      isValid: propDiffs.length === 0,
      propDiffs,
    };
  },
};

export type {
  ComponentRegistry,
  DatabaseSnapshot,
  UIRegistry,
  NavigationState,
};
