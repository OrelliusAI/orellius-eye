# Thunder Eye

**AI gets eyes into desktop apps.**

An MCP server that gives AI coding agents (Claude Code, Cursor, Windsurf) visual perception of running desktop applications. Auto-detects the framework, captures screenshots, inspects UI trees, and finds elements -- so the AI can actually *see* what you see.

## Supported Frameworks

| Framework | Screenshot | UI Inspection | Element Finding |
|-----------|-----------|---------------|-----------------|
| **Electron** (VS Code, Discord, Figma) | CDP | Accessibility Tree | Yes |
| **Tauri** (Thunder, CrabNebula) | CDP/Native | Accessibility Tree | Yes |
| **Flutter** | Native | DevTools (planned) | Planned |
| **Qt** (OBS, VLC) | Native | AT-SPI (planned) | Planned |
| **GTK** (GIMP, Inkscape) | Native | AT-SPI (planned) | Planned |
| **SwiftUI / AppKit** | Native | macOS Accessibility | Yes |
| **Any other app** | Native | -- | -- |

## Quick Start

### With Claude Code
```bash
claude mcp add thunder-eye node ~/path/to/thunder-eye/dist/index.js
```

### With Cursor / VS Code
Add to your MCP config:
```json
{
  "mcpServers": {
    "thunder-eye": {
      "command": "node",
      "args": ["/path/to/thunder-eye/dist/index.js"]
    }
  }
}
```

## Tools

### `screenshot`
Capture a screenshot of any running desktop app. The AI can analyze it visually.

> "Take a look at the app" -> AI captures screenshot -> "I can see the button is misaligned..."

### `detect_app`
Auto-detect what desktop apps are running and their frameworks.

### `inspect_ui`
Get the accessibility tree / component hierarchy without a screenshot.

### `find_element`
Search for UI elements by text or role.

### `get_window_info`
Get window dimensions, position, and framework info.

### `list_windows`
List all visible app windows.

## How It Works

Thunder Eye uses a layered detection strategy:

1. **Chromium DevTools Protocol (CDP)** -- For Electron, Tauri, CEF, and other Chromium-based apps. Highest fidelity screenshots and full DOM/accessibility tree access.
2. **OS Accessibility APIs** -- For native apps (SwiftUI, AppKit, Qt). Uses macOS Accessibility framework or Linux AT-SPI.
3. **Native screencapture** -- Universal fallback. Works with any app on any framework.

## Requirements

- **macOS**: Accessibility permissions must be granted in System Settings > Privacy & Security > Accessibility
- **Linux**: `wmctrl` or `xdotool` for window management, `import` (ImageMagick) for screenshots
- **Node.js**: 18+

## Built by [Orellius](https://orellius.ai)

Part of the Thunder ecosystem -- the AI-powered multi-agent coding orchestrator.

## License

MIT
