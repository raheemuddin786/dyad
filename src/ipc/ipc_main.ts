import { ipcMain } from "electron";
import fs from "fs/promises";
import { IpcOperationResult } from "./ipc_types";

export function initIpcFileHandlers() {
  ipcMain.handle(
    "readFile",
    async (_, path: string): Promise<IpcOperationResult<string>> => {
      try {
        const content = await fs.readFile(path, "utf-8");
        return { success: true, data: content };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );

  ipcMain.handle(
    "writeFile",
    async (
      _,
      path: string,
      content: string,
    ): Promise<IpcOperationResult<void>> => {
      try {
        await fs.writeFile(path, content, "utf-8");
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );

  ipcMain.handle(
    "deleteFile",
    async (_, path: string): Promise<IpcOperationResult<void>> => {
      try {
        await fs.unlink(path);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );
  export function _initIpcSystemInfoHandlers() {
    ipcMain.handle(
      "getSystemInfo",
      async (): Promise<IpcOperationResult<SystemInfo>> => {
        try {
          const os = require("os");
          return {
            success: true,
            data: {
              platform: os.platform(),
              arch: os.arch(),
              totalMemory: os.totalmem(),
              freeMemory: os.freemem(),
              cpus: os.cpus().length,
              uptime: os.uptime(),
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    );
  }
}
