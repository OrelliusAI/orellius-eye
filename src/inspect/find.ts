import type { FindElementOptions, FoundElement } from "../types.js";
import { inspectUI } from "./index.js";

export async function findElement(options: FindElementOptions): Promise<FoundElement[]> {
  if (!options.text && !options.role) {
    return [{
      role: "error",
      name: "At least one of 'text' or 'role' must be provided to search for elements.",
    }];
  }

  const tree = await inspectUI({
    windowTitle: options.windowTitle,
    maxDepth: 10,
  });

  const results: FoundElement[] = [];
  const lines = tree.split("\n");

  for (const line of lines) {
    const roleMatch = line.match(/\[(\w+)\]/);
    const nameMatch = line.match(/"([^"]+)"/);

    if (!roleMatch) continue;

    const role = roleMatch[1];
    const name = nameMatch?.[1] ?? "";

    let matches = false;
    if (options.text && name.toLowerCase().includes(options.text.toLowerCase())) {
      matches = true;
    }
    if (options.role && role.toLowerCase() === options.role.toLowerCase()) {
      matches = true;
    }

    if (matches) {
      // Extract value if present (format: = "value")
      const valueMatch = line.match(/= "([^"]+)"/);
      results.push({
        role,
        name,
        value: valueMatch?.[1],
      });
    }
  }

  if (results.length === 0) {
    return [{
      role: "info",
      name: `No elements found matching ${options.text ? `text="${options.text}"` : ""}${options.text && options.role ? " and " : ""}${options.role ? `role="${options.role}"` : ""}`,
    }];
  }

  return results;
}
