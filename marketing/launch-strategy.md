# Thunder Eye Launch Strategy

> Marketing & social media launch plan for Thunder Eye -- the MCP server that gives AI coding agents visual perception of running desktop apps.

---

## Competitive Positioning

**What exists today:** A handful of basic screenshot MCP servers (screenshot_mcp_server, ScreenshotMCP, Windows Screenshots). They all do the same thing: capture a full-screen or browser screenshot and return a JPEG/PNG. That is it. No framework detection, no UI tree inspection, no element search, no intelligent capture strategy.

**What Thunder Eye does differently:**
1. **Framework auto-detection** -- identifies Electron, Tauri, Flutter, Qt, GTK, SwiftUI/AppKit from running processes, loaded libraries, and process arguments
2. **Layered capture strategy** -- CDP for Chromium-based apps (pixel-perfect), OS accessibility APIs for native apps, native screencapture as universal fallback
3. **UI tree inspection** -- full accessibility tree from CDP or macOS Accessibility framework, not just a screenshot
4. **Element search** -- find UI elements by text content or accessibility role
5. **Window intelligence** -- list all windows, get dimensions, position, framework, focus state
6. **6 tools, not 1** -- `screenshot`, `detect_app`, `inspect_ui`, `find_element`, `get_window_info`, `list_windows`

**One-liner positioning:** "Other screenshot tools give your AI a camera. Thunder Eye gives it eyes."

---

## 1. Twitter/X Thread (7 Tweets)

### Tweet 1 (Hook)
```
Your AI coding agent is blind.

It can read your code, run your terminal, even browse the web.
But it cannot see the app it is building.

Today we are fixing that. Introducing Thunder Eye.
```

### Tweet 2 (The Problem)
```
The workflow right now:

1. AI writes code
2. You run the app
3. You screenshot it manually
4. You paste the screenshot into the chat
5. AI says "I see the button is misaligned"

Repeat 50 times a day.

Thunder Eye eliminates steps 2-4.
```

### Tweet 3 (What It Is)
```
Thunder Eye is an open-source MCP server that gives AI agents (Claude Code, Cursor, Windsurf) direct visual perception of running desktop apps.

6 tools:
- screenshot -- capture any window
- detect_app -- identify running frameworks
- inspect_ui -- get the accessibility tree
- find_element -- search by text/role
- get_window_info -- dimensions, position, focus
- list_windows -- see everything running
```

### Tweet 4 (Framework Detection)
```
It auto-detects the framework.

Electron app? Connects via Chrome DevTools Protocol for pixel-perfect CDP screenshots and full DOM access.

Tauri app? Same thing -- WebView gives us CDP.

SwiftUI/AppKit? macOS Accessibility APIs.

Qt/GTK? Native capture + AT-SPI on Linux.

You say "look at my app." It figures out the rest.
```

### Tweet 5 (The Key Insight)
```
The real power is not the screenshot. It is the UI tree.

Thunder Eye returns the full accessibility tree -- roles, labels, states, values. Your AI does not just "see" a button. It knows:

  [button] "Submit" (focused)
  [textfield] "Email" = "user@example.com" (required)
  [checkbox] "Remember me" (checked=true)

It can reason about your UI structurally.
```

### Tweet 6 (Install)
```
Install:

  npm install -g thunder-eye

Add to Claude Code:

  claude mcp add thunder-eye -- npx thunder-eye

Add to Cursor/Windsurf:

  {
    "mcpServers": {
      "thunder-eye": {
        "command": "npx",
        "args": ["thunder-eye"]
      }
    }
  }

Then just say "take a look at the app."
```

### Tweet 7 (CTA)
```
MIT licensed. Open source. Built by @OrelliusAI.

Part of the Thunder ecosystem -- the AI multi-agent coding orchestrator.

GitHub: github.com/Orellius/thunder-eye
npm: thunder-eye

Star it. Fork it. Give your AI eyes.
```

