

## Email Notifications for Document Minting

### What We're Building
When a document is minted on the Trust Ledger, an email notification is sent to the authorizing executive with details about the anchored document, its verification link, and QR code.

### Prerequisites
This project doesn't have an email domain configured yet. We need to set that up first before we can send any emails.

**Step 1 — Set up email domain**
Configure a sender domain through the email setup dialog. This is required before any emails can be sent.

**Step 2 — Set up email infrastructure**
Run email infrastructure setup (queue, processing function, cron job).

**Step 3 — Add executive email field**
- Add `executive_email` column to `verified_communications` table (nullable text)
- Add an "Executive Email" input field to the Trust Ledger minting form (below the "Authorizing Executive" name field)

**Step 4 — Create a transactional email template**
Scaffold a transactional email for the minting notification with:
- Document title, authorizing executive name
- Truncated SHA-256 hash
- Direct verification link (`/verify?hash=...`)
- Minted timestamp
- Dark-themed styling matching Crisis X brand (white email body background per email guidelines, but Crisis X branded header/footer)

**Step 5 — Send notification from the mint action**
Update the `verify-communication` Edge Function's `mint` action to:
- Accept the new `executiveEmail` parameter
- Store it in the `executive_email` column
- After successful insert, invoke the transactional email function to send the notification to that email address

**Step 6 — Update the frontend**
- Add the email input to `TrustLedger.tsx` minting form
- Pass `executiveEmail` in the `supabase.functions.invoke` call
- Make the email field optional (notification only sent if provided)

### Technical Notes
- Email sending uses the pgmq queue system with automatic retries
- The email is enqueued (not sent inline) so it won't block the minting response
- The executive email field is optional to avoid breaking the existing flow

