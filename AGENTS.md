<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:supabase-agent-rules -->
# Supabase-first development

When working with Supabase in this project, always:

1. **Use Supabase MCP tools** for all database and project operations — prefer them over raw `curl` or SDK-based queries, as the MCP gives direct access to the project's SQL, migrations, advisors, Edge Functions, and branch management.

2. **Load the Supabase skill** (`skill: supabase`) before writing any Supabase-related code — it provides up-to-date workflows, Gotrue auth patterns, SSR helpers, and TypeScript integration guides specific to supabase-js and @supabase/ssr.

3. **Use `supabase-postgres-best-practices`** when writing or reviewing Postgres queries, schema designs, or database configurations — it covers indexing, performance tuning, and RLS best practices.

4. **Run the security and performance advisors** after any schema change:
   - `supabase_get_advisors(type: "security")`
   - `supabase_get_advisors(type: "performance")`

5. **Generate TypeScript types** after any DDL change with `supabase_generate_typescript_types`.

6. **Always enable RLS** on new tables and create appropriate policies. Basic RLS must pass the security advisor before merging.
<!-- END:supabase-agent-rules -->

<!-- BEGIN:caveman-agent-rules -->
# Caveman communication mode

Always use caveman mode when responding to users. Keep all replies ultra-compressed — minimal words, no fluff, direct answers. Use the caveman skill (`skill: caveman`) for full communication guidelines.
<!-- END:caveman-agent-rules -->