---

## 2. Reddit Posts

### r/ClaudeAI

**Title:** I built an MCP server that lets Claude Code see your running desktop apps -- screenshots, UI trees, element search

**Body:**
```
I got tired of the screenshot-paste-repeat loop when debugging UI with Claude Code, so I built Thunder Eye.

It is an MCP server with 6 tools that gives Claude visual perception of running desktop applications:

**What it does:**

- `screenshot` -- captures any running app window and returns the image directly to Claude
- `detect_app` -- identifies what frameworks are running (Electron, Tauri, Flutter, Qt, SwiftUI)
- `inspect_ui` -- returns the full accessibility tree (roles, labels, values, states)
- `find_element` -- searches for UI elements by text or role
- `get_window_info` / `list_windows` -- window dimensions, position, focus state

**How it works:**

For Chromium-based apps (Electron, Tauri), it connects via Chrome DevTools Protocol for pixel-perfect screenshots and full accessibility tree access. For native macOS apps (SwiftUI, AppKit), it uses the macOS Accessibility framework. For everything else, it falls back to native screencapture.

The framework detection is automatic -- you say "take a look at my app" and Thunder Eye figures out whether to use CDP, accessibility APIs, or native capture.

**The key thing:** Most screenshot MCP tools give you a JPEG of the full screen. Thunder Eye gives you the UI tree. Claude does not just "see" a button -- it gets `[button] "Submit" (focused, disabled)` and can reason about the UI structurally.

**Install:**
```
npm install -g thunder-eye
claude mcp add thunder-eye -- npx thunder-eye
```

MIT licensed, open source: https://github.com/Orellius/thunder-eye

Built this as part of the Thunder ecosystem (AI multi-agent orchestrator) at Orellius.ai. Happy to answer questions about the architecture.
```

---

### r/LocalLLaMA

**Title:** Open-source MCP server for visual desktop app perception -- works with any MCP-compatible agent

**Body:**
```
Sharing an MCP server I built that might be useful for anyone building local agent workflows with visual capabilities.

**Thunder Eye** gives MCP-compatible agents 6 tools for perceiving running desktop applications:

1. `screenshot` -- capture any window, returns PNG with configurable resize
2. `detect_app` -- enumerate running apps and identify their frameworks
3. `inspect_ui` -- get accessibility tree (CDP for Electron/Tauri, macOS Accessibility for native)
4. `find_element` -- search UI elements by text content or accessibility role
5. `get_window_info` -- window geometry, framework, focus state
6. `list_windows` -- all visible windows

**Technical details:**

- Uses Chrome DevTools Protocol for Chromium-based apps (Electron, Tauri) -- connects to the debug port, calls `Page.captureScreenshot` and `Accessibility.getFullAXTree`
- Uses macOS Accessibility APIs (via osascript/System Events) for native apps
- Uses AT-SPI (python3-atspi) for Linux native apps
- Falls back to native screencapture (`screencapture` on macOS, ImageMagick `import` on Linux)
- Framework detection via process arguments, loaded libraries (`lsof`), and known app signatures
- Image resize via sharp for bandwidth optimization

Stack: TypeScript, MCP SDK, chrome-remote-interface, sharp. Runs as stdio transport.

Works with Claude Code, Cursor, Windsurf, or any MCP client. Not tied to any specific LLM -- if your local agent supports MCP and can process images, this works.

MIT licensed: https://github.com/Orellius/thunder-eye
npm: `thunder-eye`

Would be interested in feedback, especially from anyone running local agents with vision capabilities. The UI tree inspection in particular could be useful for structured reasoning without burning vision tokens.
```

---

### r/webdev

**Title:** Built an MCP server so your AI coding agent can see your Electron/Tauri app running -- no more manual screenshots

