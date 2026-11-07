# Nosuk key World — Vercel

The repository includes a separate Vercel configuration. It selects Nitro's Vercel preset only for that deployment; Lovable's existing preview and publishing configuration remain unchanged.

## Connect and deploy

1. Import the connected repository into Vercel, with the project root as Root Directory.
2. Use the committed `vercel.json`; do not select the static Vite preset or override the output with `dist`.
3. Configure the browser-facing public connection values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`) from the project's existing public configuration. Configure the server-side URL and publishable key for the same backend as well. These are public connection values, not privileged credentials.
4. Deploy and check `/`, `/admin`, `/privacy`, `/terms`, copying, submitting, and direct refreshes on Vercel.

## Important limitations

- A Vercel deployment was not performed or verified from this workspace. The supplied sharing address is a destination requested by the owner, not proof that this updated app is already deployed there.
- Logo assets use Lovable's managed asset route. The Vercel rewrite forwards only this asset path to the published Lovable app. Publish the updated Lovable app before testing logo delivery from Vercel.
- The current privileged admin actions use Lovable Cloud's managed admin connection. Its service-role credential cannot be exported from Lovable Cloud. The public board can use the public connection values, but the existing privileged admin workflow is not verified or guaranteed on a separate Vercel host. Do not insert placeholder credentials or expose privileged keys to browser code. An authenticated admin workflow with database-enforced permissions is required to remove this dependency.
- Existing fixed-password admin access is not production-grade authentication. It remains unchanged in this UI-focused update and must be replaced before treating the app as production-ready. Do not use the published password for other accounts.
- Existing rows remain in `nusuk_keys`. The brief's `nosuk_keys` spelling is not used as a new table because that would disconnect the existing data and generated clients.
- Active Users and Total Views display an em dash because no visitor analytics source is connected. Total Shared uses the loaded key count.
- Copied IDs and the saved hide-used preference keep their original storage names. New visitors default to hiding used keys; an existing saved OFF preference is respected.