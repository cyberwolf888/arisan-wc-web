# PRD: Arisan Bola PELITA

## 1. Project Overview

Football pool management application. Members pay into the pool and get assigned FIFA World Cup teams as their representatives. The app tracks which members represent which teams and whether they've paid.

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Database | Supabase Postgres |
| Client | `@supabase/supabase-js` (browser) + `@supabase/ssr` (server) |
| Auth | None — fully public |

Supabase project ref: `zcjiadnzeazdangyaylp`

## 3. Existing Database Schema

### `teams` (48 rows)
FIFA World Cup teams. Read-only (no CRUD for teams).

| Column | Type | Description |
|--------|------|-------------|
| `_id` | text (PK) | Unique team ID |
| `name_en` | text | English team name |
| `name_fa` | text | Farsi team name |
| `flag` | text | Flag image URL |
| `fifa_code` | text | FIFA country code |
| `iso2` | text | ISO 3166-1 alpha-2 code |
| `groups` | text | Group letter (A–H) |
| `id` | bigint | Numeric team ID |

### `members` (32 rows)
Pool members. Full CRUD.

| Column | Type | Description |
|--------|------|-------------|
| `_id` | uuid (PK) | Auto-generated UUID |
| `name` | text | Member name |
| `payment_status` | boolean | Whether member has paid |

### `member_teams` (5 rows)
Junction table linking members to teams. One member can represent multiple teams. Full CRUD.

| Column | Type | Description |
|--------|------|-------------|
| `_id` | uuid (PK) | Auto-generated UUID |
| `member_id` | uuid (FK → members._id) | Assigned member |
| `team_id` | text (FK → teams._id) | Assigned team |

RLS is enabled on all tables. No security advisors flagged.

## 4. Pages & Routes

| Route | Page | Data Source | Auth |
|-------|------|-------------|------|
| `/` | Home | Server: teams + member_teams + members | None |
| `/members` | Member List | Client: members table | None |
| `/members/new` | Add Member | Client: INSERT members | None |
| `/members/[id]/edit` | Edit Member | Client: UPDATE members | None |
| `/teams` | Team Assignments | Client: member_teams + members + teams | None |
| `/teams/assign` | Assign Rep | Client: INSERT member_teams | None |
| `/teams/[id]/reassign` | Reassign | Client: UPDATE member_teams | None |

**Navigation:** Top nav bar with links: Home, Members, Teams. Present on all pages via root layout.

## 5. Feature Details

### 5.1 Front Page (Read-only)
- Server-rendered list of all teams, grouped by group letter (sections A–H)
- Each team card displays: flag image, team name (`name_en`), assigned member name(s)
- `payment_status` is NOT shown on this page
- No action buttons — navigation only

### 5.2 Members CRUD
- **List page:** Table with columns: name, payment_status, actions (edit, delete)
- **Add form:** `name` (text input), `payment_status` (checkbox/toggle)
- **Edit form:** Pre-filled name and payment_status
- **Delete:** Confirmation dialog via shadcn/ui AlertDialog
- `payment_status` shown on list as badge (paid/unpaid)

### 5.3 Team Representative CRUD
- **Assign form:** Two dropdowns — select member, select team. Submit creates row in `member_teams`
- **Assignment list:** Table with team name, assigned member(s), actions (reassign, delete)
- **Reassign form:** Change member for an existing assignment
- One team can have multiple members assigned

### 5.4 No Authentication
- Supabase anon key only
- All operations are public — no login, no tokens, no user sessions
- RLS policies must allow public INSERT/UPDATE/DELETE on `members` and `member_teams`

## 6. UI Component Library

shadcn/ui components to be used:
- `Button`, `Input`, `Checkbox`, `Select`
- `Table` (with TableHeader, TableBody, TableRow, TableHead, TableCell)
- `Form` (with FormField, FormItem, FormLabel, FormControl, FormMessage)
- `AlertDialog` (for delete confirmations)
- `Badge` (for payment_status display)
- `Card` (for team cards on home page)
- `NavigationMenu` or simple Link-based nav

## 7. Implementation Plan

1. Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`
2. Initialize shadcn/ui
3. Generate TypeScript types from Supabase schema
4. Create Supabase client wrappers (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
5. Add root layout with top navigation
6. Build Home page (`app/page.tsx`) — server-rendered team + representative list
7. Build Members pages (`app/members/`)
8. Build Team Assignments pages (`app/teams/`)
9. Verify RLS policies allow public CRUD operations

## 8. Decisions

- **Team names:** Display in English (`name_en`).
- **RLS:** Yes, RLS policies must be updated to allow public INSERT/UPDATE/DELETE on `members` and `member_teams`.
- **Teams table:** Read-only. No CRUD operations on the `teams` table.
