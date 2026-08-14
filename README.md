# ROXX — Autonomous Systems Team Manager

A modern, role-based web application for college teams working on autonomous systems such as drones and automated hydroponics. It covers member management, project tracking, task assignment, event registration, weekly reports, research documentation, budget tracking and lab inventory logging.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + Supabase (Auth + Postgres)

---

## Features

- **Landing page** with elegant, light-green modern UI.
- **Strict role hierarchy:** Captain → Vice Captain → Member.
- **Captain:** create members & VCs, assign departments/projects, register events, assign event participants, manage budget, export reports/inventory.
- **Vice Captain:** manage members and tasks within their domain.
- **Member:** view tasks, submit weekly reports, ask doubts via report blockers, log inventory.
- **Projects & tasks:** live status, progress bars and department filtering.
- **Events:** register competitions with max participant limits.
- **Research docs:** share improvements and experiments.
- **Weekly reports:** Sunday submissions, Monday review, Excel export.
- **Inventory log:** automatic take/return timestamps with Excel export.
- **Budget tracker:** categorize expenses per project.

---

## Step-by-step: Run locally in VS Code

### 1. Clone / open the project

Open the project folder in VS Code.

```bash
cd roxx
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login.
2. Create a new project. Wait for the database to be ready.
3. Open **Project Settings → API**.
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` API key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (Optional) `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Restart VS Code / the dev server after editing `.env.local`.

### 5. Set up the database

In Supabase, open the **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and click **Run**.

This creates all tables, RLS policies and the trigger that auto-creates a profile when a user signs up.

### 6. Create the first Captain

Supabase Auth does not allow role assignment from the client, so promote your account manually:

1. Run the app and sign up on `/login` with your email.
2. In Supabase **Table Editor → profiles**, find your new row.
3. Change `role` from `member` to `captain`.
4. Refresh the app.

The Captain can now add other members directly from the **Members** page.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Build for production

```bash
npm run build
npm start
```

---

## Project structure

```
/src
  /app                  Next.js App Router pages
    /dashboard          Protected app pages
    /login              Authentication page
    page.tsx            Landing page
  /components/ui        Reusable UI components
  /components/dashboard Sidebar, header, mobile nav
  /hooks/useAuth.ts     Auth + profile hook
  /lib/supabase         Browser + server + middleware Supabase clients
  /lib/roles.ts         Permission helpers
  /lib/constants.ts     Departments, roles, statuses
  /types/index.ts       TypeScript types
/supabase
  schema.sql            Database setup SQL
```

---

## Common tips

- **Email confirmation:** In development, disable email confirmation in Supabase Auth settings or check the confirmations tab.
- **RLS errors:** If reads/writes fail unexpectedly, verify you ran `supabase/schema.sql` and that the user has a profile row with the correct role.
- **Adding VCs:** A Captain can change any member's role to `vice_captain` from the Members page.
- **Excel export:** Uses `xlsx` and works entirely in the browser.

---

## License

MIT — built for student autonomous systems teams.
# Team-ROXX
