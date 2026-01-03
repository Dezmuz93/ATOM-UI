export type Message = {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

export type Device = {
  id: string;
  name: string;
  type: "light" | "switch" | "sensor";
  state: string | number | boolean;
};

export interface SystemStatus {
  llmStatus: 'Running' | 'Idle';
  embeddingsServer: 'Online' | 'Offline';
  chromaDb: 'Connected' | 'Disconnected';
  judgeModel: 'Sleeping' | 'Processing';
  ttsMode: 'Piper' | 'Edge';
  stt: 'Listening' | 'Idle';
}

export interface Tool {
  name: string;
  description: string;
  parameters: string[];
}

export interface MemoryItem {
  id: string;
  content: string;
  timestamp: string;
}
