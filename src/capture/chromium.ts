import CDP from "chrome-remote-interface";
import type { ScreenshotResult } from "../types.js";

interface ChromiumCaptureOptions {
  port: number;
  resizeWidth: number;
}

export async function captureChromium(options: ChromiumCaptureOptions): Promise<ScreenshotResult> {
  const client = await CDP({ port: options.port });

  try {
    const { Page } = client;
    await Page.enable();

    const result = await Page.captureScreenshot({
      format: "png",
      quality: 80,
    });

    const base64 = result.data;

    // Attempt to get viewport dimensions from the DOM
    let width = 0;
    let height = 0;
    try {
      const { Runtime } = client;
      const dimensions = await Runtime.evaluate({
        expression: "JSON.stringify({ width: window.innerWidth, height: window.innerHeight })",
        returnByValue: true,
      });
      if (dimensions.result?.value) {
        const parsed = JSON.parse(dimensions.result.value as string) as { width: number; height: number };
        width = parsed.width;
        height = parsed.height;
      }
    } catch {
      // Dimensions not critical, continue with zeros
    }

    return {
      base64,
      width,
      height,
      framework: "chromium",
      method: "cdp",
    };
  } finally {
    await client.close();
  }
}
