export interface FileOperationError {
  success: false;
  error: string;
}

export interface ReadFileResult {
  success: true;
  data: string;
}

export interface WriteFileResult {
  success: true;
}

export interface DeleteFileResult {
  success: true;
}

export type IpcOperationResult<T = void> =
  | (T extends void ? WriteFileResult | DeleteFileResult : ReadFileResult)
  | FileOperationError;

export interface AppOutput {
  type: string;
  message: string;
  appId: number;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatsResponse {
  chats: Chat[];
}

export interface ChatResponseEnd {
  chatId: string;
}

export interface UserSettings {
  theme: string;
  locale: string;
  autoUpdate: boolean;
  analyticsEnabled: boolean;
}

export interface SystemPlatformInfo {
  platform: "win32" | "darwin" | "linux";
  arch: string;
  version: string;
  memory: number;
}

export interface ListAppsResponse {
  apps: {
    id: string;
    name: string;
    version: string;
    status: "running" | "stopped";
  }[];
}

export interface CreateAppParams {}
export interface CreateAppResult {}
export interface Message {}
export interface Version {}
export interface NodeSystemInfo {
  platform: string;
  arch: string;
  release: string;
  totalMemory: number;
  freeMemory: number;
  cpus: {
    model: string;
    speed: number;
    times: {
      user: number;
      nice: number;
      sys: number;
      idle: number;
      irq: number;
    };
  }[];
}

export interface SystemDebugInfo {}
export interface LocalModel {}
export interface TokenCountParams {}
export interface TokenCountResult {}
export interface ChatLogsData {}
export interface BranchResult {}
export interface LanguageModelProvider {}
export interface LanguageModel {}
export interface CreateCustomLanguageModelProviderParams {}
export interface CreateCustomLanguageModelParams {}
export interface DoesReleaseNoteExistParams {}
export interface ApproveProposalResult {}
export interface ImportAppResult {}
export interface ImportAppParams {}
export interface RenameBranchParams {}
export interface UserBudgetInfo {
  usedCredits: number;
  totalCredits: number;
  budgetResetDate: Date;
}
export interface CopyAppParams {}
export interface App {}
export interface ComponentSelection {}
export interface AppUpgrade {}
export interface ReadFileParams {}
export interface WriteFileParams {}
export interface DeleteFileParams {}

export const UserBudgetInfoSchema = {
  parse: (input: {
    usedCredits: number;
    totalCredits: number;
    budgetResetDate: Date | string;
  }) => ({
    usedCredits: input.usedCredits,
    totalCredits: input.totalCredits,
    budgetResetDate:
      input.budgetResetDate instanceof Date
        ? input.budgetResetDate
        : new Date(input.budgetResetDate),
  }),
};
