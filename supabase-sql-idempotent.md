---
trigger: model_decision
description: when working with any database sql related changes
---

# Supabase SQL Schema Modification Rules

Whenever making database changes or adding SQL code to this project, you must adhere strictly to these rules:

1. **Idempotence & schema.sql Consolidation**:
   - Any permanent database schema changes (tables, indexes, views, triggers, functions, policies, seeds) MUST be integrated directly into the main `supabase/schema.sql` file.
   - All SQL statements in `supabase/schema.sql` must be written in an IDEMPOTENT way (using `CREATE OR REPLACE`, `DROP POLICY IF EXISTS ... CREATE POLICY`, `IF NOT EXISTS` etc.) so that running the entire script on a fresh Supabase database instance creates a fully working database with all custom rules.

2. **Temporary SQL Script Handling**:
   - For ad-hoc database updates, one-off scripts, data backfills, migrations, or local adjustments, you may output the SQL directly in the chat or create a temporary SQL file in the `supabase/` directory (e.g., `supabase/temp_something.sql`).
   - If a temporary SQL file is created to run a specific task, you MUST delete it immediately after the task is finished to keep the repository clean. Never commit or leave temporary SQL files in the workspace.