**Body:**
```
If you build desktop apps with Electron or Tauri and use an AI coding assistant (Claude Code, Cursor, Windsurf), you know this loop:

1. Ask AI to change the UI
2. AI modifies the code
3. You build and run the app
4. You screenshot it
5. You paste the screenshot back
6. AI says "I see the issue, let me fix the padding"
7. Go to 2

I built **Thunder Eye** to eliminate the manual screenshot step. It is an open-source MCP server that gives AI agents direct visual access to your running desktop app.

**For Electron/Tauri specifically, it is more than screenshots.** It connects via Chrome DevTools Protocol and gives the AI:

- Pixel-perfect screenshots (not OS-level screencapture, actual CDP `Page.captureScreenshot`)
- Full accessibility tree with roles, labels, values, states
- Element search by text or role ("find me all buttons")
- Auto-detection of which framework is running

For other frameworks (Flutter, Qt, SwiftUI), it uses OS accessibility APIs or native capture.

**Setup takes 30 seconds:**

```
npm install -g thunder-eye
claude mcp add thunder-eye -- npx thunder-eye
```

Or in your Cursor/VS Code MCP config:
```json
{
  "mcpServers": {
    "thunder-eye": {
      "command": "npx",
      "args": ["thunder-eye"]
    }
  }
}
```

Then you just say "take a look at the app" and it captures, detects, and returns the visual + structural data.

GitHub: https://github.com/Orellius/thunder-eye (MIT)

Built by Orellius.ai, part of the Thunder ecosystem. Feedback welcome.
```

---

### r/programming

**Title:** Thunder Eye: open-source MCP server that gives AI agents visual perception of running desktop apps via CDP, accessibility APIs, and native capture

**Body:**
```
Released an open-source tool that I think solves an interesting problem in AI-assisted development.

**Problem:** AI coding agents can read code, run terminals, browse the web -- but they cannot see the desktop application they are building. Every visual check requires the developer to manually screenshot and paste.

**Solution:** Thunder Eye is an MCP server that gives agents 6 tools for visual perception of running apps:

| Tool | What it does |
|------|-------------|
| `screenshot` | Capture any window, returns PNG image |
| `detect_app` | Identify running apps and their frameworks |
| `inspect_ui` | Get accessibility tree / component hierarchy |
| `find_element` | Search elements by text or role |
| `get_window_info` | Window geometry, framework, focus state |
| `list_windows` | Enumerate all visible windows |

**Architecture:**

Three-layer capture strategy based on detected framework:

1. **Chrome DevTools Protocol** -- For Electron, Tauri, CEF apps. Connects to the debug port, uses `Page.captureScreenshot` for pixel-perfect captures and `Accessibility.getFullAXTree` for structured UI data.

2. **OS Accessibility APIs** -- For native apps. macOS Accessibility framework (via System Events), Linux AT-SPI (via python3-atspi).

3. **Native screencapture** -- Universal fallback. `screencapture` on macOS, ImageMagick `import` on Linux.

Framework detection works by checking process arguments (`ps -o args`), loaded dynamic libraries (`lsof | grep framework`), and a known-apps signature table (Electron: Code, Discord, Slack, Figma, etc.).

TypeScript, ~800 lines, 3 runtime deps (MCP SDK, chrome-remote-interface, sharp). MIT licensed.

GitHub: https://github.com/Orellius/thunder-eye
npm: thunder-eye

Interested in feedback on the detection heuristics -- especially from anyone working with less common desktop frameworks.
```

---

## 3. Hacker News "Show HN" Post

**Title:** Show HN: Thunder Eye -- MCP server giving AI agents visual perception of desktop apps

