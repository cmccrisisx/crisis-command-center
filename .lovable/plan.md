

# Book a Demo — Contact Form with Backend Storage

## Overview
Add a "Book a Demo" section to the About page with a form that saves submissions to a new `demo_requests` database table.

## Steps

### 1. Database — Create `demo_requests` table
```sql
CREATE TABLE public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form, no auth required)
CREATE POLICY "Anyone can submit demo request"
  ON public.demo_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can view submissions
CREATE POLICY "Authenticated can view demo requests"
  ON public.demo_requests FOR SELECT
  TO authenticated
  USING (true);
```

### 2. About Page — Add form section (`src/pages/About.tsx`)
- New section before the footer: two-column layout
  - Left: "Book a Demo" heading + short copy about scheduling a walkthrough of the platform
  - Right: form with Name, Work Email, Company, Message (optional)
- Submit inserts into `demo_requests` via `supabase.from('demo_requests').insert()`
- Success toast + form reset on completion
- Error toast on failure
- Styled with existing Input/Textarea/Button components, crisis-red submit button
- `framer-motion` fadeUp entrance animation

### Files Modified
- **Database migration** — new `demo_requests` table with RLS
- **`src/pages/About.tsx`** — new Book a Demo form section

