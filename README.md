# TAPPED IN

Production platform for Vercel + Supabase. This release starts empty; it does not import old users or demo data. `/demo` returns 404. The separate TAPPED IN business website is not part of this repository.

## Finish your setup

Your Vercel project is already connected to this repository. Before the platform can work, complete these steps.

### 1. Create the database tables

In Supabase, open **SQL Editor → New query**. Copy the entire contents of [supabase/setup.sql](supabase/setup.sql), paste into the editor, and click **Run** once. This creates the fresh application tables and private JSON helpers. It does not delete existing data. The setup script can be rerun and preserves existing rows; it stops if pre-existing tables have incompatible columns.

Create another query, paste [supabase/storage.sql](supabase/storage.sql), and click **Run**. This creates the private media bucket.

### 2. Add Vercel environment variables

In Vercel, open **tappedin.platform → Settings → Environment Variables** (or the Environment Variables sidebar). Add these variables for Production:

| Variable | Value / where to find it |
| --- | --- |
| `SUPABASE_URL` | `https://dmlnbnsoeouufobvzkhb.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API Keys → Publishable key. A legacy anon key also works. |
| `SUPABASE_SECRET_KEY` | Supabase → Settings → API Keys → Secret key. A legacy service-role key also works. **Server only: never put it in GitHub or chat.** |
| `DATABASE_URL` | Supabase → Connect → Transaction pooler → connection URI. Replace the password placeholder with your database password, URL-encoding special characters. Use port 6543 with the exact project-specific username shown in the panel. **Server only.** |
| `SUPABASE_DB_CA_CERT` | Supabase → Database → Settings → SSL Configuration → Download certificate. Open the downloaded file in a text editor and paste its entire PEM contents, including BEGIN/END CERTIFICATE, as a multiline Vercel value. Required if the page reports `DATABASE_TLS`. This is a public CA certificate, not a password or private key. |
| `APP_URL` | The exact HTTPS domain assigned to this Vercel project, without a trailing slash. Copy it from Vercel → Domains. Do not guess the name. |

After adding or changing any variable, redeploy the latest production deployment. The server keeps certificate and hostname verification enabled.

The example file contains no credentials. Never commit a completed `.env` file. The private key is used only in the server for storage; database access uses the pooled connection URI. Browser requests cannot supply a trusted member identity.

### Sign in before setting up email delivery

Password login works for a confirmed Supabase account without SMTP. In Supabase **Authentication → Users → Add user → Create new user**, enter your own email and a strong new account password, and enable **Auto confirm user** if shown. This is an application account, not your database login. Keep the password private. If the email already exists, do not delete an account with work attached; use another email you control or ask for help setting an existing account password through the Auth admin API.

Open `/login` on the deployed website and select **Email & password**. Log in with that account. Your first login takes you through profile setup. Ordinary public email-code signups still require the SMTP setup below. This feature adds no demo accounts or authentication bypass.

### 3. Configure sign-in emails

The platform uses email codes, not ChatGPT sign-in or demo accounts. In Supabase → Authentication → Email Templates, edit **Magic Link** and **Confirm signup** to include the OTP token:

```html
<h2>Your TAPPED IN sign-in code</h2>
<p>Enter this code on the TAPPED IN sign-in page:</p>
<p style="font-size:28px;font-weight:bold">{{ .Token }}</p>
<p>If you did not request this, ignore this email.</p>
```

Set **Authentication → URL Configuration → Site URL** to the same value as `APP_URL`.

For public signups, configure a transactional email provider under Authentication's SMTP settings. Supabase's built-in sender has low sending limits and restricted recipients; it is suitable for initial setup checks, not unrestricted public signup. You can use a provider's free tier to start. Keep sign-in email rate limits enabled.

### 4. Redeploy

After saving the variables, open **Vercel → Deployments**, select the latest deployment, and choose **Redeploy**. Framework preset: **Other**. Build command and output directory are defined in `vercel.json`; root directory is the repository root.

Verify: open the homepage; create an account with an email code; choose your main category and primary role; save a profile; create a project; send a message; upload media; design a rate card and save an invoice. Check private information with a second account. `/demo` must return 404.

## Development

Node 22 or newer. `npm ci`, `npm run build`, `npm test`. Tests use an isolated local PostgreSQL engine and never connect to your Supabase account. No demo seed is deployed. Real Supabase authentication, email delivery, storage and Vercel deployment must be verified after the environment variables and SQL are configured.

## Architecture

Vercel Node function serves the existing UI and application API. Supabase Auth validates every session, with access and refresh tokens stored in HttpOnly cookies. All externally supplied hosting identity headers are stripped. The server checks owner, member and delegated-agent permissions before data access. Application tables have row-level security enabled and no browser roles have direct access; the server connects using the database connection owner. The compatibility adapter translates existing parameterized SQLite-style JSON queries to private PostgreSQL helper functions; transactions and optimistic version checks remain intact.

Supabase Storage holds private project media and profile photos. Photos are served publicly by the application; project files are served only after current project membership is checked. Large office files upload directly using short-lived signed upload URLs, then the server validates the actual media bytes and associates them with the project. Each file is limited to 25 MB and each project to 500 MB. Abandoned temporary uploads in the `pending/` prefix should be periodically removed using the Storage dashboard; they are never served as project files.

Existing supported features include Feed, Discover, public briefs/gig bids, credits, named stakeholder invitations, fans and contributions, Office projects/teams/messages/documents/assets/bookings, scoped agent access, profile awards and contact details, rate cards and invoices. Live social metrics remain dependent on supported provider authorisation; linking a profile does not fabricate follower or engagement numbers.
