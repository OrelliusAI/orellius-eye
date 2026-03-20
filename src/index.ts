#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { detectApps } from "./detector.js";
import { captureScreenshot } from "./capture/index.js";
import { inspectUI } from "./inspect/index.js";
import { getWindowInfo, listWindows } from "./window.js";
import { findElement } from "./inspect/find.js";

const server = new McpServer({
  name: "thunder-eye",
  version: "1.0.0",
});

// Tool: detect_app
server.registerTool(
  "detect_app",
  {
    description: "Auto-detect running desktop applications and their frameworks (Electron, Tauri, Flutter, Qt, etc.)",
  },
  async () => {
    try {
      const apps = await detectApps();
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(apps, null, 2),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Error detecting apps: ${message}` }],
        isError: true,
      };
    }
  },
);

// Tool: screenshot
server.registerTool(
  "screenshot",
  {
    description: "Capture a screenshot of a running desktop application window. Returns the image for visual analysis. Use this when the user says 'take a look', 'check the app', 'see what is on screen', or reports a visual bug.",
    inputSchema: {
      window_title: z.optional(z.string().describe("Target window by title (partial match). If omitted, captures the frontmost window.")),
      resize_width: z.optional(z.number().describe("Resize image width in pixels (default 1024). Smaller = faster, larger = more detail.")),
    },
  },
  async ({ window_title, resize_width }) => {
    try {
      const image = await captureScreenshot({
        windowTitle: window_title,
        resizeWidth: resize_width ?? 1024,
      });
      return {
        content: [{
          type: "image" as const,
          data: image.base64,
          mimeType: "image/png" as const,
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Screenshot failed: ${message}` }],
        isError: true,
      };
    }
  },
);

// Tool: inspect_ui
server.registerTool(
  "inspect_ui",
  {
    description: "Get the UI component tree / accessibility snapshot of a running desktop app. Shows element hierarchy, roles, labels, and states. Use this to understand the structure of what is on screen without needing a screenshot.",
    inputSchema: {
      window_title: z.optional(z.string().describe("Target window by title (partial match). If omitted, inspects the frontmost window.")),
      max_depth: z.optional(z.number().describe("Maximum tree depth to return (default 5). Deeper = more detail but larger output.")),
    },
  },
  async ({ window_title, max_depth }) => {
    try {
      const tree = await inspectUI({
        windowTitle: window_title,
        maxDepth: max_depth ?? 5,
      });
      return {
        content: [{
          type: "text" as const,
          text: tree,
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `UI inspection failed: ${message}` }],
        isError: true,
      };
    }
  },
);

// Tool: get_window_info
server.registerTool(
  "get_window_info",
  {
    description: "Get information about a specific app window: title, size, position, framework, and whether it is focused.",
    inputSchema: {
      window_title: z.optional(z.string().describe("Target window by title (partial match). If omitted, returns info for the frontmost window.")),
    },
  },
  async ({ window_title }) => {
    try {
      const info = await getWindowInfo(window_title);
      if (!info) {
        return {
          content: [{ type: "text" as const, text: "No matching window found." }],
        };
      }
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(info, null, 2),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Window info failed: ${message}` }],
        isError: true,
      };
    }
  },
);

// Tool: list_windows
server.registerTool(
  "list_windows",
  {
    description: "List all visible application windows with their titles, sizes, and detected frameworks.",
  },
  async () => {
    try {
      const windows = await listWindows();
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(windows, null, 2),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `List windows failed: ${message}` }],
        isError: true,
      };
    }
  },
);

// Tool: find_element
server.registerTool(
  "find_element",
  {
    description: "Search for a UI element by text content, role, or label in the running app. Returns matching elements with their properties and position.",
    inputSchema: {
      text: z.optional(z.string().describe("Search by text content (partial match)")),
      role: z.optional(z.string().describe("Search by accessibility role (button, input, heading, etc.)")),
      window_title: z.optional(z.string().describe("Target window by title")),
    },
  },
  async ({ text, role, window_title }) => {
    try {
      const elements = await findElement({
        text,
        role,
        windowTitle: window_title,
      });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(elements, null, 2),
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Find element failed: ${message}` }],
        isError: true,
      };
    }
  },
);

// Start server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[thunder-eye] MCP server started");
}

main().catch((error: unknown) => {
  console.error("[thunder-eye] Fatal error:", error);
  process.exit(1);
});
