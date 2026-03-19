

# Mobile Responsiveness, SEO, AEO & Meta Data Polish

## Overview
Make the entire Crisis-X platform mobile-friendly, add comprehensive SEO/AEO meta data, and polish the UI for all screen sizes.

---

## 1. Enhanced Meta Data, SEO & AEO (`index.html`)

- Add structured data (JSON-LD) for `WebApplication` schema — improves AI Engine Optimization (AEO) and rich snippets
- Add canonical URL, `og:url`, `twitter:title`, `twitter:description` meta tags
- Add `theme-color` meta tag (dark theme)
- Add `apple-mobile-web-app` meta tags for iOS homescreen
- Add proper `sitemap.xml` reference in robots.txt
- Update OG image to use the Crisis-X logo instead of Lovable default

## 2. Sitemap (`public/sitemap.xml`)

- Create a basic sitemap with public routes (`/auth`, `/`) for search engine crawling

## 3. Robots.txt Update (`public/robots.txt`)

- Add `Sitemap:` directive pointing to sitemap.xml

## 4. Mobile-Responsive Dashboard (`src/pages/Index.tsx`)

- **Header**: Stack title and action buttons vertically on mobile (`flex-col` on `sm:` breakpoint)
- **Stats grid**: Change from `grid-cols-2 lg:grid-cols-4 xl:grid-cols-6` to `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6`
- **Action buttons**: Make "Escalate to War Room" show icon-only on small screens

## 5. Mobile-Responsive TopBar (`src/components/TopBar.tsx`)

- Add mobile sign-out button (currently hidden on `md:` breakpoint)
- Ensure notification popover width is responsive (`w-80 sm:w-96`)

## 6. Mobile-Responsive CrisisChat (`src/components/CrisisChat.tsx`)

- On mobile, make chat panel full-width/full-height instead of fixed 380px
- Adjust expanded size for tablets
- Move floating trigger slightly for mobile (`bottom-4 right-4`)

## 7. Mobile-Responsive Auth Page (`src/pages/Auth.tsx`)

- Already decent — minor padding tweaks for very small screens

## 8. Mobile-Responsive Sidebar (`src/components/AppSidebar.tsx`)

- Already uses shadcn sidebar with collapse — no changes needed, it handles mobile via sheet overlay

## 9. Global CSS Polish (`src/index.css`)

- Add smooth scroll behavior
- Add `-webkit-tap-highlight-color: transparent` for mobile touch
- Ensure `body` has proper `overflow-x: hidden` to prevent horizontal scroll on mobile

---

## Technical Details

### JSON-LD Structured Data (in `index.html`)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Crisis-X",
  "description": "Real-time crisis intelligence, sentiment analysis, and AI-powered response recommendations.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web"
}
```

### Key Responsive Breakpoints
- `< 640px` (mobile): Stack layouts, full-width chat, compact buttons
- `640-768px` (tablet): 2-3 column grids, medium chat panel
- `768px+` (desktop): Current layout preserved

### Files Modified
1. `index.html` — meta tags, JSON-LD, theme-color, apple meta
2. `public/robots.txt` — add sitemap directive
3. `public/sitemap.xml` — new file
4. `src/index.css` — smooth scroll, tap highlight, overflow-x
5. `src/pages/Index.tsx` — responsive header, stats grid
6. `src/components/TopBar.tsx` — mobile sign-out, responsive popover
7. `src/components/CrisisChat.tsx` — full-screen mobile chat
8. `src/pages/Auth.tsx` — minor mobile padding

