

## Remove Duplicate "Crisis-X" Text from PublicNav

### Problem
The nav shows both the Crisis-X logo image and a redundant "CRISIS-X" text label beside it.

### Change
**`src/components/PublicNav.tsx`** — Remove the `<span>` element with "Crisis-X" text from the logo link, keeping only the `<img>` logo.

