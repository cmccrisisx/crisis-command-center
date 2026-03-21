

## Add Public Navigation Bar to Public Pages

### Problem
The public pages (Landing, About, Launch, Verify) have no shared navigation, making it hard to move between them.

### Solution
Create a `PublicNav` component — a minimal dark header with the Crisis-X logo and links to the public pages, plus a "Sign In" CTA button.

### Changes

**New file: `src/components/PublicNav.tsx`**
- Fixed top header with Crisis-X logo (links to `/`)
- Nav links: About, Launch, Verify
- "Sign In" button linking to `/auth`
- Mobile: hamburger menu with a sheet/drawer for links
- Matches dark aesthetic — border-b, bg-background, font-mono labels

**Updated pages** (add `<PublicNav />` at the top):
- `src/pages/Landing.tsx`
- `src/pages/Launch.tsx`
- `src/pages/About.tsx`
- `src/pages/Verify.tsx`
- `src/pages/Auth.tsx` (nav without "Sign In" button since user is already there)

### Technical Details
- Uses existing `crisisLogo` asset, `Link` from react-router, `Sheet` for mobile menu
- Highlights active route using `useLocation`
- Sticky/fixed positioning so it stays visible on scroll
- Z-index above page content but below modals

