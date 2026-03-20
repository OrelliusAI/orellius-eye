import type { InspectOptions } from "../types.js";
import { inspectChromium } from "./chromium.js";
import { inspectNative } from "./native.js";
import { detectApps } from "../detector.js";

export async function inspectUI(options: InspectOptions): Promise<string> {
  const apps = await detectApps();

  const target = options.windowTitle
    ? apps.find(app => app.windowTitle.toLowerCase().includes(options.windowTitle!.toLowerCase()))
    : apps[0];

  // Try CDP inspection for Chromium-based apps (highest fidelity)
  if (target?.debugPort || target?.framework === "electron" || target?.framework === "tauri") {
    try {
      return await inspectChromium({
        port: target.debugPort ?? 9222,
        maxDepth: options.maxDepth ?? 5,
      });
    } catch (error) {
      console.error("[thunder-eye] CDP inspect failed, falling back to native:", error);
    }
  }

  // Fallback: OS accessibility APIs
  return inspectNative(options);
}
