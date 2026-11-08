<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Preserve the existing `nusuk_keys` table name across board and admin calls to keep historical rows and generated client types intact.
- Keep copy storage parsing, visibility, sharing destination, and chronological sorting in the browser-safe key-board module so behavior has direct unit coverage.
- Use shared semantic glass tokens and the document-level theme class across all pages so both modes remain consistent.
- Select Nitro's Vercel preset through the Vercel-only build environment, leaving Lovable's default deployment target unchanged.
- Bulk admin submissions reuse the existing authorized server connection and insert a parsed batch in one statement, with browser-safe parsing shared by client validation and tests.
- Community inserts are validated in both the browser and database; a locked registry prevents concurrent duplicates without removing historical rows or changing bulk-admin parsing.
- Page-load counts use an idempotent database RPC; Realtime Presence counts distinct browser visitors across tabs, and disconnected stats remain unknown rather than displaying fabricated counts.
