import CDP from "chrome-remote-interface";

interface ChromiumInspectOptions {
  port: number;
  maxDepth: number;
}

interface AXNode {
  ignored?: boolean;
  role?: { value?: string };
  name?: { value?: string };
  value?: { value?: string | number | boolean };
  depth?: number;
  properties?: Array<{
    name: string;
    value?: { value?: string | number | boolean };
  }>;
}

export async function inspectChromium(options: ChromiumInspectOptions): Promise<string> {
  const client = await CDP({ port: options.port });

  try {
    const { Accessibility } = client;
    await Accessibility.enable();

    const { nodes } = await Accessibility.getFullAXTree({ depth: options.maxDepth }) as { nodes: AXNode[] };

    // Format accessibility tree as a human-readable indented structure
    const lines: string[] = [];
    for (const node of nodes) {
      if (node.ignored) continue;
      const role = node.role?.value ?? "unknown";
      const name = node.name?.value ?? "";
      const value = node.value?.value;
      const depth = node.depth ?? 0;
      const indent = "  ".repeat(depth);

      let line = `${indent}[${role}]`;
      if (name) line += ` "${name}"`;
      if (value !== undefined && value !== "") line += ` = "${value}"`;

      // Collect meaningful accessibility properties
      const props: string[] = [];
      for (const prop of node.properties ?? []) {
        if (prop.name === "focused" && prop.value?.value === true) props.push("focused");
        if (prop.name === "disabled" && prop.value?.value === true) props.push("disabled");
        if (prop.name === "checked") props.push(`checked=${prop.value?.value}`);
        if (prop.name === "expanded") props.push(`expanded=${prop.value?.value}`);
        if (prop.name === "selected" && prop.value?.value === true) props.push("selected");
        if (prop.name === "required" && prop.value?.value === true) props.push("required");
      }
      if (props.length > 0) line += ` (${props.join(", ")})`;

      lines.push(line);
    }

    return lines.join("\n") || "No accessibility tree available";
  } finally {
    await client.close();
  }
}
