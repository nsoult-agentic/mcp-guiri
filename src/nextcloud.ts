/**
 * Nextcloud MCP client — calls mcp-nextcloud via Streamable HTTP transport.
 * Uses the MCP SDK client to communicate with the existing mcp-nextcloud server.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { GUIRI_BASE_PATH } from "./style-guide.js";
import { sanitizeSlug } from "./slug.js";

const NEXTCLOUD_MCP_URL = process.env["NEXTCLOUD_MCP_URL"] || "http://127.0.0.1:8902/mcp";

/** Create a fresh MCP client connection to mcp-nextcloud */
async function createClient(): Promise<Client> {
  const client = new Client({ name: "mcp-guiri", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(new URL(NEXTCLOUD_MCP_URL));
  // @ts-expect-error — SDK type defect under exactOptionalPropertyTypes: the
  // Transport interface declares `sessionId?: string` while
  // StreamableHTTPClientTransport implements `get sessionId(): string | undefined`,
  // which is not assignable to the optional `string` without `| undefined`. This
  // is internal to @modelcontextprotocol/sdk; the runtime behavior is unaffected.
  await client.connect(transport);
  return client;
}

/** Call a Nextcloud MCP tool and return the text result */
async function callTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const client = await createClient();
  try {
    const result = await client.callTool({ name: toolName, arguments: args });
    const content = Array.isArray(result.content) ? result.content : [];
    const text = content
      .filter((c: { type: string }): c is { type: "text"; text: string } => c.type === "text")
      .map((c: { type: "text"; text: string }) => c.text)
      .join("\n");
    return text || "No content returned";
  } finally {
    await client.close().catch(() => {});
  }
}

/** Call a Nextcloud MCP tool and return raw content blocks (for images) */
async function callToolRaw(
  toolName: string,
  args: Record<string, unknown>,
): Promise<Array<{ type: string; [key: string]: unknown }>> {
  const client = await createClient();
  try {
    const result = await client.callTool({ name: toolName, arguments: args });
    const content = Array.isArray(result.content) ? result.content : [];
    return content as Array<{ type: string; [key: string]: unknown }>;
  } finally {
    await client.close().catch(() => {});
  }
}

// ─── Public API ───

export async function listPosts(city?: string): Promise<string> {
  const path = city ? `${GUIRI_BASE_PATH}/${sanitizeSlug(city)}` : GUIRI_BASE_PATH;
  return callTool("nextcloud-list", { path });
}

export async function getFile(postSlug: string, filename: string): Promise<string> {
  const path = `${GUIRI_BASE_PATH}/${sanitizeSlug(postSlug)}/${filename}`;
  return callTool("nextcloud-download", { path });
}

export async function getFileRaw(
  postSlug: string,
  filename: string,
): Promise<Array<{ type: string; [key: string]: unknown }>> {
  const path = `${GUIRI_BASE_PATH}/${sanitizeSlug(postSlug)}/${filename}`;
  return callToolRaw("nextcloud-download", { path });
}

export async function saveFile(
  postSlug: string,
  filename: string,
  content: string,
): Promise<string> {
  const path = `${GUIRI_BASE_PATH}/${sanitizeSlug(postSlug)}/${filename}`;
  return callTool("nextcloud-upload", { path, content });
}

export async function createFolder(postSlug: string): Promise<string> {
  const path = `${GUIRI_BASE_PATH}/${sanitizeSlug(postSlug)}`;
  return callTool("nextcloud-mkdir", { path });
}

/**
 * Get post metadata with fallback chain: post.json → notes.txt → not found.
 */
export async function getPostInfo(
  postSlug: string,
): Promise<{ source: "json" | "text" | "none"; content: string }> {
  // Try post.json first
  try {
    const json = await getFile(postSlug, "post.json");
    if (json && !json.includes("not found") && !json.includes("error")) {
      return { source: "json", content: json };
    }
  } catch {
    /* fall through */
  }

  // Try notes.txt
  try {
    const notes = await getFile(postSlug, "notes.txt");
    if (notes && !notes.includes("not found") && !notes.includes("error")) {
      return { source: "text", content: notes };
    }
  } catch {
    /* fall through */
  }

  return {
    source: "none",
    content:
      "No post metadata found (no post.json or notes.txt). Ask the user for restaurant name, city, dishes ordered, and their experience.",
  };
}
