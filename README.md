<p align="center">
  <img src="https://orellius.ai/thunder-eye-logo.png" alt="Thunder Eye" width="120" />
</p>

<h1 align="center">Thunder Eye</h1>

<p align="center">
  <strong>AI gets eyes into desktop apps.</strong>
</p>

<p align="center">
  <a href="https://github.com/Orellius/thunder-eye/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://www.npmjs.com/package/thunder-eye"><img src="https://img.shields.io/npm/v/thunder-eye.svg?color=blue" alt="npm" /></a>
  <a href="https://orellius.ai"><img src="https://img.shields.io/badge/by-Orellius.ai-05a0ef" alt="Orellius" /></a>
  <a href="https://github.com/Orellius/Thunder"><img src="https://img.shields.io/badge/ecosystem-Thunder-10b981" alt="Thunder" /></a>
  <img src="https://img.shields.io/badge/MCP-compatible-8b5cf6" alt="MCP Compatible" />
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux-333" alt="Platform" />
</p>

<p align="center">
  An MCP server that gives AI coding agents (Claude Code, Cursor, Windsurf) visual perception of running desktop applications.<br/>
  Auto-detects the framework, captures screenshots, inspects UI trees, and finds elements — so the AI can actually <em>see</em> what you see.
</p>

---

## Supported Frameworks

| Framework | Screenshot | UI Inspection | Element Finding |
|-----------|:---------:|:-------------:|:---------------:|
| **Electron** (VS Code, Discord, Figma) | CDP | Accessibility Tree | Yes |
| **Tauri** (Thunder, CrabNebula) | CDP / Native | Accessibility Tree | Yes |
| **Flutter** | Native | DevTools (planned) | Planned |
| **Qt** (OBS, VLC) | Native | AT-SPI (planned) | Planned |
| **GTK** (GIMP, Inkscape) | Native | AT-SPI (planned) | Planned |
| **SwiftUI / AppKit** | Native | macOS Accessibility | Yes |
| **Any other app** | Native | — | — |

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

> "Take a look at the app" → AI captures screenshot → "I can see the button is misaligned..."

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

1. **Chromium DevTools Protocol (CDP)** — For Electron, Tauri, CEF, and other Chromium-based apps. Highest fidelity screenshots and full DOM/accessibility tree access.
2. **OS Accessibility APIs** — For native apps (SwiftUI, AppKit, Qt). Uses macOS Accessibility framework or Linux AT-SPI.
3. **Native screencapture** — Universal fallback. Works with any app on any framework.

## Requirements

- **macOS**: Accessibility permissions must be granted in System Settings > Privacy & Security > Accessibility
- **Linux**: `wmctrl` or `xdotool` for window management, `import` (ImageMagick) for screenshots
- **Node.js**: 18+

---

<p align="center">
  Built with care by <a href="https://orellius.ai"><strong>Orellius.ai</strong></a><br/>
  Part of the <a href="https://github.com/Orellius/Thunder"><strong>Thunder</strong></a> ecosystem — the AI-powered multi-agent coding orchestrator.
</p>

<p align="center">
  <a href="https://orellius.ai">Website</a> · <a href="https://github.com/Orellius/Thunder">Thunder</a> · <a href="https://github.com/Orellius/thunder-thinking">Thunder Thinking</a> · <a href="https://github.com/Orellius/thunder-eye">Thunder Eye</a>
</p>

## License

[MIT](LICENSE) — use it however you want.
