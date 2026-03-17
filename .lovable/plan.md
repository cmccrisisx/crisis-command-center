

# Create Test Accounts for All User Roles

## Current State
One user exists: `ybo@cmcconnect.com` with `pr_manager` role.

## Plan

### 1. Create a seed edge function
Build a temporary edge function `seed-test-users` that creates 4 test accounts using the Supabase Admin API (service role key):

| Email | Password | Display Name | Role |
|-------|----------|-------------|------|
| admin@crisisx.demo | CrisisX2026! | Super Admin | admin |
| pr@crisisx.demo | CrisisX2026! | Sarah Chen (PR Manager) | pr_manager |
| legal@crisisx.demo | CrisisX2026! | David Okafor (Legal Reviewer) | legal_reviewer |
| social@crisisx.demo | CrisisX2026! | Maria Santos (Social Manager) | social_manager |

The edge function will:
- Use `supabase.auth.admin.createUser()` with `email_confirm: true` to skip verification
- The existing `handle_new_user` trigger auto-creates profiles and assigns `pr_manager` — so the function will also update the role to the correct one after creation
- Return a summary of created accounts

### 2. Also upgrade your existing account
Add the `admin` role to your existing user (`ybo@cmcconnect.com`) so you have full super admin access.

### 3. Run the seed function once, then clean up
Deploy, invoke to create the accounts, then optionally delete the edge function.

### Technical Notes
- Uses `SUPABASE_SERVICE_ROLE_KEY` (already configured) for admin-level user creation
- The `handle_new_user` trigger assigns `pr_manager` by default; the seed function will correct each user's role after creation
- All accounts use the same password for easy demo testing

