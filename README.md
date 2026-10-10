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

### 3. Enable email-and-password accounts

Supabase → Authentication → Sign In / Providers → Email: enable email signups and **Confirm email**. Set the minimum password length to **10** (or stronger); the application requires at least 10 characters. Password login replaces ordinary passwordless login. Existing users without a password can use **Forgot password?** to set one without deleting their profile or work.

Under **Authentication → Email Templates**, update **Confirm signup**:

```html
<h2>Confirm your TAPPED IN account</h2>
<p>Enter this code on the sign-up page:</p>
<p style="font-size:28px;font-weight:bold">{{ .Token }}</p>
<p>After confirmation, sign in with your email and password.</p>
```

Update **Reset password**:

```html
<h2>Reset your TAPPED IN password</h2>
<p>Enter this code on the password reset page:</p>
<p style="font-size:28px;font-weight:bold">{{ .Token }}</p>
<p>If you did not request this, ignore this email.</p>
```

These codes confirm the account or authorise setting a new password; they are not an ordinary passwordless sign-in method. Do not use the previous magic-link template for these flows. Keep **Authentication → URL Configuration → Site URL** equal to `APP_URL`.

Configure a transactional email provider under Authentication's SMTP settings before inviting public users. Supabase's default sender has restricted recipients and low limits; public sign-up and recovery need working delivery. Keep provider rate limits enabled. No extra application environment variables or tables are required by this account change.

A confirmed account created through Supabase **Authentication → Users → Add user** can still sign in with its account password. Never use the database password for an application account.

### 4. Redeploy

After saving the variables, open **Vercel → Deployments**, select the latest deployment, and choose **Redeploy**. Framework preset: **Other**. Build command and output directory are defined in `vercel.json`; root directory is the repository root.

Verify: open the homepage; create an account with email and password, confirm its email code, log in, test logout and password reset; choose your main category and primary role; save a profile; create a project; send a message; upload media; design a rate card and save an invoice. Check private information with a second account. `/demo` must return 404.

## Development

Node 22 or newer. `npm ci`, `npm run build`, `npm test`. Tests use an isolated local PostgreSQL engine and never connect to your Supabase account. No demo seed is deployed. Real Supabase authentication, email delivery, storage and Vercel deployment must be verified after the environment variables and SQL are configured.

## Architecture

Vercel Node function serves the existing UI and application API. Supabase Auth validates every session, with access and refresh tokens stored in HttpOnly cookies. All externally supplied hosting identity headers are stripped. The server checks owner, member and delegated-agent permissions before data access. Application tables have row-level security enabled and no browser roles have direct access; the server connects using the database connection owner. The compatibility adapter translates existing parameterized SQLite-style JSON queries to private PostgreSQL helper functions; transactions and optimistic version checks remain intact.

Supabase Storage holds private project media and profile photos. Photos are served publicly by the application; project files are served only after current project membership is checked. Large office files upload directly using short-lived signed upload URLs, then the server validates the actual media bytes and associates them with the project. Each file is limited to 25 MB and each project to 500 MB. Abandoned temporary uploads in the `pending/` prefix should be periodically removed using the Storage dashboard; they are never served as project files.

Existing supported features include Feed, Discover, public briefs/gig bids, credits, named stakeholder invitations, fans and contributions, Office projects/teams/messages/documents/assets/bookings, scoped agent access, profile awards and contact details, rate cards and invoices. Live social metrics remain dependent on supported provider authorisation; linking a profile does not fabricate follower or engagement numbers.

## Separate user testing environment

1. Create a separate Supabase project for testing. Run `supabase/setup.sql` and `supabase/storage.sql` there; do not copy live user data.
2. Configure the Email provider, confirmation/reset templates and SMTP for that test project.
3. In Vercel, configure **Preview** variables using that project's URL, publishable key, server-only secret key, pooled `DATABASE_URL`, and CA certificate. Set `APP_URL` to the stable preview URL you will test, and use it as the test project's Site URL. Keep Production variables bound to the existing production Supabase project.
4. Deploy the account branch as a Preview. If Vercel deployment protection is enabled, give testers access through its supported sharing controls.
5. Test two accounts: sign-up, confirmation, login, refresh, logout, wrong password, reset, expired code, profile completion, messages and project access. Check that one account cannot read another's private earnings, invoices or project files.
6. After acceptance, merge the branch and redeploy Production; configure the same Email settings/templates on the production project.

Creating these external projects, configuring SMTP and deploying are account-owner actions; repository changes do not perform them automatically.

## Limitations before inviting users

- Signup confirmation and password reset require SMTP and correctly configured token templates. A generic reset acknowledgement does not prove email arrival or account existence.
- Codes expire and are single use; Supabase enforces provider rate limits. Configure additional abuse protection/CAPTCHA as traffic grows (the current UI does not integrate CAPTCHA).
- Passwords are handled by Supabase Auth and never stored in platform tables. Sessions use HttpOnly cookies; cookies must be enabled. Ordinary passwordless API endpoints are retired.
- No MFA, self-service account deletion/export, automated moderation or billing/payment processing is added by this change.
- Public profile contact details/photos and explicitly shared rate-card snapshots are visible to others; project documents and financial data are subject to server-side permissions.
- Media limits remain 25 MB per file and 500 MB per project. Pending uploads need periodic cleanup. Social metrics need supported provider authorisation; linking a URL is not an analytics connection.
- Vercel/Supabase storage, compute, email and database quotas depend on your plans. This release does not establish a guaranteed concurrent-user capacity; load-test before a larger launch.
- Local tests use an isolated database and mocked Auth responses. Real confirmation delivery, recovery, production session handling and deployment need live acceptance checks. No live provider settings or user records are changed by running tests.

## Public homepage

The homepage presents existing profiles, Discover, credits, opportunities, Office and fan contributions. Its local screenshots contain clearly labelled fictional test content, never live member records. See [homepage showcase notes](docs/homepage-showcase.md) for feature accuracy, preview provenance, scope and the review checklist. No new services or environment variables are required.

## Discovery, public sharing and profile updates

See [the platform update guide](docs/platform-updates.md) for the combined Discovery page, designer roles, public post links, thumbnails, Office notifications, shared awards and venue invitations. These updates need no additional environment variables, services or database migration. Run `npm run build` and `npm test`, review the branch's Vercel preview, then merge into the production branch to publish.
