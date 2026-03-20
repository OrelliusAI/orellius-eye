import type { ScreenshotOptions, ScreenshotResult } from "../types.js";
import { captureChromium } from "./chromium.js";
import { captureNative } from "./native.js";
import { detectApps } from "../detector.js";

export async function captureScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
  const apps = await detectApps();

  // Find target app by title match, or use the first detected app
  const target = options.windowTitle
    ? apps.find(app => app.windowTitle.toLowerCase().includes(options.windowTitle!.toLowerCase()))
    : apps[0];

  // Try CDP capture for Chromium-based apps (Electron, Tauri with WebView)
  if (target?.debugPort || target?.framework === "electron" || target?.framework === "tauri") {
    try {
      return await captureChromium({
        port: target.debugPort ?? 9222,
        resizeWidth: options.resizeWidth ?? 1024,
      });
    } catch (error) {
      console.error("[thunder-eye] CDP capture failed, falling back to native:", error);
    }
  }

  // Fallback: OS-level screen capture
  return captureNative({
    windowTitle: options.windowTitle ?? target?.windowTitle,
    resizeWidth: options.resizeWidth ?? 1024,
  });
}