**Body:**
```
Thunder Eye is an open-source MCP server that gives AI coding agents
(Claude Code, Cursor, Windsurf) the ability to see running desktop
applications.

6 tools: screenshot, detect_app, inspect_ui, find_element,
get_window_info, list_windows.

Three-layer detection strategy:
- CDP for Electron/Tauri apps (pixel-perfect screenshots + full
  accessibility tree)
- macOS Accessibility / Linux AT-SPI for native apps
- Native screencapture as universal fallback

Framework auto-detection via process args, loaded libraries, and
known-app signatures. The agent says "look at the app" and Thunder Eye
figures out the capture method.

The interesting part is the UI tree -- instead of just returning a
screenshot (which burns vision tokens), it can return the structured
accessibility tree: roles, labels, values, states. The AI can reason
about your UI without needing to "see" it.

TypeScript, ~800 lines, MIT licensed.

GitHub: https://github.com/Orellius/thunder-eye
Install: npm install -g thunder-eye
```

**HN-specific notes:**
- Keep it under 80 words in the submission text (HN truncates long Show HN posts)
- No marketing language, no exclamation marks, no emojis
- Lead with what it IS, not why it is great
- Technical details earn upvotes; adjectives do not
- Best submission time: Tuesday-Thursday, 8-10 AM EST
- Respond to every comment in the first 2 hours

---

## 4. Dev.to / Blog Post Outline

**Title:** How I Gave Claude Eyes Into My Electron App (with 6 lines of config)

**Outline:**

### Section 1: The Problem (200 words)
- Describe the screenshot-paste loop
- Quantify it: "I counted -- 47 manual screenshots in one coding session fixing a sidebar layout"
- This is the biggest friction point in AI-assisted desktop app development
- Web developers have Playwright MCP, browser preview tools. Desktop developers have nothing.

### Section 2: What Thunder Eye Is (300 words)
- Open-source MCP server for visual perception of desktop apps
- 6 tools, one sentence each
- Three-layer capture strategy diagram (CDP -> Accessibility -> Native)
- Supported frameworks table from README

### Section 3: Setup Walkthrough (400 words)
- Install: `npm install -g thunder-eye`
- Claude Code config: `claude mcp add thunder-eye -- npx thunder-eye`
- Cursor/VS Code config JSON
- Grant macOS accessibility permissions (screenshot of System Settings)
- Verify: ask Claude "what apps am I running?" -- show the `detect_app` output

### Section 4: Real Usage Example -- Fixing an Electron App (600 words)
- Start with a broken Electron app (misaligned sidebar, wrong colors)
- Show the conversation:
  - "Take a look at the app" -> Thunder Eye captures via CDP
  - Claude sees the screenshot, identifies layout issues
  - "Inspect the sidebar" -> returns accessibility tree showing the component hierarchy
  - "Find all buttons" -> `find_element` returns structured list
  - Claude fixes the CSS, says "check again"
  - Second screenshot confirms the fix
- Total time: under 2 minutes with zero manual screenshots

### Section 5: How It Works Under the Hood (500 words)
- Framework detection: process args, lsof, known-app table
- CDP connection: chrome-remote-interface, port detection, `Page.captureScreenshot`, `Accessibility.getFullAXTree`
- macOS Accessibility: osascript, System Events, UI elements enumeration
- Native fallback: screencapture (macOS), ImageMagick import (Linux)
- Image optimization: sharp resize to configurable width (default 1024px)

### Section 6: Why the UI Tree Matters More Than Screenshots (300 words)
- Screenshots cost vision tokens (expensive, slow)
- Accessibility tree is structured text (cheap, fast, precise)
- The AI can `find_element` by role without processing any image
- Combined workflow: inspect_ui for structure, screenshot only when visual confirmation needed
- Analogy: "A screenshot is like describing a room by showing a photo. The UI tree is like giving someone the floor plan with labeled furniture."

### Section 7: What Is Next (200 words)
- Flutter DevTools integration (planned)
- AT-SPI deep inspection for Qt/GTK on Linux (planned)
- Element interaction (click, type) -- possible future direction
- Part of the Thunder ecosystem (link to Orellius.ai)

### CTA
- GitHub link
- npm install command
- Invite to star, fork, contribute
- Link to Orellius.ai

---

