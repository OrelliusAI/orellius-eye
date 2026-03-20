import { execSync } from "node:child_process";
import type { DetectedApp } from "./types.js";

export async function detectApps(): Promise<DetectedApp[]> {
  const platform = process.platform;
  const apps: DetectedApp[] = [];

  if (platform === "darwin") {
    apps.push(...detectMacOS());
  } else if (platform === "linux") {
    apps.push(...detectLinux());
  }

  return apps;
}

function detectMacOS(): DetectedApp[] {
  const apps: DetectedApp[] = [];

  try {
    const script = `tell application "System Events"
  set windowList to {}
  repeat with proc in (every process whose visible is true)
    set procName to name of proc
    set procPID to unix id of proc
    try
      set winTitle to name of front window of proc
    on error
      set winTitle to ""
    end try
    set end of windowList to procName & "|" & procPID & "|" & winTitle
  end repeat
  return windowList as text
end tell`;

    const result = execSync(`osascript -e ${escapeAppleScript(script)}`, {
      timeout: 15000,
      encoding: "utf-8",
    }).trim();

    const entries = result.split(", ");
    for (const entry of entries) {
      const parts = entry.split("|");
      const procName = parts[0];
      const pidStr = parts[1];
      const winTitle = parts[2] ?? "";
      if (!procName || !pidStr) continue;
      const pid = parseInt(pidStr, 10);
      if (isNaN(pid)) continue;

      const framework = identifyFramework(procName, pid);
      if (framework !== "unknown" || winTitle) {
        apps.push({
          framework,
          processName: procName,
          pid,
          windowTitle: winTitle || procName,
          debugPort: findDebugPort(pid),
        });
      }
    }
  } catch (error) {
    console.error("[thunder-eye] macOS detection error:", error);
  }

  return apps;
}

function detectLinux(): DetectedApp[] {
  const apps: DetectedApp[] = [];
  try {
    const result = execSync(
      "wmctrl -lp 2>/dev/null || xdotool search --name '' getwindowname %@ 2>/dev/null",
      { timeout: 5000, encoding: "utf-8" },
    );
    for (const line of result.split("\n").filter(Boolean)) {
      apps.push({
        framework: "unknown",
        processName: line.trim(),
        pid: 0,
        windowTitle: line.trim(),
      });
    }
  } catch {
    // wmctrl/xdotool not available
  }
  return apps;
}

function identifyFramework(processName: string, pid: number): DetectedApp["framework"] {
  const name = processName.toLowerCase();

  // Well-known Electron apps
  const electronApps = [
    "electron", "code", "discord", "slack", "figma",
    "spotify", "notion", "obsidian", "postman", "insomnia",
    "atom", "github desktop", "visual studio code",
  ];
  if (electronApps.some(app => name.includes(app))) {
    return "electron";
  }

  // Check process arguments for framework markers
  try {
    const args = execSync(`ps -p ${pid} -o args= 2>/dev/null`, {
      encoding: "utf-8",
      timeout: 2000,
    });
    if (args.includes("--type=renderer") || args.includes("electron")) return "electron";
    if (args.includes("tauri") || args.includes("WKWebView")) return "tauri";
    if (args.includes("--remote-debugging-port")) return "electron";
    if (args.includes("flutter")) return "flutter";
  } catch {
    // Process may have exited
  }

  // Check loaded libraries for framework signatures
  try {
    const libs = execSync(
      `lsof -p ${pid} 2>/dev/null | grep -iE "framework|electron|tauri|qt|gtk|flutter" | head -5`,
      { encoding: "utf-8", timeout: 3000 },
    );
    if (libs.includes("Electron")) return "electron";
    if (libs.includes("Tauri") || libs.includes("WebKit")) return "tauri";
    if (libs.includes("Qt")) return "qt";
    if (/[Gg]tk/.test(libs)) return "gtk";
    if (libs.includes("Flutter")) return "flutter";
  } catch {
    // lsof may fail for some processes
  }

  return "unknown";
}

function findDebugPort(pid: number): number | undefined {
  try {
    const args = execSync(`ps -p ${pid} -o args= 2>/dev/null`, {
      encoding: "utf-8",
      timeout: 2000,
    });
    const match = args.match(/--remote-debugging-port=(\d+)/);
    if (match?.[1]) return parseInt(match[1], 10);
  } catch {
    // Process may have exited
  }

  // Check if common debug ports are in use by this process
  const commonPorts = [9222, 9229, 9515];
  for (const port of commonPorts) {
    try {
      const lsof = execSync(`lsof -i :${port} -t 2>/dev/null`, {
        encoding: "utf-8",
        timeout: 1000,
      }).trim();
      if (lsof === String(pid)) return port;
    } catch {
      // Port not in use or lsof failed
    }
  }

  return undefined;
}

function escapeAppleScript(script: string): string {
  // Use heredoc-style quoting to safely pass multi-line AppleScript
  const escaped = script.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}
