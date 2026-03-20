export interface DetectedApp {
  framework: "electron" | "tauri" | "flutter" | "qt" | "gtk" | "native" | "unknown";
  processName: string;
  pid: number;
  windowTitle: string;
  debugPort?: number;
  debugUrl?: string;
}

export interface ScreenshotOptions {
  windowTitle?: string;
  resizeWidth?: number;
}

export interface ScreenshotResult {
  base64: string;
  width: number;
  height: number;
  framework: string;
  method: "cdp" | "screencapture" | "accessibility";
}

export interface InspectOptions {
  windowTitle?: string;
  maxDepth?: number;
}

export interface WindowInfo {
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  focused: boolean;
  framework: string;
  pid: number;
}

export interface FindElementOptions {
  text?: string;
  role?: string;
  windowTitle?: string;
}

export interface FoundElement {
  role: string;
  name: string;
  value?: string;
  bounds?: { x: number; y: number; width: number; height: number };
  children?: number;
}
