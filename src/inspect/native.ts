import { execSync } from "node:child_process";
import type { InspectOptions } from "../types.js";

export async function inspectNative(options: InspectOptions): Promise<string> {
  const platform = process.platform;

  if (platform === "darwin") {
    return inspectMacOS(options);
  }

  if (platform === "linux") {
    return inspectLinux(options);
  }

  return "Native UI inspection not yet supported on this platform. Use the screenshot tool instead.";
}

function inspectMacOS(options: InspectOptions): string {
  try {
    const targetClause = options.windowTitle
      ? `first process whose name contains "${options.windowTitle.replace(/"/g, '\\"')}"`
      : "first process whose frontmost is true";

    const script = `tell application "System Events"
  set frontProc to ${targetClause}
  set procName to name of frontProc
  set uiElements to ""
  try
    set allElements to UI elements of front window of frontProc
    repeat with elem in allElements
      set elemRole to role of elem
      set elemTitle to ""
      try
        set elemTitle to title of elem
      end try
      set elemDesc to ""
      try
        set elemDesc to description of elem
      end try
      set elemValue to ""
      try
        set elemValue to value of elem as text
      end try
      set uiElements to uiElements & elemRole & " | " & elemTitle & " | " & elemDesc & " | " & elemValue & linefeed
    end repeat
  end try
  return procName & linefeed & "---" & linefeed & uiElements
end tell`;

    const escaped = script.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const result = execSync(`osascript -e "${escaped}"`, {
      timeout: 8000,
      encoding: "utf-8",
    });

    if (!result.trim()) {
      return "No UI elements found. The app may not expose accessibility information, or accessibility permissions may not be granted.";
    }

    // Parse and format the raw output into a structured tree
    const lines = result.trim().split("\n");
    const appName = lines[0] ?? "Unknown App";
    const separator = lines.findIndex(line => line.trim() === "---");
    const elementLines = lines.slice(separator + 1).filter(Boolean);

    const formatted: string[] = [`Application: ${appName}`, ""];
    for (const line of elementLines) {
      const parts = line.split(" | ");
      const role = parts[0]?.trim() ?? "unknown";
      const title = parts[1]?.trim() ?? "";
      const desc = parts[2]?.trim() ?? "";
      const value = parts[3]?.trim() ?? "";

      let entry = `  [${role}]`;
      if (title) entry += ` "${title}"`;
      if (desc && desc !== title) entry += ` (${desc})`;
      if (value) entry += ` = "${value}"`;
      formatted.push(entry);
    }

    return formatted.join("\n");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Failed to inspect UI: ${errorMessage}. Ensure accessibility permissions are granted in System Settings > Privacy & Security > Accessibility.`;
  }
}

function inspectLinux(options: InspectOptions): string {
  // AT-SPI inspection for Linux (GTK, Qt apps)
  try {
    // Try using accerciser's CLI or python-atspi2
    const targetFilter = options.windowTitle
      ? `"${options.windowTitle.replace(/"/g, '\\"')}"`
      : "";
    const result = execSync(
      `python3 -c "
import gi
gi.require_version('Atspi', '2.0')
from gi.repository import Atspi
desktop = Atspi.get_desktop(0)
for i in range(desktop.get_child_count()):
    app = desktop.get_child_at_index(i)
    name = app.get_name()
    if ${targetFilter ? `'${options.windowTitle}' in name` : 'True'}:
        print(f'App: {name}')
        for j in range(min(app.get_child_count(), 50)):
            child = app.get_child_at_index(j)
            role = child.get_role_name()
            child_name = child.get_name()
            print(f'  [{role}] {child_name}')
" 2>/dev/null`,
      { encoding: "utf-8", timeout: 5000 },
    );
    return result.trim() || "No AT-SPI elements found.";
  } catch {
    return "Linux UI inspection requires python3-atspi. Install with: sudo apt install python3-gi gir1.2-atspi-2.0";
  }
}
