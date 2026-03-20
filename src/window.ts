import { execSync } from "node:child_process";
import type { WindowInfo } from "./types.js";
import { detectApps } from "./detector.js";

export async function getWindowInfo(windowTitle?: string): Promise<WindowInfo | null> {
  const windows = await listWindows();

  if (windowTitle) {
    const match = windows.find(w => w.title.toLowerCase().includes(windowTitle.toLowerCase()));
    return match ?? null;
  }

  // Return focused window, or first available
  return windows.find(w => w.focused) ?? windows[0] ?? null;
}

export async function listWindows(): Promise<WindowInfo[]> {
  const platform = process.platform;

  if (platform === "darwin") {
    return listMacOSWindows();
  }

  if (platform === "linux") {
    return listLinuxWindows();
  }

  return [];
}

async function listMacOSWindows(): Promise<WindowInfo[]> {
  const windows: WindowInfo[] = [];
  const apps = await detectApps();

  try {
    const script = `tell application "System Events"
  set windowData to ""
  repeat with proc in (every process whose visible is true)
    try
      repeat with win in (every window of proc)
        set winTitle to name of win
        set winPos to position of win
        set winSize to size of win
        set isFront to frontmost of proc
        set winPID to unix id of proc
        set windowData to windowData & winTitle & "|" & (item 1 of winPos) & "|" & (item 2 of winPos) & "|" & (item 1 of winSize) & "|" & (item 2 of winSize) & "|" & isFront & "|" & winPID & linefeed
      end repeat
    end try
  end repeat
  return windowData
end tell`;

    const escaped = script.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const result = execSync(`osascript -e "${escaped}"`, {
      timeout: 15000,
      encoding: "utf-8",
    }).trim();

    for (const line of result.split("\n").filter(Boolean)) {
      const parts = line.split("|");
      const title = parts[0];
      const xStr = parts[1];
      const yStr = parts[2];
      const wStr = parts[3];
      const hStr = parts[4];
      const focusedStr = parts[5];
      const pidStr = parts[6];
      if (!title) continue;

      const pid = parseInt(pidStr ?? "0", 10);
      const app = apps.find(a => a.pid === pid);

      windows.push({
        title: title || "Untitled",
        x: parseInt(xStr ?? "0", 10),
        y: parseInt(yStr ?? "0", 10),
        width: parseInt(wStr ?? "0", 10),
        height: parseInt(hStr ?? "0", 10),
        focused: focusedStr === "true",
        framework: app?.framework ?? "unknown",
        pid,
      });
    }
  } catch (error) {
    console.error("[thunder-eye] Failed to list macOS windows:", error);
  }

  return windows;
}

async function listLinuxWindows(): Promise<WindowInfo[]> {
  const windows: WindowInfo[] = [];
  const apps = await detectApps();

  try {
    // wmctrl -lG gives: id desktop x y width height client title
    const result = execSync("wmctrl -lG 2>/dev/null", {
      encoding: "utf-8",
      timeout: 3000,
    });

    for (const line of result.split("\n").filter(Boolean)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 8) continue;

      const x = parseInt(parts[2] ?? "0", 10);
      const y = parseInt(parts[3] ?? "0", 10);
      const width = parseInt(parts[4] ?? "0", 10);
      const height = parseInt(parts[5] ?? "0", 10);
      const title = parts.slice(7).join(" ");

      // Try to find PID from wmctrl -lp
      let pid = 0;
      try {
        const pidResult = execSync(`wmctrl -lp 2>/dev/null | grep "${parts[0]}"`, {
          encoding: "utf-8",
          timeout: 2000,
        });
        const pidParts = pidResult.trim().split(/\s+/);
        pid = parseInt(pidParts[2] ?? "0", 10);
      } catch {
        // PID lookup is best-effort
      }

      const app = apps.find(a => a.pid === pid);

      windows.push({
        title: title || "Untitled",
        x,
        y,
        width,
        height,
        focused: false, // Would need xdotool getactivewindow to determine
        framework: app?.framework ?? "unknown",
        pid,
      });
    }
  } catch {
    // wmctrl not available
  }

  return windows;
}
