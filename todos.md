# Task Breakdown: Arisan Bola PELITA

Tasks ordered by dependency. Each task is independently verifiable.

---

## Phase 1: Project Scaffold (Completed)

### 1.1 Install Supabase dependencies
- `npm install @supabase/supabase-js @supabase/ssr`
- Verify: `npm ls @supabase/supabase-js @supabase/ssr` shows installed versions

### 1.2 Generate TypeScript types from Supabase
- Run `supabase_generate_typescript_types` via MCP
- Output to `lib/supabase/types.ts`
- Verify: file exists and exports `Database` type with `teams`, `members`, `member_teams` tables

### 1.3 Create Supabase browser client
- File: `lib/supabase/client.ts`
- Export `createClient()` using `@supabase/ssr`
- Use env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify: imports resolve, no TypeScript errors

### 1.4 Create Supabase server client
- File: `lib/supabase/server.ts`
- Export `createClient()` for server components / server actions
- Use `cookies()` from `next/headers`
- Verify: imports resolve, no TypeScript errors

### 1.5 Set up RLS policies for public write
- Add policy to `members`: allow public INSERT, UPDATE, DELETE
- Add policy to `member_teams`: allow public INSERT, UPDATE, DELETE
- Verify: security advisor shows no issues; insert a test row then delete it

---

## Phase 2: Shared Layout & Navigation (Completed)

### 2.1 Initialize shadcn/ui
- Run `npx shadcn@latest init` (default style, neutral base, css variables yes)
- Verify: `components/ui/` exists, `components.json` created

### 2.2 Install required shadcn components
- Install: `button`, `input`, `checkbox`, `select`, `table`, `form`, `alert-dialog`, `badge`, `card`
- Verify: each component file exists in `components/ui/`

### 2.3 Create root layout with navigation
- File: `app/layout.tsx` (update existing)
- Add top nav bar with links: Home (`/`), Members (`/members`), Teams (`/teams`)
- Style with Tailwind, highlight active route
- Verify: nav renders on all pages, links navigate correctly

---

## Phase 3: Home Page (Read-only Team List) (Completed)

### 3.1 Create server data fetcher for home page
- File: `app/page.tsx` (replace existing)
- Server component: fetch `teams`, `member_teams`, and `members` via server client
- Join data: each team → array of assigned member names
- Group teams by `groups` field (A–H)
- Verify: page renders without errors, data visible in dev tools

### 3.2 Build team card component
- File: `components/team-card.tsx`
- Props: team (name_en, flag), members (string[])
- Display: flag image, team name, member name(s) below
- Wrap in shadcn `Card`
- Verify: card renders correctly with passed data

### 3.3 Build home page layout
- Update `app/page.tsx`
- Render group sections (A–H), each with a heading
- Render `TeamCard` for each team in the group
- Handle empty groups (no assigned members yet)
- Add loading state with `loading.tsx`
- Verify: all 48 teams displayed, grouped correctly, members shown where assigned

---

## Phase 4: Members CRUD (Completed)

### 4.1 Create members data layer
- File: `lib/members.ts`
- Functions: `getMembers()`, `getMember(id)`, `createMember(data)`, `updateMember(id, data)`, `deleteMember(id)`
- Use server client for read; server actions or client for write
- Verify: each function works when called

### 4.2 Build member list page
- File: `app/members/page.tsx`
- Client component: fetch members, display in shadcn `Table`
- Columns: Name, Payment Status (Badge), Actions (Edit, Delete buttons)
- Payment badge: green "Paid" / red "Unpaid"
- Add "Add Member" button linking to `/members/new`
- Show empty state when no members
- Verify: all 32 members visible, badges correct, buttons present

### 4.3 Build add member form
- File: `app/members/new/page.tsx`
- Form fields: name (Input), payment_status (Checkbox)
- Use shadcn `Form` with validation (name required)
- On submit: insert into `members`, redirect to `/members`
- Cancel button → navigate back to `/members`
- Verify: submit creates new member, redirects, member appears in list

### 4.4 Build edit member form
- File: `app/members/[id]/edit/page.tsx`
- Fetch existing member data, pre-fill form
- Same form as add but with update logic
- On submit: update member, redirect to `/members`
- Cancel button → navigate back to `/members`
- Handle not-found: redirect or show 404
- Verify: edits persist, redirect works from list page

### 4.5 Build delete member flow
- Update `app/members/page.tsx`
- Delete button triggers shadcn `AlertDialog`
- Confirm → delete member, refresh list
- Cancel → close dialog
- Verify: delete removes member, dialog works

---

## Phase 5: Team Assignments CRUD (Completed)

### 5.1 Create assignments data layer
- File: `lib/assignments.ts`
- Functions: `getAssignments()`, `getAssignment(id)`, `createAssignment(data)`, `updateAssignment(id, data)`, `deleteAssignment(id)`
- `getAssignments()` joins `member_teams` with `members` and `teams`
- Verify: each function works when called

### 5.2 Build assignment list page
- File: `app/teams/page.tsx`
- Client component: fetch assignments, display in shadcn `Table`
- Columns: Team (name_en), Assigned Member(s), Actions (Reassign, Delete)
- Multiple members per team shown as comma-separated or stacked
- "Add Assignment" button → `/teams/assign`
- Verify: current 5 assignments shown, buttons work

### 5.3 Build assign member form
- File: `app/teams/assign/page.tsx`
- Two shadcn `Select` dropdowns: Team (all teams), Member (all members)
- Search/filter within selects for large lists
- On submit: insert `member_teams` row, redirect to `/teams`
- Cancel → navigate back
- Verify: assignment created, appears in list

### 5.4 Build reassign form
- File: `app/teams/[id]/reassign/page.tsx`
- Fetch existing assignment, pre-select current member
- Change member via Select dropdown, update assignment
- On submit: update, redirect to `/teams`
- Cancel → navigate back
- Verify: reassignment persists

### 5.5 Build delete assignment flow
- Update `app/teams/page.tsx`
- Delete button → shadcn `AlertDialog` confirmation
- Confirm → delete `member_teams` row, refresh list
- Verify: assignment removed

---

## Phase 6: Polish (Completed)

### 6.1 Add .env file
- File: `.env.local` (create if missing)
- Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify: app connects to Supabase

### 6.2 Error handling
- Each page: try/catch around data fetches, show error message on failure
- Forms: show validation errors inline, show server error on failure

### 6.3 Loading states
- Add `loading.tsx` for each route group
- Skeleton or spinner for data-fetching pages

### 6.4 Empty states
- Members page: "No members yet. Add one."
- Teams page: "No assignments yet. Assign a member to a team."
- Home page: "No representatives assigned yet." per team

---

## Dependencies

```
Phase 1 ──► Phase 2 ──► Phase 3
                 │
                 └──────► Phase 4
                 │
                 └──────► Phase 5

Phase 3, 4, 5 ──► Phase 6
```
