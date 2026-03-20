import { execSync } from "node:child_process";
import { readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ScreenshotResult } from "../types.js";

interface NativeCaptureOptions {
  windowTitle?: string;
  resizeWidth: number;
}

export async function captureNative(options: NativeCaptureOptions): Promise<ScreenshotResult> {
  const platform = process.platform;
  const tmpFile = join(tmpdir(), `thunder-eye-${Date.now()}.png`);

  try {
    if (platform === "darwin") {
      captureMacOS(tmpFile, options.windowTitle);
    } else if (platform === "linux") {
      captureLinux(tmpFile, options.windowTitle);
    } else if (platform === "win32") {
      captureWindows(tmpFile, options.windowTitle);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const buffer = readFileSync(tmpFile);
    const base64 = buffer.toString("base64");

    // Resize with sharp if available for bandwidth optimization
    let width = 0;
    let height = 0;
    try {
      const sharp = (await import("sharp")).default;
      const metadata = await sharp(buffer).metadata();
      width = metadata.width ?? 0;
      height = metadata.height ?? 0;

      if (options.resizeWidth && width > options.resizeWidth) {
        const resized = await sharp(buffer)
          .resize(options.resizeWidth)
          .png()
          .toBuffer();
        const resizedMeta = await sharp(resized).metadata();
        return {
          base64: resized.toString("base64"),
          width: resizedMeta.width ?? options.resizeWidth,
          height: resizedMeta.height ?? 0,
          framework: "native",
          method: "screencapture",
        };
      }
    } catch {
      // sharp not available, return full-size image
    }

    return {
      base64,
      width,
      height,
      framework: "native",
      method: "screencapture",
    };
  } finally {
    try {
      unlinkSync(tmpFile);
    } catch {
      // Cleanup is best-effort
    }
  }
}

function captureWindows(outputPath: string, _windowTitle?: string): void {
  // Use PowerShell with .NET System.Drawing to capture the primary screen
  // Window-specific capture on Windows requires user32.dll PrintWindow which is
  // unreliable across DPI settings, so we capture the full primary screen consistently.
  const safePath = outputPath.replace(/'/g, "''");
  const script = `
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen
    $bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size)
    $bitmap.Save('${safePath}')
    $graphics.Dispose()
    $bitmap.Dispose()
  `;
  execSync(`powershell -NoProfile -Command "${script}"`, { timeout: 10000 });
}

function captureMacOS(outputPath: string, windowTitle?: string): void {
  if (windowTitle) {
    // Bring the target window to front before capturing
    const escapedTitle = windowTitle.replace(/"/g, '\\"');
    const script = `tell application "System Events"
  set targetProc to first process whose visible is true and name of front window contains "${escapedTitle}"
  set frontmost of targetProc to true
end tell
delay 0.3`;
    try {
      const escaped = script.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      execSync(`osascript -e "${escaped}"`, { timeout: 3000 });
    } catch {
      // Window focus is best-effort, capture will still work on frontmost window
    }
  }
  // -x = no sound, -o = no shadow
  execSync(`screencapture -x -o "${outputPath}"`, { timeout: 5000 });
}

function captureLinux(outputPath: string, windowTitle?: string): void {
  if (windowTitle) {
    try {
      const escapedTitle = windowTitle.replace(/"/g, '\\"');
      const winId = execSync(`xdotool search --name "${escapedTitle}" | head -1`, {
        encoding: "utf-8",
        timeout: 2000,
      }).trim();
      if (winId) {
        execSync(`import -window ${winId} "${outputPath}"`, { timeout: 5000 });
        return;
      }
    } catch {
      // Window search failed, fall through to full-screen capture
    }
  }
  // Fallback: capture entire screen
  execSync(`import -window root "${outputPath}"`, { timeout: 5000 });
}