## 5. GitHub Description & Topics

### Repository Description (max 350 chars)
```
AI gets eyes into desktop apps. MCP server giving Claude Code, Cursor, and Windsurf visual perception of Electron, Tauri, Flutter, Qt, and native applications. Auto-detects frameworks, captures screenshots via CDP, inspects accessibility trees, finds UI elements. MIT licensed.
```

### Topics (max 20)
```
mcp
mcp-server
model-context-protocol
claude
claude-code
cursor
windsurf
electron
tauri
desktop
screenshot
accessibility
ui-testing
ai-tools
devtools
cdp
chrome-devtools-protocol
developer-tools
visual-testing
typescript
```

### GitHub Social Preview Image
Recommend creating a 1280x640 image with:
- Thunder Eye logo + "AI gets eyes into desktop apps" tagline
- Show a split: left side = code editor with Claude, right side = Electron app being inspected
- Framework logos along the bottom (Electron, Tauri, Flutter, Qt, SwiftUI)
- Dark background matching Thunder brand (#0d1117 background, #05a0ef accent)

---

## 6. Launch Timing & Sequencing

### Day 0 (Pre-launch)
- Ensure GitHub repo is public with polished README
- npm package published and installable via `npx thunder-eye`
- Social preview image uploaded to GitHub
- Have 2-3 people test the install + usage flow and fix any friction

### Day 1 (Launch Day -- Tuesday or Wednesday, 9 AM EST)
1. **09:00** -- Submit Hacker News "Show HN" post
2. **09:15** -- Post Twitter/X thread
3. **09:30** -- Post to r/programming (most technical angle)
4. **10:00** -- Post to r/ClaudeAI
5. **10:30** -- Post to r/webdev
6. **11:00** -- Post to r/LocalLLaMA

### Day 1 (All Day)
- Monitor HN comments -- respond to every comment within 30 minutes for the first 4 hours
- Monitor Reddit threads -- respond to every comment
- Retweet/engage with anyone who quotes the thread
- If HN gains traction (front page), share the HN link on Twitter with a "we are on the front page" note

### Day 2-3 (Follow-up)
- Publish Dev.to blog post
- Cross-post blog to Hashnode and Medium
- Share blog post on Twitter and LinkedIn

### Day 4-7 (Amplification)
- Post a short demo video (screen recording of the workflow) on Twitter
- Share specific use cases: "Here is how I used Thunder Eye to debug a Tauri app layout"
- Engage in relevant MCP/Claude/Cursor discussions and naturally mention Thunder Eye where relevant (not spam -- only when directly useful)

---

## 7. Metrics to Track

| Metric | Day 1 Target | Week 1 Target |
|--------|-------------|---------------|
| GitHub stars | 50+ | 200+ |
| npm installs | 30+ | 150+ |
| HN points | 50+ | -- |
| Twitter thread impressions | 10K+ | 25K+ |
| Reddit upvotes (combined) | 100+ | 200+ |
| GitHub issues opened | 3+ | 10+ |
| Forks | 5+ | 20+ |

---

## 8. Key Messaging Rules

1. **Always be specific.** "6 MCP tools" not "comprehensive toolkit." "CDP screenshots" not "high-quality captures."
2. **Lead with the problem.** Every post opens with the pain (manual screenshots) before the solution.
3. **Show the install command early.** Developers want to try it, not read about it. `npm install -g thunder-eye` should appear in the first scroll.
4. **Technical credibility signals.** Mention CDP, accessibility trees, AT-SPI, chrome-remote-interface. Developers trust tools that speak their language.
5. **No superlatives.** Never say "revolutionary," "game-changing," "best." Let the features speak.
6. **Open source first.** MIT license, GitHub link, and the word "open-source" should appear in every post.
7. **Ecosystem mention, not ecosystem pitch.** Thunder Eye stands on its own. Mention Thunder/Orellius.ai as context, not as a sales funnel.
