

# Final Webapp Polish and Production Hardening

## Security Findings (3 Critical, 5 Warnings)

The security scan found real issues that need fixing before go-live:

### Critical — RLS Policy Fixes

**1. `demo_requests` table** — any authenticated user can read all emails/contacts and delete any request
- Fix: Restrict SELECT and DELETE to admins only using `has_role(auth.uid(), 'admin')`

**2. `user_roles` table** — all authenticated users can see everyone's roles (privilege enumeration)
- Fix: Restrict SELECT to own roles: `USING (auth.uid() = user_id)`

**3. `response_log` UPDATE** — any user can update any response (including approving their own)
- Fix: Restrict UPDATE to owner (`auth.uid() = user_id`) OR admin role

### Warnings — Tighten Permissive Policies

**4. `crises` UPDATE** — any user can modify any crisis
- Fix: Restrict to creator (`auth.uid() = created_by`) OR admin

**5. `response_templates` UPDATE** — any user can edit anyone's templates
- Fix: Restrict to creator (`auth.uid() = created_by`) OR admin

**6. `narratives` INSERT WITH CHECK** — currently `true`, should be `auth.uid() IS NOT NULL` (minor)

**7. `reputation_snapshots` INSERT WITH CHECK** — same as above

**8. Leaked password protection** — disabled in auth config
- Fix: Enable via auth configuration

### Tables with acceptable `USING(true)` SELECT (no change needed)
- `crises`, `narratives`, `reputation_snapshots`, `response_log`, `response_templates`, `signals`, `activity_log`, `profiles` — team-wide read access is intentional for a crisis platform

## UI Polish

### 9. `NotFound.tsx` — doesn't match dark theme
- Uses `bg-muted` instead of the app's dark aesthetic
- Fix: Restyle with dark background, Crisis X branding, and a proper "Return to Dashboard" button

### 10. Loading states consistency
- `ProtectedRoute` and `LandingOrDashboard` both have custom loaders — these are fine, already branded

## Implementation

### Database Migration (single SQL migration)
Drop and recreate the overly permissive policies:
- `demo_requests`: admin-only SELECT and DELETE
- `user_roles`: own-roles-only SELECT
- `response_log`: owner-or-admin UPDATE
- `crises`: creator-or-admin UPDATE
- `response_templates`: creator-or-admin UPDATE
- `narratives`: tighten INSERT WITH CHECK
- `reputation_snapshots`: tighten INSERT WITH CHECK

### Auth Config
- Enable leaked password protection

### File Changes
- `src/pages/NotFound.tsx` — restyle to match Crisis X dark theme

## Files Modified
- `src/pages/NotFound.tsx` — visual polish
- 1 database migration — RLS hardening (7 policy replacements)
- Auth config update — leaked password protection

No edge function or component logic changes needed.

