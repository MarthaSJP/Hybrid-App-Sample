export type BridgeErrorCode = "METHOD_NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_ERROR" | "TIMEOUT";

export type BridgeError = {
  code: BridgeErrorCode;
  message: string;
};

export type CommandRequest = {
  id: string;
  method: string;
  payload?: unknown;
};

export type CommandResponse = {
  id: string;
  ok: boolean;
  result?: Record<string, unknown>;
  error?: BridgeError;
};

export type DeviceInfo = {
  platform: string;
  systemName: string;
  systemVersion: string;
  model: string;
};

export type HapticStyle = "light" | "medium" | "heavy";

export type MobileAgentContext = {
  sessionId: string;
  uuid: string;
};
