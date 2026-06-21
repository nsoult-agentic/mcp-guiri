/**
 * mcp-guiri — Instagram content management for @guiridinnerdates.
 *
 * Stateless MCP server providing:
 * - Style guide (embedded, no LLM needed)
 * - Nextcloud post folder management (via mcp-nextcloud)
 * - Photo access for agent vision
 *
 * The calling agent (PAI, Lucy's Claude, SENY) does the actual caption writing.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { STYLE_GUIDE } from "./style-guide.js";
import {
  listPosts,
  getPostInfo,
  getFile,
  getFileRaw,
  saveFile,
  createFolder,
} from "./nextcloud.js";
import { KEBAB_CASE } from "./slug.js";
import { formatUsage, totalCalls, track as trackCall, type UsageCounts } from "./usage.js";

const PORT = Number(process.env["PORT"]) || 8918;

// ─── API Usage Tracking ───

const usage: UsageCounts = {};
function track(tool: string): void {
  trackCall(usage, tool);
}

// ─── MCP Server Factory ───

function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-guiri",
    version: "0.1.0",
  });

  // ── 1. Style Guide ──

  server.tool(
    "guiri-style-guide",
    "Get the @guiridinnerdates voice & style guide. Call this FIRST before writing any caption. Returns tone rules, caption structure, hashtag strategy, naming conventions, and what to avoid.",
    {},
    async () => {
      track("guiri-style-guide");
      return {
        content: [{ type: "text" as const, text: STYLE_GUIDE }],
      };
    },
  );

  // ── 2. List Posts ──

  server.tool(
    "guiri-list-posts",
    "List post folders in Nextcloud with their contents. Shows which posts have images, captions, and metadata files.",
    {
      city: z.string().optional().describe("Filter by city subfolder (optional)"),
    },
    async ({ city }) => {
      track("guiri-list-posts");
      const result = await listPosts(city);
      return {
        content: [{ type: "text" as const, text: result }],
      };
    },
  );

  // ── 3. Get Post Info ──

  server.tool(
    "guiri-get-post-info",
    "Read post metadata from a post folder. Tries post.json first, falls back to notes.txt. If neither exists, returns guidance to ask the user for details.",
    {
      postSlug: z.string().min(1).describe("Post folder name (e.g., 'barcelona-cal-pep')"),
    },
    async ({ postSlug }) => {
      track("guiri-get-post-info");
      const info = await getPostInfo(postSlug);
      const header =
        info.source === "json"
          ? "Post info (from post.json):"
          : info.source === "text"
            ? "Post notes (from notes.txt — freeform, not structured):"
            : "";
      return {
        content: [{ type: "text" as const, text: `${header}\n${info.content}`.trim() }],
      };
    },
  );

  // ── 4. Save Post Info ──

  server.tool(
    "guiri-save-post-info",
    "Save post metadata to a post folder. Use format 'json' for structured data (post.json) or 'text' for freeform notes (notes.txt).",
    {
      postSlug: z.string().min(1).describe("Post folder name"),
      info: z.string().min(1).describe("Post metadata content — JSON object or freeform text"),
      format: z
        .enum(["json", "text"])
        .optional()
        .default("json")
        .describe("Save as post.json (default) or notes.txt"),
    },
    async ({ postSlug, info, format }) => {
      track("guiri-save-post-info");
      const filename = format === "text" ? "notes.txt" : "post.json";
      const result = await saveFile(postSlug, filename, info);
      return {
        content: [{ type: "text" as const, text: `Saved ${filename} to ${postSlug}/: ${result}` }],
      };
    },
  );

  // ── 5. Get Caption ──

  server.tool(
    "guiri-get-caption",
    "Read the existing caption from a post folder (caption.txt).",
    {
      postSlug: z.string().min(1).describe("Post folder name"),
    },
    async ({ postSlug }) => {
      track("guiri-get-caption");
      try {
        const caption = await getFile(postSlug, "caption.txt");
        return {
          content: [{ type: "text" as const, text: caption }],
        };
      } catch {
        return {
          content: [{ type: "text" as const, text: "No caption.txt found in this post folder." }],
        };
      }
    },
  );

  // ── 6. Save Caption ──

  server.tool(
    "guiri-save-caption",
    "Save a caption to a post folder as caption.txt. The caption should follow the style guide.",
    {
      postSlug: z.string().min(1).describe("Post folder name"),
      caption: z.string().min(10).describe("Full caption text including title, body, and hashtags"),
    },
    async ({ postSlug, caption }) => {
      track("guiri-save-caption");
      const result = await saveFile(postSlug, "caption.txt", caption);
      return {
        content: [
          { type: "text" as const, text: `Caption saved to ${postSlug}/caption.txt: ${result}` },
        ],
      };
    },
  );

  // ── 7. Create Post ──

  server.tool(
    "guiri-create-post",
    "Create a new post folder in Nextcloud. Use kebab-case: city-restaurant (e.g., 'barcelona-cal-pep').",
    {
      postSlug: z
        .string()
        .min(1)
        .regex(KEBAB_CASE, "Must be kebab-case (lowercase letters, numbers, hyphens)")
        .describe("Post folder name to create"),
    },
    async ({ postSlug }) => {
      track("guiri-create-post");
      const result = await createFolder(postSlug);
      return {
        content: [{ type: "text" as const, text: `Created post folder: ${postSlug}/ — ${result}` }],
      };
    },
  );

  // ── 8. Get Photo ──

  server.tool(
    "guiri-get-photo",
    "Download a photo from a post folder. Returns the image so you can view it with vision and incorporate visual details into the caption.",
    {
      postSlug: z.string().min(1).describe("Post folder name"),
      filename: z.string().min(1).describe("Photo filename (e.g., 'img-01.jpg')"),
    },
    async ({ postSlug, filename }) => {
      track("guiri-get-photo");
      const blocks = await getFileRaw(postSlug, filename);

      // If mcp-nextcloud returned image content, pass it through
      // Otherwise return text indicating what happened
      if (blocks.length > 0) {
        return {
          content: blocks as Array<
            { type: "text"; text: string } | { type: "image"; data: string; mimeType: string }
          >,
        };
      }
      return {
        content: [
          { type: "text" as const, text: `Could not retrieve ${filename} from ${postSlug}/` },
        ],
      };
    },
  );

  // ── 9. API Usage ──

  server.tool(
    "guiri-api-usage",
    "Check tool call counts for the current server session.",
    {},
    async () => {
      track("guiri-api-usage");
      return {
        content: [{ type: "text" as const, text: formatUsage(usage) }],
      };
    },
  );

  return server;
}

// ─── HTTP Server ───

const httpServer = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "mcp-guiri",
          version: "0.1.0",
          tools: 9,
          calls: totalCalls(usage),
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    if (url.pathname === "/mcp") {
      const server = createServer();
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      return transport.handleRequest(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`mcp-guiri v0.1.0 listening on http://0.0.0.0:${PORT}/mcp`);

process.on("SIGTERM", () => {
  httpServer.stop();
  process.exit(0);
});
